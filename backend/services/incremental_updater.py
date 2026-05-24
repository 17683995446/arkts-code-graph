import os
import json
import time
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable

sys.path.insert(0, str(Path(__file__).parent.parent))

from database.db import (
    compute_file_hash, delete_file_by_path, insert_file,
    insert_code_element, insert_relation, get_file_hash
)
from services.llm_service import parse_code_with_llm
from services.debounce_scheduler import DebounceScheduler
from services.file_watcher import FileWatcher
from utils.logger import updater_logger as logger


class IncrementalUpdater:
    def __init__(self):
        logger.debug("IncrementalUpdater.__init__ 开始")
        self.scheduler = DebounceScheduler(delay=1.0)
        self.watcher = FileWatcher()
        self.watch_callback: Optional[Callable] = None
        self.is_active = False
        self.watch_root: Optional[str] = None
        logger.debug("IncrementalUpdater.__init__ 完成")

    def start_watching(self, path: str, callback: Optional[Callable] = None):
        logger.info(f"start_watching 开始: path={path}")
        self.watch_callback = callback
        self.watch_root = path
        logger.debug("启动 debounce scheduler")
        self.scheduler.start(self._process_file)
        logger.debug("启动 file watcher")
        self.watcher.start(path, self._on_file_change)
        logger.debug("扫描现有文件")
        self._scan_existing_files(path)
        self.is_active = True
        logger.info("start_watching 完成，开始监控文件变更")

    def _scan_existing_files(self, root_path: str):
        logger.debug(f"_scan_existing_files 开始: root_path={root_path}")
        supported_extensions = ['.ts', '.tsx', '.ets']
        scanned_count = 0

        for root, dirs, files in os.walk(root_path):
            # 排除隐藏目录和特定目录
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'dist', 'build']]
            
            for file in files:
                if any(file.endswith(ext) for ext in supported_extensions):
                    file_path = os.path.join(root, file)
                    try:
                        logger.debug(f"处理文件: {file_path}")
                        self._process_file(file_path)
                        scanned_count += 1
                        logger.debug(f"初始扫描: {scanned_count} 文件已处理")
                    except Exception as e:
                        logger.error(f"扫描文件 {file_path} 出错: {e}", exc_info=True)
        
        logger.info(f"_scan_existing_files 完成: 共扫描 {scanned_count} 个文件")

    def stop_watching(self):
        logger.info("stop_watching 开始")
        self.scheduler.stop()
        self.watcher.stop()
        self.is_active = False
        logger.info("stop_watching 完成")

    def _on_file_change(self, file_path: str, event_type: str):
        logger.debug(f"_on_file_change 开始: file_path={file_path}, event_type={event_type}")
        if event_type == 'deleted':
            logger.debug(f"文件被删除，处理删除操作: {file_path}")
            self._handle_deleted(file_path)
        else:
            if not self._has_file_changed(file_path):
                logger.debug(f"文件内容未变更，跳过处理: {file_path}")
                return
            logger.debug(f"文件内容变更，调度处理: {file_path}")
            self.scheduler.schedule(file_path)
        
        if self.watch_callback:
            logger.debug(f"触发 watch_callback")
            self.watch_callback({
                'type': 'file_changed',
                'data': {
                    'path': file_path,
                    'action': event_type
                }
            })
        logger.debug("_on_file_change 完成")

    def _has_file_changed(self, file_path: str) -> bool:
        logger.debug(f"_has_file_changed 开始: {file_path}")
        if not os.path.exists(file_path):
            logger.debug("文件不存在，返回 False")
            return False
        current_hash = compute_file_hash(file_path)
        stored_hash = get_file_hash(file_path)
        result = current_hash != stored_hash
        logger.debug(f"_has_file_changed 结果: {result}")
        return result

    def _process_file(self, file_path: str):
        start_time = time.time()
        logger.info(f"_process_file 开始: {file_path}")
        
        try:
            logger.debug("删除旧文件数据")
            delete_file_by_path(file_path)
            
            if not os.path.exists(file_path):
                logger.debug("文件不存在，结束处理")
                return
            
            logger.debug("读取文件内容")
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            logger.debug("计算文件哈希")
            file_hash = compute_file_hash(file_path)
            logger.debug("插入文件记录")
            file_id = insert_file(file_path, file_hash)
            
            logger.debug("使用 LLM 解析代码")
            parsed = parse_code_with_llm(file_path, content)
            elements = parsed.get('elements', [])
            relations = parsed.get('relations', [])
            
            logger.debug(f"解析结果: {len(elements)} 个元素, {len(relations)} 个关系")
            
            element_map = {}
            for idx, elem_data in enumerate(elements):
                logger.debug(f"处理元素 {idx+1}/{len(elements)}: {elem_data['name']} ({elem_data['element_type']})")
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
            
            for idx, rel in enumerate(relations):
                from_name = rel.get('from_name', '')
                to_name = rel.get('to_name', '')
                relation_type = rel.get('relation_type', 'uses')
                
                logger.debug(f"处理关系 {idx+1}/{len(relations)}: {from_name} {relation_type} {to_name}")
                
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
            logger.info(f"_process_file 完成: {file_path}, {len(elements)} 个元素, 耗时 {duration_ms}ms")
            
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
            logger.error(f"处理文件 {file_path} 时出错: {e}", exc_info=True)
            if self.watch_callback:
                self.watch_callback({
                    'type': 'error',
                    'data': {
                        'path': file_path,
                        'error': str(e)
                    }
                })

    def _handle_deleted(self, file_path: str):
        logger.debug(f"_handle_deleted 开始: {file_path}")
        delete_file_by_path(file_path)
        logger.debug("_handle_deleted 完成")

    def update_single_file(self, file_path: str):
        logger.debug(f"update_single_file 开始: {file_path}")
        if os.path.exists(file_path):
            self._process_file(file_path)
        logger.debug("update_single_file 完成")

    def get_status(self) -> Dict[str, Any]:
        logger.debug("get_status 被调用")
        status = {
            "is_active": self.is_active,
            "pending_files": self.scheduler.get_pending_count(),
            "watch_status": self.watcher.get_status(),
            "watch_root": self.watch_root
        }
        logger.debug(f"get_status 返回: {status}")
        return status
