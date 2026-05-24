import sqlite3
from pathlib import Path
from typing import Optional
import hashlib
import sys
import os

# 添加项目根目录到路径，允许导入utils模块
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.logger import db_logger as logger

DATABASE_PATH = Path(__file__).parent.parent.parent / "data" / "knowledge_graph.db"

def get_connection() -> sqlite3.Connection:
    logger.debug(f"get_connection 开始: DATABASE_PATH={DATABASE_PATH}")
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    logger.debug("get_connection 完成")
    return conn

def init_database():
    logger.info(f"init_database 开始: DATABASE_PATH={DATABASE_PATH}")
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    logger.debug("目录已创建/已存在")
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # 启用外键约束
    logger.debug("启用外键约束")
    cursor.execute("PRAGMA foreign_keys = ON")
    
    logger.debug("创建 files 表")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT UNIQUE NOT NULL,
            hash TEXT NOT NULL,
            modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    logger.debug("创建 code_elements 表")
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
    
    logger.debug("创建 relations 表")
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
    
    logger.debug("创建索引")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_elements_file ON code_elements(file_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_elements_type ON code_elements(element_type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_relations_from ON relations(from_element)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_relations_to ON relations(to_element)")
    
    conn.commit()
    conn.close()
    logger.info("init_database 完成")

def safe_get_stats():
    """安全获取统计信息，处理表不存在的情况"""
    logger.debug("safe_get_stats 开始")
    try:
        result = get_stats()
        logger.debug(f"safe_get_stats 成功: {result}")
        return result
    except Exception as e:
        logger.error(f"safe_get_stats 出错: {e}", exc_info=True)
        return {
            'file_count': 0,
            'element_count': 0,
            'last_update': None
        }

def safe_get_all_files():
    """安全获取所有文件，处理表不存在的情况"""
    logger.debug("safe_get_all_files 开始")
    try:
        result = get_all_files()
        logger.debug(f"safe_get_all_files 成功: {len(result)} 个文件")
        return result
    except Exception as e:
        logger.error(f"safe_get_all_files 出错: {e}", exc_info=True)
        return []

def safe_get_all_elements():
    """安全获取所有元素，处理表不存在的情况"""
    logger.debug("safe_get_all_elements 开始")
    try:
        result = get_all_elements()
        logger.debug(f"safe_get_all_elements 成功: {len(result)} 个元素")
        return result
    except Exception as e:
        logger.error(f"safe_get_all_elements 出错: {e}", exc_info=True)
        return []

def safe_get_all_relations():
    """安全获取所有关系，处理表不存在的情况"""
    logger.debug("safe_get_all_relations 开始")
    try:
        result = get_all_relations()
        logger.debug(f"safe_get_all_relations 成功: {len(result)} 个关系")
        return result
    except Exception as e:
        logger.error(f"safe_get_all_relations 出错: {e}", exc_info=True)
        return []

def safe_search_elements(query: str, element_type: str = None):
    """安全搜索元素，处理表不存在的情况"""
    logger.debug(f"safe_search_elements 开始: query={query}, element_type={element_type}")
    try:
        result = search_elements(query, element_type)
        logger.debug(f"safe_search_elements 成功: {len(result)} 个结果")
        return result
    except Exception as e:
        logger.error(f"safe_search_elements 出错: {e}", exc_info=True)
        return []

def compute_file_hash(file_path: str) -> str:
    logger.debug(f"compute_file_hash 开始: {file_path}")
    try:
        logger.debug(f"打开文件 {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        logger.debug(f"计算 SHA-256 哈希")
        hash_result = hashlib.sha256(content.encode()).hexdigest()
        logger.debug(f"compute_file_hash 完成: {hash_result[:16]}...")
        return hash_result
    except Exception as e:
        logger.error(f"compute_file_hash 出错: {e}", exc_info=True)
        return ""

def get_file_hash(path: str) -> Optional[str]:
    logger.debug(f"get_file_hash 开始: path={path}")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug(f"执行 SELECT hash FROM files WHERE path = ?")
    cursor.execute("SELECT hash FROM files WHERE path = ?", (path,))
    row = cursor.fetchone()
    conn.close()
    result = row['hash'] if row else None
    logger.debug(f"get_file_hash 结果: {result}")
    return result

def has_file_changed(path: str) -> bool:
    logger.debug(f"has_file_changed 开始: path={path}")
    current_hash = compute_file_hash(path)
    stored_hash = get_file_hash(path)
    result = current_hash != stored_hash
    logger.debug(f"has_file_changed 结果: {result} (当前={current_hash[:16]}, 存储={stored_hash[:16] if stored_hash else 'None'})")
    return result

def insert_file(path: str, hash_value: str) -> int:
    logger.debug(f"insert_file 开始: path={path}, hash={hash_value[:16]}")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 INSERT OR REPLACE INTO files")
    cursor.execute("""
        INSERT OR REPLACE INTO files (path, hash, modified) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
    """, (path, hash_value))
    file_id = cursor.lastrowid
    conn.commit()
    conn.close()
    logger.debug(f"insert_file 完成: file_id={file_id}")
    return file_id

def delete_file_data(file_id: int):
    logger.debug(f"delete_file_data 开始: file_id={file_id}")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 DELETE FROM code_elements")
    cursor.execute("DELETE FROM code_elements WHERE file_id = ?", (file_id,))
    logger.debug("执行 DELETE FROM files")
    cursor.execute("DELETE FROM files WHERE id = ?", (file_id,))
    conn.commit()
    conn.close()
    logger.debug("delete_file_data 完成")

def delete_file_by_path(path: str):
    logger.debug(f"delete_file_by_path 开始: path={path}")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 SELECT id FROM files WHERE path = ?")
    cursor.execute("SELECT id FROM files WHERE path = ?", (path,))
    row = cursor.fetchone()
    if row:
        logger.debug(f"找到文件记录，file_id={row['id']}")
        logger.debug("执行 DELETE FROM code_elements")
        cursor.execute("DELETE FROM code_elements WHERE file_id = ?", (row['id'],))
        logger.debug("执行 DELETE FROM files")
        cursor.execute("DELETE FROM files WHERE id = ?", (row['id'],))
    else:
        logger.debug("未找到文件记录")
    conn.commit()
    conn.close()
    logger.debug("delete_file_by_path 完成")

def insert_code_element(file_id: int, name: str, element_type: str, code: str, 
                        line_start: int, line_end: int, metadata: str = '{}') -> int:
    logger.debug(f"insert_code_element 开始: file_id={file_id}, name={name}, element_type={element_type}, lines={line_start}-{line_end}")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 INSERT INTO code_elements")
    cursor.execute("""
        INSERT INTO code_elements (file_id, name, element_type, code, line_start, line_end, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (file_id, name, element_type, code, line_start, line_end, metadata))
    element_id = cursor.lastrowid
    conn.commit()
    conn.close()
    logger.debug(f"insert_code_element 完成: element_id={element_id}")
    return element_id

def insert_relation(from_element: int, to_element: int, relation_type: str) -> int:
    logger.debug(f"insert_relation 开始: from_element={from_element}, to_element={to_element}, relation_type={relation_type}")
    if to_element == 0:
        logger.debug("to_element 为 0，改为 -1")
        to_element = -1
    
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 INSERT INTO relations")
    cursor.execute("""
        INSERT INTO relations (from_element, to_element, relation_type)
        VALUES (?, ?, ?)
    """, (from_element, to_element, relation_type))
    relation_id = cursor.lastrowid
    conn.commit()
    conn.close()
    logger.debug(f"insert_relation 完成: relation_id={relation_id}")
    return relation_id

def get_all_files():
    logger.debug("get_all_files 开始")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 SELECT 文件统计")
    cursor.execute("""
        SELECT f.*, COUNT(e.id) as element_count 
        FROM files f 
        LEFT JOIN code_elements e ON f.id = e.file_id 
        GROUP BY f.id 
        ORDER BY f.modified DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    result = [dict(row) for row in rows]
    logger.debug(f"get_all_files 完成: {len(result)} 个文件")
    return result

def get_file_by_id(file_id: int):
    logger.debug(f"get_file_by_id 开始: file_id={file_id}")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 SELECT * FROM files WHERE id = ?")
    cursor.execute("SELECT * FROM files WHERE id = ?", (file_id,))
    row = cursor.fetchone()
    conn.close()
    result = dict(row) if row else None
    logger.debug(f"get_file_by_id 结果: {result}")
    return result

def get_file_elements(file_id: int):
    logger.debug(f"get_file_elements 开始: file_id={file_id}")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 SELECT * FROM code_elements WHERE file_id = ?")
    cursor.execute("""
        SELECT * FROM code_elements WHERE file_id = ? ORDER BY line_start
    """, (file_id,))
    rows = cursor.fetchall()
    conn.close()
    result = [dict(row) for row in rows]
    logger.debug(f"get_file_elements 完成: {len(result)} 个元素")
    return result

def get_all_elements():
    logger.debug("get_all_elements 开始")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 SELECT 元素与文件路径")
    cursor.execute("""
        SELECT e.*, f.path as file_path 
        FROM code_elements e 
        JOIN files f ON e.file_id = f.id
    """)
    rows = cursor.fetchall()
    conn.close()
    result = [dict(row) for row in rows]
    logger.debug(f"get_all_elements 完成: {len(result)} 个元素")
    return result

def get_all_relations():
    logger.debug("get_all_relations 开始")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 SELECT 关系与关联元素名称")
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
    result = [dict(row) for row in rows]
    logger.debug(f"get_all_relations 完成: {len(result)} 个关系")
    return result

def search_elements(query: str, element_type: str = None):
    logger.debug(f"search_elements 开始: query={query}, element_type={element_type}")
    conn = get_connection()
    cursor = conn.cursor()
    
    if element_type:
        logger.debug("执行带类型过滤的搜索")
        cursor.execute("""
            SELECT e.*, f.path as file_path 
            FROM code_elements e 
            JOIN files f ON e.file_id = f.id
            WHERE e.name LIKE ? AND e.element_type = ?
            ORDER BY e.name
        """, (f'%{query}%', element_type))
    else:
        logger.debug("执行普通搜索")
        cursor.execute("""
            SELECT e.*, f.path as file_path 
            FROM code_elements e 
            JOIN files f ON e.file_id = f.id
            WHERE e.name LIKE ? OR e.code LIKE ?
            ORDER BY e.name
        """, (f'%{query}%', f'%{query}%'))
    
    rows = cursor.fetchall()
    conn.close()
    result = [dict(row) for row in rows]
    logger.debug(f"search_elements 完成: {len(result)} 个结果")
    return result

def get_element_by_id(element_id: int):
    logger.debug(f"get_element_by_id 开始: element_id={element_id}")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 SELECT 单个元素")
    cursor.execute("""
        SELECT e.*, f.path as file_path 
        FROM code_elements e 
        JOIN files f ON e.file_id = f.id
        WHERE e.id = ?
    """, (element_id,))
    row = cursor.fetchone()
    conn.close()
    result = dict(row) if row else None
    logger.debug(f"get_element_by_id 结果: {result}")
    return result

def get_stats():
    logger.debug("get_stats 开始")
    conn = get_connection()
    cursor = conn.cursor()
    logger.debug("执行 SELECT COUNT(*) FROM files")
    cursor.execute("SELECT COUNT(*) as count FROM files")
    file_count = cursor.fetchone()['count']
    logger.debug("执行 SELECT COUNT(*) FROM code_elements")
    cursor.execute("SELECT COUNT(*) as count FROM code_elements")
    element_count = cursor.fetchone()['count']
    logger.debug("执行 SELECT MAX(modified) FROM files")
    cursor.execute("SELECT MAX(modified) as last_update FROM files")
    last_update = cursor.fetchone()['last_update']
    conn.close()
    result = {
        'file_count': file_count,
        'element_count': element_count,
        'last_update': last_update
    }
    logger.debug(f"get_stats 完成: {result}")
    return result

logger.debug("初始化数据库")
init_database()
