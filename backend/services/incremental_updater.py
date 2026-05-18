import os
import json
import time
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable
from backend.database.db import (
    compute_file_hash, delete_file_by_path, insert_file,
    insert_code_element, insert_relation, get_file_hash
)
from backend.services.llm_service import parse_code_with_llm
from backend.services.debounce_scheduler import DebounceScheduler
from backend.services.file_watcher import FileWatcher

class IncrementalUpdater:
    def __init__(self):
        self.scheduler = DebounceScheduler(delay=1.0)
        self.watcher = FileWatcher()
        self.watch_callback: Optional[Callable] = None
        self.is_active = False
        self.watch_root: Optional[str] = None
    
    def start_watching(self, path: str, callback: Optional[Callable] = None):
        self.watch_callback = callback
        self.watch_root = path
        self.scheduler.start(self._process_file)
        self.watcher.start(path, self._on_file_change)
        self._scan_existing_files(path)
        self.is_active = True
    
    def _scan_existing_files(self, root_path: str):
        supported_extensions = ['.ts', '.tsx', '.ets']
        scanned_count = 0
        
        for root, dirs, files in os.walk(root_path):
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'dist', 'build']]
            
            for file in files:
                if any(file.endswith(ext) for ext in supported_extensions):
                    file_path = os.path.join(root, file)
                    try:
                        self._process_file(file_path)
                        scanned_count += 1
                        print(f"Initial scan: {scanned_count} files processed")
                    except Exception as e:
                        print(f"Error scanning {file_path}: {e}")
    
    def stop_watching(self):
        self.scheduler.stop()
        self.watcher.stop()
        self.is_active = False
    
    def _on_file_change(self, file_path: str, event_type: str):
        if event_type == 'deleted':
            self._handle_deleted(file_path)
        else:
            if not self._has_file_changed(file_path):
                return
            self.scheduler.schedule(file_path)
        
        if self.watch_callback:
            self.watch_callback({
                'type': 'file_changed',
                'data': {
                    'path': file_path,
                    'action': event_type
                }
            })
    
    def _has_file_changed(self, file_path: str) -> bool:
        if not os.path.exists(file_path):
            return False
        current_hash = compute_file_hash(file_path)
        stored_hash = get_file_hash(file_path)
        return current_hash != stored_hash
    
    def _process_file(self, file_path: str):
        start_time = time.time()
        
        try:
            delete_file_by_path(file_path)
            
            if not os.path.exists(file_path):
                return
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            file_hash = compute_file_hash(file_path)
            file_id = insert_file(file_path, file_hash)
            
            parsed = parse_code_with_llm(file_path, content)
            elements = parsed.get('elements', [])
            relations = parsed.get('relations', [])
            
            element_map = {}
            for elem_data in elements:
                element_id = insert_code_element(
                    file_id=file_id,
                    name=elem_data['name'],
                    element_type=elem_data['element_type'],
                    code=elem_data['code'],
                    line_start=elem_data['line_start'],
                    line_end=elem_data['line_end'],
                    metadata=json.dumps(elem_data.get('metadata', {}))
                )
                element_map[elem_data['name']] = element_id
            
            for rel in relations:
                from_name = rel.get('from_name', '')
                to_name = rel.get('to_name', '')
                relation_type = rel.get('relation_type', 'uses')
                
                if from_name in element_map:
                    if to_name in element_map:
                        insert_relation(
                            from_element=element_map[from_name],
                            to_element=element_map[to_name],
                            relation_type=relation_type
                        )
                    elif relation_type == 'imports':
                        element_map[to_name] = 0
                        insert_relation(
                            from_element=element_map[from_name],
                            to_element=0,
                            relation_type=relation_type
                        )
            
            duration_ms = int((time.time() - start_time) * 1000)
            
            if self.watch_callback:
                self.watch_callback({
                    'type': 'update_complete',
                    'data': {
                        'path': file_path,
                        'element_count': len(elements),
                        'duration_ms': duration_ms
                    }
                })
        
        except Exception as e:
            print(f"处理文件 {file_path} 时出错: {e}")
            import traceback
            traceback.print_exc()
            if self.watch_callback:
                self.watch_callback({
                    'type': 'error',
                    'data': {
                        'path': file_path,
                        'error': str(e)
                    }
                })
    
    def _handle_deleted(self, file_path: str):
        delete_file_by_path(file_path)
    
    def update_single_file(self, file_path: str):
        if os.path.exists(file_path):
            self._process_file(file_path)
    
    def get_status(self) -> Dict[str, Any]:
        return {
            "is_active": self.is_active,
            "pending_files": self.scheduler.get_pending_count(),
            "watch_status": self.watcher.get_status(),
            "watch_root": self.watch_root
        }
