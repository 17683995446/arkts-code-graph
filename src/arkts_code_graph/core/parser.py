import re
import time
import logging
import sys
from typing import List, Tuple, Optional, Dict, Any
from dataclasses import dataclass

# 创建解析器层专用logger
_parse_logger = logging.getLogger('ArkTsParser')
_parse_logger.setLevel(logging.DEBUG)
_ch = logging.StreamHandler(sys.stdout)
_ch.setLevel(logging.DEBUG)
_ch.setFormatter(logging.Formatter('%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s', datefmt='%H:%M:%S'))
_parse_logger.addHandler(_ch)

def _log_parse(level: str, msg: str):
    elapsed = time.time()
    full_msg = f"[{elapsed:.3f}s] {msg}"
    if level == 'DEBUG':
        _parse_logger.debug(full_msg)
    elif level == 'INFO':
        _parse_logger.info(full_msg)
    elif level == 'WARNING':
        _parse_logger.warning(full_msg)
    elif level == 'ERROR':
        _parse_logger.error(full_msg)
    elif level == 'CRITICAL':
        _parse_logger.critical(full_msg)

@dataclass
class ParsedClass:
    name: str
    start_line: int
    end_line: int
    flags: int = 0

@dataclass
class ParsedMethod:
    name: str
    class_name: Optional[str]
    start_line: int
    end_line: int

@dataclass
class ParsedCall:
    caller_method: str
    caller_class: Optional[str]
    callee_method: str
    callee_class: Optional[str]

@dataclass
class ParsedComponent:
    parent_class: str
    child_class: str

@dataclass
class ParseResult:
    classes: List[ParsedClass]
    methods: List[ParsedMethod]
    calls: List[ParsedCall]
    components: List[ParsedComponent]

class ArkTsParser:
    CLASS_PATTERNS = [
        r'class\s+(\w+)\s*(?:extends\s+\w+)?\s*\{',
        r'struct\s+(\w+)\s*\{',
        r'interface\s+(\w+)\s*(?:extends\s+\w+(?:,\s*\w+)*)?\s*\{',
        r'@Component\s*\n?\s*(?:struct|class)\s+(\w+)\s*\{',
        r'@Entry\s*\n?\s*(?:struct|class)\s+(\w+)\s*\{',
        r'@Preview\s*\n?\s*(?:struct|class)\s+(\w+)\s*\{',
    ]
    
    METHOD_PATTERNS = [
        r'(?:public|private|protected|static|const|readonly)\s*(\w+)\s*\(\s*[^)]*\s*\)\s*(?::\s*\w+)?\s*\{',
        r'(\w+)\s*\(\s*[^)]*\s*\)\s*(?::\s*\w+)?\s*\{',
        r'(?:public|private|protected|static|const|readonly)\s*(\w+)\s*\(\s*[^)]*\s*\)\s*(?::\s*\w+)?\s*=>',
    ]
    
    CALL_PATTERN = r'(\w+)\s*\(\s*[^)]*\s*\)'
    
    COMPONENT_PATTERN = r'(\w+)\s*:\s*(\w+)\s*=\s*new\s+\2'
    
    def __init__(self):
        _log_parse('DEBUG', f'ArkTsParser.__init__ 开始')
        self.class_patterns = [re.compile(p) for p in self.CLASS_PATTERNS]
        _log_parse('DEBUG', f'  编译 {len(self.class_patterns)} 个class_patterns')
        self.method_patterns = [re.compile(p) for p in self.METHOD_PATTERNS]
        _log_parse('DEBUG', f'  编译 {len(self.method_patterns)} 个method_patterns')
        self.call_pattern = re.compile(self.CALL_PATTERN)
        _log_parse('DEBUG', f'  编译 call_pattern')
        self.component_pattern = re.compile(self.COMPONENT_PATTERN)
        _log_parse('DEBUG', f'  编译 component_pattern')
        _log_parse('INFO', f'ArkTsParser.__init__ 完成')
    
    def parse(self, content: str, file_path: str) -> ParseResult:
        _log_parse('DEBUG', f'parse 开始 | path={file_path}, 内容长度={len(content)}')
        
        lines = content.split('\n')
        _log_parse('DEBUG', f'  分割为 {len(lines)} 行')
        
        _log_parse('DEBUG', f'  开始解析classes')
        classes = self._parse_classes(lines)
        _log_parse('DEBUG', f'  解析完成 | classes={len(classes)}')
        
        _log_parse('DEBUG', f'  开始解析methods')
        methods = self._parse_methods(lines, classes)
        _log_parse('DEBUG', f'  解析完成 | methods={len(methods)}')
        
        _log_parse('DEBUG', f'  开始解析calls')
        calls = self._parse_calls(lines, methods, classes)
        _log_parse('DEBUG', f'  解析完成 | calls={len(calls)}')
        
        _log_parse('DEBUG', f'  开始解析components')
        components = self._parse_components(lines, classes)
        _log_parse('DEBUG', f'  解析完成 | components={len(components)}')
        
        result = ParseResult(classes, methods, calls, components)
        _log_parse('INFO', f'parse 完成 | classes={len(classes)}, methods={len(methods)}, calls={len(calls)}, components={len(components)}')
        return result
    
    def _parse_classes(self, lines: List[str]) -> List[ParsedClass]:
        _log_parse('DEBUG', f'_parse_classes 开始 | {len(lines)} 行')
        classes = []
        in_comment = False
        seen_class_names = set()
        _log_parse('DEBUG', f'  初始化: classes=[], in_comment=False')
        
        for i, line in enumerate(lines):
            _log_parse('DEBUG', f'    处理行 {i+1}: {line[:50]}...')
            line_num = i + 1
            
            if '/*' in line:
                in_comment = True
                _log_parse('DEBUG', f'      进入注释块')
            if '*/' in line:
                in_comment = False
                _log_parse('DEBUG', f'      退出注释块')
                continue
            if in_comment or line.strip().startswith('//'):
                _log_parse('DEBUG', f'      跳过(注释或被注释)')
                continue
            
            for p_idx, pattern in enumerate(self.class_patterns):
                match = pattern.search(line)
                if match:
                    class_name = match.group(1)
                    _log_parse('DEBUG', f'      匹配pattern[{p_idx}]: {class_name}')
                    
                    if class_name in seen_class_names:
                        _log_parse('DEBUG', f'      跳过(已见过): {class_name}')
                        continue
                    seen_class_names.add(class_name)
                    
                    end_line = self._find_block_end(lines, i)
                    if end_line is None:
                        _log_parse('DEBUG', f'      ⚠️ 跳过(块不完整，缺少闭合括号)')
                        continue
                    
                    _log_parse('DEBUG', f'      找到结束行: {end_line}')
                    
                    flags = self._determine_flags(line)
                    _log_parse('DEBUG', f'      flags={flags}')
                    
                    classes.append(ParsedClass(class_name, line_num, end_line, flags))
                    _log_parse('DEBUG', f'      添加class: {class_name} (行{line_num}-{end_line})')
                    break
        
        _log_parse('INFO', f'_parse_classes 完成 | {len(classes)} 个classes')
        return classes
    
    def _parse_methods(self, lines: List[str], classes: List[ParsedClass]) -> List[ParsedMethod]:
        _log_parse('DEBUG', f'_parse_methods 开始 | {len(lines)} 行, {len(classes)} classes')
        methods = []
        in_comment = False
        _log_parse('DEBUG', f'  初始化: methods=[], in_comment=False')
        
        for i, line in enumerate(lines):
            _log_parse('DEBUG', f'    处理行 {i+1}: {line[:50]}...')
            line_num = i + 1
            
            if '/*' in line:
                in_comment = True
                _log_parse('DEBUG', f'      进入注释块')
            if '*/' in line:
                in_comment = False
                _log_parse('DEBUG', f'      退出注释块')
                continue
            if in_comment or line.strip().startswith('//'):
                _log_parse('DEBUG', f'      跳过(注释或被注释)')
                continue
            
            current_class = self._find_containing_class(classes, line_num)
            _log_parse('DEBUG', f'      所在class: {current_class.name if current_class else "None"}')
            
            for p_idx, pattern in enumerate(self.method_patterns):
                match = pattern.search(line)
                if match:
                    method_name = match.group(1)
                    _log_parse('DEBUG', f'      匹配pattern[{p_idx}]: {method_name}')
                    
                    if method_name in ['if', 'for', 'while', 'switch', 'try', 'catch', 'finally']:
                        _log_parse('DEBUG', f'      跳过(控制流关键字)')
                        continue
                    
                    end_line = self._find_block_end(lines, i)
                    if end_line is None:
                        _log_parse('DEBUG', f'      ⚠️ 跳过(块不完整，缺少闭合括号)')
                        continue
                    _log_parse('DEBUG', f'      找到结束行: {end_line}')
                    
                    methods.append(ParsedMethod(
                        method_name,
                        current_class.name if current_class else None,
                        line_num,
                        end_line
                    ))
                    _log_parse('DEBUG', f'      添加method: {method_name} (行{line_num}-{end_line})')
                    break
        
        _log_parse('INFO', f'_parse_methods 完成 | {len(methods)} 个methods')
        return methods
    
    def _parse_calls(self, lines: List[str], methods: List[ParsedMethod], classes: List[ParsedClass]) -> List[ParsedCall]:
        _log_parse('DEBUG', f'_parse_calls 开始 | {len(lines)} 行, {len(methods)} methods, {len(classes)} classes')
        calls = []
        in_comment = False
        _log_parse('DEBUG', f'  初始化: calls=[], in_comment=False')
        
        for i, line in enumerate(lines):
            _log_parse('DEBUG', f'    处理行 {i+1}: {line[:50]}...')
            line_num = i + 1
            
            if '/*' in line:
                in_comment = True
                _log_parse('DEBUG', f'      进入注释块')
            if '*/' in line:
                in_comment = False
                _log_parse('DEBUG', f'      退出注释块')
                continue
            if in_comment or line.strip().startswith('//'):
                _log_parse('DEBUG', f'      跳过(注释或被注释)')
                continue
            
            current_method = self._find_containing_method(methods, line_num)
            current_class = self._find_containing_class(classes, line_num)
            _log_parse('DEBUG', f'      所在method: {current_method.name if current_method else "None"}')
            _log_parse('DEBUG', f'      所在class: {current_class.name if current_class else "None"}')
            
            matches = self.call_pattern.findall(line)
            _log_parse('DEBUG', f'      找到 {len(matches)} 个调用匹配')
            
            for idx, callee in enumerate(matches):
                _log_parse('DEBUG', f'        [{idx+1}] 检查: {callee}')
                
                if callee in ['if', 'for', 'while', 'switch', 'new', 'return', 'throw', 'break', 'continue']:
                    _log_parse('DEBUG', f'          跳过(关键字)')
                    continue
                
                calls.append(ParsedCall(
                    caller_method=current_method.name if current_method else '',
                    caller_class=current_class.name if current_class else None,
                    callee_method=callee,
                    callee_class=None
                ))
                _log_parse('DEBUG', f'          添加call: {current_method.name if current_method else ""} -> {callee}')
        
        _log_parse('INFO', f'_parse_calls 完成 | {len(calls)} 个calls')
        return calls
    
    def _parse_components(self, lines: List[str], classes: List[ParsedClass]) -> List[ParsedComponent]:
        _log_parse('DEBUG', f'_parse_components 开始 | {len(lines)} 行, {len(classes)} classes')
        components = []
        in_comment = False
        _log_parse('DEBUG', f'  初始化: components=[], in_comment=False')
        
        for i, line in enumerate(lines):
            _log_parse('DEBUG', f'    处理行 {i+1}: {line[:50]}...')
            line_num = i + 1
            
            if '/*' in line:
                in_comment = True
                _log_parse('DEBUG', f'      进入注释块')
            if '*/' in line:
                in_comment = False
                _log_parse('DEBUG', f'      退出注释块')
                continue
            if in_comment or line.strip().startswith('//'):
                _log_parse('DEBUG', f'      跳过(注释或被注释)')
                continue
            
            current_class = self._find_containing_class(classes, line_num)
            _log_parse('DEBUG', f'      所在class: {current_class.name if current_class else "None"}')
            
            if not current_class:
                _log_parse('DEBUG', f'      无所在class，跳过')
                continue
            
            if '@Component' in line and ('struct' in line or 'class' in line):
                _log_parse('DEBUG', f'      发现@Component')
                match = re.search(r'(?:struct|class)\s+(\w+)', line)
                if match:
                    component_name = match.group(1)
                    _log_parse('DEBUG', f'      组件名: {component_name}')
                    components.append(ParsedComponent(component_name, component_name))
                    _log_parse('DEBUG', f'      添加自引用component')
            
            match = self.component_pattern.search(line)
            if match:
                child_name = match.group(1)
                parent_name = match.group(2)
                _log_parse('DEBUG', f'      匹配component模式: {child_name} : {parent_name} = new {parent_name}')
                components.append(ParsedComponent(current_class.name, parent_name))
                _log_parse('DEBUG', f'      添加component: {current_class.name} -> {parent_name}')
        
        _log_parse('INFO', f'_parse_components 完成 | {len(components)} 个components')
        return components
    
    def _find_block_end(self, lines: List[str], start_idx: int) -> Optional[int]:
        _log_parse('DEBUG', f'_find_block_end 开始 | start_idx={start_idx}, line={lines[start_idx][:50]}...')
        depth = 1
        _log_parse('DEBUG', f'  初始depth=1')
        
        for i in range(start_idx + 1, len(lines)):
            line = lines[i]
            _log_parse('DEBUG', f'    检查行 {i+1}: {line[:30]}...')
            depth += line.count('{') - line.count('}')
            _log_parse('DEBUG', f'    depth变化: {line.count("{")}个{{, {line.count("}")}个}} -> depth={depth}')
            
            if depth == 0:
                _log_parse('DEBUG', f'    depth==0, 找到结束')
                return i + 1
        
        _log_parse('DEBUG', f'    ⚠️ 未找到配对的闭合括号，不完整块')
        return None
    
    def _find_containing_class(self, classes: List[ParsedClass], line_num: int) -> Optional[ParsedClass]:
        _log_parse('DEBUG', f'_find_containing_class 开始 | line_num={line_num}')
        for cls in classes:
            _log_parse('DEBUG', f'  检查class {cls.name}: 行{cls.start_line}-{cls.end_line}')
            if cls.start_line <= line_num <= cls.end_line:
                _log_parse('DEBUG', f'  匹配! 返回 {cls.name}')
                return cls
        
        _log_parse('DEBUG', f'  无匹配，返回None')
        return None
    
    def _find_containing_method(self, methods: List[ParsedMethod], line_num: int) -> Optional[ParsedMethod]:
        _log_parse('DEBUG', f'_find_containing_method 开始 | line_num={line_num}')
        for method in methods:
            _log_parse('DEBUG', f'  检查method {method.name}: 行{method.start_line}-{method.end_line}')
            if method.start_line <= line_num <= method.end_line:
                _log_parse('DEBUG', f'  匹配! 返回 {method.name}')
                return method
        
        _log_parse('DEBUG', f'  无匹配，返回None')
        return None
    
    def _determine_flags(self, line: str) -> int:
        _log_parse('DEBUG', f'_determine_flags 开始 | line={line[:50]}...')
        flags = 0
        
        if '@Component' in line:
            flags |= 1
            _log_parse('DEBUG', f'  @Component -> flags|=1')
        if '@Entry' in line:
            flags |= 2
            _log_parse('DEBUG', f'  @Entry -> flags|=2')
        if '@Preview' in line:
            flags |= 4
            _log_parse('DEBUG', f'  @Preview -> flags|=4')
        if 'struct' in line:
            flags |= 8
            _log_parse('DEBUG', f'  struct -> flags|=8')
        if 'interface' in line:
            flags |= 16
            _log_parse('DEBUG', f'  interface -> flags|=16')
        
        _log_parse('DEBUG', f'  返回 flags={flags}')
        return flags
