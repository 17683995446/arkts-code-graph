import os
import json
import re
import sys
import httpx
from pathlib import Path
from typing import Dict, Any, Optional

# 添加项目根目录到路径，允许导入utils模块
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.logger import llm_logger as logger

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
    """使用正则表达式解析代码元素"""
    logger.debug(f"parse_code_with_llm 开始: file_path={file_path}, content_length={len(content)}")
    result = extract_elements_regex(content)
    logger.debug(f"parse_code_with_llm 完成: {len(result['elements'])} 个元素, {len(result['relations'])} 个关系")
    return result

def call_silicon_flow(file_path: str, content: str) -> str:
    logger.debug(f"call_silicon_flow 开始: file_path={file_path}")
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
    
    logger.debug("调用SiliconFlow API")
    with httpx.Client(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
        response = client.post(SILICON_FLOW_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        logger.debug("收到API响应")
        return data['choices'][0]['message']['content']

def parse_llm_response(response: str) -> Optional[Dict[str, Any]]:
    logger.debug("parse_llm_response 开始")
    try:
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            logger.debug("找到JSON匹配")
            result = json.loads(json_match.group())
            logger.debug(f"parse_llm_response 完成")
            return result
    except json.JSONDecodeError as e:
        logger.error(f"JSON解析错误: {e}", exc_info=True)
    logger.debug("parse_llm_response 返回None")
    return None

def remove_comments_and_strings(content: str) -> str:
    """去掉注释和字符串内容，避免误解析"""
    logger.debug("remove_comments_and_strings 开始")
    # 替换多行注释 /* ... */
    pattern = r'/\*[\s\S]*?\*/'
    content = re.sub(pattern, '', content)
    logger.debug("已替换多行注释")
    
    # 替换单行注释 // ...
    content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
    logger.debug("已替换单行注释")
    
    # 替换双引号字符串
    content = re.sub(r'"[^"]*"', '', content)
    logger.debug("已替换双引号字符串")
    
    # 替换单引号字符串
    content = re.sub(r"'[^']*'", '', content)
    logger.debug("已替换单引号字符串")
    
    # 替换反引号字符串（模板字符串）
    content = re.sub(r'`[^`]*`', '', content)
    logger.debug("已替换反引号字符串")
    
    logger.debug("remove_comments_and_strings 完成")
    return content

def extract_elements_regex(content: str) -> Dict[str, Any]:
    """使用正则表达式提取代码元素"""
    logger.debug("extract_elements_regex 开始")
    elements = []
    relations = []
    lines = content.split('\n')
    logger.debug(f"共有 {len(lines)} 行代码")
    
    # 创建清理版本用于检查（去掉注释和字符串）
    cleaned_content = remove_comments_and_strings(content)
    cleaned_lines = cleaned_content.split('\n')
    
    # 更新正则表达式，支持$和_等有效字符
    # 标识符可以由字母、数字、_、$组成，但不能以数字开头
    class_pattern = r'(?:export\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)(?:<[^>]+>)?'
    interface_pattern = r'(?:export\s+)?interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)(?:<[^>]+>)?'
    function_pattern = r'(?:export\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\('
    arrow_function_pattern = r'(?:export\s+)?const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>'
    variable_pattern = r'(?:export\s+)?const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=:]'
    type_pattern = r'(?:export\s+)?type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)(?:<[^>]+>)?\s*='
    enum_pattern = r'(?:export\s+)?enum\s+([a-zA-Z_$][a-zA-Z0-9_$]*)'
    namespace_pattern = r'(?:export\s+)?namespace\s+([a-zA-Z_$][a-zA-Z0-9_$]*)'
    
    added_names = set()
    brace_depth = 0  # 当前花括号深度
    
    logger.debug("开始逐行扫描代码")
    # 关键修复：使用 re.finditer() 替代 re.search()，支持同一行多个元素
    for line_num, (line, cleaned_line) in enumerate(zip(lines, cleaned_lines), 1):
        in_block = brace_depth > 0
        
        # 1. Class 匹配：支持同一行多个 class 声明
        for class_match in re.finditer(class_pattern, cleaned_line):
            if in_block:
                logger.debug(f"第 {line_num} 行：在块内，跳过 class")
                continue
            name = class_match.group(1)
            if name not in added_names:
                logger.debug(f"第 {line_num} 行：找到 class {name}")
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
                    logger.debug(f"class {name} extends {extends_match.group(1)}")
                    relations.append({
                        "from_name": name,
                        "to_name": extends_match.group(1),
                        "relation_type": "extends"
                    })
                
                elements.append(elem)
        
        # 2. Interface 匹配：支持同一行多个 interface 声明
        for interface_match in re.finditer(interface_pattern, cleaned_line):
            if in_block:
                logger.debug(f"第 {line_num} 行：在块内，跳过 interface")
                continue
            name = interface_match.group(1)
            if name not in added_names:
                logger.debug(f"第 {line_num} 行：找到 interface {name}")
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
        
        # 3. Function 匹配：支持同一行多个 function 声明
        for function_match in re.finditer(function_pattern, cleaned_line):
            if in_block:
                logger.debug(f"第 {line_num} 行：在块内，跳过 function")
                continue
            name = function_match.group(1)
            if name not in added_names:
                logger.debug(f"第 {line_num} 行：找到 function {name}")
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
        
        # 4. Arrow Function 匹配：支持同一行多个箭头函数
        for arrow_match in re.finditer(arrow_function_pattern, cleaned_line):
            if in_block:
                logger.debug(f"第 {line_num} 行：在块内，跳过 arrow function")
                continue
            name = arrow_match.group(1)
            if name not in added_names:
                logger.debug(f"第 {line_num} 行：找到 arrow function {name}")
                added_names.add(name)
                elements.append({
                    "name": name,
                    "element_type": "function",
                    "code": line.strip()[:500],
                    "line_start": line_num,
                    "line_end": line_num,
                    "metadata": {}
                })
        
        # 5. Type 匹配：支持同一行多个 type 声明
        for type_match in re.finditer(type_pattern, cleaned_line):
            if in_block:
                logger.debug(f"第 {line_num} 行：在块内，跳过 type")
                continue
            name = type_match.group(1)
            if name not in added_names:
                logger.debug(f"第 {line_num} 行：找到 type {name}")
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
        
        # 6. Enum 匹配：支持同一行多个 enum 声明
        for enum_match in re.finditer(enum_pattern, cleaned_line):
            if in_block:
                logger.debug(f"第 {line_num} 行：在块内，跳过 enum")
                continue
            name = enum_match.group(1)
            if name not in added_names:
                logger.debug(f"第 {line_num} 行：找到 enum {name}")
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
        
        # 7. Namespace 匹配：关键修复！移除 in_block 限制，支持嵌套 namespace
        for namespace_match in re.finditer(namespace_pattern, cleaned_line):
            name = namespace_match.group(1)
            if name not in added_names:
                logger.debug(f"第 {line_num} 行：找到 namespace {name} (当前深度: {brace_depth})")
                added_names.add(name)
                start_line = line_num
                end_line = find_block_end_line(lines, line_num - 1)
                
                code_lines = lines[start_line-1:end_line]
                code = '\n'.join(code_lines)
                
                elements.append({
                    "name": name,
                    "element_type": "namespace",
                    "code": code.strip()[:500],
                    "line_start": start_line,
                    "line_end": end_line,
                    "metadata": {
                        "nesting_depth": brace_depth
                    }
                })
        
        # 8. Variable 匹配：支持同一行多个变量
        for var_match in re.finditer(variable_pattern, cleaned_line):
            if in_block:
                logger.debug(f"第 {line_num} 行：在块内，跳过 variable")
                continue
            name = var_match.group(1)
            if name not in added_names:
                logger.debug(f"第 {line_num} 行：找到 variable {name}")
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
        # 注意：用清理过的行来计算花括号深度，避免字符串和注释里的括号干扰！
        brace_depth += cleaned_line.count('{') - cleaned_line.count('}')
        logger.debug(f"第 {line_num} 行结束：brace_depth = {brace_depth}")
    
    # 解析 import 语句
    logger.debug("开始解析 import 语句")
    import_pattern = re.compile(r'import\s+(?:{\s*)?([\w,\s*]+)(?:\s*})?\s+from\s+[\'"]([^\'"]+)[\'"]', re.MULTILINE)
    for match in import_pattern.finditer(content):
        for item in match.group(1).split(','):
            item = item.strip()
            if item and item != '*':
                logger.debug(f"找到 import: {item} from {match.group(2)}")
                relations.append({
                    "from_name": item,
                    "to_name": match.group(2),
                    "relation_type": "imports"
                })
    
    logger.debug(f"extract_elements_regex 完成: {len(elements)} 个元素, {len(relations)} 个关系")
    return {"elements": elements, "relations": relations[:50]}

def find_block_end_line(lines: list, start_idx: int) -> int:
    """查找代码块结束的行号"""
    logger.debug(f"find_block_end_line 开始: start_idx={start_idx}")
    if start_idx >= len(lines):
        logger.debug(f"start_idx 超出范围: {start_idx} >= {len(lines)}")
        return start_idx + 1
    
    line = lines[start_idx]
    end_line = start_idx + 1
    
    if '{' not in line:
        logger.debug("当前行没有 '{', 返回下一行")
        return end_line
    
    brace_count = line.count('{') - line.count('}')
    logger.debug(f"初始 brace_count = {brace_count}")
    
    if brace_count <= 0:
        logger.debug("brace_count <= 0, 返回下一行")
        return end_line
    
    logger.debug("开始查找匹配的 '}'")
    for i in range(start_idx + 1, min(start_idx + 200, len(lines))):
        brace_count += lines[i].count('{') - lines[i].count('}')
        end_line = i + 1
        if brace_count <= 0:
            logger.debug(f"找到匹配的 '}}' 于第 {end_line} 行")
            return end_line
    
    logger.debug(f"未找到匹配的 '}}'，返回第 {end_line} 行")
    return end_line
