# ArkTS 代码知识图谱系统

基于增量更新的ArkTS/TypeScript代码智能索引和可视化系统。

## 功能特性

- 🔄 增量更新：修改文件后只需重新解析该文件
- 📊 实时可视化：代码元素和关系的D3.js力导向图
- 🔍 智能搜索：按名称和类型搜索代码元素
- 📁 文件树导航：快速浏览项目结构
- 📈 状态监控：实时显示文件数和元素数

## 技术栈

### 后端
- FastAPI
- SQLite
- watchdog（文件监控）
- httpx（HTTP客户端）

### 前端
- Vue 3 + Vite
- Pinia（状态管理）
- D3.js（图谱可视化）

## 快速开始

### 后端
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

## 使用说明

1. 打开前端界面
2. 在"Monitor Control"中输入项目路径
3. 点击"Start Monitoring"开始监控
4. 修改代码文件，系统会自动更新图谱

## 项目结构

```
/workspace
├── backend/           # Python FastAPI后端
│   ├── api/           # API路由
│   ├── database/      # SQLite数据库
│   └── services/      # 核心服务
├── frontend/          # Vue3前端
│   └── src/components/
├── realistic_project/ # 测试项目
└── data/              # 数据库文件
```