import os
import json
import re
import httpx
from typing import Dict, Any, Optional

SILICON_FLOW_API_KEY = "sk-uqelhavcdhfxjzjesdenxpbtqombamjniazzjtbssmdcwdvg"
SILICON_FLOW_API_URL = "https://api.siliconflow.cn/v1/chat/completions"

SYSTEM_PROMPT = """你是一个专业的ArkTS/TypeScript代码分析助手。请分析代码并提取所有元素。

输出JSON格式：
```json
{
  "elements": [
    {
      "name": "名称",
      "element_type": "function|class|interface|variable",
      "code": "代码",
      "line_start": 1,
      "line_end": 10,
      "metadata": {}
    }
  ],
  "relations": [
    {"from_name": "A", "to_name": "B", "relation_type": "calls|imports|extends"}
  ]
}
```

只输出JSON，不要其他内容。"""

def parse_code_with_llm(file_path: str, content: str) -> Dict[str, Any]:
    try:
        response = call_silicon_flow(file_path, content)
        result = parse_llm_response(response)
        if result and 'elements' in result:
            return result
    except Exception as e:
        print(f"LLM调用失败: {e}")
    
    return extract_elements_regex(content)

def call_silicon_flow(file_path: str, content: str) -> str:
    headers = {
        "Authorization": f"Bearer {SILICON_FLOW_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"分析文件 {os.path.basename(file_path)}，提取所有代码元素：\n\n```typescript\n{content[:8000]}\n```"
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]
    
    payload = {
        "model": "Qwen/Qwen2.5-7B-Instruct",
        "messages": messages,
        "temperature": 0.1,
        "max_tokens": 2048
    }
    
    with httpx.Client(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
        response = client.post(SILICON_FLOW_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content']

def parse_llm_response(response: str) -> Optional[Dict[str, Any]]:
    try:
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            return json.loads(json_match.group())
    except json.JSONDecodeError:
        pass
    return None

def extract_elements_regex(content: str) -> Dict[str, Any]:
    elements = []
    relations = []
    lines = content.split('\n')
    
    patterns = [
        (r'(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?',
         'class'),
        (r'(?:export\s+)?interface\s+(\w+)', 'interface'),
        (r'(?:(?:export|async)\s+)*function\s+(\w+)\s*\(', 'function'),
        (r'(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(', 'function'),
        (r'(?:export\s+)?const\s+(\w+)\s*[=:]', 'variable'),
    ]
    
    for pattern, elem_type in patterns:
        regex = re.compile(pattern, re.MULTILINE)
        for match in regex.finditer(content):
            name = match.group(1)
            start_line = content[:match.start()].count('\n') + 1
            end_line = find_block_end(content, match.end()) if elem_type in ['class', 'function'] else start_line
            
            if any(e['name'] == name for e in elements):
                continue
            
            code = '\n'.join(lines[max(0, start_line-1):min(len(lines), end_line)])
            
            elem = {
                "name": name,
                "element_type": elem_type,
                "code": code.strip()[:500],
                "line_start": start_line,
                "line_end": end_line,
                "metadata": {}
            }
            
            if elem_type == 'class' and match.group(2):
                relations.append({
                    "from_name": name,
                    "to_name": match.group(2),
                    "relation_type": "extends"
                })
            
            elements.append(elem)
    
    import_pattern = re.compile(r'import\s+(?:{\s*)?([\w,\s*]+)(?:\s*})?\s+from\s+[\'"]([^\'"]+)[\'"]', re.MULTILINE)
    for match in import_pattern.finditer(content):
        for item in match.group(1).split(','):
            item = item.strip()
            if item and item != '*':
                relations.append({
                    "from_name": item,
                    "to_name": match.group(2),
                    "relation_type": "imports"
                })
    
    return {"elements": elements, "relations": relations[:50]}

def find_block_end(content: str, start: int) -> int:
    brace_count = 1
    i = start
    while i < len(content) and brace_count > 0:
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
        i += 1
    return min(content[:i].count('\n') + 1, start + 200)
