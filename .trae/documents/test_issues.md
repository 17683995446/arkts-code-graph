# 系统测试问题记录

## 已发现的问题

### 1. 行号计算错误 (严重)
**问题描述**: 代码元素的line_start和line_end不准确

**具体表现**:
- `many_classes.ts`中的所有TestClass都显示lines 2-52
- `line_numbers.ts`中:
  - SingleLineClass: 显示2-16,实际应为2
  - MultiLineClass: 显示3-16,实际应为3-5
  - multiLineFn: 显示13-16,实际应为14-15

**根本原因**:
`extract_elements_regex`函数中的行号计算逻辑:
```python
start_line = content[:match.start()].count('\n') + 1
end_line = find_block_end(content, match.end())
```

问题:
1. `match.start()`返回的是整个正则表达式匹配的位置,不包括"export"关键字
2. `find_block_end`函数返回的是从匹配末尾开始的块结束位置,但可能不准确

### 2. "export"被错误识别为元素名 (严重)
**问题描述**: 正则表达式匹配到"export class"中的"export"关键字

**具体表现**:
```typescript
export class SingleLineClass { value = 1; }
```
被错误解析为一个名为"export"的class

**根本原因**:
正则表达式`(?:export\s+)?class\s+(\w+)`中的捕获组`(\w+)`可能匹配到了整个"export class"

### 3. 同一行多个class解析错误 (中等)
**问题描述**: 同一行有多个export class时,只有第一个被正确解析

**根本原因**:
正则表达式匹配逻辑问题,`find_block_end`没有正确处理单行class

### 4. 接口(interface)解析不完整 (中等)
**问题描述**: 复杂接口(包含多个属性的interface)没有被完全解析

**具体表现**:
```typescript
export interface MultiLineInterface { 
  name: string;
  age: number;
}
```
被解析为单行(lines 8-8),但实际应为8-10

**根本原因**:
`find_block_end`函数只检查花括号,没有正确处理interface和type的结束位置

### 5. ArkTS装饰器未识别 (低)
**问题描述**: ArkTS特有装饰器如@Component, @Entry等没有被识别

**根本原因**:
解析器没有处理装饰器语法

### 6. Type alias解析不完整 (低)
**问题描述**: 复杂的type定义没有被完全解析

**具体表现**:
- CreateUserDto被识别为"type"类型(正确)
- 但更复杂的type如`TreeNode<T>`等可能未被识别

## 测试数据统计

- 文件总数: 30个
- 元素总数: 311个
- 增量更新: 正常工作
- 搜索功能: 正常工作,但受解析准确性影响

## 待修复优先级

1. **高优先级**: 修复行号计算错误
2. **高优先级**: 修复"export"错误识别
3. **中优先级**: 修复interface块解析
4. **低优先级**: 添加装饰器和type解析增强
