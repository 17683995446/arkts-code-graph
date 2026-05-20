from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, List
import os

from ..core.database import CodeGraphDatabase

app = FastAPI(title='ArkTS Code Graph', description='百万行级代码知识图谱可视化')

db_path = 'code_graph.db'

def set_db_path(path: str):
    global db_path
    db_path = path

class QueryRequest(BaseModel):
    question: str

@app.get('/', response_class=HTMLResponse)
async def index():
    html_content = '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ArkTS Code Graph</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; color: #f1f5f9; }
        .header { padding: 24px; text-align: center; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .header h1 { font-size: 2.5rem; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
        .header p { color: #94a3b8; font-size: 1.1rem; }
        .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
        .tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .tab { padding: 12px 24px; background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem; transition: all 0.3s; border-bottom: 2px solid transparent; }
        .tab:hover { color: #e2e8f0; }
        .tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: rgba(255,255,255,0.05); padding: 24px; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s; }
        .stat-card:hover { transform: translateY(-4px); border-color: rgba(59,130,246,0.3); }
        .stat-card .number { font-size: 2.5rem; font-weight: bold; background: linear-gradient(90deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stat-card .label { color: #94a3b8; margin-top: 8px; font-size: 0.95rem; }
        .section { background: rgba(255,255,255,0.05); padding: 28px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px; }
        .section-title { font-size: 1.3rem; margin-bottom: 20px; color: #e2e8f0; display: flex; align-items: center; gap: 10px; }
        .query-section { background: rgba(255,255,255,0.05); padding: 28px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); }
        .query-input-wrapper { display: flex; gap: 12px; margin-bottom: 20px; }
        .query-input { flex: 1; padding: 16px 20px; font-size: 1rem; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; background: rgba(0,0,0,0.2); color: #f1f5f9; transition: all 0.3s; }
        .query-input:focus { outline: none; border-color: #3b82f6; background: rgba(0,0,0,0.3); }
        .query-btn { padding: 16px 36px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); border: none; border-radius: 12px; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .query-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(59,130,246,0.3); }
        .result-box { background: rgba(0,0,0,0.3); padding: 24px; border-radius: 12px; white-space: pre-wrap; font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; color: #a5f3fc; font-size: 0.95rem; line-height: 1.7; max-height: 400px; overflow-y: auto; border: 1px solid rgba(59,130,246,0.2); }
        .result-box.error { color: #fca5a5; border-color: rgba(239,68,68,0.3); }
        .graph-container { height: 600px; background: rgba(255,255,255,0.05); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); position: relative; overflow: hidden; }
        .graph-header { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; }
        .graph-title { font-size: 1.2rem; color: #e2e8f0; }
        .graph-controls { display: flex; gap: 8px; }
        .graph-btn { padding: 8px 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #e2e8f0; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
        .graph-btn:hover { background: rgba(59,130,246,0.2); border-color: #3b82f6; }
        .graph-canvas { width: 100%; height: calc(100% - 68px); }
        .node { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; position: absolute; box-shadow: 0 8px 24px rgba(59,130,246,0.3); cursor: pointer; transition: all 0.3s; user-select: none; }
        .node:hover { transform: scale(1.15); box-shadow: 0 12px 32px rgba(59,130,246,0.5); }
        .node.class { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
        .node.method { background: linear-gradient(135deg, #8b5cf6, #ec4899); width: 60px; height: 60px; font-size: 0.7rem; }
        .edge { position: absolute; background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 3px; opacity: 0.6; transition: opacity 0.3s; }
        .edge:hover { opacity: 1; }
        .loading { color: #3b82f6; animation: pulse 1.2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .data-table th { background: rgba(0,0,0,0.2); color: #94a3b8; font-weight: 600; font-size: 0.9rem; }
        .data-table tr:hover td { background: rgba(59,130,246,0.1); }
        .data-table td { color: #e2e8f0; font-size: 0.95rem; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
        .badge-file { background: rgba(34,197,94,0.2); color: #4ade80; }
        .badge-class { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .badge-method { background: rgba(139,92,246,0.2); color: #a78bfa; }
        .empty-state { text-align: center; padding: 60px 20px; color: #64748b; }
        .empty-state svg { width: 80px; height: 80px; margin-bottom: 16px; opacity: 0.5; }
        .quick-queries { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .quick-query { padding: 8px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: #94a3b8; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
        .quick-query:hover { background: rgba(59,130,246,0.2); border-color: #3b82f6; color: #e2e8f0; }
        .node-tooltip { position: absolute; background: rgba(15,23,42,0.98); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); color: #e2e8f0; font-size: 0.9rem; z-index: 1000; pointer-events: none; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .filter-input { width: 100%; padding: 12px 16px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f1f5f9; margin-bottom: 16px; }
        .filter-input:focus { outline: none; border-color: #3b82f6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ArkTS Code Graph</h1>
        <p>百万行级鸿蒙代码知识图谱分析工具</p>
    </div>
    
    <div class="container">
        <div class="tabs">
            <button class="tab active" onclick="switchTab('overview')">📊 概览</button>
            <button class="tab" onclick="switchTab('graph')">🌐 知识图谱</button>
            <button class="tab" onclick="switchTab('classes')">📦 类列表</button>
            <button class="tab" onclick="switchTab('methods')">🔧 方法列表</button>
            <button class="tab" onclick="switchTab('files')">📁 文件列表</button>
        </div>
        
        <div id="overview" class="tab-content active">
            <div class="stats-grid" id="stats">
                <div class="stat-card"><div class="number">--</div><div class="label">📄 文件数</div></div>
                <div class="stat-card"><div class="number">--</div><div class="label">📦 类数量</div></div>
                <div class="stat-card"><div class="number">--</div><div class="label">🔧 方法数量</div></div>
                <div class="stat-card"><div class="number">--</div><div class="label">🔗 调用关系</div></div>
                <div class="stat-card"><div class="number">--</div><div class="label">🧩 组件关系</div></div>
            </div>
            
            <div class="query-section">
                <div class="section-title">💬 自然语言查询</div>
                <div class="quick-queries">
                    <span class="quick-query" onclick="setQuery('列出所有类')">列出所有类</span>
                    <span class="quick-query" onclick="setQuery('找出所有方法')">找出所有方法</span>
                    <span class="quick-query" onclick="setQuery('显示调用关系')">显示调用关系</span>
                    <span class="quick-query" onclick="setQuery('列出组件')">列出组件</span>
                </div>
                <div class="query-input-wrapper">
                    <input type="text" class="query-input" id="question" placeholder="例如：列出所有类及其包含的方法...">
                    <button class="query-btn" onclick="submitQuery()">查询</button>
                </div>
                <div class="result-box" id="result"></div>
            </div>
        </div>
        
        <div id="graph" class="tab-content">
            <div class="graph-container">
                <div class="graph-header">
                    <div class="graph-title">🌐 知识图谱可视化</div>
                    <div class="graph-controls">
                        <button class="graph-btn" onclick="resetGraph()">🔄 重置布局</button>
                        <button class="graph-btn" onclick="togglePhysics()">⚡ 物理引擎</button>
                    </div>
                </div>
                <canvas class="graph-canvas" id="graphCanvas"></canvas>
            </div>
        </div>
        
        <div id="classes" class="tab-content">
            <div class="section">
                <div class="section-title">📦 类列表</div>
                <input type="text" class="filter-input" id="classFilter" placeholder="搜索类名...">
                <div id="classesTable"></div>
            </div>
        </div>
        
        <div id="methods" class="tab-content">
            <div class="section">
                <div class="section-title">🔧 方法列表</div>
                <input type="text" class="filter-input" id="methodFilter" placeholder="搜索方法名...">
                <div id="methodsTable"></div>
            </div>
        </div>
        
        <div id="files" class="tab-content">
            <div class="section">
                <div class="section-title">📁 文件列表</div>
                <input type="text" class="filter-input" id="fileFilter" placeholder="搜索文件名...">
                <div id="filesTable"></div>
            </div>
        </div>
    </div>
    
    <div class="node-tooltip" id="tooltip" style="display: none;"></div>
    
    <script>
        let currentStats = null;
        let currentGraph = null;
        let physicsEnabled = true;
        let nodes = [];
        let edges = [];
        let canvas, ctx;
        
        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                if (!response.ok) throw new Error('加载统计信息失败');
                const stats = await response.json();
                currentStats = stats;
                const statCards = document.querySelectorAll('.stat-card .number');
                statCards[0].textContent = stats.files;
                statCards[1].textContent = stats.classes;
                statCards[2].textContent = stats.methods;
                statCards[3].textContent = stats.calls;
                statCards[4].textContent = stats.components;
            } catch (error) {
                console.error('Load stats error:', error);
            }
        }
        
        function setQuery(q) {
            document.getElementById('question').value = q;
        }
        
        async function submitQuery() {
            const question = document.getElementById('question').value;
            const resultDiv = document.getElementById('result');
            
            if (!question.trim()) {
                resultDiv.textContent = '请输入查询问题';
                resultDiv.className = 'result-box error';
                return;
            }
            
            resultDiv.innerHTML = '<span class="loading">🔄 查询中...</span>';
            resultDiv.className = 'result-box';
            
            try {
                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: question })
                });
                
                if (!response.ok) throw new Error('查询失败');
                
                const data = await response.json();
                resultDiv.textContent = data.result;
                resultDiv.className = 'result-box';
            } catch (error) {
                resultDiv.textContent = '查询出错: ' + error.message;
                resultDiv.className = 'result-box error';
            }
        }
        
        async function loadClasses() {
            try {
                const response = await fetch('/api/classes');
                const classes = await response.json();
                const container = document.getElementById('classesTable');
                if (classes.length === 0) {
                    container.innerHTML = '<div class="empty-state"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg><p>暂无类数据</p></div>';
                    return;
                }
                container.innerHTML = `<table class="data-table">
                    <thead><tr><th>ID</th><th>类名</th><th>文件</th><th>标志</th></tr></thead>
                    <tbody>${classes.map(c => `<tr>
                        <td>${c.id}</td>
                        <td><span class="badge badge-class">${c.name}</span></td>
                        <td>${c.file_path || '-'}</td>
                        <td>${c.flags || 0}</td>
                    </tr>`).join('')}</tbody>
                </table>`;
            } catch (error) {
                document.getElementById('classesTable').innerHTML = '<div class="empty-state"><p>加载失败: ' + error.message + '</p></div>';
            }
        }
        
        async function loadMethods() {
            try {
                const response = await fetch('/api/methods');
                const methods = await response.json();
                const container = document.getElementById('methodsTable');
                if (methods.length === 0) {
                    container.innerHTML = '<div class="empty-state"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg><p>暂无方法数据</p></div>';
                    return;
                }
                container.innerHTML = `<table class="data-table">
                    <thead><tr><th>ID</th><th>方法名</th><th>所属类</th><th>文件</th></tr></thead>
                    <tbody>${methods.map(m => `<tr>
                        <td>${m.id}</td>
                        <td><span class="badge badge-method">${m.name}</span></td>
                        <td>${m.class_name || '-'}</td>
                        <td>${m.file_path || '-'}</td>
                    </tr>`).join('')}</tbody>
                </table>`;
            } catch (error) {
                document.getElementById('methodsTable').innerHTML = '<div class="empty-state"><p>加载失败: ' + error.message + '</p></div>';
            }
        }
        
        async function loadFiles() {
            try {
                const response = await fetch('/api/files');
                const files = await response.json();
                const container = document.getElementById('filesTable');
                if (files.length === 0) {
                    container.innerHTML = '<div class="empty-state"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><p>暂无文件数据</p></div>';
                    return;
                }
                container.innerHTML = `<table class="data-table">
                    <thead><tr><th>ID</th><th>文件路径</th></tr></thead>
                    <tbody>${files.map(f => `<tr>
                        <td>${f.id}</td>
                        <td><span class="badge badge-file">${f.path}</span></td>
                    </tr>`).join('')}</tbody>
                </table>`;
            } catch (error) {
                document.getElementById('filesTable').innerHTML = '<div class="empty-state"><p>加载失败: ' + error.message + '</p></div>';
            }
        }
        
        async function loadGraph() {
            try {
                const response = await fetch('/api/graph');
                if (!response.ok) throw new Error('加载图谱失败');
                currentGraph = await response.json();
                initGraph();
            } catch (error) {
                console.error('Load graph error:', error);
            }
        }
        
        function initGraph() {
            canvas = document.getElementById('graphCanvas');
            ctx = canvas.getContext('2d');
            resizeCanvas();
            
            const classNodes = currentGraph.nodes.map((n, i) => ({
                id: n.id,
                name: n.name,
                type: n.type,
                x: Math.random() * (canvas.width - 200) + 100,
                y: Math.random() * (canvas.height - 200) + 100,
                vx: 0, vy: 0,
                radius: n.type === 'class' ? 35 : 25,
                color: n.type === 'class' ? '#3b82f6' : '#8b5cf6'
            }));
            
            const methodNodes = currentGraph.methods.map((m, i) => ({
                id: 'm_' + m.id,
                name: m.name,
                type: 'method',
                x: Math.random() * (canvas.width - 200) + 100,
                y: Math.random() * (canvas.height - 200) + 100,
                vx: 0, vy: 0,
                radius: 20,
                color: '#ec4899'
            }));
            
            nodes = [...classNodes, ...methodNodes];
            
            edges = currentGraph.edges.map(e => ({
                from: e.from,
                to: e.to
            }));
            
            window.addEventListener('resize', resizeCanvas);
            
            let draggedNode = null;
            canvas.addEventListener('mousedown', (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                draggedNode = nodes.find(n => {
                    const dx = n.x - x;
                    const dy = n.y - y;
                    return Math.sqrt(dx*dx + dy*dy) < n.radius;
                });
            });
            
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const tooltip = document.getElementById('tooltip');
                const hovered = nodes.find(n => {
                    const dx = n.x - x;
                    const dy = n.y - y;
                    return Math.sqrt(dx*dx + dy*dy) < n.radius;
                });
                if (hovered) {
                    tooltip.style.display = 'block';
                    tooltip.style.left = (e.clientX + 15) + 'px';
                    tooltip.style.top = (e.clientY + 15) + 'px';
                    tooltip.innerHTML = `<strong>${hovered.type === 'class' ? '类' : '方法'}</strong><br>${hovered.name}`;
                    canvas.style.cursor = 'pointer';
                } else {
                    tooltip.style.display = 'none';
                    canvas.style.cursor = 'default';
                }
                if (draggedNode) {
                    draggedNode.x = x;
                    draggedNode.y = y;
                    draggedNode.vx = 0;
                    draggedNode.vy = 0;
                }
            });
            
            canvas.addEventListener('mouseup', () => draggedNode = null);
            canvas.addEventListener('mouseleave', () => draggedNode = null);
            
            animate();
        }
        
        function resizeCanvas() {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
        
        function animate() {
            if (physicsEnabled) {
                nodes.forEach(node => {
                    node.vx *= 0.95;
                    node.vy *= 0.95;
                    node.x += node.vx;
                    node.y += node.vy;
                    const margin = 50;
                    if (node.x < margin) { node.x = margin; node.vx *= -0.5; }
                    if (node.x > canvas.width - margin) { node.x = canvas.width - margin; node.vx *= -0.5; }
                    if (node.y < margin) { node.y = margin; node.vy *= -0.5; }
                    if (node.y > canvas.height - margin) { node.y = canvas.height - margin; node.vy *= -0.5; }
                });
                
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const dx = nodes[j].x - nodes[i].x;
                        const dy = nodes[j].y - nodes[i].y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < 100) {
                            const force = (100 - dist) * 0.1;
                            nodes[i].vx -= (dx / dist) * force;
                            nodes[i].vy -= (dy / dist) * force;
                            nodes[j].vx += (dx / dist) * force;
                            nodes[j].vy += (dy / dist) * force;
                        }
                    }
                }
            }
            
            draw();
            requestAnimationFrame(animate);
        }
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.lineWidth = 2;
            edges.forEach(edge => {
                const from = nodes.find(n => n.id === edge.from || n.id === 'm_' + edge.from);
                const to = nodes.find(n => n.id === edge.to || n.id === 'm_' + edge.to);
                if (from && to) {
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(to.x, to.y);
                    ctx.stroke();
                }
            });
            nodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius);
                gradient.addColorStop(0, node.color);
                gradient.addColorStop(1, node.type === 'class' ? '#06b6d4' : '#ec4899');
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const displayName = node.name.length > 8 ? node.name.substring(0, 8) + '...' : node.name;
                ctx.fillText(displayName, node.x, node.y);
            });
        }
        
        function resetGraph() {
            nodes.forEach(node => {
                node.x = Math.random() * (canvas.width - 200) + 100;
                node.y = Math.random() * (canvas.height - 200) + 100;
                node.vx = 0;
                node.vy = 0;
            });
        }
        
        function togglePhysics() {
            physicsEnabled = !physicsEnabled;
        }
        
        function switchTab(tabName) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            if (tabName === 'classes') loadClasses();
            if (tabName === 'methods') loadMethods();
            if (tabName === 'files') loadFiles();
        }
        
        document.getElementById('classFilter').addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelectorAll('#classesTable tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });
        
        document.getElementById('methodFilter').addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelectorAll('#methodsTable tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });
        
        document.getElementById('fileFilter').addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelectorAll('#filesTable tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });
        
        loadStats();
        loadGraph();
    </script>
</body>
</html>
'''
    return HTMLResponse(content=html_content)

@app.get('/api/stats')
async def get_stats():
    try:
        db = CodeGraphDatabase(db_path)
        stats = db.get_stats()
        db.close()
        return JSONResponse(content=stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/query')
async def query_graph(request: QueryRequest):
    try:
        db = CodeGraphDatabase(db_path)
        question = request.question.lower()
        result = ""
        
        if '类' in question and '列' in question:
            classes = db.query('SELECT c.id, c.name, f.path FROM classes c LEFT JOIN files f ON c.file_id = f.id')
            result = "=== 所有类 ===\n\n"
            for cls in classes:
                result += f"ID: {cls[0]}, 类名: {cls[1]}, 文件: {cls[2] or '-'}\n"
        elif '方法' in question and '列' in question:
            methods = db.query('''
                SELECT m.id, m.name, c.name, f.path 
                FROM methods m 
                LEFT JOIN classes c ON m.class_id = c.id 
                LEFT JOIN files f ON m.file_id = f.id
            ''')
            result = "=== 所有方法 ===\n\n"
            for m in methods:
                result += f"ID: {m[0]}, 方法名: {m[1]}, 类: {m[2] or '-'}, 文件: {m[3] or '-'}\n"
        elif '调用' in question:
            calls = db.query('''
                SELECT caller.id, caller.name, callee.id, callee.name 
                FROM calls 
                JOIN methods caller ON calls.caller_id = caller.id 
                JOIN methods callee ON calls.callee_id = callee.id
            ''')
            result = "=== 调用关系 ===\n\n"
            for call in calls:
                result += f"{call[1]} ({call[0]}) -> {call[3]} ({call[2]})\n"
        else:
            stats = db.get_stats()
            result = f"""代码库统计:
- 文件数: {stats['files']}
- 类数量: {stats['classes']}
- 方法数量: {stats['methods']}
- 调用关系: {stats['calls']}
- 组件关系: {stats['components']}"""
        
        db.close()
        return JSONResponse(content={'result': result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/graph')
async def get_graph():
    try:
        db = CodeGraphDatabase(db_path)
        
        classes = db.query('SELECT id, name FROM classes LIMIT 30')
        methods = db.query('SELECT id, name FROM methods LIMIT 50')
        calls = db.query('SELECT caller_id, callee_id FROM calls LIMIT 60')
        
        nodes = [{'id': cls[0], 'name': cls[1], 'type': 'class'} for cls in classes]
        
        edges = []
        for caller, callee in calls:
            edges.append({'from': caller, 'to': callee})
        
        db.close()
        
        return JSONResponse(content={
            'nodes': nodes,
            'methods': [{'id': m[0], 'name': m[1]} for m in methods],
            'edges': edges
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/classes')
async def get_classes():
    try:
        db = CodeGraphDatabase(db_path)
        classes = db.query('''
            SELECT c.id, c.name, f.path, c.flags 
            FROM classes c 
            LEFT JOIN files f ON c.file_id = f.id
            ORDER BY c.id
        ''')
        db.close()
        return JSONResponse(content=[
            {'id': cls[0], 'name': cls[1], 'file_path': cls[2], 'flags': cls[3]} 
            for cls in classes
        ])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/methods')
async def get_methods():
    try:
        db = CodeGraphDatabase(db_path)
        methods = db.query('''
            SELECT m.id, m.name, c.name, f.path 
            FROM methods m 
            LEFT JOIN classes c ON m.class_id = c.id 
            LEFT JOIN files f ON m.file_id = f.id
            ORDER BY m.id
        ''')
        db.close()
        return JSONResponse(content=[
            {'id': m[0], 'name': m[1], 'class_name': m[2], 'file_path': m[3]} 
            for m in methods
        ])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/files')
async def get_files():
    try:
        db = CodeGraphDatabase(db_path)
        files = db.query('SELECT id, path FROM files ORDER BY id')
        db.close()
        return JSONResponse(content=[{'id': f[0], 'path': f[1]} for f in files])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def start_server(host: str = '127.0.0.1', port: int = 8000, db: str = 'code_graph.db'):
    set_db_path(db)
    import uvicorn
    uvicorn.run(app, host=host, port=port)
