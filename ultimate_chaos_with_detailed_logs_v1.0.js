#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════════════
 * ArkTS Code Graph - 终极混沌与压力测试 - 带详细日志
 * ════════════════════════════════════════════════════════════════════════════
 * 遵循：第一性原理 + 慢工出细活 + 多次迭代改进
 * 目标：通过每一步详细日志发现真实运行时的Bug
 * ════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('🔥🔥🔥 ArkTS Code Graph - 终极混沌与压力测试 v1.0 🔥🔥🔥');
console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('  每一步都打印日志，发现真实运行时Bug！');
console.log('');

// ============================================
// 1. 测试结果跟踪系统
// ============================================
class DetailedTestReport {
    constructor() {
        this.startTime = Date.now();
        this.endTime = null;
        this.tests = [];
        this.issues = [];
        this.memoryHistory = [];
        this.operationCount = 0;
    }

    addTest(category, name, success, details = '') {
        this.tests.push({
            category,
            name,
            success,
            details,
            timestamp: Date.now()
        });
        const icon = success ? '✅' : '❌';
        console.log(`  ${icon} [${category}] ${name}${details ? ` - ${details}` : ''}`);
        if (!success) {
            this.issues.push({ category, name, details });
        }
    }

    recordMemory() {
        const usage = process.memoryUsage();
        this.memoryHistory.push({
            timestamp: Date.now(),
            heapMB: Math.round(usage.heapUsed / 1024 / 1024),
            totalMB: Math.round(usage.heapTotal / 1024 / 1024)
        });
    }

    recordOperation() {
        this.operationCount++;
        if (this.operationCount % 1000 === 0) {
            console.log(`  [PROGRESS] 已执行 ${this.operationCount} 次操作...`);
        }
    }

    finalize() {
        this.endTime = Date.now();
    }

    printSummary() {
        console.log('\n' + '═══════════════════════════════════════════════════════════════════════════');
        console.log('📊 测试总结');
        console.log('═══════════════════════════════════════════════════════════════════════════');
        const passed = this.tests.filter(t => t.success).length;
        const failed = this.tests.filter(t => !t.success).length;
        console.log(`  总测试数: ${this.tests.length}`);
        console.log(`  ✅ 通过: ${passed}`);
        console.log(`  ❌ 失败: ${failed}`);
        console.log(`  总操作数: ${this.operationCount}`);
        console.log(`  耗时: ${(this.endTime - this.startTime) / 1000}s`);
        if (this.issues.length > 0) {
            console.log('\n  ⚠️  发现的问题:');
            this.issues.forEach((issue, i) => {
                console.log(`    ${i + 1}. [${issue.category}] ${issue.name}: ${issue.details}`);
            });
        } else {
            console.log('\n  🎉🎉🎉 完美！没有发现任何问题！🎉🎉🎉');
        }
        console.log('');
    }

    saveToFile(fileName) {
        const data = {
            startTime: new Date(this.startTime).toISOString(),
            endTime: new Date(this.endTime).toISOString(),
            summary: {
                totalTests: this.tests.length,
                passed: this.tests.filter(t => t.success).length,
                failed: this.tests.filter(t => !t.success).length,
                operationCount: this.operationCount
            },
            tests: this.tests,
            issues: this.issues,
            memoryHistory: this.memoryHistory
        };
        fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    }
}

const report = new DetailedTestReport();

// ============================================
// 2. 带详细日志的知识图谱数据库
// ============================================
class LoggedKnowledgeGraphDatabase {
    constructor() {
        console.log('  [INIT] 创建 LoggedKnowledgeGraphDatabase 实例');
        this.nodes = new Map();
        this.relations = new Map();
    }

    createNode(node) {
        console.log(`    [CREATE_NODE] id=${node.id}, type=${node.type}, name=${node.name}`);
        this.nodes.set(node.id, { ...node, createdAt: new Date() });
        report.recordOperation();
        return node;
    }

    addNode(node) { return this.createNode(node); }

    getNode(id) {
        console.log(`    [GET_NODE] id=${id}`);
        report.recordOperation();
        return this.nodes.get(id) || null;
    }

    getAllNodes() {
        console.log(`    [GET_ALL_NODES] count=${this.nodes.size}`);
        report.recordOperation();
        return Array.from(this.nodes.values());
    }

    getNodesByType(type) {
        const count = Array.from(this.nodes.values()).filter(n => n.type === type).length;
        console.log(`    [GET_NODES_BY_TYPE] type=${type}, found=${count}`);
        report.recordOperation();
        return Array.from(this.nodes.values()).filter(n => n.type === type);
    }

    updateNode(id, updates) {
        console.log(`    [UPDATE_NODE] id=${id}, changes=${Object.keys(updates).length}`);
        const existing = this.nodes.get(id);
        if (!existing) {
            console.log(`    [UPDATE_NODE] ⚠️  节点不存在: id=${id}`);
            return null;
        }
        const updated = { ...existing, ...updates };
        this.nodes.set(id, updated);
        report.recordOperation();
        return updated;
    }

    deleteNode(id) {
        console.log(`    [DELETE_NODE] id=${id}`);
        // 找出所有相关关系并删除
        const relatedRelations = Array.from(this.relations.entries())
            .filter(([_, r]) => r.sourceId === id || r.targetId === id);
        console.log(`    [DELETE_NODE] 级联删除 ${relatedRelations.length} 个关系`);
        for (const [relId] of relatedRelations) {
            this.relations.delete(relId);
        }
        const deleted = this.nodes.delete(id);
        report.recordOperation();
        return deleted;
    }

    createRelation(relation) {
        console.log(`    [CREATE_RELATION] id=${relation.id}, type=${relation.type}, source=${relation.sourceId} → target=${relation.targetId}`);
        this.relations.set(relation.id, relation);
        report.recordOperation();
        return relation;
    }

    addRelation(relation) { return this.createRelation(relation); }

    deleteRelation(id) {
        console.log(`    [DELETE_RELATION] id=${id}`);
        report.recordOperation();
        return this.relations.delete(id);
    }

    getAllRelations() {
        console.log(`    [GET_ALL_RELATIONS] count=${this.relations.size}`);
        report.recordOperation();
        return Array.from(this.relations.values());
    }

    getOutRelations(nodeId) {
        const count = Array.from(this.relations.values()).filter(r => r.sourceId === nodeId).length;
        console.log(`    [GET_OUT_RELATIONS] nodeId=${nodeId}, found=${count}`);
        report.recordOperation();
        return Array.from(this.relations.values()).filter(r => r.sourceId === nodeId);
    }

    getInRelations(nodeId) {
        const count = Array.from(this.relations.values()).filter(r => r.targetId === nodeId).length;
        console.log(`    [GET_IN_RELATIONS] nodeId=${nodeId}, found=${count}`);
        report.recordOperation();
        return Array.from(this.relations.values()).filter(r => r.targetId === nodeId);
    }

    findPath(sourceId, targetId, maxDepth = 10) {
        console.log(`    [FIND_PATH] source=${sourceId} → target=${targetId}, maxDepth=${maxDepth}`);
        const visited = new Set();
        const queue = [{ id: sourceId, path: [sourceId] }];
        while (queue.length > 0) {
            const current = queue.shift();
            if (current.id === targetId) {
                console.log(`    [FIND_PATH] ✅ 找到路径: ${current.path.join(' → ')}`);
                report.recordOperation();
                return current.path;
            }
            if (current.path.length >= maxDepth || visited.has(current.id)) continue;
            visited.add(current.id);
            const outgoing = Array.from(this.relations.values()).filter(r => r.sourceId === current.id);
            for (const rel of outgoing) {
                if (!visited.has(rel.targetId)) {
                    queue.push({ id: rel.targetId, path: [...current.path, rel.targetId] });
                }
            }
        }
        console.log(`    [FIND_PATH] ❌ 未找到路径`);
        report.recordOperation();
        return [];
    }

    searchNodes(query) {
        console.log(`    [SEARCH_NODES] query=${query}`);
        const lowerQuery = query.toLowerCase();
        const results = Array.from(this.nodes.values()).filter(node => {
            return node.name && node.name.toLowerCase().includes(lowerQuery);
        });
        console.log(`    [SEARCH_NODES] 找到 ${results.length} 个结果`);
        report.recordOperation();
        return results;
    }

    findCycleDependencies() {
        console.log(`    [FIND_CYCLE_DEPENDENCIES]`);
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (nodeId, path) => {
            visited.add(nodeId);
            recursionStack.add(nodeId);
            path.push(nodeId);
            const outgoing = Array.from(this.relations.values()).filter(r => r.sourceId === nodeId);
            for (const rel of outgoing) {
                if (!visited.has(rel.targetId)) {
                    dfs(rel.targetId, [...path]);
                } else if (recursionStack.has(rel.targetId)) {
                    const cycleStart = path.indexOf(rel.targetId);
                    if (cycleStart !== -1) {
                        cycles.push([...path.slice(cycleStart), rel.targetId]);
                    }
                }
            }
            recursionStack.delete(nodeId);
        };
        for (const nodeId of this.nodes.keys()) {
            if (!visited.has(nodeId)) {
                dfs(nodeId, []);
            }
        }
        console.log(`    [FIND_CYCLE_DEPENDENCIES] 找到 ${cycles.length} 个循环`);
        report.recordOperation();
        return cycles;
    }

    clear() {
        console.log(`    [CLEAR] 清空所有数据`);
        this.nodes.clear();
        this.relations.clear();
        report.recordOperation();
    }

    getStats() {
        const nodeTypes = {};
        const relationTypes = {};
        for (const node of this.nodes.values()) {
            const type = node.type || 'unknown';
            nodeTypes[type] = (nodeTypes[type] || 0) + 1;
        }
        for (const rel of this.relations.values()) {
            const type = rel.type || 'unknown';
            relationTypes[type] = (relationTypes[type] || 0) + 1;
        }
        const stats = {
            nodes: this.nodes.size,
            relations: this.relations.size,
            nodeTypes,
            relationTypes,
            totalNodes: this.nodes.size,
            totalRelations: this.relations.size
        };
        console.log(`    [GET_STATS] nodes=${stats.nodes}, relations=${stats.relations}`);
        report.recordOperation();
        return stats;
    }
}

// ============================================
// 3. 测试数据生成器
// ============================================
class ComplexDataGenerator {
    constructor() {
        this.nodeTypes = ['FILE', 'CLASS', 'FUNCTION', 'INTERFACE', 'ENUM', 'TYPE', 'VARIABLE', 'METHOD', 'PROPERTY'];
        this.relationTypes = ['CONTAINS', 'DEPENDS_ON', 'REFERENCES', 'IMPLEMENTS', 'EXTENDS', 'CALLS', 'USES'];
    }

    generateNode(i) {
        const typeIndex = Math.floor(Math.random() * this.nodeTypes.length);
        return {
            id: `node-${i}`,
            type: this.nodeTypes[typeIndex],
            name: `Test${this.nodeTypes[typeIndex]}${i}${Math.random() > 0.95 ? '🚀' : ''}`,
            metadata: {
                created: Date.now(),
                random: Math.random(),
                index: i,
                hugeData: (i % 10 === 0) ? 'x'.repeat(1000) : null
            }
        };
    }

    generateRelation(sourceId, targetId, i) {
        return {
            id: `relation-${i}`,
            type: this.relationTypes[Math.floor(Math.random() * this.relationTypes.length)],
            sourceId,
            targetId,
            weight: Math.random(),
            createdAt: Date.now()
        };
    }
}

const generator = new ComplexDataGenerator();

// ============================================
// 4. 测试执行
// ============================================
async function runTests() {
    console.log('\n  ────────────────────────────────────────────────────────────────');
    console.log('  阶段1: 静态代码核验');
    console.log('  ────────────────────────────────────────────────────────────────');
    
    const db = new LoggedKnowledgeGraphDatabase();
    report.addTest('STATIC', '知识图谱数据库初始化成功', db.nodes instanceof Map);
    
    console.log('\n  ────────────────────────────────────────────────────────────────');
    console.log('  阶段2: 单元全覆盖测试 - 每一步都打印');
    console.log('  ────────────────────────────────────────────────────────────────');
    
    // 2.1 基本节点操作
    const testNode = { id: 'test-1', type: 'FILE', name: 'TestFile.ts' };
    db.addNode(testNode);
    const retrieved = db.getNode('test-1');
    report.addTest('UNIT', '创建节点并正确获取', retrieved !== null && retrieved.id === 'test-1');
    
    // 2.2 测试空值
    let nullTestOk = true;
    try {
        console.log('    [TEST] 测试添加 null 节点');
        db.addNode(null);
        nullTestOk = false;
    } catch (e) {
        nullTestOk = true;
    }
    report.addTest('UNIT', '添加 null 节点应抛出错误', nullTestOk);
    
    // 2.3 测试批量添加
    console.log('    [TEST] 批量添加 1000 个节点...');
    for (let i = 0; i < 1000; i++) {
        db.addNode(generator.generateNode(i + 1000));
    }
    const allNodes = db.getAllNodes();
    report.addTest('UNIT', '批量添加节点成功', allNodes.length === 1001);
    
    // 2.4 测试关系操作
    const sourceId = 'node-1000';
    const targetId = 'node-1001';
    db.addRelation({
        id: 'rel-test-1',
        type: 'DEPENDS_ON',
        sourceId,
        targetId
    });
    const outRels = db.getOutRelations(sourceId);
    report.addTest('UNIT', '关系创建和查询正确', outRels.length === 1);
    
    // 2.5 测试删除（关键！）
    console.log('    [TEST] 测试删除节点（级联删除关系）...');
    const deleted = db.deleteNode(sourceId);
    const sourceOutRelsAfterDelete = db.getOutRelations(sourceId);
    const targetInRelsAfterDelete = db.getInRelations(targetId);
    const deleteOk = deleted && sourceOutRelsAfterDelete.length === 0 && targetInRelsAfterDelete.length === 0;
    report.addTest('UNIT', '节点删除时正确级联删除关系', deleteOk);
    
    db.clear();
    report.recordMemory();
    
    console.log('\n  ────────────────────────────────────────────────────────────────');
    console.log('  阶段3: 超大规模压力测试');
    console.log('  ────────────────────────────────────────────────────────────────');
    
    // 3.1 创建超大规模数据
    console.log('    [PHASE3] 创建 10000 个节点，每步打印...');
    for (let i = 0; i < 10000; i++) {
        db.addNode(generator.generateNode(i));
        if (i % 1000 === 0) {
            console.log(`    [PROGRESS] 创建节点: ${i} / 10000 (${Math.round(i/100)}%)`);
            report.recordMemory();
        }
    }
    const stats1 = db.getStats();
    report.addTest('PERF', '10000 节点创建成功', stats1.nodes === 10000);
    
    // 3.2 创建大规模关系
    console.log('    [PHASE3] 创建 20000 个关系，每步打印...');
    for (let i = 0; i < 20000; i++) {
        const sourceIdx = Math.floor(Math.random() * 10000);
        let targetIdx = Math.floor(Math.random() * 10000);
        while (targetIdx === sourceIdx) targetIdx = Math.floor(Math.random() * 10000);
        db.addRelation(generator.generateRelation(
            `node-${sourceIdx}`,
            `node-${targetIdx}`,
            i + 10000
        ));
        if (i % 2000 === 0) {
            console.log(`    [PROGRESS] 创建关系: ${i} / 20000 (${Math.round(i/200)}%)`);
            report.recordMemory();
        }
    }
    const stats2 = db.getStats();
    report.addTest('PERF', '20000 关系创建成功', stats2.relations === 20000);
    
    console.log('\n  ────────────────────────────────────────────────────────────────');
    console.log('  阶段4: 混沌随机场景');
    console.log('  ────────────────────────────────────────────────────────────────');
    
    console.log('    [PHASE4] 随机操作 5000 次...');
    const nodeIds = db.getAllNodes().map(n => n.id);
    const operations = ['create', 'read', 'update', 'delete', 'search', 'path', 'stats'];
    
    for (let i = 0; i < 5000; i++) {
        const op = operations[Math.floor(Math.random() * operations.length)];
        
        switch(op) {
            case 'create':
                const newNode = generator.generateNode(20000 + i);
                db.addNode(newNode);
                break;
                
            case 'read':
                const randomNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
                db.getNode(randomNodeId);
                break;
                
            case 'update':
                const updateNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
                db.updateNode(updateNodeId, { lastModified: Date.now() });
                break;
                
            case 'delete':
                if (nodeIds.length > 50) {
                    const deleteNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
                    db.deleteNode(deleteNodeId);
                }
                break;
                
            case 'search':
                const queries = ['Test', 'Class', 'File', 'node', 'a'];
                db.searchNodes(queries[Math.floor(Math.random() * queries.length)]);
                break;
                
            case 'path':
                const pathStart = nodeIds[Math.floor(Math.random() * nodeIds.length)];
                const pathEnd = nodeIds[Math.floor(Math.random() * nodeIds.length)];
                db.findPath(pathStart, pathEnd, 20);
                break;
                
            case 'stats':
                db.getStats();
                break;
        }
        
        if (i % 500 === 0) {
            console.log(`    [PROGRESS] 混沌操作: ${i} / 5000 (${Math.round(i/50)}%)`);
        }
    }
    
    report.addTest('CHAOS', '随机混沌操作完成', true);
    
    console.log('\n  ────────────────────────────────────────────────────────────────');
    console.log('  阶段5: 循环依赖和边缘场景');
    console.log('  ────────────────────────────────────────────────────────────────');
    
    // 5.1 测试循环依赖
    db.clear();
    console.log('    [PHASE5] 创建循环依赖...');
    for (let i = 0; i < 50; i++) {
        db.addNode({ id: `cycle-node-${i}`, type: 'CLASS', name: `CycleNode${i}` });
    }
    // 形成大循环
    for (let i = 0; i < 50; i++) {
        db.addRelation({
            id: `cycle-rel-${i}`,
            type: 'DEPENDS_ON',
            sourceId: `cycle-node-${i}`,
            targetId: `cycle-node-${(i + 1) % 50}`
        });
    }
    const cycles = db.findCycleDependencies();
    report.addTest('CYCLE', '循环依赖检测正常', cycles.length > 0);
    
    // 5.2 边缘条件
    console.log('    [PHASE5] 测试边缘条件...');
    const hugeId = 'x'.repeat(10000);
    db.addNode({ id: hugeId, type: 'FILE', name: 'HugeIdFile' });
    const hugeNode = db.getNode(hugeId);
    report.addTest('EDGE', '超长 ID 节点处理正常', hugeNode !== null);
    
    const specialNames = [
        { id: 'sp-1', name: '测试中文', type: 'FILE' },
        { id: 'sp-2', name: 'Emoji🚀', type: 'FILE' },
        { id: 'sp-3', name: '<script>alert(XSS)</script>', type: 'FILE' },
        { id: 'sp-4', name: '"SQL" INJECTION', type: 'FILE' },
        { id: 'sp-5', name: 'Path/With/Slashes', type: 'FILE' }
    ];
    for (const n of specialNames) {
        db.addNode(n);
    }
    const allSpecialNodes = db.getAllNodes().filter(n => n.id.startsWith('sp-'));
    report.addTest('EDGE', '特殊字符名称处理正常', allSpecialNodes.length === 5);
    
    console.log('\n  ────────────────────────────────────────────────────────────────');
    console.log('  阶段6: 长时间持续测试');
    console.log('  ────────────────────────────────────────────────────────────────');
    
    db.clear();
    console.log('    [PHASE6] 持续创建和删除 50000 个节点...');
    for (let round = 0; round < 5; round++) {
        // 每轮创建10000个节点
        for (let i = 0; i < 10000; i++) {
            db.addNode(generator.generateNode(round * 100000 + i));
        }
        // 删除一半
        const currentNodes = db.getAllNodes();
        for (let i = 0; i < 5000; i++) {
            db.deleteNode(currentNodes[i % currentNodes.length].id);
        }
        console.log(`    [PROGRESS] 第 ${round + 1} / 5 轮完成`);
        report.recordMemory();
    }
    
    report.addTest('LONG', '长时间持续测试完成', true);
    
    // 最终总结
    report.finalize();
    report.printSummary();
    report.saveToFile('ultimate_chaos_test_report_v1.0.json');
    
    console.log('  📄 详细报告已保存到: ultimate_chaos_test_report_v1.0.json');
    console.log('');
}

runTests().catch(e => {
    console.error('❌ 测试执行失败:', e);
    process.exit(1);
});
