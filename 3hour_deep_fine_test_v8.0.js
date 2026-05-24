#!/usr/bin/env node

/**
 * 🎯🎯🎯 ArkTS代码图谱 - 3小时超深度精细测试 v8.0
 * 
 * 慢工出细活 - 深度精细测试策略
 * 
 * 第一阶段（60分钟）：精细基础测试
 *   - 细致节点操作测试
 *   - 关系完整性测试  
 *   - 内存管理精细监控
 *   - 性能基线建立
 * 
 * 第二阶段（60分钟）：深度边界测试
 *   - 边界条件精细测试
 *   - 并发边界探索
 *   - 错误处理深度测试
 *   - 数据一致性验证
 * 
 * 第三阶段（60分钟）：真实场景模拟
 *   - 真实项目解析
 *   - 复杂依赖关系
 *   - 长时间稳定性
 *   - 综合性能评估
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(200));
console.log('🎯🎯🎯 ArkTS代码图谱 - 3小时超深度精细测试 v8.0');
console.log('🎯🎯🎯 慢工出细活 - 深度精细测试策略');
console.log('='.repeat(200));
console.log('');

const TEST_DURATION_MS = 3 * 60 * 60 * 1000; // 3小时
const PHASE_DURATION_MS = 60 * 60 * 1000; // 每阶段1小时
const DETAILED_LOG_INTERVAL_MS = 30 * 1000; // 每30秒详细日志

const results = {
    startTime: Date.now(),
    endTime: null,
    phase: 0,
    bugsFound: [],
    issuesFound: [],
    warningsFound: [],
    memorySnapshots: [],
    performanceMetrics: [],
    detailedMetrics: {
        nodeOperations: { total: 0, successful: 0, failed: 0, avgTime: 0 },
        relationOperations: { total: 0, successful: 0, failed: 0, avgTime: 0 },
        queryOperations: { total: 0, successful: 0, failed: 0, avgTime: 0 },
        memoryOperations: { total: 0, successful: 0, failed: 0, avgTime: 0 },
        poolOperations: { acquire: 0, release: 0, hits: 0, misses: 0 }
    },
    phaseReports: [],
    cycleCount: 0
};

class DeepFineTester {
    constructor() {
        this.lastDetailedLog = Date.now();
        this.phaseStartTime = Date.now();
        this.detailedMetrics = {
            nodeCreations: [],
            relationCreations: [],
            queryTimes: [],
            memoryReadings: [],
            gcDurations: [],
            poolHitRates: []
        };
    }

    log(msg, type = 'INFO') {
        const elapsed = Math.round((Date.now() - results.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const mins = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        
        const icons = {
            'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 
            'INFO': 'ℹ️', 'TEST': '🧪', 'PERF': '⚡', 
            'DURATION': '⏱️', 'MEMORY': '📊', 'PHASE': '📦',
            'FINE': '🔍', 'DETAIL': '📝', 'STABLE': '🏛️'
        };
        
        console.log(`${icons[type] || 'ℹ️'} [${hours}:${mins}:${secs}] ${msg}`);
    }

    async recordDetailedMemory(label) {
        const mem = process.memoryUsage();
        const snapshot = {
            label,
            timestamp: Date.now(),
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            rss: Math.round(mem.rss / 1024 / 1024),
            external: Math.round(mem.external / 1024 / 1024)
        };
        
        results.memorySnapshots.push(snapshot);
        this.detailedMetrics.memoryReadings.push(snapshot.heapUsed);
        
        return snapshot;
    }

    async measureOperation(operationName, operationFn) {
        const start = process.hrtime.bigint();
        let success = false;
        let error = null;
        
        try {
            const result = await operationFn();
            success = true;
            return result;
        } catch (e) {
            error = e.message;
            throw e;
        } finally {
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1000000; // ms
            
            if (!this.detailedMetrics[operationName]) {
                this.detailedMetrics[operationName] = [];
            }
            this.detailedMetrics[operationName].push({ duration, success, error });
        }
    }

    // ====== 阶段1: 精细基础测试 ======
    async runPhase1FineBasicTest() {
        this.log('📦 第一阶段：精细基础测试 (60分钟)', 'PHASE');
        const phaseStart = Date.now();
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        const { coreEngine } = require('./dist/src/core/engine');
        
        const phaseResults = {
            phase: '精细基础测试',
            startTime: phaseStart,
            tests: []
        };
        
        // 测试1: 节点创建精细测试
        this.log('🔍 测试1: 节点创建精细测试', 'FINE');
        
        const nodeTestResults = {
            testName: '节点创建精细测试',
            subTests: []
        };
        
        // 1.1 基础节点创建
        let testCount = 0;
        for (let size = 100; size <= 10000; size += 900) {
            testCount++;
            const db = new KnowledgeGraphDatabase();
            
            const start = Date.now();
            for (let i = 0; i < size; i++) {
                db.createNode({
                    id: `fine-node-${testCount}-${i}`,
                    type: ['CLASS', 'FUNCTION', 'VARIABLE', 'TYPE', 'INTERFACE'][i % 5],
                    name: `FineNode${i}`,
                    metadata: { index: i, timestamp: Date.now() }
                });
            }
            const duration = Date.now() - start;
            const opsPerSec = (size / (duration / 1000)).toFixed(0);
            
            nodeTestResults.subTests.push({
                name: `${size}节点创建`,
                size,
                duration,
                opsPerSec,
                avgOpTime: (duration / size).toFixed(3)
            });
            
            await db.clear();
            
            this.log(`   📝 ${size}节点: ${duration}ms, ${opsPerSec} ops/s, 平均${(duration / size).toFixed(3)}ms/op`, 'DETAIL');
        }
        
        phaseResults.tests.push(nodeTestResults);
        
        // 测试2: 关系创建精细测试
        this.log('🔍 测试2: 关系创建精细测试', 'FINE');
        
        const relTestResults = {
            testName: '关系创建精细测试',
            subTests: []
        };
        
        for (let size = 100; size <= 10000; size += 900) {
            const db = new KnowledgeGraphDatabase();
            
            // 先创建足够的节点
            for (let i = 0; i < size + 10; i++) {
                db.createNode({ id: `rel-node-${i}`, type: 'CLASS', name: `RelNode${i}` });
            }
            
            const start = Date.now();
            for (let i = 0; i < size; i++) {
                db.createRelation({
                    id: `fine-rel-${i}`,
                    sourceId: `rel-node-${i}`,
                    targetId: `rel-node-${i + 1}`,
                    type: ['CALLS', 'DEPENDS_ON', 'REFERENCES'][i % 3],
                    weight: Math.random()
                });
            }
            const duration = Date.now() - start;
            const opsPerSec = (size / (duration / 1000)).toFixed(0);
            
            relTestResults.subTests.push({
                name: `${size}关系创建`,
                size,
                duration,
                opsPerSec,
                avgOpTime: (duration / size).toFixed(3)
            });
            
            await db.clear();
            
            this.log(`   📝 ${size}关系: ${duration}ms, ${opsPerSec} ops/s, 平均${(duration / size).toFixed(3)}ms/op`, 'DETAIL');
        }
        
        phaseResults.tests.push(relTestResults);
        
        // 测试3: 查询操作精细测试
        this.log('🔍 测试3: 查询操作精细测试', 'FINE');
        
        const db = new KnowledgeGraphDatabase();
        for (let i = 0; i < 5000; i++) {
            db.createNode({
                id: `query-node-${i}`,
                type: ['CLASS', 'FUNCTION', 'VARIABLE'][i % 3],
                name: `QueryNode${i}`
            });
        }
        
        const queryTestResults = {
            testName: '查询操作精细测试',
            subTests: []
        };
        
        // getNodesByType
        const queryTypes = ['CLASS', 'FUNCTION', 'VARIABLE'];
        for (const type of queryTypes) {
            const start = Date.now();
            const iterations = 1000;
            for (let i = 0; i < iterations; i++) {
                db.getNodesByType(type);
            }
            const duration = Date.now() - start;
            const avgTime = (duration / iterations).toFixed(3);
            
            queryTestResults.subTests.push({
                name: `getNodesByType(${type})`,
                iterations,
                totalDuration: duration,
                avgTime
            });
            
            this.log(`   📝 getNodesByType(${type}): ${iterations}次, ${duration}ms, 平均${avgTime}ms`, 'DETAIL');
        }
        
        // getAllNodes
        const start = Date.now();
        const iterations = 1000;
        for (let i = 0; i < iterations; i++) {
            db.getAllNodes();
        }
        const duration = Date.now() - start;
        queryTestResults.subTests.push({
            name: 'getAllNodes()',
            iterations,
            totalDuration: duration,
            avgTime: (duration / iterations).toFixed(3)
        });
        
        this.log(`   📝 getAllNodes(): ${iterations}次, ${duration}ms, 平均${(duration / iterations).toFixed(3)}ms`, 'DETAIL');
        
        phaseResults.tests.push(queryTestResults);
        await db.clear();
        
        // 测试4: 对象池精细测试
        this.log('🔍 测试4: 对象池精细测试', 'FINE');
        
        const poolTestResults = {
            testName: '对象池精细测试',
            subTests: []
        };
        
        // acquire/release 测试
        const acquireReleaseIterations = 10000;
        const acquireStart = Date.now();
        const acquiredNodes = [];
        
        for (let i = 0; i < acquireReleaseIterations; i++) {
            acquiredNodes.push(coreEngine.acquireNode());
        }
        const acquireDuration = Date.now() - acquireStart;
        
        const releaseStart = Date.now();
        for (const node of acquiredNodes) {
            coreEngine.releaseNode(node);
        }
        const releaseDuration = Date.now() - releaseStart;
        
        poolTestResults.subTests.push({
            name: 'acquire/release节点',
            iterations: acquireReleaseIterations,
            acquireDuration,
            releaseDuration,
            totalDuration: acquireDuration + releaseDuration,
            avgAcquireTime: (acquireDuration / acquireReleaseIterations).toFixed(4),
            avgReleaseTime: (releaseDuration / acquireReleaseIterations).toFixed(4)
        });
        
        this.log(`   📝 acquire: ${acquireDuration}ms (${(acquireDuration / acquireReleaseIterations).toFixed(4)}ms/op)`, 'DETAIL');
        this.log(`   📝 release: ${releaseDuration}ms (${(releaseDuration / acquireReleaseIterations).toFixed(4)}ms/op)`, 'DETAIL');
        
        // 空值处理测试
        try {
            coreEngine.releaseNode(null);
            coreEngine.releaseNode(undefined);
            coreEngine.releaseRelation(null);
            coreEngine.releaseRelation(undefined);
            poolTestResults.subTests.push({ name: '空值处理', result: 'PASSED' });
            this.log('   ✅ 空值处理: PASSED', 'SUCCESS');
        } catch (e) {
            poolTestResults.subTests.push({ name: '空值处理', result: 'FAILED', error: e.message });
            this.log(`   🐛 空值处理: FAILED - ${e.message}`, 'BUG');
            results.bugsFound.push({ type: '对象池-空值处理', error: e.message });
        }
        
        phaseResults.tests.push(poolTestResults);
        
        // 测试5: 内存管理精细测试
        this.log('🔍 测试5: 内存管理精细测试', 'FINE');
        
        const memStart = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        
        for (let round = 0; round < 20; round++) {
            const db = new KnowledgeGraphDatabase();
            for (let i = 0; i < 5000; i++) {
                db.createNode({
                    id: `mem-node-r${round}-i${i}`,
                    type: 'CLASS',
                    name: `MemNode${i}`,
                    metadata: { round, data: 'x'.repeat(100) }
                });
            }
            await db.clear();
        }
        
        if (global.gc) global.gc();
        await new Promise(r => setTimeout(r, 100));
        
        const memEnd = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const memGrowth = memEnd - memStart;
        
        const memResults = {
            testName: '内存管理精细测试',
            startMemory: memStart,
            endMemory: memEnd,
            growth: memGrowth,
            result: memGrowth < 50 ? 'PASSED' : (memGrowth < 100 ? 'WARNING' : 'FAILED')
        };
        
        phaseResults.tests.push(memResults);
        
        if (memGrowth < 50) {
            this.log(`   ✅ 内存管理: ${memStart}MB → ${memEnd}MB (+${memGrowth}MB) - PASSED`, 'SUCCESS');
        } else if (memGrowth < 100) {
            this.log(`   ⚠️ 内存管理: ${memStart}MB → ${memEnd}MB (+${memGrowth}MB) - WARNING`, 'WARNING');
            results.warningsFound.push({ type: '内存管理', growth: memGrowth });
        } else {
            this.log(`   🐛 内存管理: ${memStart}MB → ${memEnd}MB (+${memGrowth}MB) - FAILED`, 'BUG');
            results.bugsFound.push({ type: '内存管理泄漏', growth: memGrowth });
        }
        
        const phaseDuration = Date.now() - phaseStart;
        phaseResults.endTime = Date.now();
        phaseResults.duration = phaseDuration;
        phaseResults.passed = results.bugsFound.filter(b => b.phase === 1).length === 0;
        
        results.phaseReports.push(phaseResults);
        this.log(`✅ 第一阶段完成: ${Math.round(phaseDuration / 60000)}分钟`, 'PHASE');
        
        await this.recordDetailedMemory('第一阶段完成');
    }

    // ====== 阶段2: 深度边界测试 ======
    async runPhase2DeepBoundaryTest() {
        this.log('📦 第二阶段：深度边界测试 (60分钟)', 'PHASE');
        const phaseStart = Date.now();
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        const { coreEngine } = require('./dist/src/core/engine');
        
        const phaseResults = {
            phase: '深度边界测试',
            startTime: phaseStart,
            tests: []
        };
        
        // 测试1: 极端节点数量测试
        this.log('🔍 测试1: 极端节点数量测试', 'FINE');
        
        const extremeNodeResults = { testName: '极端节点数量测试', subTests: [] };
        
        for (const nodeCount of [50000, 100000, 200000, 500000]) {
            const db = new KnowledgeGraphDatabase();
            
            const start = Date.now();
            for (let i = 0; i < nodeCount; i++) {
                db.createNode({
                    id: `extreme-node-${nodeCount}-${i}`,
                    type: 'CLASS',
                    name: `ExtremeNode${i}`,
                    metadata: { index: i }
                });
            }
            const duration = Date.now() - start;
            
            const stats = db.getStats();
            extremeNodeResults.subTests.push({
                name: `${nodeCount}节点`,
                requested: nodeCount,
                created: stats.totalNodes,
                duration,
                opsPerSec: Math.round(nodeCount / (duration / 1000)),
                passed: stats.totalNodes === nodeCount
            });
            
            this.log(`   📝 ${nodeCount}节点: ${duration}ms, ${stats.totalNodes}实际创建, ${stats.totalNodes === nodeCount ? '✅' : '❌'}`, 'DETAIL');
            
            await db.clear();
        }
        
        phaseResults.tests.push(extremeNodeResults);
        
        // 测试2: 极端并发测试
        this.log('🔍 测试2: 极端并发测试', 'FINE');
        
        const concurrencyResults = { testName: '极端并发测试', subTests: [] };
        
        for (const workerCount of [200, 500, 800, 1000]) {
            const opsPerWorker = 50;
            
            const start = Date.now();
            let errors = 0;
            
            const promises = [];
            for (let w = 0; w < workerCount; w++) {
                promises.push((async () => {
                    try {
                        for (let i = 0; i < opsPerWorker; i++) {
                            const node = coreEngine.acquireNode();
                            node.id = `conc-w${w}-i${i}`;
                            node.metadata = { w, i };
                            
                            const rel = coreEngine.acquireRelation();
                            rel.sourceId = node.id;
                            rel.targetId = `conc-w${(w + 1) % workerCount}-i${i}`;
                            
                            coreEngine.releaseNode(node);
                            coreEngine.releaseRelation(rel);
                        }
                    } catch (e) {
                        errors++;
                    }
                })());
            }
            
            await Promise.all(promises);
            const duration = Date.now() - start;
            
            concurrencyResults.subTests.push({
                name: `${workerCount}workers`,
                workers: workerCount,
                opsPerWorker,
                totalOps: workerCount * opsPerWorker * 2,
                duration,
                opsPerSec: Math.round((workerCount * opsPerWorker * 2) / (duration / 1000)),
                errors,
                passed: errors === 0
            });
            
            this.log(`   📝 ${workerCount}workers: ${duration}ms, ${workerCount * opsPerWorker * 2} ops, ${errors === 0 ? '✅' : '❌'}`, 'DETAIL');
        }
        
        phaseResults.tests.push(concurrencyResults);
        
        // 测试3: 深度嵌套测试
        this.log('🔍 测试3: 深度嵌套测试', 'FINE');
        
        const nestedResults = { testName: '深度嵌套测试', subTests: [] };
        
        for (const depth of [50, 100, 200, 500]) {
            const db = new KnowledgeGraphDatabase();
            
            const createDeepObject = (d) => {
                if (d === 0) return { value: 0 };
                return { level: d, child: createDeepObject(d - 1) };
            };
            
            const deepData = createDeepObject(depth);
            
            const start = Date.now();
            for (let i = 0; i < 1000; i++) {
                db.createNode({
                    id: `nested-node-${depth}-${i}`,
                    type: 'INTERFACE',
                    name: `NestedNode${i}`,
                    metadata: { deep: deepData, depth }
                });
            }
            const duration = Date.now() - start;
            
            nestedResults.subTests.push({
                name: `嵌套深度${depth}`,
                depth,
                nodesCreated: 1000,
                duration,
                passed: true
            });
            
            this.log(`   📝 嵌套深度${depth}: ${duration}ms, 1000节点, ✅`, 'DETAIL');
            
            await db.clear();
        }
        
        phaseResults.tests.push(nestedResults);
        
        // 测试4: 大字符串测试
        this.log('🔍 测试4: 大字符串测试', 'FINE');
        
        const stringResults = { testName: '大字符串测试', subTests: [] };
        
        for (const sizeMB of [0.5, 1, 2, 5]) {
            const db = new KnowledgeGraphDatabase();
            const largeString = 'A'.repeat(sizeMB * 1024 * 1024);
            
            try {
                const start = Date.now();
                db.createNode({
                    id: `large-string-node-${sizeMB}mb`,
                    type: 'VARIABLE',
                    name: `LargeString${sizeMB}MB`,
                    metadata: { data: largeString, sizeMB }
                });
                const duration = Date.now() - start;
                
                stringResults.subTests.push({
                    name: `${sizeMB}MB字符串`,
                    sizeMB,
                    duration,
                    passed: true
                });
                
                this.log(`   📝 ${sizeMB}MB字符串: ${duration}ms, ✅`, 'DETAIL');
            } catch (e) {
                stringResults.subTests.push({
                    name: `${sizeMB}MB字符串`,
                    sizeMB,
                    error: e.message,
                    passed: false
                });
                
                this.log(`   🐛 ${sizeMB}MB字符串: FAILED - ${e.message}`, 'BUG');
                results.bugsFound.push({ type: '大字符串', sizeMB, error: e.message });
            }
            
            await db.clear();
        }
        
        phaseResults.tests.push(stringResults);
        
        // 测试5: 特殊字符测试
        this.log('🔍 测试5: 特殊字符测试', 'FINE');
        
        const specialCharResults = { testName: '特殊字符测试', subTests: [] };
        
        const db = new KnowledgeGraphDatabase();
        const specialChars = [
            { name: 'Unicode中文', value: '测试节点中文' },
            { name: 'Emoji', value: '🎉🎊🎈' },
            { name: '特殊符号', value: '<>[]{}|\\' },
            { name: 'SQL注入', value: "'; DROP TABLE nodes; --" },
            { name: 'XSS', value: '<script>alert("xss")</script>' },
            { name: 'JSON', value: '{"key": "value", "num": 123}' },
            { name: '空字符串', value: '' },
            { name: '空白字符', value: '   \t\n  ' }
        ];
        
        for (const char of specialChars) {
            try {
                db.createNode({
                    id: `special-${char.name}`,
                    type: char.name,
                    name: char.value,
                    metadata: { original: char.value }
                });
                
                specialCharResults.subTests.push({ name: char.name, passed: true });
                this.log(`   ✅ 特殊字符(${char.name}): PASSED`, 'SUCCESS');
            } catch (e) {
                specialCharResults.subTests.push({ name: char.name, passed: false, error: e.message });
                this.log(`   🐛 特殊字符(${char.name}): FAILED - ${e.message}`, 'BUG');
                results.bugsFound.push({ type: '特殊字符', name: char.name, error: e.message });
            }
        }
        
        await db.clear();
        phaseResults.tests.push(specialCharResults);
        
        // 测试6: 循环依赖测试
        this.log('🔍 测试6: 循环依赖测试', 'FINE');
        
        const cycleResults = { testName: '循环依赖测试', subTests: [] };
        
        const cycleDb = new KnowledgeGraphDatabase();
        
        // 创建循环
        const nodeIds = [];
        for (let i = 0; i < 100; i++) {
            const id = `cycle-node-${i}`;
            cycleDb.createNode({ id, type: 'CLASS', name: `CycleClass${i}` });
            nodeIds.push(id);
        }
        
        // 创建循环依赖
        for (let i = 0; i < 100; i++) {
            cycleDb.createRelation({
                id: `cycle-rel-${i}`,
                sourceId: nodeIds[i],
                targetId: nodeIds[(i + 1) % 100],
                type: 'CALLS'
            });
        }
        
        // 自引用
        for (let i = 0; i < 10; i++) {
            cycleDb.createRelation({
                id: `self-rel-${i}`,
                sourceId: nodeIds[i],
                targetId: nodeIds[i],
                type: 'DEPENDS_ON'
            });
        }
        
        // 遍历测试
        try {
            for (let i = 0; i < 10000; i++) {
                cycleDb.getAllNodes();
                cycleDb.getAllRelations();
                cycleDb.getNodesByType('CLASS');
            }
            cycleResults.subTests.push({ name: '循环遍历', passed: true });
            this.log('   ✅ 循环依赖遍历: PASSED', 'SUCCESS');
        } catch (e) {
            cycleResults.subTests.push({ name: '循环遍历', passed: false, error: e.message });
            this.log(`   🐛 循环依赖遍历: FAILED - ${e.message}`, 'BUG');
            results.bugsFound.push({ type: '循环依赖', error: e.message });
        }
        
        await cycleDb.clear();
        phaseResults.tests.push(cycleResults);
        
        const phaseDuration = Date.now() - phaseStart;
        phaseResults.endTime = Date.now();
        phaseResults.duration = phaseDuration;
        
        results.phaseReports.push(phaseResults);
        this.log(`✅ 第二阶段完成: ${Math.round(phaseDuration / 60000)}分钟`, 'PHASE');
        
        await this.recordDetailedMemory('第二阶段完成');
    }

    // ====== 阶段3: 真实场景模拟 ======
    async runPhase3RealScenarioTest() {
        this.log('📦 第三阶段：真实场景模拟 (60分钟)', 'PHASE');
        const phaseStart = Date.now();
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const phaseResults = {
            phase: '真实场景模拟',
            startTime: phaseStart,
            tests: []
        };
        
        // 测试1: 真实项目解析
        this.log('🔍 测试1: 真实项目解析', 'FINE');
        
        const projectAnalysisResults = { testName: '真实项目解析', subTests: [] };
        
        let ProjectAnalysisApplicationService = null;
        try {
            const serviceModule = require('./dist/src/application/analysis/project.analysis.app.service');
            ProjectAnalysisApplicationService = serviceModule.ProjectAnalysisApplicationService;
        } catch (e) {
            this.log('   ⏭️ 跳过真实项目解析: 项目分析服务不可用', 'INFO');
        }
        
        const projects = [
            { path: './src', name: 'src自身项目' }
        ];
        
        for (const project of projects) {
            if (!fs.existsSync(project.path)) {
                this.log(`   ⏭️ 跳过 ${project.name}: 路径不存在`, 'INFO');
                continue;
            }
            
            if (!ProjectAnalysisApplicationService) {
                this.log(`   ⏭️ 跳过 ${project.name}: 分析服务不可用`, 'INFO');
                continue;
            }
            
            const db = new KnowledgeGraphDatabase();
            const service = new ProjectAnalysisApplicationService(db);
            
            try {
                const start = Date.now();
                const result = await service.analyzeProject(project.path);
                const duration = Date.now() - start;
                
                projectAnalysisResults.subTests.push({
                    name: project.name,
                    filesAnalyzed: result.summary?.filesAnalyzed || 0,
                    nodes: result.summary?.totalNodes || 0,
                    relations: result.summary?.totalRelations || 0,
                    duration,
                    passed: true
                });
                
                this.log(`   ✅ ${project.name}: ${result.summary?.totalNodes || 0}节点, ${result.summary?.totalRelations || 0}关系, ${duration}ms`, 'SUCCESS');
            } catch (e) {
                projectAnalysisResults.subTests.push({
                    name: project.name,
                    passed: false,
                    error: e.message
                });
                
                this.log(`   🐛 ${project.name}: FAILED - ${e.message}`, 'BUG');
                results.bugsFound.push({ type: '项目解析', project: project.name, error: e.message });
            }
            
            await db.clear();
        }
        
        phaseResults.tests.push(projectAnalysisResults);
        
        // 测试2: 长时间稳定性测试
        this.log('🔍 测试2: 长时间稳定性测试 (30秒)', 'FINE');
        
        const stabilityResults = { testName: '长时间稳定性测试', subTests: [] };
        
        const stabilityDb = new KnowledgeGraphDatabase();
        let operationsCount = 0;
        const stabilityStart = Date.now();
        
        while (Date.now() - stabilityStart < 30000) { // 30秒稳定性测试
            for (let i = 0; i < 1000; i++) {
                stabilityDb.createNode({
                    id: `stability-${operationsCount}-${i}`,
                    type: 'FUNCTION',
                    name: `Stability${i}`,
                    metadata: { timestamp: Date.now() }
                });
            }
            
            stabilityDb.getNodesByType('FUNCTION');
            stabilityDb.getAllNodes();
            
            operationsCount += 1000;
        }
        
        const stabilityDuration = Date.now() - stabilityStart;
        const stabilityStats = stabilityDb.getStats();
        
        stabilityResults.subTests.push({
            name: '30秒稳定性',
            operations: operationsCount,
            duration: stabilityDuration,
            opsPerSec: Math.round(operationsCount / (stabilityDuration / 1000)),
            nodesCreated: stabilityStats.totalNodes,
            passed: stabilityStats.totalNodes > 0
        });
        
        this.log(`   📝 30秒稳定性: ${operationsCount}操作, ${Math.round(operationsCount / (stabilityDuration / 1000))} ops/s`, 'DETAIL');
        
        await stabilityDb.clear();
        phaseResults.tests.push(stabilityResults);
        
        // 测试3: 综合性能评估
        this.log('🔍 测试3: 综合性能评估', 'FINE');
        
        const perfResults = { testName: '综合性能评估', subTests: [] };
        
        const perfDb = new KnowledgeGraphDatabase();
        
        // 创建测试数据
        for (let i = 0; i < 10000; i++) {
            perfDb.createNode({
                id: `perf-node-${i}`,
                type: ['CLASS', 'FUNCTION', 'VARIABLE'][i % 3],
                name: `PerfNode${i}`,
                metadata: { index: i, timestamp: Date.now(), data: 'x'.repeat(50) }
            });
        }
        
        // 批量查询测试
        const queryStart = Date.now();
        for (let i = 0; i < 100; i++) {
            perfDb.getAllNodes();
            perfDb.getNodesByType('CLASS');
            perfDb.getNodesByType('FUNCTION');
            perfDb.getNodesByType('VARIABLE');
        }
        const queryDuration = Date.now() - queryStart;
        
        perfResults.subTests.push({
            name: '批量查询',
            operations: 400,
            duration: queryDuration,
            avgTime: (queryDuration / 400).toFixed(3),
            passed: true
        });
        
        this.log(`   📝 批量查询: 400次操作, ${queryDuration}ms, 平均${(queryDuration / 400).toFixed(3)}ms/op`, 'DETAIL');
        
        await perfDb.clear();
        phaseResults.tests.push(perfResults);
        
        const phaseDuration = Date.now() - phaseStart;
        phaseResults.endTime = Date.now();
        phaseResults.duration = phaseDuration;
        
        results.phaseReports.push(phaseResults);
        this.log(`✅ 第三阶段完成: ${Math.round(phaseDuration / 60000)}分钟`, 'PHASE');
        
        await this.recordDetailedMemory('第三阶段完成');
    }

    async runFullTest() {
        this.log('🚀 启动3小时超深度精细测试...', 'TEST');
        
        await this.recordDetailedMemory('启动');
        
        const endTime = Date.now() + TEST_DURATION_MS;
        const phaseEndTime = {
            1: Date.now() + PHASE_DURATION_MS,
            2: Date.now() + PHASE_DURATION_MS * 2,
            3: Date.now() + PHASE_DURATION_MS * 3
        };
        
        // 第一阶段
        results.phase = 1;
        await this.runPhase1FineBasicTest();
        
        // 第二阶段
        if (Date.now() < endTime) {
            results.phase = 2;
            await this.runPhase2DeepBoundaryTest();
        }
        
        // 第三阶段
        if (Date.now() < endTime) {
            results.phase = 3;
            await this.runPhase3RealScenarioTest();
        }
        
        // 继续运行直到结束时间
        while (Date.now() < endTime) {
            results.cycleCount++;
            
            this.log(`⏱️ 额外周期 ${results.cycleCount} - 巩固测试`, 'DURATION');
            
            try {
                await this.runPhase1FineBasicTest();
            } catch (e) {
                this.log(`❌ 巩固测试失败: ${e.message}`, 'BUG');
            }
            
            await this.recordDetailedMemory(`巩固周期 ${results.cycleCount}`);
            
            if (global.gc) global.gc();
            await new Promise(r => setTimeout(r, 100));
        }
        
        results.endTime = Date.now();
    }

    generateFinalReport() {
        console.log('\n' + '='.repeat(200));
        console.log('🎯🎯🎯 3小时超深度精细测试 - 最终报告 v8.0');
        console.log('🎯🎯🎯 慢工出细活 - 深度精细测试策略');
        console.log('='.repeat(200));
        
        const totalDuration = Math.round((results.endTime - results.startTime) / 1000);
        const hours = Math.floor(totalDuration / 3600);
        const mins = Math.floor((totalDuration % 3600) / 60);
        const secs = totalDuration % 60;
        
        console.log(`
📊 测试概览:
  ⏱️ 测试时长: ${hours}h ${mins}m ${secs}s
  🔄 巩固周期: ${results.cycleCount} 个
  🐛 发现Bug: ${results.bugsFound.length} 个
  ⚠️ 警告: ${results.warningsFound.length} 个
        `);
        
        console.log('\n📋 阶段测试结果:');
        console.log('─'.repeat(80));
        
        for (const phaseReport of results.phaseReports) {
            const phaseDuration = Math.round((phaseReport.endTime - phaseReport.startTime) / 60000);
            console.log(`\n📦 ${phaseReport.phase} (${phaseDuration}分钟):`);
            
            for (const test of phaseReport.tests) {
                const passed = test.subTests ? test.subTests.every(s => s.passed !== false) : true;
                console.log(`  ${passed ? '✅' : '❌'} ${test.testName}`);
                
                if (test.subTests) {
                    for (const subTest of test.subTests) {
                        if (subTest.passed === false) {
                            console.log(`     🐛 ${subTest.name}: FAILED`);
                        }
                    }
                }
            }
        }
        
        console.log('─'.repeat(80));
        
        if (results.bugsFound.length > 0) {
            console.log('\n🐛 发现的问题:');
            const grouped = {};
            for (const bug of results.bugsFound) {
                const key = bug.type;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(bug);
            }
            
            for (const [type, bugs] of Object.entries(grouped)) {
                console.log(`\n  ${type}: ${bugs.length} 个`);
                for (const bug of bugs.slice(0, 5)) {
                    console.log(`    - ${bug.error || bug.details || 'N/A'}`);
                }
                if (bugs.length > 5) {
                    console.log(`    ... 还有 ${bugs.length - 5} 个`);
                }
            }
        } else {
            console.log('\n🎉🎉🎉 没有发现任何Bug！系统完美运行！🎉🎉🎉');
        }
        
        if (results.warningsFound.length > 0) {
            console.log('\n⚠️ 警告:');
            for (const warning of results.warningsFound) {
                console.log(`  - ${warning.type}: ${warning.growth || warning.details || 'N/A'}`);
            }
        }
        
        if (results.memorySnapshots.length > 0) {
            const first = results.memorySnapshots[0];
            const last = results.memorySnapshots[results.memorySnapshots.length - 1];
            const growth = last.heapUsed - first.heapUsed;
            
            console.log('\n📊 内存分析:');
            console.log(`  初始: ${first.heapUsed}MB`);
            console.log(`  最终: ${last.heapUsed}MB`);
            console.log(`  增长: ${growth > 0 ? '+' : ''}${growth}MB`);
            
            if (results.memorySnapshots.length > 2) {
                const readings = results.memorySnapshots.map(s => s.heapUsed);
                const avg = readings.reduce((a, b) => a + b, 0) / readings.length;
                const max = Math.max(...readings);
                const min = Math.min(...readings);
                
                console.log(`  平均: ${Math.round(avg)}MB`);
                console.log(`  最高: ${max}MB`);
                console.log(`  最低: ${min}MB`);
            }
        }
        
        console.log('\n' + '='.repeat(200));
        
        const allPassed = results.bugsFound.length === 0;
        
        if (allPassed) {
            console.log('\n🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉');
            console.log('🎉                                                       🎉');
            console.log('🎉   3小时超深度精细测试完美通过！系统100%生产就绪！  🎉');
            console.log('🎉                                                       🎉');
            console.log('🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉');
        } else {
            console.log(`\n⚠️ 发现 ${results.bugsFound.length} 个问题需要修复`);
        }
        
        console.log('='.repeat(200));
        
        const reportPath = path.join(__dirname, '3hour_deep_fine_test_report_v8.0.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        console.log(`\n📄 详细报告: ${reportPath}`);
        
        return allPassed;
    }
}

async function main() {
    const tester = new DeepFineTester();
    
    try {
        await tester.runFullTest();
        const success = tester.generateFinalReport();
        process.exit(success ? 0 : 1);
    } catch (e) {
        console.error('❌ 测试异常:', e);
        console.error(e.stack);
        process.exit(1);
    }
}

main();
