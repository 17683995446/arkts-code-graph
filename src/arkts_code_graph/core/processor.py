import os
import hashlib
import time
import logging
import sys
import multiprocessing
from multiprocessing import Pool
from typing import List, Tuple, Optional, Dict, Any
from .parser import ArkTsParser, ParseResult
from .database import CodeGraphDatabase, ClassRecord, MethodRecord, CallRecord, ComponentRecord

# 创建处理器层专用logger
_proc_logger = logging.getLogger('CodeProcessor')
_proc_logger.setLevel(logging.DEBUG)
_ch = logging.StreamHandler(sys.stdout)
_ch.setLevel(logging.DEBUG)
_ch.setFormatter(logging.Formatter('%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s', datefmt='%H:%M:%S'))
_proc_logger.addHandler(_ch)

def _log_proc(level: str, msg: str):
    elapsed = time.time()
    full_msg = f"[{elapsed:.3f}s] {msg}"
    if level == 'DEBUG':
        _proc_logger.debug(full_msg)
    elif level == 'INFO':
        _proc_logger.info(full_msg)
    elif level == 'WARNING':
        _proc_logger.warning(full_msg)
    elif level == 'ERROR':
        _proc_logger.error(full_msg)
    elif level == 'CRITICAL':
        _proc_logger.critical(full_msg)

def _ensure_multiprocessing_safe():
    _log_proc('DEBUG', f'检查多进程安全')
    if multiprocessing.get_start_method() == 'spawn':
        _log_proc('DEBUG', f'  spawn模式检测到，设置sys.argv')
        import sys
        if not hasattr(sys, 'argv'):
            sys.argv = ['']
    _log_proc('DEBUG', f'多进程安全检查完成')
    return True

class ParsedFileData:
    def __init__(self, file_path: str, content_hash: bytes, parse_result: ParseResult):
        _log_proc('DEBUG', f'ParsedFileData.__init__ | path={file_path}')
        self.file_path = file_path
        self.content_hash = content_hash
        self.parse_result = parse_result

def _process_file_worker(args: Tuple[str, bytes]) -> Optional[ParsedFileData]:
    _log_proc('DEBUG', f'_process_file_worker 开始 | args={args}')
    file_path, file_hash = args
    parser = ArkTsParser()
    _log_proc('DEBUG', f'  创建ArkTsParser')
    
    try:
        _log_proc('DEBUG', f'  打开文件: {file_path}')
        with open(file_path, 'rb') as f:
            content = f.read()
        _log_proc('DEBUG', f'  文件读取完成 | 大小={len(content)}')
        
        content_hash = hashlib.sha256(content).digest()
        _log_proc('DEBUG', f'  计算hash: {content_hash[:8].hex()}...')
        
        if file_hash is not None and file_hash == content_hash:
            _log_proc('DEBUG', f'  hash未变化，跳过')
            return None
        
        content_str = content.decode('utf-8', errors='replace')
        _log_proc('DEBUG', f'  解码为字符串 | 长度={len(content_str)}')
        
        parse_result = parser.parse(content_str, file_path)
        _log_proc('DEBUG', f'  解析完成 | classes={len(parse_result.classes)}, methods={len(parse_result.methods)}, calls={len(parse_result.calls)}')
        
        result = ParsedFileData(file_path, content_hash, parse_result)
        _log_proc('INFO', f'_process_file_worker 完成 | {file_path}')
        return result
        
    except Exception as e:
        _log_proc('ERROR', f'处理文件失败 {file_path}: {e}')
        return None

class CodeProcessor:
    def __init__(self, db_path: str, max_workers: int = 8, batch_size: int = 1000):
        _log_proc('INFO', f'CodeProcessor.__init__开始 | db_path={db_path}, max_workers={max_workers}, batch_size={batch_size}')
        self.db_path = db_path
        _log_proc('DEBUG', f'  [1/5] 设置 db_path')
        self.db = CodeGraphDatabase(db_path)
        _log_proc('DEBUG', f'  [2/5] 创建数据库连接')
        self.max_workers = max_workers
        _log_proc('DEBUG', f'  [3/5] 设置 max_workers={max_workers}')
        self.batch_size = batch_size
        _log_proc('DEBUG', f'  [4/5] 设置 batch_size={batch_size}')
        _log_proc('DEBUG', f'  [5/5] 初始化完成')
        _log_proc('INFO', f'CodeProcessor.__init__完成')
    
    def scan_project(self, project_path: str, extensions: Tuple[str, ...] = ('.ets', '.arkts', '.ts')) -> List[str]:
        _log_proc('DEBUG', f'scan_project 开始 | path={project_path}, extensions={extensions}')
        file_paths = []
        _log_proc('DEBUG', f'  开始遍历目录')
        
        for root, dirs, files in os.walk(project_path):
            _log_proc('DEBUG', f'  遍历目录: {root}')
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            _log_proc('DEBUG', f'    过滤隐藏目录后: {dirs}')
            
            for file in files:
                _log_proc('DEBUG', f'    检查文件: {file}')
                if file.endswith(extensions):
                    full_path = os.path.abspath(os.path.join(root, file))
                    _log_proc('DEBUG', f'      添加: {full_path}')
                    file_paths.append(full_path)
        
        file_paths.sort()
        _log_proc('INFO', f'scan_project 完成 | 找到{len(file_paths)}个文件')
        return file_paths
    
    def _get_existing_hashes(self, file_paths: List[str]) -> Dict[str, bytes]:
        _log_proc('DEBUG', f'_get_existing_hashes 开始 | {len(file_paths)}个文件')
        hashes = {}
        
        for idx, file_path in enumerate(file_paths):
            _log_proc('DEBUG', f'  [{idx+1}/{len(file_paths)}] 查询: {file_path}')
            existing_id = self.db.get_file_id(file_path)
            _log_proc('DEBUG', f'    existing_id={existing_id}')
            
            if existing_id:
                result = self.db.query('SELECT hash FROM files WHERE id = ?', (existing_id,))
                _log_proc('DEBUG', f'    查询结果: {"有数据" if result else "无数据"}')
                if result:
                    hashes[file_path] = result[0][0]
                    _log_proc('DEBUG', f'    添加到hashes')
        
        _log_proc('INFO', f'_get_existing_hashes 完成 | {len(hashes)}个现有文件')
        return hashes
    
    def process_files(self, file_paths: List[str], force_reparse: bool = False) -> int:
        _log_proc('INFO', f'process_files 开始 | {len(file_paths)}个文件, force_reparse={force_reparse}')
        
        if not force_reparse:
            _log_proc('DEBUG', f'  获取现有文件hash')
            existing_hashes = self._get_existing_hashes(file_paths)
            args_list = [(fp, existing_hashes.get(fp)) for fp in file_paths]
            _log_proc('DEBUG', f'  需要重新处理的: {len([a for a in args_list if a[1] is None])}个')
        else:
            _log_proc('DEBUG', f'  强制重新解析')
            args_list = [(fp, None) for fp in file_paths]
        
        _log_proc('DEBUG', f'  启动进程池 | max_workers={self.max_workers}')
        try:
            with Pool(processes=self.max_workers) as pool:
                _log_proc('DEBUG', f'  进程池已创建，开始map')
                results = pool.map(_process_file_worker, args_list)
                _log_proc('DEBUG', f'  map完成 | 结果数={len(results)}')
        except (RuntimeError, ValueError) as e:
            _log_proc('WARNING', f'  多进程失败，回退到单进程: {e}')
            _log_proc('DEBUG', f'  开始单进程处理')
            results = []
            for idx, args in enumerate(args_list):
                _log_proc('DEBUG', f'    [{idx+1}/{len(args_list)}] 处理')
                results.append(_process_file_worker(args))
        
        results = [r for r in results if r is not None]
        _log_proc('DEBUG', f'  过滤后有效结果: {len(results)}个')
        
        _log_proc('DEBUG', f'  开始批量写入')
        self._batch_write_results(results)
        _log_proc('DEBUG', f'  批量写入完成')
        
        _log_proc('INFO', f'process_files 完成 | 处理{len(results)}个文件')
        return len(results)
    
    def _batch_write_results(self, results: List[ParsedFileData]):
        _log_proc('DEBUG', f'_batch_write_results 开始 | {len(results)}个结果')
        total_batches = (len(results) + self.batch_size - 1) // self.batch_size
        _log_proc('DEBUG', f'  分为 {total_batches} 批，每批最多 {self.batch_size}')
        
        for i in range(0, len(results), self.batch_size):
            batch_num = i // self.batch_size + 1
            _log_proc('DEBUG', f'  处理批次 {batch_num}/{total_batches}')
            batch = results[i:i + self.batch_size]
            self._write_batch(batch)
            _log_proc('DEBUG', f'  批次 {batch_num} 完成')
        
        _log_proc('INFO', f'_batch_write_results 完成')
    
    def _write_batch(self, batch: List[ParsedFileData]):
        _log_proc('DEBUG', f'_write_batch 开始 | {len(batch)}个文件')
        file_id_map = {}
        _log_proc('DEBUG', f'  初始化 file_id_map')
        class_id_map = {}
        _log_proc('DEBUG', f'  初始化 class_id_map')
        method_id_map = {}
        _log_proc('DEBUG', f'  初始化 method_id_map')
        
        _log_proc('DEBUG', f'  阶段1: 处理文件')
        for idx, data in enumerate(batch):
            _log_proc('DEBUG', f'    [{idx+1}/{len(batch)}] 文件: {data.file_path}')
            existing_file_id = self.db.get_file_id(data.file_path)
            _log_proc('DEBUG', f'      existing_file_id={existing_file_id}')
            
            if existing_file_id:
                _log_proc('DEBUG', f'      删除旧数据')
                self.db.delete_file_data(existing_file_id)
            
            _log_proc('DEBUG', f'      插入文件')
            file_id = self.db.upsert_file(data.file_path, data.content_hash)
            file_id_map[data.file_path] = file_id
            _log_proc('DEBUG', f'      file_id={file_id}')
        
        _log_proc('DEBUG', f'  阶段2: 插入classes')
        class_records = []
        for data in batch:
            file_id = file_id_map[data.file_path]
            for cls in data.parse_result.classes:
                _log_proc('DEBUG', f'    class={cls.name}, file_id={file_id}, flags={cls.flags}')
                class_records.append(ClassRecord(None, cls.name, file_id, cls.flags))
        
        _log_proc('DEBUG', f'  准备插入 {len(class_records)} 个classes')
        class_ids = self.db.batch_insert_classes(class_records)
        _log_proc('DEBUG', f'  插入完成 | 返回 {len(class_ids)} 个ID')
        
        _log_proc('DEBUG', f'  建立class_id映射')
        idx = 0
        for data in batch:
            file_id = file_id_map[data.file_path]
            for cls in data.parse_result.classes:
                class_id_map[(cls.name, file_id)] = class_ids[idx]
                idx += 1
        
        _log_proc('DEBUG', f'  阶段3: 插入methods')
        method_records = []
        for data in batch:
            file_id = file_id_map[data.file_path]
            for method in data.parse_result.methods:
                class_id = class_id_map.get((method.class_name, file_id)) if method.class_name else None
                _log_proc('DEBUG', f'    method={method.name}, class_id={class_id}, file_id={file_id}')
                method_records.append(MethodRecord(None, method.name, class_id, file_id))
        
        _log_proc('DEBUG', f'  准备插入 {len(method_records)} 个methods')
        method_ids = self.db.batch_insert_methods(method_records)
        _log_proc('DEBUG', f'  插入完成 | 返回 {len(method_ids)} 个ID')
        
        _log_proc('DEBUG', f'  建立method_id映射')
        idx = 0
        for data in batch:
            file_id = file_id_map[data.file_path]
            for method in data.parse_result.methods:
                class_id = class_id_map.get((method.class_name, file_id)) if method.class_name else None
                method_id_map[(method.name, class_id, file_id)] = method_ids[idx]
                idx += 1
        
        _log_proc('DEBUG', f'  阶段4: 构建per-file方法查找表')
        method_lookup = {}
        for (method_name, class_id, file_id), mid in method_id_map.items():
            key = (method_name, class_id, file_id)
            method_lookup[key] = mid
        
        per_file_methods: Dict[int, Dict[str, List[int]]] = {}
        for (method_name, class_id, file_id), mid in method_id_map.items():
            if file_id not in per_file_methods:
                per_file_methods[file_id] = {}
            if method_name not in per_file_methods[file_id]:
                per_file_methods[file_id][method_name] = []
            per_file_methods[file_id][method_name].append(mid)
        
        _log_proc('DEBUG', f'  per_file_methods: {len(per_file_methods)} 个文件')
        
        _log_proc('DEBUG', f'  阶段5: 处理calls')
        call_records = []
        call_candidates = 0
        call_added = 0
        
        for data in batch:
            file_id = file_id_map[data.file_path]
            for call in data.parse_result.calls:
                caller_class_id = class_id_map.get((call.caller_class, file_id)) if call.caller_class else None
                caller_id = method_id_map.get((call.caller_method, caller_class_id, file_id))
                
                if caller_id:
                    file_methods = per_file_methods.get(file_id, {})
                    callee_candidates = file_methods.get(call.callee_method, [])
                    call_candidates += len(callee_candidates)
                    
                    if len(callee_candidates) <= 5:
                        for callee_id in callee_candidates:
                            call_records.append(CallRecord(caller_id, callee_id))
                            call_added += 1
                    else:
                        _log_proc('DEBUG', f'    跳过过多候选: {call.callee_method} -> {len(callee_candidates)}个')
        
        _log_proc('DEBUG', f'  call候选: {call_candidates}, 添加: {call_added}')
        _log_proc('DEBUG', f'  插入calls')
        self.db.batch_insert_calls(call_records)
        
        _log_proc('DEBUG', f'  阶段6: 处理components')
        component_records = []
        for data in batch:
            file_id = file_id_map[data.file_path]
            for comp in data.parse_result.components:
                parent_id = class_id_map.get((comp.parent_class, file_id))
                child_id = class_id_map.get((comp.child_class, file_id))
                if parent_id and child_id:
                    _log_proc('DEBUG', f'    component: {comp.parent_class} -> {comp.child_class}')
                    component_records.append(ComponentRecord(parent_id, child_id))
        
        _log_proc('DEBUG', f'  插入 {len(component_records)} 个components')
        self.db.batch_insert_components(component_records)
        
        _log_proc('INFO', f'_write_batch 完成')
    
    def build_graph(self, project_path: str, force_reparse: bool = False) -> Dict[str, int]:
        _log_proc('INFO', f'build_graph 开始 | path={project_path}, force_reparse={force_reparse}')
        
        _log_proc('DEBUG', f'  [1/3] 扫描项目')
        file_paths = self.scan_project(project_path)
        _log_proc('DEBUG', f'    找到 {len(file_paths)} 个文件')
        
        _log_proc('DEBUG', f'  [2/3] 处理文件')
        processed_count = self.process_files(file_paths, force_reparse)
        _log_proc('DEBUG', f'    处理了 {processed_count} 个文件')
        
        _log_proc('DEBUG', f'  [3/3] 获取统计')
        stats = self.db.get_stats()
        stats['processed_files'] = processed_count
        _log_proc('DEBUG', f'    统计: {stats}')
        
        _log_proc('INFO', f'build_graph 完成')
        return stats
    
    def update_file(self, file_path: str) -> bool:
        _log_proc('DEBUG', f'update_file 开始 | path={file_path}')
        existing_hash = None
        existing_id = self.db.get_file_id(file_path)
        _log_proc('DEBUG', f'  existing_id={existing_id}')
        
        if existing_id:
            result = self.db.query('SELECT hash FROM files WHERE id = ?', (existing_id,))
            _log_proc('DEBUG', f'  查询hash: {"有" if result else "无"}')
            if result:
                existing_hash = result[0][0]
        
        _log_proc('DEBUG', f'  处理文件')
        result = _process_file_worker((file_path, existing_hash))
        
        if result:
            _log_proc('DEBUG', f'  写入结果')
            self._batch_write_results([result])
            _log_proc('INFO', f'update_file 完成 | 成功')
            return True
        
        _log_proc('INFO', f'update_file 完成 | 无变化')
        return False
    
    def close(self):
        _log_proc('DEBUG', f'close 开始')
        self.db.close()
        _log_proc('DEBUG', f'  数据库连接已关闭')
        _log_proc('INFO', f'close 完成')
