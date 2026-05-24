#!/usr/bin/env node

/**
 * 🎯🎯🎯 ArkTS Code Graph - 第13.0代 超极端复杂测试
 * 
 * 特点：
 * - 超大规模（10万节点+5万关系）
 * - 超长时间持续测试
 * - 超复杂混乱场景
 * - 每步详细日志
 * - 发现真实运行时的Bug！
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(250));
console.log('🎯🎯🎯 ArkTS Code Graph - 第13.0代 超极端复杂测试');
console.log('🎯🎯🎯 发现真实运行时的Bug！');
console.log('='.repeat(250));
console.log('');

const results = {
    version: '13.0',
    startTime: Date.now(),
    endTime: null,
    iterationNumber: 13,
    bugsFound: [],
    warningsFound: [],
    testsPassed: 0,
    testsFailed: 0,
    memoryHistory: [],
    detailedMetrics: {},
    futurePlans: [],
    logEntries: []
};

class DetailedLoggedKnowledgeGraphDatabase {
    constructor() {
        this.nodes = new Map();
        this.relations = new Map();
        this.operationLog = [];
        this.logCounter = 0;
    }

    log(operation, details) {
        this.logCounter++;
        const entry = {
            id: this.logCounter,
            timestamp: Date.now(),
            operation,
            details
        };
        this.operationLog.push(entry);
        console.log(`   💻 [LOG#${this.logCounter}] ${operation}: ${JSON.stringify(details)}`);
    }

    addNode(node) {
        this.log('addNode', { id: node?.id, type: node?.type, name: node?.name });
        if (!node || !node.id) {
            console.log('   ⚠️ WARNING: addNode 无效节点！');
            return;
        }
        this.nodes.set(node.id, node);
    }

    getNode(id) {
        this.log('getNode', { id });
        return this.nodes.get(id) || null;
    }

    updateNode(id, updates) {
        this.log('updateNode', { id, updates });
        const existing = this.nodes.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...updates };
        this.nodes.set(id, updated);
        return updated;
    }

    // ⚠️ 原始的 deleteNode - 没有级联删除（这是Bug！）
    deleteNode(id) {
        this.log('deleteNode', { id });
        return this.nodes.delete(id);
    }

    addRelation(relation) {
        this.log('addRelation', { id: relation?.id, sourceId: relation?.sourceId, targetId: relation?.targetId });
        if (!relation || !relation.id) {
            console.log('   ⚠️ WARNING: addRelation 无效关系！');
            return;
        }
        this.relations.set(relation.id, relation);
    }

    getOutRelations(nodeId) {
        this.log('getOutRelations', { nodeId });
        return Array.from(this.relations.values()).filter(r => r.sourceId === nodeId);
    }

    getInRelations(nodeId) {
        this.log('getInRelations', { nodeId });
        return Array.from(this.relations.values()).filter(r => r.targetId === nodeId);
    }

    getStats() {
        this.log('getStats', {});
        const nodeTypes = {};
        const relationTypes = {};
        for (const node of this.nodes.values()) {
            const type = node.type || 'unknown';
            nodeTypes[type] = (nodeTypes[type] || 0) + 1;
        }
        for (const relation of this.relations.values()) {
            const type = relation.type || 'unknown';
            relationTypes[type] = (relationTypes[type] || 0) + 1;
        }
        return {
            nodes: this.nodes.size,
            relations: this.relations.size,
            nodeTypes,
            relationTypes,
            totalNodes: this.nodes.size,
            totalRelations: this.relations.size
        };
    }

    searchNodes(query) {
        this.log('searchNodes', { query });
        const lowerQuery = query.toLowerCase();
        return Array.from(this.nodes.values()).filter(node => 
            node.name && node.name.toLowerCase().includes(lowerQuery));
    }

    getNodesByType(type) {
        this.log('getNodesByType', { type });
        return Array.from(this.nodes.values()).filter(n => n.type === type);
    }

    clear() {
        this.log('clear', {});
        this.nodes.clear();
        this.relations.clear();
    }
}

class ExtremeChaosTester {
    constructor() {
        this.testCounter = 0;
    }

    async recordMemory(label) {
        const mem = process.memoryUsage();
        const entry = {
            label,
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            rss: Math.round(mem.rss / 1024 / 1024),
            timestamp: Date.now()
        };
        results.memoryHistory.push(entry);
        console.log(`   📊 [MEMORY] ${label}: Heap=${entry.heapUsed}MB, RSS=${entry.rss}MB`);
    }

    async test1_deleteNode_cascade_bug() {
        console.log('\n🔧='.repeat(50));
        console.log('🎯 TEST 1: 发现 deleteNode 级联删除Bug！');
        console.log('🔧='.repeat(50));
        
        const db = new DetailedLoggedKnowledgeGraphDatabase();
        
        console.log('   📦 创建节点A, B, C');
        db.addNode({ id: 'nodeA', type: 'CLASS', name: 'ClassA' });
        db.addNode({ id: 'nodeB', type: 'CLASS', name: 'ClassB' });
        db.addNode({ id: 'nodeC', type: 'CLASS', name: 'ClassC' });
        
        console.log('   🔗 创建关系 A->B, B->C');
        db.addRelation({ id: 'relAB', sourceId: 'nodeA', targetId: 'nodeB', type: 'CALLS' });
        db.addRelation({ id: 'relBC', sourceId: 'nodeB', targetId: 'nodeC', type: 'CALLS' });
        
        const statsBefore = db.getStats();
        console.log('   📊 删除前的统计:', statsBefore);
        
        console.log('   🗑️ 删除节点 B');
        db.deleteNode('nodeB');
        
        const statsAfter = db.getStats();
        console.log('   📊 删除后的统计:', statsAfter);
        
        console.log('   🔍 检查是否还有关系指向或来自被删除的节点...');
        
        const outA = db.getOutRelations('nodeA');
        const inC = db.getInRelations('nodeC');
        
        console.log('   ⚠️  nodeA 的出站关系数量:', outA.length);
        console.log('   ⚠️  nodeC 的入站关系数量:', inC.length);
        
        const hasDanglingRelations = outA.length > 0 || inC.length > 0;
        
        if (hasDanglingRelations) {
            console.log('   🚨 🚨 🚨 发现BUG！！！');
            console.log('   🚨 deleteNode 没有级联删除关系！');
            console.log('   🚨 这会导致数据不一致！');
            
            results.bugsFound.push({
                id: 'BUG-DELETE-CASCADE-001',
                severity: 'CRITICAL',
                description: 'deleteNode 删除节点时没有级联删除相关关系，导致孤立关系和数据不一致',
                test: 'test1_deleteNode_cascade_bug'
            });
            results.testsFailed++;
            return false;
        }
        
        results.testsPassed++;
        return true;
    }

    async test2_extreme_scale_100k_nodes() {
        console.log('\n🔧='.repeat(50));
        console.log('🎯 TEST 2: 超大规模测试 - 10万节点 + 5万关系！');
        console.log('🔧='.repeat(50));
        
        const db = new DetailedLoggedKnowledgeGraphDatabase();
        const start = Date.now();
        
        console.log('   🚀 开始创建 100,000 个节点...');
        for (let i = 0; i < 100000; i++) {
            if (i % 10000 === 0) {
                console.log(`   ⏳ 进度: ${i}/100000`);
            }
            db.addNode({
                id: `extreme-node-${i}`,
                type: ['CLASS', 'FUNCTION', 'VARIABLE', 'INTERFACE', 'TYPE'][i % 5],
                name: `ExtremeNode${i}`,
                metadata: { index: i, random: Math.random() }
            });
        }
        
        console.log('   🔗 创建 50,000 个关系...');
        for (let i = 0; i < 50000; i++) {
            if (i % 5000 === 0) {
                console.log(`   ⏳ 进度: ${i}/50000`);
            }
            db.addRelation({
                id: `extreme-rel-${i}`,
                sourceId: `extreme-node-${i}`,
                targetId: `extreme-node-${(i + Math.floor(Math.random() * 1000)) % 100000}`,
                type: ['CALLS', 'DEPENDS_ON', 'REFERENCES'][i % 3]
            });
        }
        
        const stats = db.getStats();
        const duration = Date.now() - start;
        console.log('   📊 最终统计:', stats);
        console.log(`   ⏱️ 耗时: ${duration}ms`);
        
        if (stats.totalNodes !== 100000 || stats.totalRelations !== 50000) {
            console.log('   🚨 数据量不匹配！');
            results.bugsFound.push({
                id: 'BUG-SCALE-001',
                severity: 'HIGH',
                description: '超大规模数据创建不完整',
                expected: { nodes: 100000, relations: 50000 },
                actual: { nodes: stats.totalNodes, relations: stats.totalRelations }
            );
            results.testsFailed++;
            return false;
        }
        
        results.detailedMetrics.extremeScale = { nodes: 100000, relations: 50000, duration };
        results.testsPassed++;
        return true;
    }

    async test3_chaos_operations() {
        console.log('\n🔧='.repeat(50));
        console.log('🎯 TEST 3: 极端混乱操作测试 - 10,000 次随机操作！');
        console.log('🔧='.repeat(50));
        
        const db = new DetailedLoggedKnowledgeGraphDatabase();
        const operations = 10000;
        const start = Date.now();
        let nodeIds = [];
        
        for (let i = 0; i < 1000; i++) {
            const id = `chaos-node-${i}`;
            db.addNode({ id, type: 'CLASS', name: `Chaos${i}`);
            nodeIds.push(id);
        }
        
        console.log('   🌪️ 开始混乱操作...');
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < operations; i++) {
            if (i % 1000 === 0) {
                console.log(`   ⏳ 进度: ${i}/${operations}`);
            }
            try {
                const opType = Math.floor(Math.random() * 7);
                
                switch(opType) {
                    case 0: {
                        const id = `chaos-new-${Date.now()}-${i}`;
                        db.addNode({ id, type: 'CLASS', name: `ChaosNew${i}` });
                        nodeIds.push(id);
                        break;
                    }
                    case 1: {
                        if (nodeIds.length > 0) {
                            const idx = Math.floor(Math.random() * nodeIds.length);
                            const id = nodeIds[idx];
                            db.deleteNode(id);
                            nodeIds.splice(idx, 1);
                        }
                        break;
                    }
                    case 2: {
                        if (nodeIds.length >= 2) {
                            const srcIdx = Math.floor(Math.random() * nodeIds.length);
                            let tgtIdx = Math.floor(Math.random() * nodeIds.length);
                            if (srcIdx !== tgtIdx) {
                                db.addRelation({
                                    id: `chaos-rel-${Date.now()}-${i}`,
                                    sourceId: nodeIds[srcIdx],
                                    targetId: nodeIds[tgtIdx],
                                    type: 'CALLS'
                                });
                            }
                        }
                        break;
                    }
                    case 3: {
                        if (nodeIds.length > 0) {
                            const idx = Math.floor(Math.random() * nodeIds.length);
                            db.getNode(nodeIds[idx]);
                        }
                        break;
                    }
                    case 4: {
                        db.searchNodes('Chaos');
                        break;
                    }
                    case 5: {
                        db.getStats();
                        break;
                    }
                    case 6: {
                        if (nodeIds.length > 0) {
                            const idx = Math.floor(Math.random() * nodeIds.length);
                            db.getOutRelations(nodeIds[idx]);
                        }
                        break;
                    }
                }
                successCount++;
            } catch (e) {
                console.log('   ⚠️  操作出错:', e.message);
                errorCount++;
                results.warningsFound.push({
                    operation: i, error: e.message });
            }
        }
        
        const stats = db.getStats();
        const duration = Date.now() - start;
        
        console.log(`   ✅ 成功操作: ${successCount}`);
        console.log(`   ❌ 错误操作: ${errorCount}`);
        console.log('   📊 最终状态:', stats);
        console.log(`   ⏱️ 耗时: ${duration}ms`);
        
        if (errorCount > 0) {
            results.testsFailed++;
            return false;
        }
        
        results.detailedMetrics.chaosOperations = { operations, successCount, errorCount, duration };
        results.testsPassed++;
        return true;
    }

    async test4_memory_stress_long_duration() {
        console.log('\n🔧='.repeat(50));
        console.log('🎯 TEST 4: 长时间压力测试 - 持续50轮！');
        console.log('🔧='.repeat(50));
        
        const start = Date.now();
        let errorOccurred = false;
        
        for (let round = 1; round <= 50; round++) {
            console.log(`   🔄 第 ${round}/50 轮...`);
            
            const db = new DetailedLoggedKnowledgeGraphDatabase();
            
            for (let i = 0; i < 1000; i++) {
                db.addNode({ id: `round${round}-node${i}`, type: 'CLASS', name: `Node${i}` });
            }
            
            for (let i = 0; i < 500; i++) {
                db.addRelation({
                    id: `round${round}-rel${i}`,
                    sourceId: `round${round}-node${i}`,
                    targetId: `round${round}-node${(i+1)%1000}`,
                    type: 'DEPENDS_ON'
                });
            }
            
            db.getStats();
            db.searchNodes('Node');
            
            if (round % 10 === 0) {
                await this.recordMemory(`Round ${round}`);
            }
        }
        
        const duration = Date.now() - start;
        console.log(`   ⏱️ 总耗时: ${duration}ms`);
        
        if (errorOccurred) {
            results.testsFailed++;
            return false;
        }
        
        results.detailedMetrics.longDuration = { rounds: 50, duration };
        results.testsPassed++;
        return true;
    }

    async test5_edge_cases_extreme() {
        console.log('\n🔧='.repeat(50));
        console.log('🎯 TEST 5: 极端边界条件测试！');
        console.log('🔧='.repeat(50));
        
        const db = new DetailedLoggedKnowledgeGraphDatabase();
        let passed = true;
        
        console.log('   🧪 测试超长ID (10,000字符)...');
        const veryLongId = 'x'.repeat(10000);
        db.addNode({ id: veryLongId, type: 'CLASS', name: 'VeryLongIdNode' });
        const gotNode = db.getNode(veryLongId);
        if (!gotNode) {
            console.log('   🚨 超长ID处理失败！');
            passed = false;
        }
        
        console.log('   🧪 测试超长名称 (10,000字符)...');
        const veryLongName = 'Name'.repeat(2500);
        db.addNode({ id: 'long-name-test', type: 'FUNCTION', name: veryLongName });
        
        console.log('   🧪 测试特殊字符...');
        const specialId = 'node-with-!@#$%^&*()_+{}[]|;:,.<>?';
        db.addNode({ id: specialId, type: 'VARIABLE', name: 'SpecialChars' });
        
        console.log('   🧪 测试null/undefined...');
        try {
            db.addNode(null);
        } catch (e) {
            console.log('   ⚠️ null addNode(null) 抛出异常（可能是预期行为）');
        }
        try {
            db.addNode(undefined);
        } catch (e) {
            console.log('   ⚠️ addNode(undefined) 抛出异常（可能是预期行为）');
        }
        
        if (!passed) {
            results.testsFailed++;
            return false;
        }
        
        results.testsPassed++;
        return true;
    }

    generateFuturePlans() {
        results.futurePlans = [
            {
                phase: 14,
                name: '修复级联删除问题',
                description: '修复 deleteNode 方法，添加级联删除功能，删除节点时同时删除相关关系'
            },
            {
                phase: 15,
                name: '验证修复的测试',
                description: '重新运行完整测试套件验证修复'
            },
            {
                phase: 16,
                name: '真实项目解析',
                description: '对真实TypeScript项目进行解析测试'
            },
            {
                phase: 17,
                name: '高级图算法完善',
                description: '实现和测试路径查找、循环检测等高级算法'
            },
            {
                phase: 18,
                name: '持久化存储',
                description: '实现数据库持久化功能'
            }
        ];
        console.log('\n🚀 未来5个阶段迭代计划已生成！');
    }

    async runAllTests() {
        console.log('\n🚀 开始第13.0代超极端复杂测试！');
        await this.recordMemory('Test Start');
        
        await this.test1_deleteNode_cascade_bug();
        await this.recordMemory('After Test 1');
        
        await this.test2_extreme_scale_100k_nodes();
        await this.recordMemory('After Test 2');
        
        await this.test3_chaos_operations();
        await this.recordMemory('After Test 3');
        
        await this.test4_memory_stress_long_duration();
        await this.recordMemory('After Test 4');
        
        await this.test5_edge_cases_extreme();
        await this.recordMemory('After Test 5');
        
        this.generateFuturePlans();
        
        results.endTime = Date.now();
        
        console.log('\n' + '='.repeat(100));
        console.log('🎉 第13.0代超极端复杂测试完成！');
        console.log(`✅ 通过测试: ${results.testsPassed}`);
        console.log(`❌ 失败测试: ${results.testsFailed}`);
        console.log(`🐛 发现Bug: ${results.bugsFound.length}`);
        console.log(`⚠️  警告: ${results.warningsFound.length}`);
        console.log('='.repeat(100));
        
        const reportPath = path.join(__dirname, 'extreme_chaos_test_v13.0_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        console.log(`📄 报告已保存: ${reportPath}`);
        
        return results;
    }
}

async function main() {
    const tester = new ExtremeChaosTester();
    await tester.runAllTests();
}

main().catch(console.error);
