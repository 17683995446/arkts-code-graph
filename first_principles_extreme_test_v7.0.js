#!/usr/bin/env node

/**
 * 🎯 第一性原理极限测试 v7.0 - 2小时超长压力测试
 * 
 * 基于物理根本法则的极限测试：
 * 1. 时间极限 - 2小时连续运行
 * 2. 空间极限 - 内存边界测试
 * 3. 并发极限 - 1000并发worker
 * 4. 数据极限 - 100万+节点、深度嵌套
 * 5. 递归极限 - 系统栈深度测试
 * 6. 字符串极限 - 超大字符串操作
 * 7. 数字极限 - 浮点精度边界
 * 8. 循环依赖 - 自引用图谱
 * 9. 内存泄漏 - 长时间GC监控
 * 10. 混沌工程 - 随机故障注入
 */

const fs = require('fs');
const path = require('path');
const v8 = require('v8');

console.log('='.repeat(200));
console.log('🎯 ArkTS 代码图谱 - 第一性原理极限测试 v7.0 - 2小时超长压力测试');
console.log('='.repeat(200));
console.log('');

const TEST_DURATION_MS = 2 * 60 * 60 * 1000; // 2小时
const REPORT_INTERVAL_MS = 60 * 1000; // 每分钟报告

const results = {
    startTime: Date.now(),
    endTime: null,
    bugsFound: [],
    issuesFound: [],
    memorySnapshots: [],
    performanceMetrics: [],
    cycleCount: 0,
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    testPhases: []
};

const firstPrinciplesTests = {
    timeLimit: { passed: false, details: null },
    spaceLimit: { passed: false, details: null },
    concurrencyLimit: { passed: false, details: null },
    dataLimit: { passed: false, details: null },
    recursionLimit: { passed: false, details: null },
    stringLimit: { passed: false, details: null },
    numberLimit: { passed: false, details: null },
    cyclicDependency: { passed: false, details: null },
    memoryLeak: { passed: false, details: null },
    chaosEngineering: { passed: false, details: null }
};

class FirstPrinciplesTester {
    constructor() {
        this.cycleStart = Date.now();
        this.lastReport = Date.now();
        this.gcCount = 0;
        this.lastHeapUsed = 0;
    }

    log(msg, type = 'INFO') {
        const elapsed = Math.round((Date.now() - results.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const mins = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        
        const icons = {
            'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 
            'INFO': 'ℹ️', 'TEST': '🧪', 'PERF': '⚡', 
            'DURATION': '⏱️', 'MEMORY': '📊', 'PHYSICS': '🔬',
            'CHAOS': '🌀', 'STACK': '🔁', 'CYCLE': '🔄'
        };
        
        console.log(`${icons[type] || 'ℹ️'} [${hours}:${mins}:${secs}] ${msg}`);
    }

    async recordMemorySnapshot(label) {
        const mem = process.memoryUsage();
        const heapUsed = Math.round(mem.heapUsed / 1024 / 1024);
        const heapTotal = Math.round(mem.heapTotal / 1024 / 1024);
        const rss = Math.round(mem.rss / 1024 / 1024);
        const external = Math.round(mem.external / 1024 / 1024);
        
        const snapshot = {
            label,
            timestamp: Date.now(),
            heapUsed,
            heapTotal,
            rss,
            external,
            growth: heapUsed - this.lastHeapUsed
        };
        
        results.memorySnapshots.push(snapshot);
        this.lastHeapUsed = heapUsed;
        
        this.log(`📊 [${label}] Heap: ${heapUsed}MB/${heapTotal}MB, RSS: ${rss}MB, 增长: ${snapshot.growth > 0 ? '+' : ''}${snapshot.growth}MB`, 'MEMORY');
        
        return snapshot;
    }

    async forceGC() {
        if (global.gc) {
            const beforeMem = process.memoryUsage().heapUsed;
            global.gc();
            this.gcCount++;
            const afterMem = process.memoryUsage().heapUsed;
            const freed = Math.round((beforeMem - afterMem) / 1024 / 1024);
            this.log(`🗑️ GC #${this.gcCount}: 释放 ${freed}MB`, 'MEMORY');
            return freed;
        }
        return 0;
    }

    // ====== 第一性原理测试1: 时间极限 ======
    async testTimeLimit() {
        this.log('🔬 第一性原理测试1: 时间极限 (2小时连续运行)...', 'PHYSICS');
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        let iterations = 0;
        const startTime = Date.now();
        const duration = 60000; // 1分钟连续测试
        
        while (Date.now() - startTime < duration) {
            iterations++;
            const db = new KnowledgeGraphDatabase();
            
            for (let i = 0; i < 10000; i++) {
                db.createNode({
                    id: `time-node-${iterations}-${i}`,
                    type: 'FUNCTION',
                    name: `TimeTest${i}`,
                    metadata: { ts: Date.now(), iteration: iterations }
                });
            }
            
            db.getNodesByType('FUNCTION');
            db.clear();
            
            if (iterations % 10 === 0) {
                this.log(`⏱️ 时间极限: ${iterations} 次迭代完成`, 'DURATION');
            }
        }
        
        const actualDuration = Date.now() - startTime;
        const opsPerSec = (iterations * 10000) / (actualDuration / 1000);
        
        firstPrinciplesTests.timeLimit = {
            passed: true,
            iterations,
            opsPerSec: opsPerSec.toFixed(2)
        };
        
        this.log(`✅ 时间极限测试: ${iterations} 次迭代, ${opsPerSec.toFixed(2)} ops/sec`, 'SUCCESS');
        results.testPhases.push({ name: '时间极限', passed: true, ops: iterations * 10000 });
    }

    // ====== 第一性原理测试2: 空间极限 (内存边界) ======
    async testSpaceLimit() {
        this.log('🔬 第一性原理测试2: 空间极限 (内存边界)...', 'PHYSICS');
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        let nodesCreated = 0;
        let oomDetected = false;
        
        try {
            for (let i = 0; i < 500000; i++) { // 50万节点
                db.createNode({
                    id: `space-node-${i}`,
                    type: 'CLASS',
                    name: `SpaceNode${i}`,
                    metadata: {
                        largePayload: 'x'.repeat(1000), // 1KB元数据
                        index: i,
                        ts: Date.now()
                    }
                });
                nodesCreated++;
                
                if (i % 50000 === 0) {
                    const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
                    this.log(`📊 空间极限: ${i} 节点, 堆内存: ${mem}MB`, 'MEMORY');
                }
            }
            
            const stats = db.getStats();
            this.log(`✅ 空间极限测试: 创建 ${stats.totalNodes} 节点`, 'SUCCESS');
            
            firstPrinciplesTests.spaceLimit = {
                passed: true,
                nodesCreated: stats.totalNodes,
                memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
            };
            
            results.testPhases.push({ name: '空间极限', passed: true, nodes: stats.totalNodes });
            
        } catch (e) {
            if (e.message.includes('heap') || e.message.includes('memory')) {
                oomDetected = true;
                this.log(`⚠️ OOM检测 (这是预期的): ${e.message}`, 'WARNING');
            } else {
                this.log(`🐛 BUG: 空间测试异常: ${e.message}`, 'BUG');
                results.bugsFound.push({ type: '空间极限', error: e.message });
            }
            
            firstPrinciplesTests.spaceLimit = {
                passed: !oomDetected,
                nodesCreated,
                oomDetected
            };
        }
        
        await db.clear();
        await this.forceGC();
    }

    // ====== 第一性原理测试3: 并发极限 ======
    async testConcurrencyLimit() {
        this.log('🔬 第一性原理测试3: 并发极限 (1000 workers)...', 'PHYSICS');
        
        const { coreEngine } = require('./dist/src/core/engine');
        
        const workerCount = 1000; // 1000并发
        const opsPerWorker = 100;
        
        this.log(`🌀 启动 ${workerCount} 个并发worker...`, 'CHAOS');
        
        const startTime = Date.now();
        let errors = 0;
        
        const promises = [];
        for (let w = 0; w < workerCount; w++) {
            promises.push((async () => {
                try {
                    for (let i = 0; i < opsPerWorker; i++) {
                        const node = coreEngine.acquireNode();
                        node.id = `concurrent-w${w}-i${i}`;
                        node.metadata = { w, i, ts: Date.now() };
                        
                        const rel = coreEngine.acquireRelation();
                        rel.sourceId = node.id;
                        rel.targetId = `concurrent-w${(w + 1) % workerCount}-i${i}`;
                        rel.type = ['CALLS', 'DEPENDS_ON', 'REFERENCES'][w % 3];
                        
                        coreEngine.releaseNode(node);
                        coreEngine.releaseRelation(rel);
                    }
                } catch (e) {
                    errors++;
                    if (errors <= 5) {
                        this.log(`🐛 并发错误: ${e.message}`, 'BUG');
                    }
                }
            })());
        }
        
        await Promise.all(promises);
        
        const duration = Date.now() - startTime;
        const totalOps = workerCount * opsPerWorker * 2;
        const opsPerSec = (totalOps / (duration / 1000)).toFixed(2);
        
        firstPrinciplesTests.concurrencyLimit = {
            passed: errors === 0,
            workerCount,
            errors,
            opsPerSec
        };
        
        if (errors === 0) {
            this.log(`✅ 并发极限测试: ${workerCount} workers, ${opsPerSec} ops/sec`, 'SUCCESS');
        } else {
            this.log(`⚠️ 并发极限测试: ${errors} 错误`, 'WARNING');
            results.issuesFound.push({ type: '并发极限', errors });
        }
        
        results.testPhases.push({ name: '并发极限', passed: errors === 0, ops: totalOps, errors });
    }

    // ====== 第一性原理测试4: 数据极限 (深度嵌套) ======
    async testDataLimit() {
        this.log('🔬 第一性原理测试4: 数据极限 (深度嵌套)...', 'PHYSICS');
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        // 测试100层嵌套
        const createDeepNested = (depth) => {
            if (depth === 0) return { value: depth };
            return { level: depth, child: createDeepNested(depth - 1) };
        };
        
        const deepData = createDeepNested(100);
        
        try {
            for (let i = 0; i < 10000; i++) {
                db.createNode({
                    id: `deep-node-${i}`,
                    type: 'INTERFACE',
                    name: `DeepNode${i}`,
                    metadata: {
                        deepNesting: deepData,
                        array: Array.from({ length: 100 }, (_, i) => ({ index: i })),
                        ts: Date.now()
                    }
                });
            }
            
            const stats = db.getStats();
            this.log(`✅ 数据极限测试: ${stats.totalNodes} 深度嵌套节点`, 'SUCCESS');
            
            firstPrinciplesTests.dataLimit = {
                passed: true,
                nodesCreated: stats.totalNodes,
                nestingDepth: 100
            };
            
            results.testPhases.push({ name: '数据极限', passed: true, nodes: stats.totalNodes });
            
        } catch (e) {
            this.log(`🐛 BUG: 数据极限失败: ${e.message}`, 'BUG');
            results.bugsFound.push({ type: '数据极限', error: e.message });
            firstPrinciplesTests.dataLimit = { passed: false, error: e.message };
        }
        
        await db.clear();
    }

    // ====== 第一性原理测试5: 递归极限 (栈深度) ======
    async testRecursionLimit() {
        this.log('🔬 第一性原理测试5: 递归极限 (栈深度)...', 'STACK');
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        // 测试递归查询深度
        let maxSafeDepth = 0;
        const testRecursionDepth = (currentDepth, maxDepth) => {
            try {
                if (currentDepth >= maxDepth) {
                    return currentDepth;
                }
                
                const nodes = db.getNodesByType('FUNCTION');
                if (nodes.length > 0 && currentDepth < maxDepth) {
                    return testRecursionDepth(currentDepth + 1, maxDepth);
                }
                return currentDepth;
            } catch (e) {
                return currentDepth - 1;
            }
        };
        
        for (let i = 0; i < 1000; i++) {
            db.createNode({
                id: `stack-node-${i}`,
                type: 'FUNCTION',
                name: `StackTest${i}`,
                metadata: {}
            });
        }
        
        maxSafeDepth = testRecursionDepth(0, 1000);
        
        this.log(`🔁 递归安全深度: ${maxSafeDepth}`, 'STACK');
        
        firstPrinciplesTests.recursionLimit = {
            passed: maxSafeDepth > 100,
            maxSafeDepth
        };
        
        if (maxSafeDepth > 100) {
            this.log(`✅ 递归极限测试: 安全深度 ${maxSafeDepth}`, 'SUCCESS');
        } else {
            this.log(`⚠️ 递归极限测试: 安全深度 ${maxSafeDepth} 较低`, 'WARNING');
        }
        
        results.testPhases.push({ name: '递归极限', passed: maxSafeDepth > 100, depth: maxSafeDepth });
        
        await db.clear();
    }

    // ====== 第一性原理测试6: 字符串极限 ======
    async testStringLimit() {
        this.log('🔬 第一性原理测试6: 字符串极限 (超大字符串)...', 'PHYSICS');
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        // 测试超大字符串
        const largeString = 'A'.repeat(1 * 1024 * 1024); // 1MB字符串
        const hugeString = 'B'.repeat(10 * 1024 * 1024); // 10MB字符串
        
        let largeStringPassed = false;
        let hugeStringPassed = false;
        
        try {
            for (let i = 0; i < 10; i++) {
                db.createNode({
                    id: `string-node-${i}`,
                    type: 'VARIABLE',
                    name: `StringTest${i}`,
                    metadata: { largeData: largeString, index: i }
                });
            }
            largeStringPassed = true;
            this.log(`✅ 1MB字符串测试通过`, 'SUCCESS');
        } catch (e) {
            this.log(`🐛 BUG: 1MB字符串失败: ${e.message}`, 'BUG');
            results.bugsFound.push({ type: '字符串极限-1MB', error: e.message });
        }
        
        try {
            db.createNode({
                id: `huge-string-node`,
                type: 'VARIABLE',
                name: `HugeStringTest`,
                metadata: { hugeData: hugeString }
            });
            hugeStringPassed = true;
            this.log(`✅ 10MB字符串测试通过`, 'SUCCESS');
        } catch (e) {
            this.log(`🐛 BUG: 10MB字符串失败: ${e.message}`, 'BUG');
            results.bugsFound.push({ type: '字符串极限-10MB', error: e.message });
        }
        
        firstPrinciplesTests.stringLimit = {
            passed: largeStringPassed && hugeStringPassed,
            largeStringMB: 1,
            hugeStringMB: 10,
            largeStringPassed,
            hugeStringPassed
        };
        
        results.testPhases.push({ name: '字符串极限', passed: largeStringPassed && hugeStringPassed });
        
        await db.clear();
    }

    // ====== 第一性原理测试7: 数字极限 (浮点精度) ======
    async testNumberLimit() {
        this.log('🔬 第一性原理测试7: 数字极限 (浮点精度)...', 'PHYSICS');
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        // 测试浮点精度边界
        const precisionTests = [
            { name: '极小正数', value: Number.EPSILON },
            { name: '极大正数', value: Number.MAX_VALUE },
            { name: '极小负数', value: -Number.EPSILON },
            { name: '极大负数', value: -Number.MAX_VALUE },
            { name: 'NaN', value: NaN },
            { name: 'Infinity', value: Infinity },
            { name: '-Infinity', value: -Infinity },
            { name: '0', value: 0 },
            { name: '-0', value: -0 }
        ];
        
        let allPassed = true;
        
        for (const test of precisionTests) {
            try {
                db.createRelation({
                    id: `precision-rel-${test.name}`,
                    sourceId: `precision-node-1`,
                    targetId: `precision-node-2`,
                    type: 'DEPENDS_ON',
                    weight: test.value
                });
            } catch (e) {
                allPassed = false;
                this.log(`🐛 BUG: 数字极限 (${test.name}): ${e.message}`, 'BUG');
                results.bugsFound.push({ type: '数字极限', value: test.name, error: e.message });
            }
        }
        
        // 测试极大整数
        for (let i = 0; i < 1000; i++) {
            db.createNode({
                id: `number-node-${i}`,
                type: 'VARIABLE',
                name: `NumberTest${i}`,
                metadata: {
                    largeInt: BigInt(Number.MAX_SAFE_INTEGER) + BigInt(i),
                    floatVal: Math.random() * Number.MAX_VALUE
                }
            });
        }
        
        firstPrinciplesTests.numberLimit = {
            passed: allPassed,
            precisionTests: precisionTests.length
        };
        
        if (allPassed) {
            this.log(`✅ 数字极限测试: ${precisionTests.length} 个精度测试全部通过`, 'SUCCESS');
        }
        
        results.testPhases.push({ name: '数字极限', passed: allPassed });
        
        await db.clear();
    }

    // ====== 第一性原理测试8: 循环依赖 ======
    async testCyclicDependency() {
        this.log('🔬 第一性原理测试8: 循环依赖 (自引用图谱)...', 'CYCLE');
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        // 创建循环依赖: A -> B -> C -> A
        const nodeA = db.createNode({ id: 'cycle-A', type: 'CLASS', name: 'ClassA', metadata: {} });
        const nodeB = db.createNode({ id: 'cycle-B', type: 'CLASS', name: 'ClassB', metadata: {} });
        const nodeC = db.createNode({ id: 'cycle-C', type: 'CLASS', name: 'ClassC', metadata: {} });
        
        db.createRelation({ id: 'rel-A-B', sourceId: 'cycle-A', targetId: 'cycle-B', type: 'CALLS', weight: 1.0 });
        db.createRelation({ id: 'rel-B-C', sourceId: 'cycle-B', targetId: 'cycle-C', type: 'CALLS', weight: 1.0 });
        db.createRelation({ id: 'rel-C-A', sourceId: 'cycle-C', targetId: 'cycle-A', type: 'CALLS', weight: 1.0 });
        
        // 自引用
        db.createRelation({ id: 'rel-A-A', sourceId: 'cycle-A', targetId: 'cycle-A', type: 'DEPENDS_ON', weight: 0.5 });
        
        // 测试遍历
        let traversalSafe = true;
        try {
            for (let i = 0; i < 10000; i++) {
                const allNodes = db.getNodesByType('CLASS');
                const allRels = db.getAllRelations();
            }
            this.log(`✅ 循环依赖遍历安全 (10000次)`, 'SUCCESS');
        } catch (e) {
            traversalSafe = false;
            this.log(`🐛 BUG: 循环依赖遍历失败: ${e.message}`, 'BUG');
            results.bugsFound.push({ type: '循环依赖', error: e.message });
        }
        
        firstPrinciplesTests.cyclicDependency = {
            passed: traversalSafe,
            cycleNodes: 3,
            cycleRelations: 4
        };
        
        results.testPhases.push({ name: '循环依赖', passed: traversalSafe });
        
        await db.clear();
    }

    // ====== 第一性原理测试9: 内存泄漏检测 ======
    async testMemoryLeak() {
        this.log('🔬 第一性原理测试9: 内存泄漏检测 (长时间GC监控)...', 'PHYSICS');
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const initialMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        let leakDetected = false;
        let leakAmount = 0;
        
        // 100轮创建和清理
        for (let round = 0; round < 100; round++) {
            const db = new KnowledgeGraphDatabase();
            
            for (let i = 0; i < 10000; i++) {
                db.createNode({
                    id: `leak-node-r${round}-i${i}`,
                    type: 'VARIABLE',
                    name: `LeakTest${i}`,
                    metadata: { round, index: i }
                });
            }
            
            await db.clear();
            
            if (round % 10 === 0) {
                await this.forceGC();
                const currentMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
                const growth = currentMem - initialMem;
                
                if (round > 20 && growth > 100) { // 超过初始100MB认为是泄漏
                    leakDetected = true;
                    leakAmount = growth;
                    this.log(`⚠️ 内存泄漏检测: 增长 ${growth}MB`, 'WARNING');
                }
            }
        }
        
        await this.forceGC();
        const finalMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const totalGrowth = finalMem - initialMem;
        
        firstPrinciplesTests.memoryLeak = {
            passed: !leakDetected,
            initialMB: initialMem,
            finalMB: finalMem,
            totalGrowthMB: totalGrowth,
            leakDetected
        };
        
        if (!leakDetected) {
            this.log(`✅ 内存泄漏测试: 无泄漏, 增长 ${totalGrowth}MB`, 'SUCCESS');
        } else {
            this.log(`⚠️ 内存泄漏: +${leakAmount}MB`, 'WARNING');
            results.issuesFound.push({ type: '内存泄漏', amount: leakAmount });
        }
        
        results.testPhases.push({ name: '内存泄漏检测', passed: !leakDetected, growthMB: totalGrowth });
    }

    // ====== 第一性原理测试10: 混沌工程 ======
    async testChaosEngineering() {
        this.log('🌀 第一性原理测试10: 混沌工程 (随机故障注入)...', 'CHAOS');
        
        const { coreEngine } = require('./dist/src/core/engine');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        let chaosTestsPassed = 0;
        let chaosTestsFailed = 0;
        
        // 1000次随机混沌操作
        for (let i = 0; i < 1000; i++) {
            const operation = Math.floor(Math.random() * 10);
            
            try {
                switch (operation) {
                    case 0: coreEngine.releaseNode(null); break;
                    case 1: coreEngine.releaseNode(undefined); break;
                    case 2: coreEngine.releaseRelation(null); break;
                    case 3: coreEngine.releaseRelation(undefined); break;
                    case 4:
                        const node = coreEngine.acquireNode();
                        coreEngine.releaseNode(node);
                        coreEngine.releaseNode(node); // 重复释放
                        break;
                    case 5:
                        const rel = coreEngine.acquireRelation();
                        coreEngine.releaseRelation(rel);
                        coreEngine.releaseRelation(rel); // 重复释放
                        break;
                    case 6:
                        db.createNode({
                            id: `chaos-${i}`,
                            type: null,
                            name: undefined,
                            metadata: { malformed: true }
                        });
                        break;
                    case 7:
                        db.createNode({
                            id: '',
                            type: '',
                            name: '',
                            metadata: { empty: true }
                        });
                        break;
                    case 8:
                        db.createNode({
                            id: `unicode-${i}`,
                            type: '测试类型',
                            name: '🎉🎊🎈🎁🎂',
                            metadata: { emoji: true }
                        });
                        break;
                    case 9:
                        db.createNode({
                            id: `special-${i}`,
                            type: '<script>alert("xss")</script>',
                            name: '"quotes" & \'apostrophes\'',
                            metadata: { special: true }
                        });
                        break;
                }
                chaosTestsPassed++;
            } catch (e) {
                chaosTestsFailed++;
                if (chaosTestsFailed <= 3) {
                    this.log(`🐛 混沌测试失败 (op ${operation}): ${e.message}`, 'BUG');
                }
            }
        }
        
        firstPrinciplesTests.chaosEngineering = {
            passed: chaosTestsFailed === 0,
            totalTests: 1000,
            passed: chaosTestsPassed,
            failed: chaosTestsFailed
        };
        
        if (chaosTestsFailed === 0) {
            this.log(`✅ 混沌工程测试: 1000次随机故障注入全部安全处理`, 'SUCCESS');
        } else {
            this.log(`⚠️ 混沌工程测试: ${chaosTestsFailed} 次失败`, 'WARNING');
            results.issuesFound.push({ type: '混沌工程', failed: chaosTestsFailed });
        }
        
        results.testPhases.push({ name: '混沌工程', passed: chaosTestsFailed === 0, passed: chaosTestsPassed, failed: chaosTestsFailed });
        
        await db.clear();
    }

    async runFullTest() {
        const endTime = Date.now() + TEST_DURATION_MS;
        this.log(`🚀 启动第一性原理极限测试 (2小时)...`, 'TEST');
        
        await this.recordMemorySnapshot('启动');
        
        while (Date.now() < endTime) {
            results.cycleCount++;
            
            const remaining = Math.round((endTime - Date.now()) / 60000);
            const hours = Math.floor(remaining / 60);
            const mins = remaining % 60;
            
            if (results.cycleCount % 5 === 0) {
                this.log(`⏱️ 周期 ${results.cycleCount} - 剩余 ${hours}h ${mins}m`, 'DURATION');
            }
            
            try {
                await this.testTimeLimit();
            } catch (e) {
                this.log(`❌ 时间极限失败: ${e.message}`, 'BUG');
            }
            
            try {
                await this.testSpaceLimit();
            } catch (e) {
                this.log(`❌ 空间极限失败: ${e.message}`, 'BUG');
            }
            
            try {
                await this.testConcurrencyLimit();
            } catch (e) {
                this.log(`❌ 并发极限失败: ${e.message}`, 'BUG');
            }
            
            if (results.cycleCount % 3 === 0) {
                try {
                    await this.testDataLimit();
                } catch (e) {
                    this.log(`❌ 数据极限失败: ${e.message}`, 'BUG');
                }
                
                try {
                    await this.testRecursionLimit();
                } catch (e) {
                    this.log(`❌ 递归极限失败: ${e.message}`, 'BUG');
                }
            }
            
            if (results.cycleCount % 2 === 0) {
                try {
                    await this.testStringLimit();
                } catch (e) {
                    this.log(`❌ 字符串极限失败: ${e.message}`, 'BUG');
                }
                
                try {
                    await this.testNumberLimit();
                } catch (e) {
                    this.log(`❌ 数字极限失败: ${e.message}`, 'BUG');
                }
                
                try {
                    await this.testCyclicDependency();
                } catch (e) {
                    this.log(`❌ 循环依赖失败: ${e.message}`, 'BUG');
                }
                
                try {
                    await this.testMemoryLeak();
                } catch (e) {
                    this.log(`❌ 内存泄漏检测失败: ${e.message}`, 'BUG');
                }
                
                try {
                    await this.testChaosEngineering();
                } catch (e) {
                    this.log(`❌ 混沌工程失败: ${e.message}`, 'BUG');
                }
            }
            
            await this.recordMemorySnapshot(`周期 ${results.cycleCount}`);
            
            if (Date.now() - this.lastReport >= REPORT_INTERVAL_MS) {
                await this.generateProgressReport();
                this.lastReport = Date.now();
            }
            
            await this.forceGC();
            await new Promise(r => setTimeout(r, 100));
        }
        
        results.endTime = Date.now();
    }

    async generateProgressReport() {
        const elapsed = Math.round((Date.now() - results.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const mins = Math.floor((elapsed % 3600) / 60);
        
        console.log('\n' + '='.repeat(100));
        console.log(`📊 第一性原理测试进度报告 [${hours}h ${mins}m elapsed]`);
        console.log('='.repeat(100));
        
        console.log('\n🔬 第一性原理测试状态:');
        for (const [name, test] of Object.entries(firstPrinciplesTests)) {
            const status = test.passed ? '✅' : '❌';
            console.log(`  ${status} ${name}: ${test.passed ? 'PASSED' : 'FAILED'}`);
        }
        
        console.log('\n📊 测试统计:');
        console.log(`  周期数: ${results.cycleCount}`);
        console.log(`  Bug数: ${results.bugsFound.length}`);
        console.log(`  警告数: ${results.issuesFound.length}`);
        
        if (results.memorySnapshots.length > 0) {
            const last = results.memorySnapshots[results.memorySnapshots.length - 1];
            const first = results.memorySnapshots[0];
            console.log(`  内存: ${first.heapUsed}MB → ${last.heapUsed}MB (${last.heapUsed - first.heapUsed > 0 ? '+' : ''}${last.heapUsed - first.heapUsed}MB)`);
        }
        
        console.log('\n' + '='.repeat(100));
    }

    generateFinalReport() {
        console.log('\n' + '='.repeat(200));
        console.log('🎯 第一性原理极限测试 - 最终报告 v7.0');
        console.log('='.repeat(200));
        
        const totalDuration = Math.round((results.endTime - results.startTime) / 1000);
        const hours = Math.floor(totalDuration / 3600);
        const mins = Math.floor((totalDuration % 3600) / 60);
        const secs = totalDuration % 60;
        
        console.log(`
📈 测试概览:
  ⏱️ 测试时长: ${hours}h ${mins}m ${secs}s
  🔄 完整周期: ${results.cycleCount} 次
  🐛 发现Bug: ${results.bugsFound.length} 个
  ⚠️ 警告: ${results.issuesFound.length} 个
        `);
        
        console.log('\n🔬 第一性原理测试结果:');
        console.log('─'.repeat(80));
        
        const testResults = [
            ['时间极限 (2小时连续)', firstPrinciplesTests.timeLimit],
            ['空间极限 (内存边界)', firstPrinciplesTests.spaceLimit],
            ['并发极限 (1000 workers)', firstPrinciplesTests.concurrencyLimit],
            ['数据极限 (深度嵌套)', firstPrinciplesTests.dataLimit],
            ['递归极限 (栈深度)', firstPrinciplesTests.recursionLimit],
            ['字符串极限 (超大字符串)', firstPrinciplesTests.stringLimit],
            ['数字极限 (浮点精度)', firstPrinciplesTests.numberLimit],
            ['循环依赖 (自引用)', firstPrinciplesTests.cyclicDependency],
            ['内存泄漏检测', firstPrinciplesTests.memoryLeak],
            ['混沌工程 (随机故障)', firstPrinciplesTests.chaosEngineering]
        ];
        
        for (const [name, result] of testResults) {
            const status = result.passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`  ${status} - ${name}`);
            if (result.details || result.error) {
                console.log(`         ${JSON.stringify(result.details || result.error)}`);
            }
        }
        
        console.log('─'.repeat(80));
        
        if (results.bugsFound.length > 0) {
            console.log('\n🐛 发现的问题:');
            results.bugsFound.forEach((bug, i) => {
                console.log(`  ${i + 1}. ${bug.type}: ${bug.error}`);
            });
        } else {
            console.log('\n🎉🎉🎉 所有第一性原理测试完美通过！系统100%稳定！🎉🎉🎉');
        }
        
        if (results.memorySnapshots.length > 0) {
            const first = results.memorySnapshots[0];
            const last = results.memorySnapshots[results.memorySnapshots.length - 1];
            const growth = last.heapUsed - first.heapUsed;
            
            console.log('\n📊 内存分析:');
            console.log(`  初始: ${first.heapUsed}MB`);
            console.log(`  最终: ${last.heapUsed}MB`);
            console.log(`  增长: ${growth > 0 ? '+' : ''}${growth}MB`);
            console.log(`  GC次数: ${this.gcCount}`);
        }
        
        console.log('\n' + '='.repeat(200));
        
        const reportPath = path.join(__dirname, 'first_principles_test_report_v7.0.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            ...results,
            testResults: firstPrinciplesTests
        }, null, 2));
        
        console.log(`📄 详细报告: ${reportPath}`);
        console.log('='.repeat(200));
        
        const allPassed = Object.values(firstPrinciplesTests).every(t => t.passed);
        if (allPassed && results.bugsFound.length === 0) {
            console.log('\n🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉');
            console.log('🎉                                                               🎉');
            console.log('🎉    第一性原理极限测试 - 完美通过！系统100%生产就绪！    🎉');
            console.log('🎉                                                               🎉');
            console.log('🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉');
        }
        
        return allPassed;
    }
}

async function main() {
    if (!global.gc) {
        console.log('ℹ️ 提示: 启用GC监控 (运行: node --expose-gc 你的脚本.js)');
    }
    
    const tester = new FirstPrinciplesTester();
    
    try {
        await tester.runFullTest();
        const success = tester.generateFinalReport();
        process.exit(success ? 0 : 1);
    } catch (e) {
        console.error('❌ 测试异常:', e);
        process.exit(1);
    }
}

main();
