from typing import Dict, List, Tuple, Set, Any
from .database import CodeGraphDatabase

class GraphBuilder:
    def __init__(self, db_path: str):
        self.db = CodeGraphDatabase(db_path)
    
    def build_class_graph(self) -> Dict[int, List[int]]:
        components = self.db.query('SELECT parent_id, child_id FROM components')
        graph = {}
        for parent, child in components:
            if parent not in graph:
                graph[parent] = []
            graph[parent].append(child)
        return graph
    
    def build_call_graph(self) -> Dict[int, List[int]]:
        calls = self.db.query('SELECT caller_id, callee_id FROM calls')
        graph = {}
        for caller, callee in calls:
            if caller not in graph:
                graph[caller] = []
            graph[caller].append(callee)
        return graph
    
    def find_class_hierarchy(self, class_id: int) -> List[int]:
        hierarchy = []
        current = class_id
        
        components = self.db.query('SELECT parent_id FROM components WHERE child_id = ?', (class_id,))
        while components:
            parent_id = components[0][0]
            hierarchy.append(parent_id)
            components = self.db.query('SELECT parent_id FROM components WHERE child_id = ?', (parent_id,))
        
        return hierarchy
    
    def find_callers(self, method_id: int) -> List[int]:
        callers = self.db.query('SELECT caller_id FROM calls WHERE callee_id = ?', (method_id,))
        return [c[0] for c in callers]
    
    def find_callees(self, method_id: int) -> List[int]:
        callees = self.db.query('SELECT callee_id FROM calls WHERE caller_id = ?', (method_id,))
        return [c[0] for c in callees]
    
    def get_class_info(self, class_id: int) -> Dict[str, Any]:
        result = self.db.query(
            'SELECT c.name, f.path FROM classes c JOIN files f ON c.file_id = f.id WHERE c.id = ?',
            (class_id,)
        )
        if result:
            return {'name': result[0][0], 'file': result[0][1]}
        return {}
    
    def get_method_info(self, method_id: int) -> Dict[str, Any]:
        result = self.db.query(
            '''SELECT m.name, c.name, f.path 
               FROM methods m 
               LEFT JOIN classes c ON m.class_id = c.id 
               JOIN files f ON m.file_id = f.id 
               WHERE m.id = ?''',
            (method_id,)
        )
        if result:
            return {'name': result[0][0], 'class_name': result[0][1], 'file': result[0][2]}
        return {}
    
    def close(self):
        self.db.close()