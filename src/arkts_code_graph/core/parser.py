import re
from typing import List, Tuple, Optional, Dict, Any
from dataclasses import dataclass

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
        self.class_patterns = [re.compile(p) for p in self.CLASS_PATTERNS]
        self.method_patterns = [re.compile(p) for p in self.METHOD_PATTERNS]
        self.call_pattern = re.compile(self.CALL_PATTERN)
        self.component_pattern = re.compile(self.COMPONENT_PATTERN)
    
    def parse(self, content: str, file_path: str) -> ParseResult:
        lines = content.split('\n')
        classes = self._parse_classes(lines)
        methods = self._parse_methods(lines, classes)
        calls = self._parse_calls(lines, methods, classes)
        components = self._parse_components(lines, classes)
        return ParseResult(classes, methods, calls, components)
    
    def _parse_classes(self, lines: List[str]) -> List[ParsedClass]:
        classes = []
        in_comment = False
        seen_class_names = set()
        
        for i, line in enumerate(lines):
            line_num = i + 1
            
            if '/*' in line:
                in_comment = True
            if '*/' in line:
                in_comment = False
                continue
            if in_comment or line.strip().startswith('//'):
                continue
            
            for pattern in self.class_patterns:
                match = pattern.search(line)
                if match:
                    class_name = match.group(1)
                    if class_name in seen_class_names:
                        continue
                    seen_class_names.add(class_name)
                    end_line = self._find_block_end(lines, i)
                    flags = self._determine_flags(line)
                    classes.append(ParsedClass(class_name, line_num, end_line, flags))
                    break
        
        return classes
    
    def _parse_methods(self, lines: List[str], classes: List[ParsedClass]) -> List[ParsedMethod]:
        methods = []
        in_comment = False
        
        for i, line in enumerate(lines):
            line_num = i + 1
            
            if '/*' in line:
                in_comment = True
            if '*/' in line:
                in_comment = False
                continue
            if in_comment or line.strip().startswith('//'):
                continue
            
            current_class = self._find_containing_class(classes, line_num)
            
            for pattern in self.method_patterns:
                match = pattern.search(line)
                if match:
                    method_name = match.group(1)
                    if method_name in ['if', 'for', 'while', 'switch', 'try', 'catch', 'finally']:
                        continue
                    end_line = self._find_block_end(lines, i)
                    methods.append(ParsedMethod(
                        method_name,
                        current_class.name if current_class else None,
                        line_num,
                        end_line
                    ))
                    break
        
        return methods
    
    def _parse_calls(self, lines: List[str], methods: List[ParsedMethod], classes: List[ParsedClass]) -> List[ParsedCall]:
        calls = []
        in_comment = False
        
        for i, line in enumerate(lines):
            line_num = i + 1
            
            if '/*' in line:
                in_comment = True
            if '*/' in line:
                in_comment = False
                continue
            if in_comment or line.strip().startswith('//'):
                continue
            
            current_method = self._find_containing_method(methods, line_num)
            current_class = self._find_containing_class(classes, line_num)
            
            matches = self.call_pattern.findall(line)
            for callee in matches:
                if callee in ['if', 'for', 'while', 'switch', 'new', 'return', 'throw', 'break', 'continue']:
                    continue
                
                calls.append(ParsedCall(
                    caller_method=current_method.name if current_method else '',
                    caller_class=current_class.name if current_class else None,
                    callee_method=callee,
                    callee_class=None
                ))
        
        return calls
    
    def _parse_components(self, lines: List[str], classes: List[ParsedClass]) -> List[ParsedComponent]:
        components = []
        in_comment = False
        
        for i, line in enumerate(lines):
            line_num = i + 1
            
            if '/*' in line:
                in_comment = True
            if '*/' in line:
                in_comment = False
                continue
            if in_comment or line.strip().startswith('//'):
                continue
            
            current_class = self._find_containing_class(classes, line_num)
            if not current_class:
                continue
            
            # Mark struct with @Component as a component
            if '@Component' in line and ('struct' in line or 'class' in line):
                # Extract the name
                match = re.search(r'(?:struct|class)\s+(\w+)', line)
                if match:
                    component_name = match.group(1)
                    # Add a self-reference to mark it as a component
                    components.append(ParsedComponent(component_name, component_name))
            
            match = self.component_pattern.search(line)
            if match:
                child_name = match.group(1)
                parent_name = match.group(2)
                components.append(ParsedComponent(current_class.name, parent_name))
        
        return components
    
    def _find_block_end(self, lines: List[str], start_idx: int) -> int:
        depth = 1
        for i in range(start_idx + 1, len(lines)):
            line = lines[i]
            depth += line.count('{') - line.count('}')
            if depth == 0:
                return i + 1
        return len(lines)
    
    def _find_containing_class(self, classes: List[ParsedClass], line_num: int) -> Optional[ParsedClass]:
        for cls in classes:
            if cls.start_line <= line_num <= cls.end_line:
                return cls
        return None
    
    def _find_containing_method(self, methods: List[ParsedMethod], line_num: int) -> Optional[ParsedMethod]:
        for method in methods:
            if method.start_line <= line_num <= method.end_line:
                return method
        return None
    
    def _determine_flags(self, line: str) -> int:
        flags = 0
        if '@Component' in line:
            flags |= 1
        if '@Entry' in line:
            flags |= 2
        if '@Preview' in line:
            flags |= 4
        if 'struct' in line:
            flags |= 8
        if 'interface' in line:
            flags |= 16
        return flags
