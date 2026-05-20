import os
import hashlib
import multiprocessing
from multiprocessing import Pool
from typing import List, Tuple, Optional, Dict, Any
from .parser import ArkTsParser, ParseResult
from .database import CodeGraphDatabase, ClassRecord, MethodRecord, CallRecord, ComponentRecord


def _ensure_multiprocessing_safe():
    """Ensure safe multiprocessing initialization"""
    if multiprocessing.get_start_method() == 'spawn':
        import sys
        if not hasattr(sys, 'argv'):
            sys.argv = ['']
    return True

class ParsedFileData:
    def __init__(self, file_path: str, content_hash: bytes, parse_result: ParseResult):
        self.file_path = file_path
        self.content_hash = content_hash
        self.parse_result = parse_result

def _process_file_worker(args: Tuple[str, bytes]) -> Optional[ParsedFileData]:
    file_path, file_hash = args
    parser = ArkTsParser()
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        
        content_hash = hashlib.sha256(content).digest()
        
        if file_hash is not None and file_hash == content_hash:
            return None
        
        content_str = content.decode('utf-8', errors='replace')
        parse_result = parser.parse(content_str, file_path)
        
        return ParsedFileData(file_path, content_hash, parse_result)
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

class CodeProcessor:
    def __init__(self, db_path: str, max_workers: int = 8, batch_size: int = 1000):
        self.db_path = db_path
        self.db = CodeGraphDatabase(db_path)
        self.max_workers = max_workers
        self.batch_size = batch_size
    
    def scan_project(self, project_path: str, extensions: Tuple[str, ...] = ('.ets', '.arkts', '.ts')) -> List[str]:
        file_paths = []
        for root, dirs, files in os.walk(project_path):
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            for file in files:
                if file.endswith(extensions):
                    file_paths.append(os.path.abspath(os.path.join(root, file)))
        return sorted(file_paths)
    
    def _get_existing_hashes(self, file_paths: List[str]) -> Dict[str, bytes]:
        hashes = {}
        for file_path in file_paths:
            existing_id = self.db.get_file_id(file_path)
            if existing_id:
                result = self.db.query('SELECT hash FROM files WHERE id = ?', (existing_id,))
                if result:
                    hashes[file_path] = result[0][0]
        return hashes
    
    def process_files(self, file_paths: List[str], force_reparse: bool = False) -> int:
        if not force_reparse:
            existing_hashes = self._get_existing_hashes(file_paths)
            args_list = [(fp, existing_hashes.get(fp)) for fp in file_paths]
        else:
            args_list = [(fp, None) for fp in file_paths]
        
        try:
            with Pool(processes=self.max_workers) as pool:
                results = pool.map(_process_file_worker, args_list)
        except (RuntimeError, ValueError):
            # Fall back to single process
            print('Warning: Multiprocessing unavailable, falling back to single process')
            results = []
            for args in args_list:
                results.append(_process_file_worker(args))
        
        results = [r for r in results if r is not None]
        self._batch_write_results(results)
        
        return len(results)
    
    def _batch_write_results(self, results: List[ParsedFileData]):
        for i in range(0, len(results), self.batch_size):
            batch = results[i:i + self.batch_size]
            self._write_batch(batch)
    
    def _write_batch(self, batch: List[ParsedFileData]):
        file_id_map = {}
        class_id_map = {}
        method_id_map = {}
        
        for data in batch:
            # Check if file already existed
            existing_file_id = self.db.get_file_id(data.file_path)
            
            # If file existed, delete all old data first
            if existing_file_id:
                self.db.delete_file_data(existing_file_id)
            
            # Insert or update the file
            file_id = self.db.upsert_file(data.file_path, data.content_hash)
            file_id_map[data.file_path] = file_id
        
        class_records = []
        for data in batch:
            file_id = file_id_map[data.file_path]
            for cls in data.parse_result.classes:
                class_records.append(ClassRecord(None, cls.name, file_id, cls.flags))
        
        class_ids = self.db.batch_insert_classes(class_records)
        
        idx = 0
        for data in batch:
            file_id = file_id_map[data.file_path]
            for cls in data.parse_result.classes:
                class_id_map[(cls.name, file_id)] = class_ids[idx]
                idx += 1
        
        method_records = []
        for data in batch:
            file_id = file_id_map[data.file_path]
            for method in data.parse_result.methods:
                class_id = class_id_map.get((method.class_name, file_id)) if method.class_name else None
                method_records.append(MethodRecord(None, method.name, class_id, file_id))
        
        method_ids = self.db.batch_insert_methods(method_records)
        
        idx = 0
        for data in batch:
            file_id = file_id_map[data.file_path]
            for method in data.parse_result.methods:
                class_id = class_id_map.get((method.class_name, file_id)) if method.class_name else None
                method_id_map[(method.name, class_id, file_id)] = method_ids[idx]
                idx += 1
        
        # Build a per-file method lookup for more accurate matching
        # Also build a quick lookup: (method_name, class_name, file_id) -> method_id
        method_lookup = {}
        for (method_name, class_id, file_id), mid in method_id_map.items():
            key = (method_name, class_id, file_id)
            method_lookup[key] = mid
        
        # Also build a per-file method name -> list of method_ids
        per_file_methods: Dict[int, Dict[str, List[int]]] = {}
        for (method_name, class_id, file_id), mid in method_id_map.items():
            if file_id not in per_file_methods:
                per_file_methods[file_id] = {}
            if method_name not in per_file_methods[file_id]:
                per_file_methods[file_id][method_name] = []
            per_file_methods[file_id][method_name].append(mid)
        
        call_records = []
        for data in batch:
            file_id = file_id_map[data.file_path]
            for call in data.parse_result.calls:
                caller_class_id = class_id_map.get((call.caller_class, file_id)) if call.caller_class else None
                caller_id = method_id_map.get((call.caller_method, caller_class_id, file_id))
                
                if caller_id:
                    # Only match callees within the same file!
                    file_methods = per_file_methods.get(file_id, {})
                    callee_candidates = file_methods.get(call.callee_method, [])
                    
                    # Limit the number of candidates to avoid explosion
                    # If there are too many, skip (probably false positives)
                    if len(callee_candidates) <= 5:
                        for callee_id in callee_candidates:
                            call_records.append(CallRecord(caller_id, callee_id))
        
        self.db.batch_insert_calls(call_records)
        
        component_records = []
        for data in batch:
            file_id = file_id_map[data.file_path]
            for comp in data.parse_result.components:
                parent_id = class_id_map.get((comp.parent_class, file_id))
                child_id = class_id_map.get((comp.child_class, file_id))
                if parent_id and child_id:
                    component_records.append(ComponentRecord(parent_id, child_id))
        
        self.db.batch_insert_components(component_records)
    
    def build_graph(self, project_path: str, force_reparse: bool = False) -> Dict[str, int]:
        file_paths = self.scan_project(project_path)
        processed_count = self.process_files(file_paths, force_reparse)
        stats = self.db.get_stats()
        stats['processed_files'] = processed_count
        return stats
    
    def update_file(self, file_path: str) -> bool:
        existing_hash = None
        existing_id = self.db.get_file_id(file_path)
        if existing_id:
            result = self.db.query('SELECT hash FROM files WHERE id = ?', (existing_id,))
            if result:
                existing_hash = result[0][0]
        
        result = _process_file_worker((file_path, existing_hash))
        if result:
            self._batch_write_results([result])
            return True
        return False
    
    def close(self):
        self.db.close()
