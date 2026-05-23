import sqlite3
import hashlib
import time
import logging
import sys
from typing import List, Tuple, Optional, Any
from dataclasses import dataclass

# 创建数据库层专用logger
_db_logger = logging.getLogger('CodeGraphDB')
_db_logger.setLevel(logging.DEBUG)
_ch = logging.StreamHandler(sys.stdout)
_ch.setLevel(logging.DEBUG)
_ch.setFormatter(logging.Formatter('%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s', datefmt='%H:%M:%S'))
_db_logger.addHandler(_ch)

def _log_db(level: str, msg: str):
    elapsed = time.time()
    full_msg = f"[{elapsed:.3f}s] {msg}"
    if level == 'DEBUG':
        _db_logger.debug(full_msg)
    elif level == 'INFO':
        _db_logger.info(full_msg)
    elif level == 'WARNING':
        _db_logger.warning(full_msg)
    elif level == 'ERROR':
        _db_logger.error(full_msg)
    elif level == 'CRITICAL':
        _db_logger.critical(full_msg)

@dataclass
class FileRecord:
    id: Optional[int]
    path: str
    hash: bytes

@dataclass
class ClassRecord:
    id: Optional[int]
    name: str
    file_id: int
    flags: int = 0

@dataclass
class MethodRecord:
    id: Optional[int]
    name: str
    class_id: Optional[int]
    file_id: int

@dataclass
class CallRecord:
    caller_id: int
    callee_id: int

@dataclass
class ComponentRecord:
    parent_id: int
    child_id: int

class CodeGraphDatabase:
    def __init__(self, db_path: str):
        _log_db('INFO', f'Database.__init__开始 | db_path={db_path}')
        self.db_path = db_path
        _log_db('DEBUG', f'  [1/4] 设置 db_path')
        self.conn = None
        _log_db('DEBUG', f'  [2/4] 初始化 conn=None')
        self._connect()
        _log_db('DEBUG', f'  [3/4] 调用 _connect() 完成')
        self._ensure_tables()
        _log_db('DEBUG', f'  [4/4] 调用 _ensure_tables() 完成')
        _log_db('INFO', f'Database.__init__完成')
    
    def _connect(self):
        _log_db('DEBUG', f'_connect() 开始检查连接状态')
        if self.conn is None:
            _log_db('DEBUG', f'  连接为空，需要创建新连接')
            max_retries = 5
            retry_delay = 0.1
            _log_db('DEBUG', f'  设置 max_retries={max_retries}, retry_delay={retry_delay}')
            
            for attempt in range(max_retries):
                _log_db('DEBUG', f'  连接尝试 {attempt + 1}/{max_retries}')
                try:
                    self.conn = sqlite3.connect(self.db_path, timeout=30.0)
                    _log_db('DEBUG', f'    sqlite3.connect 成功')
                    self.conn.execute("PRAGMA journal_mode = WAL")
                    _log_db('DEBUG', f'    PRAGMA journal_mode = WAL')
                    self.conn.execute("PRAGMA synchronous = NORMAL")
                    _log_db('DEBUG', f'    PRAGMA synchronous = NORMAL')
                    self.conn.execute("PRAGMA cache_size = 50000")
                    _log_db('DEBUG', f'    PRAGMA cache_size = 50000')
                    self.conn.execute("PRAGMA temp_store = MEMORY")
                    _log_db('DEBUG', f'    PRAGMA temp_store = MEMORY')
                    self.conn.execute("PRAGMA busy_timeout = 5000")
                    _log_db('DEBUG', f'    PRAGMA busy_timeout = 5000')
                    _log_db('INFO', f'数据库连接成功建立 (attempt={attempt + 1})')
                    break
                except sqlite3.OperationalError as e:
                    _log_db('WARNING', f'    连接失败: {e}')
                    if attempt < max_retries - 1:
                        _log_db('DEBUG', f'    等待 {retry_delay * (attempt + 1):.2f}秒后重试')
                        time.sleep(retry_delay * (attempt + 1))
                    else:
                        _log_db('ERROR', f'  所有重试失败，抛出异常')
                        raise
        
        _log_db('DEBUG', f'_connect() 完成')
        return self.conn
    
    def close(self):
        _log_db('INFO', f'close() 开始')
        if self.conn:
            _log_db('DEBUG', f'  conn 存在，尝试关闭')
            try:
                self.conn.commit()
                _log_db('DEBUG', f'  commit 成功')
                self.conn.close()
                _log_db('DEBUG', f'  close 成功')
            except Exception as e:
                _log_db('ERROR', f'  关闭时出错: {e}')
                pass
            self.conn = None
            _log_db('DEBUG', f'  设置 conn=None')
        else:
            _log_db('DEBUG', f'  conn 不存在，无需关闭')
        _log_db('INFO', f'close() 完成')
    
    def _ensure_tables(self):
        _log_db('DEBUG', f'_ensure_tables() 开始')
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  获取 cursor')
        
        _log_db('DEBUG', f'  创建 files 表')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY,
                path TEXT UNIQUE,
                hash BLOB
            )
        ''')
        
        _log_db('DEBUG', f'  创建 classes 表')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY,
                name TEXT,
                file_id INTEGER,
                flags INTEGER,
                FOREIGN KEY(file_id) REFERENCES files(id)
            )
        ''')
        
        _log_db('DEBUG', f'  创建 methods 表')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS methods (
                id INTEGER PRIMARY KEY,
                name TEXT,
                class_id INTEGER,
                file_id INTEGER,
                FOREIGN KEY(class_id) REFERENCES classes(id),
                FOREIGN KEY(file_id) REFERENCES files(id)
            )
        ''')
        
        _log_db('DEBUG', f'  创建 calls 表')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS calls (
                caller_id INTEGER,
                callee_id INTEGER,
                PRIMARY KEY(caller_id, callee_id),
                FOREIGN KEY(caller_id) REFERENCES methods(id),
                FOREIGN KEY(callee_id) REFERENCES methods(id)
            )
        ''')
        
        _log_db('DEBUG', f'  创建 components 表')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS components (
                parent_id INTEGER,
                child_id INTEGER,
                PRIMARY KEY(parent_id, child_id),
                FOREIGN KEY(parent_id) REFERENCES classes(id),
                FOREIGN KEY(child_id) REFERENCES classes(id)
            )
        ''')
        
        _log_db('DEBUG', f'  创建 symbols 表')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS symbols (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE
            )
        ''')
        
        _log_db('DEBUG', f'  创建索引')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_classes_file_id ON classes(file_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_methods_class_id ON methods(class_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_methods_file_id ON methods(file_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_calls_callee_id ON calls(callee_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_components_child_id ON components(child_id)')
        
        self.conn.commit()
        _log_db('DEBUG', f'  commit 完成')
        _log_db('INFO', f'_ensure_tables() 完成')
    
    def compute_file_hash(self, content: bytes) -> bytes:
        _log_db('DEBUG', f'compute_file_hash() 开始 | content长度={len(content)}')
        result = hashlib.sha256(content).digest()
        _log_db('DEBUG', f'compute_file_hash() 完成 | hash长度={len(result)}')
        return result
    
    def upsert_file(self, path: str, content_hash: bytes) -> int:
        _log_db('DEBUG', f'upsert_file() 开始 | path={path}')
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  查询现有文件')
        cursor.execute('SELECT id, hash FROM files WHERE path = ?', (path,))
        row = cursor.fetchone()
        _log_db('DEBUG', f'  查询结果: {"存在" if row else "不存在"}')
        
        if row:
            existing_id, existing_hash = row
            _log_db('DEBUG', f'  existing_id={existing_id}')
            if existing_hash == content_hash:
                _log_db('DEBUG', f'  hash相同，返回现有ID')
                return existing_id
            _log_db('DEBUG', f'  hash不同，更新记录')
            cursor.execute('UPDATE files SET hash = ? WHERE id = ?', (content_hash, existing_id))
            self.conn.commit()
            _log_db('DEBUG', f'  更新并commit')
            return existing_id
        
        _log_db('DEBUG', f'  插入新记录')
        cursor.execute('INSERT INTO files (path, hash) VALUES (?, ?)', (path, content_hash))
        self.conn.commit()
        _log_db('DEBUG', f'  插入并commit')
        result = cursor.lastrowid
        _log_db('INFO', f'upsert_file() 完成 | 返回ID={result}')
        return result
    
    def batch_insert_classes(self, classes: List[ClassRecord]) -> List[int]:
        _log_db('DEBUG', f'batch_insert_classes() 开始 | 数量={len(classes)}')
        if not classes:
            _log_db('DEBUG', f'  classes为空，返回[]')
            return []
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  获取cursor')
        ids = []
        _log_db('DEBUG', f'  开始循环插入')
        for idx, cls in enumerate(classes):
            _log_db('DEBUG', f'    [{idx+1}/{len(classes)}] 插入 class={cls.name}, file_id={cls.file_id}')
            cursor.execute(
                'INSERT INTO classes (name, file_id, flags) VALUES (?, ?, ?)',
                (cls.name, cls.file_id, cls.flags)
            )
            _log_db('DEBUG', f'    [{idx+1}] lastrowid={cursor.lastrowid}')
            ids.append(cursor.lastrowid)
        self.conn.commit()
        _log_db('DEBUG', f'  批量commit完成')
        _log_db('INFO', f'batch_insert_classes() 完成 | 返回{len(ids)}个ID')
        return ids
    
    def batch_insert_methods(self, methods: List[MethodRecord]) -> List[int]:
        _log_db('DEBUG', f'batch_insert_methods() 开始 | 数量={len(methods)}')
        if not methods:
            _log_db('DEBUG', f'  methods为空，返回[]')
            return []
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  获取cursor')
        ids = []
        _log_db('DEBUG', f'  开始循环插入')
        for idx, method in enumerate(methods):
            _log_db('DEBUG', f'    [{idx+1}/{len(methods)}] 插入 method={method.name}, class_id={method.class_id}')
            cursor.execute(
                'INSERT INTO methods (name, class_id, file_id) VALUES (?, ?, ?)',
                (method.name, method.class_id, method.file_id)
            )
            _log_db('DEBUG', f'    [{idx+1}] lastrowid={cursor.lastrowid}')
            ids.append(cursor.lastrowid)
        self.conn.commit()
        _log_db('DEBUG', f'  批量commit完成')
        _log_db('INFO', f'batch_insert_methods() 完成 | 返回{len(ids)}个ID')
        return ids
    
    def batch_insert_calls(self, calls: List[CallRecord]):
        _log_db('DEBUG', f'batch_insert_calls() 开始 | 数量={len(calls)}')
        if not calls:
            _log_db('DEBUG', f'  calls为空，直接返回')
            return
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  获取cursor')
        insert_count = 0
        skip_count = 0
        _log_db('DEBUG', f'  开始循环插入')
        for idx, call in enumerate(calls):
            try:
                _log_db('DEBUG', f'    [{idx+1}/{len(calls)}] 插入 call caller={call.caller_id} -> callee={call.callee_id}')
                cursor.execute(
                    'INSERT OR IGNORE INTO calls (caller_id, callee_id) VALUES (?, ?)',
                    (call.caller_id, call.callee_id)
                )
                insert_count += 1
                _log_db('DEBUG', f'    [{idx+1}] 插入成功')
            except sqlite3.IntegrityError as e:
                skip_count += 1
                _log_db('DEBUG', f'    [{idx+1}] 跳过(IntegrityError): {e}')
        self.conn.commit()
        _log_db('DEBUG', f'  批量commit完成 | 插入={insert_count}, 跳过={skip_count}')
        _log_db('INFO', f'batch_insert_calls() 完成')
    
    def batch_insert_components(self, components: List[ComponentRecord]):
        _log_db('DEBUG', f'batch_insert_components() 开始 | 数量={len(components)}')
        if not components:
            _log_db('DEBUG', f'  components为空，直接返回')
            return
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  获取cursor')
        insert_count = 0
        skip_count = 0
        _log_db('DEBUG', f'  开始循环插入')
        for idx, comp in enumerate(components):
            try:
                _log_db('DEBUG', f'    [{idx+1}/{len(components)}] 插入 component parent={comp.parent_id} -> child={comp.child_id}')
                cursor.execute(
                    'INSERT OR IGNORE INTO components (parent_id, child_id) VALUES (?, ?)',
                    (comp.parent_id, comp.child_id)
                )
                insert_count += 1
                _log_db('DEBUG', f'    [{idx+1}] 插入成功')
            except sqlite3.IntegrityError as e:
                skip_count += 1
                _log_db('DEBUG', f'    [{idx+1}] 跳过(IntegrityError): {e}')
        self.conn.commit()
        _log_db('DEBUG', f'  批量commit完成 | 插入={insert_count}, 跳过={skip_count}')
        _log_db('INFO', f'batch_insert_components() 完成')
    
    def get_file_id(self, path: str) -> Optional[int]:
        _log_db('DEBUG', f'get_file_id() 开始 | path={path}')
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  执行查询')
        cursor.execute('SELECT id FROM files WHERE path = ?', (path,))
        row = cursor.fetchone()
        _log_db('DEBUG', f'  查询结果: {"存在" if row else "不存在"}')
        result = row[0] if row else None
        _log_db('INFO', f'get_file_id() 完成 | 返回={result}')
        return result
    
    def get_class_id(self, name: str, file_id: int) -> Optional[int]:
        _log_db('DEBUG', f'get_class_id() 开始 | name={name}, file_id={file_id}')
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  执行查询')
        cursor.execute('SELECT id FROM classes WHERE name = ? AND file_id = ?', (name, file_id))
        row = cursor.fetchone()
        _log_db('DEBUG', f'  查询结果: {"存在" if row else "不存在"}')
        result = row[0] if row else None
        _log_db('INFO', f'get_class_id() 完成 | 返回={result}')
        return result
    
    def get_method_id(self, name: str, class_id: Optional[int], file_id: int) -> Optional[int]:
        _log_db('DEBUG', f'get_method_id() 开始 | name={name}, class_id={class_id}, file_id={file_id}')
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  执行查询')
        cursor.execute(
            'SELECT id FROM methods WHERE name = ? AND class_id = ? AND file_id = ?',
            (name, class_id, file_id)
        )
        row = cursor.fetchone()
        _log_db('DEBUG', f'  查询结果: {"存在" if row else "不存在"}')
        result = row[0] if row else None
        _log_db('INFO', f'get_method_id() 完成 | 返回={result}')
        return result
    
    def delete_file_data(self, file_id: int):
        _log_db('DEBUG', f'delete_file_data() 开始 | file_id={file_id}')
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  获取cursor')
        
        _log_db('DEBUG', f'  删除 calls (caller_id)')
        cursor.execute('DELETE FROM calls WHERE caller_id IN (SELECT id FROM methods WHERE file_id = ?)', (file_id,))
        _log_db('DEBUG', f'    影响行数={cursor.rowcount}')
        
        _log_db('DEBUG', f'  删除 calls (callee_id)')
        cursor.execute('DELETE FROM calls WHERE callee_id IN (SELECT id FROM methods WHERE file_id = ?)', (file_id,))
        _log_db('DEBUG', f'    影响行数={cursor.rowcount}')
        
        _log_db('DEBUG', f'  删除 components (parent_id)')
        cursor.execute('DELETE FROM components WHERE parent_id IN (SELECT id FROM classes WHERE file_id = ?)', (file_id,))
        _log_db('DEBUG', f'    影响行数={cursor.rowcount}')
        
        _log_db('DEBUG', f'  删除 components (child_id)')
        cursor.execute('DELETE FROM components WHERE child_id IN (SELECT id FROM classes WHERE file_id = ?)', (file_id,))
        _log_db('DEBUG', f'    影响行数={cursor.rowcount}')
        
        _log_db('DEBUG', f'  删除 methods')
        cursor.execute('DELETE FROM methods WHERE file_id = ?', (file_id,))
        _log_db('DEBUG', f'    影响行数={cursor.rowcount}')
        
        _log_db('DEBUG', f'  删除 classes')
        cursor.execute('DELETE FROM classes WHERE file_id = ?', (file_id,))
        _log_db('DEBUG', f'    影响行数={cursor.rowcount}')
        
        _log_db('DEBUG', f'  删除 files')
        cursor.execute('DELETE FROM files WHERE id = ?', (file_id,))
        _log_db('DEBUG', f'    影响行数={cursor.rowcount}')
        
        self.conn.commit()
        _log_db('DEBUG', f'  commit 完成')
        _log_db('INFO', f'delete_file_data() 完成')
    
    def query(self, sql: str, params: Tuple = ()) -> List[Tuple]:
        _log_db('DEBUG', f'query() 开始 | sql={sql[:100]}...')
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  执行查询')
        cursor.execute(sql, params)
        result = cursor.fetchall()
        _log_db('DEBUG', f'  返回 {len(result)} 行')
        _log_db('INFO', f'query() 完成')
        return result
    
    def execute(self, sql: str, params: Tuple = ()) -> int:
        _log_db('DEBUG', f'execute() 开始 | sql={sql[:100]}...')
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  执行语句')
        cursor.execute(sql, params)
        self.conn.commit()
        _log_db('DEBUG', f'  commit 完成 | rowcount={cursor.rowcount}')
        _log_db('INFO', f'execute() 完成')
        return cursor.rowcount
    
    def get_stats(self) -> dict:
        _log_db('DEBUG', f'get_stats() 开始')
        cursor = self.conn.cursor()
        _log_db('DEBUG', f'  获取cursor')
        
        _log_db('DEBUG', f'  统计 files')
        cursor.execute('SELECT COUNT(*) FROM files')
        files_count = cursor.fetchone()[0]
        _log_db('DEBUG', f'    files_count={files_count}')
        
        _log_db('DEBUG', f'  统计 classes')
        cursor.execute('SELECT COUNT(*) FROM classes')
        classes_count = cursor.fetchone()[0]
        _log_db('DEBUG', f'    classes_count={classes_count}')
        
        _log_db('DEBUG', f'  统计 methods')
        cursor.execute('SELECT COUNT(*) FROM methods')
        methods_count = cursor.fetchone()[0]
        _log_db('DEBUG', f'    methods_count={methods_count}')
        
        _log_db('DEBUG', f'  统计 calls')
        cursor.execute('SELECT COUNT(*) FROM calls')
        calls_count = cursor.fetchone()[0]
        _log_db('DEBUG', f'    calls_count={calls_count}')
        
        _log_db('DEBUG', f'  统计 components')
        cursor.execute('SELECT COUNT(*) FROM components')
        components_count = cursor.fetchone()[0]
        _log_db('DEBUG', f'    components_count={components_count}')
        
        result = {
            'files': files_count,
            'classes': classes_count,
            'methods': methods_count,
            'calls': calls_count,
            'components': components_count
        }
        _log_db('INFO', f'get_stats() 完成 | {result}')
        return result
