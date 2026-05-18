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
    
    class_pattern = r'(?:export\s+)?class\s+(\w+)'
    interface_pattern = r'(?:export\s+)?interface\s+(\w+)'
    function_pattern = r'(?:export\s+)?function\s+(\w+)\s*\('
    arrow_function_pattern = r'(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>'
    variable_pattern = r'(?:export\s+)?const\s+(\w+)\s*[=:]'
    type_pattern = r'(?:export\s+)?type\s+(\w+)\s*='
    enum_pattern = r'(?:export\s+)?enum\s+(\w+)'
    
    added_names = set()
    brace_depth = 0  # 当前花括号深度
    
    for line_num, line in enumerate(lines, 1):
        in_block = brace_depth > 0
        
        class_match = re.search(class_pattern, line)
        if class_match and not in_block:
            name = class_match.group(1)
            if name not in added_names:
                added_names.add(name)
                start_line = line_num
                end_line = find_block_end_line(lines, line_num - 1)
                
                code_lines = lines[start_line-1:end_line]
                code = '\n'.join(code_lines)
                
                elem = {
                    "name": name,
                    "element_type": "class",
                    "code": code.strip()[:500],
                    "line_start": start_line,
                    "line_end": end_line,
                    "metadata": {}
                }
                
                extends_match = re.search(r'extends\s+(\w+)', line)
                if extends_match:
                    relations.append({
                        "from_name": name,
                        "to_name": extends_match.group(1),
                        "relation_type": "extends"
                    })
                
                elements.append(elem)
        
        interface_match = re.search(interface_pattern, line)
        if interface_match and not in_block:
            name = interface_match.group(1)
            if name not in added_names:
                added_names.add(name)
                start_line = line_num
                end_line = find_block_end_line(lines, line_num - 1)
                
                code_lines = lines[start_line-1:end_line]
                code = '\n'.join(code_lines)
                
                elements.append({
                    "name": name,
                    "element_type": "interface",
                    "code": code.strip()[:500],
                    "line_start": start_line,
                    "line_end": end_line,
                    "metadata": {}
                })
        
        function_match = re.search(function_pattern, line)
        if function_match and not in_block:
            name = function_match.group(1)
            if name not in added_names:
                added_names.add(name)
                start_line = line_num
                end_line = find_block_end_line(lines, line_num - 1)
                
                code_lines = lines[start_line-1:end_line]
                code = '\n'.join(code_lines)
                
                elements.append({
                    "name": name,
                    "element_type": "function",
                    "code": code.strip()[:500],
                    "line_start": start_line,
                    "line_end": end_line,
                    "metadata": {}
                })
        
        arrow_match = re.search(arrow_function_pattern, line)
        if arrow_match and not in_block:
            name = arrow_match.group(1)
            if name not in added_names:
                added_names.add(name)
                elements.append({
                    "name": name,
                    "element_type": "function",
                    "code": line.strip()[:500],
                    "line_start": line_num,
                    "line_end": line_num,
                    "metadata": {}
                })
        
        type_match = re.search(type_pattern, line)
        if type_match and not in_block:
            name = type_match.group(1)
            if name not in added_names:
                added_names.add(name)
                start_line = line_num
                if '{' in line:
                    end_line = find_block_end_line(lines, line_num - 1)
                else:
                    end_line = line_num
                
                code_lines = lines[start_line-1:end_line]
                code = '\n'.join(code_lines)
                
                elements.append({
                    "name": name,
                    "element_type": "type",
                    "code": code.strip()[:500],
                    "line_start": start_line,
                    "line_end": end_line,
                    "metadata": {}
                })
        
        enum_match = re.search(enum_pattern, line)
        if enum_match and not in_block:
            name = enum_match.group(1)
            if name not in added_names:
                added_names.add(name)
                start_line = line_num
                end_line = find_block_end_line(lines, line_num - 1)
                
                code_lines = lines[start_line-1:end_line]
                code = '\n'.join(code_lines)
                
                elements.append({
                    "name": name,
                    "element_type": "enum",
                    "code": code.strip()[:500],
                    "line_start": start_line,
                    "line_end": end_line,
                    "metadata": {}
                })
        
        var_match = re.search(variable_pattern, line)
        if var_match and not in_block:
            name = var_match.group(1)
            if name not in added_names:
                added_names.add(name)
                elements.append({
                    "name": name,
                    "element_type": "variable",
                    "code": line.strip()[:500],
                    "line_start": line_num,
                    "line_end": line_num,
                    "metadata": {}
                })
        
        # 检查代码之后再更新深度！
        brace_depth += line.count('{') - line.count('}')
    
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

def find_block_end_line(lines: list, start_idx: int) -> int:
    if start_idx >= len(lines):
        return start_idx + 1
    
    line = lines[start_idx]
    end_line = start_idx + 1
    
    if '{' not in line:
        return end_line
    
    brace_count = line.count('{') - line.count('}')
    
    if brace_count <= 0:
        return end_line
    
    for i in range(start_idx + 1, min(start_idx + 200, len(lines))):
        brace_count += lines[i].count('{') - lines[i].count('}')
        end_line = i + 1
        if brace_count <= 0:
            return end_line
    
    return end_line
