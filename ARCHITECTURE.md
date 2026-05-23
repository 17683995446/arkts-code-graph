# 系统架构分析

## 一、项目结构分层

### 1.1 分层架构
```
src/arkts_code_graph/
├── config.py            # 配置层
├── cli.py               # 入口层 (CLI)
├── core/
│   ├── database.py      # 数据层
│   ├── parser.py        # 解析层
│   ├── processor.py     # 业务层 (核心)
│   └── graph_builder.py # 工具层
├── llm/
│   └── query_engine.py  # LLM集成层
└── web/
    └── server.py        # 展示层 (Web)
```

### 1.2 模块依赖关系

```
cli.py 
    └── core.processor
        ├── core.database
        └── core.parser
            └── ... (regex)
    ├── core.graph_builder
    │   └── core.database
    └── llm.query_engine
        └── core.database

web.server
    └── core.database
```

### 1.3 调用链路图

**主流程 (build):**
1. `cli.run_build()`
2. `CodeProcessor.__init__()`
3. `CodeProcessor.build_graph()`
4. `CodeProcessor.scan_project()` - 扫描文件
5. `CodeProcessor._get_existing_hashes()` - 检查变更
6. `CodeProcessor.process_files()` - 多进程处理
7. `_process_file_worker()` - 单文件解析
8. `ArkTsParser.parse()` - 代码解析
9. `CodeProcessor._batch_write_results()` - 批量写入
10. `CodeGraphDatabase` - 数据库操作

**查询流程 (query):**
1. `cli.run_query()`
2. `QueryEngine.__init__()`
3. `QueryEngine.query()`
4. `QueryEngine._generate_sql()` - LLM生成SQL
5. `QueryEngine._execute_sql()` - 执行查询

## 二、入口点

### 2.1 CLI入口
```python
# 文件: cli.py
if __name__ == '__main__':
    main()
```
支持命令: `build`, `update`, `stats`, `query`, `serve`

### 2.2 Web入口
```python
# 文件: web/server.py
def start_server(host, port, db):
    uvicorn.run(app, host=host, port=port)
```

## 三、数据流向

### 3.1 构建流程数据流向
```
项目文件 → scan_project → 
    [文件列表] → _get_existing_hashes →
        [需处理文件] → process_files →
            [解析结果] → _batch_write_results →
                [插入/更新] → SQLite数据库
```

### 3.2 查询流程数据流向
```
用户问题 → _generate_sql →
    [SQL语句] → _execute_sql →
        [查询结果] → 用户
```

## 四、核心类职责

| 类 | 文件 | 职责 |
|-----|-----|------|
| Config | config.py | 全局配置管理 |
| CodeProcessor | core/processor.py | 核心业务流程控制 |
| CodeGraphDatabase | core/database.py | 数据库连接和操作 |
| ArkTsParser | core/parser.py | ArkTS代码解析 |
| GraphBuilder | core/graph_builder.py | 图结构查询工具 |
| QueryEngine | llm/query_engine.py | 自然语言查询引擎 |
