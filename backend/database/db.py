import sqlite3
from pathlib import Path
from typing import Optional
import hashlib

DATABASE_PATH = Path(__file__).parent.parent.parent / "data" / "knowledge_graph.db"

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # 启用外键约束
    cursor.execute("PRAGMA foreign_keys = ON")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT UNIQUE NOT NULL,
            hash TEXT NOT NULL,
            modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS code_elements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            element_type TEXT NOT NULL,
            code TEXT NOT NULL,
            line_start INTEGER NOT NULL,
            line_end INTEGER NOT NULL,
            metadata TEXT DEFAULT '{}',
            FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS relations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_element INTEGER NOT NULL,
            to_element INTEGER NOT NULL,
            relation_type TEXT NOT NULL,
            FOREIGN KEY (from_element) REFERENCES code_elements(id) ON DELETE CASCADE,
            FOREIGN KEY (to_element) REFERENCES code_elements(id) ON DELETE CASCADE
        )
    """)
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_elements_file ON code_elements(file_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_elements_type ON code_elements(element_type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_relations_from ON relations(from_element)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_relations_to ON relations(to_element)")
    
    conn.commit()
    conn.close()

def safe_get_stats():
    """安全获取统计信息，处理表不存在的情况"""
    try:
        return get_stats()
    except Exception:
        return {
            'file_count': 0,
            'element_count': 0,
            'last_update': None
        }

def safe_get_all_files():
    """安全获取所有文件，处理表不存在的情况"""
    try:
        return get_all_files()
    except Exception:
        return []

def safe_get_all_elements():
    """安全获取所有元素，处理表不存在的情况"""
    try:
        return get_all_elements()
    except Exception:
        return []

def safe_get_all_relations():
    """安全获取所有关系，处理表不存在的情况"""
    try:
        return get_all_relations()
    except Exception:
        return []

def safe_search_elements(query: str, element_type: str = None):
    """安全搜索元素，处理表不存在的情况"""
    try:
        return search_elements(query, element_type)
    except Exception:
        return []

def compute_file_hash(file_path: str) -> str:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return hashlib.sha256(content.encode()).hexdigest()
    except Exception:
        return ""

def get_file_hash(path: str) -> Optional[str]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT hash FROM files WHERE path = ?", (path,))
    row = cursor.fetchone()
    conn.close()
    return row['hash'] if row else None

def has_file_changed(path: str) -> bool:
    current_hash = compute_file_hash(path)
    stored_hash = get_file_hash(path)
    return current_hash != stored_hash

def insert_file(path: str, hash_value: str) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO files (path, hash, modified) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
    """, (path, hash_value))
    file_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return file_id

def delete_file_data(file_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM code_elements WHERE file_id = ?", (file_id,))
    cursor.execute("DELETE FROM files WHERE id = ?", (file_id,))
    conn.commit()
    conn.close()

def delete_file_by_path(path: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM files WHERE path = ?", (path,))
    row = cursor.fetchone()
    if row:
        cursor.execute("DELETE FROM code_elements WHERE file_id = ?", (row['id'],))
        cursor.execute("DELETE FROM files WHERE id = ?", (row['id'],))
    conn.commit()
    conn.close()

def insert_code_element(file_id: int, name: str, element_type: str, code: str, 
                        line_start: int, line_end: int, metadata: str = '{}') -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO code_elements (file_id, name, element_type, code, line_start, line_end, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (file_id, name, element_type, code, line_start, line_end, metadata))
    element_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return element_id

def insert_relation(from_element: int, to_element: int, relation_type: str) -> int:
    if to_element == 0:
        to_element = -1
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO relations (from_element, to_element, relation_type)
        VALUES (?, ?, ?)
    """, (from_element, to_element, relation_type))
    relation_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return relation_id

def get_all_files():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT f.*, COUNT(e.id) as element_count 
        FROM files f 
        LEFT JOIN code_elements e ON f.id = e.file_id 
        GROUP BY f.id 
        ORDER BY f.modified DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_file_by_id(file_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM files WHERE id = ?", (file_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_file_elements(file_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM code_elements WHERE file_id = ? ORDER BY line_start
    """, (file_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_all_elements():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT e.*, f.path as file_path 
        FROM code_elements e 
        JOIN files f ON e.file_id = f.id
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_all_relations():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.*, 
               e1.name as from_name, e1.element_type as from_type,
               COALESCE(e2.name, 'external') as to_name, 
               COALESCE(e2.element_type, 'import') as to_type
        FROM relations r
        JOIN code_elements e1 ON r.from_element = e1.id
        LEFT JOIN code_elements e2 ON r.to_element = e2.id
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def search_elements(query: str, element_type: str = None):
    conn = get_connection()
    cursor = conn.cursor()
    
    if element_type:
        cursor.execute("""
            SELECT e.*, f.path as file_path 
            FROM code_elements e 
            JOIN files f ON e.file_id = f.id
            WHERE e.name LIKE ? AND e.element_type = ?
            ORDER BY e.name
        """, (f'%{query}%', element_type))
    else:
        cursor.execute("""
            SELECT e.*, f.path as file_path 
            FROM code_elements e 
            JOIN files f ON e.file_id = f.id
            WHERE e.name LIKE ? OR e.code LIKE ?
            ORDER BY e.name
        """, (f'%{query}%', f'%{query}%'))
    
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_element_by_id(element_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT e.*, f.path as file_path 
        FROM code_elements e 
        JOIN files f ON e.file_id = f.id
        WHERE e.id = ?
    """, (element_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM files")
    file_count = cursor.fetchone()['count']
    cursor.execute("SELECT COUNT(*) as count FROM code_elements")
    element_count = cursor.fetchone()['count']
    cursor.execute("SELECT MAX(modified) as last_update FROM files")
    last_update = cursor.fetchone()['last_update']
    conn.close()
    return {
        'file_count': file_count,
        'element_count': element_count,
        'last_update': last_update
    }

init_database()
