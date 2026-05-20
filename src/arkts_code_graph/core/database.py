import sqlite3
import hashlib
import time
from typing import List, Tuple, Optional, Any
from dataclasses import dataclass

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
        self.db_path = db_path
        self.conn = None
        self._connect()  # Connect immediately and keep open
        self._ensure_tables()
    
    def _connect(self):
        """Connect and keep the connection open"""
        if self.conn is None:
            # Add retries for connection stability
            max_retries = 5
            retry_delay = 0.1
            
            for attempt in range(max_retries):
                try:
                    self.conn = sqlite3.connect(self.db_path, timeout=30.0)
                    self.conn.execute("PRAGMA journal_mode = WAL")
                    self.conn.execute("PRAGMA synchronous = NORMAL")
                    self.conn.execute("PRAGMA cache_size = 50000")
                    self.conn.execute("PRAGMA temp_store = MEMORY")
                    self.conn.execute("PRAGMA busy_timeout = 5000")
                    break
                except sqlite3.OperationalError:
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay * (attempt + 1))
                    else:
                        raise
        
        return self.conn
    
    def close(self):
        if self.conn:
            try:
                self.conn.commit()
                self.conn.close()
            except Exception:
                pass
            self.conn = None
    
    def _ensure_tables(self):
        cursor = self.conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY,
                path TEXT UNIQUE,
                hash BLOB
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY,
                name TEXT,
                file_id INTEGER,
                flags INTEGER,
                FOREIGN KEY(file_id) REFERENCES files(id)
            )
        ''')
        
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
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS calls (
                caller_id INTEGER,
                callee_id INTEGER,
                PRIMARY KEY(caller_id, callee_id),
                FOREIGN KEY(caller_id) REFERENCES methods(id),
                FOREIGN KEY(callee_id) REFERENCES methods(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS components (
                parent_id INTEGER,
                child_id INTEGER,
                PRIMARY KEY(parent_id, child_id),
                FOREIGN KEY(parent_id) REFERENCES classes(id),
                FOREIGN KEY(child_id) REFERENCES classes(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS symbols (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE
            )
        ''')
        
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_classes_file_id ON classes(file_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_methods_class_id ON methods(class_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_methods_file_id ON methods(file_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_calls_callee_id ON calls(callee_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_components_child_id ON components(child_id)')
        
        self.conn.commit()
    
    def compute_file_hash(self, content: bytes) -> bytes:
        return hashlib.sha256(content).digest()
    
    def upsert_file(self, path: str, content: bytes) -> int:
        file_hash = self.compute_file_hash(content)
        cursor = self.conn.cursor()
        
        cursor.execute('SELECT id, hash FROM files WHERE path = ?', (path,))
        row = cursor.fetchone()
        
        if row:
            existing_id, existing_hash = row
            if existing_hash == file_hash:
                return existing_id
            cursor.execute('UPDATE files SET hash = ? WHERE id = ?', (file_hash, existing_id))
            self.conn.commit()
            return existing_id
        
        cursor.execute('INSERT INTO files (path, hash) VALUES (?, ?)', (path, file_hash))
        self.conn.commit()
        return cursor.lastrowid
    
    def batch_insert_classes(self, classes: List[ClassRecord]) -> List[int]:
        if not classes:
            return []
        cursor = self.conn.cursor()
        ids = []
        for cls in classes:
            cursor.execute(
                'INSERT INTO classes (name, file_id, flags) VALUES (?, ?, ?)',
                (cls.name, cls.file_id, cls.flags)
            )
            ids.append(cursor.lastrowid)
        self.conn.commit()
        return ids
    
    def batch_insert_methods(self, methods: List[MethodRecord]) -> List[int]:
        if not methods:
            return []
        cursor = self.conn.cursor()
        ids = []
        for method in methods:
            cursor.execute(
                'INSERT INTO methods (name, class_id, file_id) VALUES (?, ?, ?)',
                (method.name, method.class_id, method.file_id)
            )
            ids.append(cursor.lastrowid)
        self.conn.commit()
        return ids
    
    def batch_insert_calls(self, calls: List[CallRecord]):
        if not calls:
            return
        cursor = self.conn.cursor()
        for call in calls:
            try:
                cursor.execute(
                    'INSERT OR IGNORE INTO calls (caller_id, callee_id) VALUES (?, ?)',
                    (call.caller_id, call.callee_id)
                )
            except sqlite3.IntegrityError:
                pass
        self.conn.commit()
    
    def batch_insert_components(self, components: List[ComponentRecord]):
        if not components:
            return
        cursor = self.conn.cursor()
        for comp in components:
            try:
                cursor.execute(
                    'INSERT OR IGNORE INTO components (parent_id, child_id) VALUES (?, ?)',
                    (comp.parent_id, comp.child_id)
                )
            except sqlite3.IntegrityError:
                pass
        self.conn.commit()
    
    def get_file_id(self, path: str) -> Optional[int]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT id FROM files WHERE path = ?', (path,))
        row = cursor.fetchone()
        return row[0] if row else None
    
    def get_class_id(self, name: str, file_id: int) -> Optional[int]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT id FROM classes WHERE name = ? AND file_id = ?', (name, file_id))
        row = cursor.fetchone()
        return row[0] if row else None
    
    def get_method_id(self, name: str, class_id: Optional[int], file_id: int) -> Optional[int]:
        cursor = self.conn.cursor()
        cursor.execute(
            'SELECT id FROM methods WHERE name = ? AND class_id = ? AND file_id = ?',
            (name, class_id, file_id)
        )
        row = cursor.fetchone()
        return row[0] if row else None
    
    def delete_file_data(self, file_id: int):
        cursor = self.conn.cursor()
        cursor.execute('DELETE FROM calls WHERE caller_id IN (SELECT id FROM methods WHERE file_id = ?)', (file_id,))
        cursor.execute('DELETE FROM calls WHERE callee_id IN (SELECT id FROM methods WHERE file_id = ?)', (file_id,))
        cursor.execute('DELETE FROM components WHERE parent_id IN (SELECT id FROM classes WHERE file_id = ?)', (file_id,))
        cursor.execute('DELETE FROM components WHERE child_id IN (SELECT id FROM classes WHERE file_id = ?)', (file_id,))
        cursor.execute('DELETE FROM methods WHERE file_id = ?', (file_id,))
        cursor.execute('DELETE FROM classes WHERE file_id = ?', (file_id,))
        cursor.execute('DELETE FROM files WHERE id = ?', (file_id,))
        self.conn.commit()
    
    def query(self, sql: str, params: Tuple = ()) -> List[Tuple]:
        cursor = self.conn.cursor()
        cursor.execute(sql, params)
        return cursor.fetchall()
    
    def execute(self, sql: str, params: Tuple = ()) -> int:
        cursor = self.conn.cursor()
        cursor.execute(sql, params)
        self.conn.commit()
        return cursor.rowcount
    
    def get_stats(self) -> dict:
        cursor = self.conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM files')
        files_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM classes')
        classes_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM methods')
        methods_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM calls')
        calls_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM components')
        components_count = cursor.fetchone()[0]
        
        return {
            'files': files_count,
            'classes': classes_count,
            'methods': methods_count,
            'calls': calls_count,
            'components': components_count
        }
