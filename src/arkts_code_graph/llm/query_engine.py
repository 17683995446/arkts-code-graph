import requests
import json
from typing import Optional, Dict, Any
from ..core.database import CodeGraphDatabase

class QueryEngine:
    def __init__(self, db_path: str, api_key: Optional[str] = None):
        self.db = CodeGraphDatabase(db_path)
        self.api_key = api_key
    
    def _generate_sql(self, question: str) -> Optional[str]:
        system_prompt = '''你是一个SQL生成专家，专门为代码知识图谱数据库生成SQL查询。

数据库Schema如下：

files(id INTEGER PRIMARY KEY, path TEXT UNIQUE, hash BLOB)
classes(id INTEGER PRIMARY KEY, name TEXT, file_id INTEGER, flags INTEGER)
methods(id INTEGER PRIMARY KEY, name TEXT, class_id INTEGER, file_id INTEGER)
calls(caller_id INTEGER, callee_id INTEGER, PRIMARY KEY(caller_id, callee_id))
components(parent_id INTEGER, child_id INTEGER, PRIMARY KEY(parent_id, child_id))

请根据用户的问题生成正确的SQL查询。
注意：
1. 使用数字ID进行关联
2. 使用JOIN连接表
3. 返回结果要包含有意义的列
4. 如果问题太模糊或无法回答，返回"无法回答"
5. 只返回SQL语句，不要有其他文字
'''
        
        user_prompt = f'问题：{question}'
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }
        
        data = {
            'model': 'Qwen/Qwen2.5-7B-Instruct',
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            'temperature': 0.1,
            'max_tokens': 1024
        }
        
        try:
            response = requests.post(
                'https://api.siliconflow.cn/v1/chat/completions',
                headers=headers,
                data=json.dumps(data)
            )
            
            if response.status_code == 200:
                result = response.json()
                sql = result['choices'][0]['message']['content'].strip()
                if sql.lower() == '无法回答':
                    return None
                return sql
            else:
                print(f'LLM API error: {response.status_code}')
                return None
        except Exception as e:
            print(f'LLM API error: {e}')
            return None
    
    def _execute_sql(self, sql: str) -> str:
        try:
            results = self.db.query(sql)
            if not results:
                return '未找到相关结果'
            
            lines = []
            for row in results:
                lines.append(str(row))
            
            return '\n'.join(lines)
        except Exception as e:
            return f'SQL执行错误: {e}'
    
    def query(self, question: str) -> str:
        sql = self._generate_sql(question)
        
        if not sql:
            return '无法回答该问题'
        
        print(f'生成的SQL: {sql}')
        
        return self._execute_sql(sql)
    
    def close(self):
        self.db.close()