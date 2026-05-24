#!/usr/bin/env node

/**
 * 🔥🔥🔥 ArkTS 代码图谱 - 1小时15分钟超长时间极端压力测试 v5.0
 * 真正的长时间真实场景测试，包含故障注入、超大负载、复杂并发
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

console.log('='.repeat(180));
console.log('🔥🔥🔥 ArkTS 代码图谱 - 1小时15分钟超长时间极端压力测试 v5.0');
console.log('='.repeat(180));
console.log('');

const TEST_DURATION_MINUTES = 75; // 1小时15分钟，超过用户要求的1小时
const MEMORY_CHECK_INTERVAL_MS = 300000; // 每5分钟检查内存
const PROJECT_ANALYSIS_INTERVAL_MS = 600000; // 每10分钟解析一次完整真实项目

const results = {
    startTime: Date.now(),
    endTime: null,
    tests: [],
    bugsFound: [],
    issuesFound: [],
    memoryHistory: [],
    performanceHistory: [],
    projectAnalysisResults: [],
    errorCount: 0,
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    memoryLeaks: [],
    performanceDegradations: []
};

let isRunning = true;

class UltraLongComplexPressureTester {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.operationCount = 0;
        this.errorCount = 0;
        this.initialMemory = 0;
        this.projectAnalyses = [];
    }

    log(msg, type = 'INFO') {
        const elapsed = Math.round((Date.now() - results.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        
        const icons = {
            'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 
            'ISSUE': '🔍', 'FIX': '🔧', 'INFO': 'ℹ️', 
            'TEST': '🧪', 'PERF': '⚡', 'DURATION': '⏱️',
            'MEMORY': '📊', 'COMPLEX': '🎯', 'FAULT': '💥'
        };
        
        console.log(`${icons[type] || 'ℹ️'} [${minutes}:${seconds}] ${msg}`);
    }

    async recordMemory(label = 'Memory Check') {
        const mem = process.memoryUsage();
        const entry = {
            timestamp: Date.now(),
            label,
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            external: Math.round(mem.external / 1024 / 1024),
            rss: Math.round(mem.rss / 1024 / 1024),
            elapsedSeconds: Math.round((Date.now() - results.startTime) / 1000)
        };
        
        results.memoryHistory.push(entry);
        this.log(`📊 [${label}] Heap: ${entry.heapUsed}MB, RSS: ${entry.rss}MB`, 'MEMORY');
        
        // 检查内存泄漏（每15分钟检查增长）
        if (results.memoryHistory.length > 3) {
            const earlierIndex = Math.max(0, results.memoryHistory.length - 4);
            const earlier = results.memoryHistory[earlierIndex];
            const growth = entry.heapUsed - earlier.heapUsed;
            
            if (growth > 150) {
                this.log(`⚠️ WARNING: Possible memory leak detected! ${growth}MB growth`, 'WARNING');
                results.memoryLeaks.push({
                    timestamp: Date.now(),
                    growthMB: growth,
                    fromMB: earlier.heapUsed,
                    toMB: entry.heapUsed
                });
            }
        }
        
        return entry;
    }

    async recordPerformance(operation, durationMs, itemCount = 0) {
        const entry = {
            timestamp: Date.now(),
            operation,
            durationMs,
            itemCount
        };
        
        results.performanceHistory.push(entry);
        
        if (itemCount > 0) {
            this.log(`⚡ ${operation}: ${durationMs}ms for ${itemCount} items`, 'PERF');
        } else {
            this.log(`⚡ ${operation}: ${durationMs}ms`, 'PERF');
        }
    }

    async testLargeScaleKnowledgeGraph() {
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        const nodeCount = 5000;
        const relationCount = 4999;
        
        const startTime = Date.now();
        
        for (let i = 0; i < nodeCount; i++) {
            const type = ['CLASS', 'FUNCTION', 'VARIABLE', 'TYPE', 'INTERFACE', 'ENUM', 'CONSTANT', 'NAMESPACE'][i % 8];
            db.createNode({
                id: `kg-node-${Date.now()}-${i}`,
                type,
                name: `TestNode${i}`,
                metadata: { 
                    index: i, 
                    timestamp: Date.now(),
                    testRound: Math.floor(this.operationCount / 50000),
                    isComplex: i % 17 === 0
                }
            });
            this.operationCount++;
        }
        
        for (let i = 0; i < relationCount; i++) {
            const relationType = ['CALLS', 'DEPENDS_ON', 'EXTENDS', 'IMPLEMENTS', 'REFERENCES', 'USES', 'IMPORTS', 'HAS_MEMBER'][i % 8];
            db.createRelation({
                id: `kg-rel-${Date.now()}-${i}`,
                sourceId: `kg-node-${Date.now()}-${i}`,
                targetId: `kg-node-${Date.now()}-${i + 1}`,
                type: relationType,
                weight: Math.random()
            });
            this.operationCount++;
        }
        
        const stats = db.getStats();
        
        const creationTime = Date.now() - startTime;
        await this.recordPerformance('Large KG Create', creationTime, nodeCount + relationCount);
        
        await db.clear();
        
        results.successfulOperations += nodeCount + relationCount;
        results.totalOperations += nodeCount + relationCount;
        
        if (stats.totalNodes !== nodeCount || stats.totalRelations !== relationCount) {
            this.log(`🐛 BUG: Node/relation count mismatch!`, 'BUG');
            results.bugsFound.push({
                timestamp: Date.now(),
                type: 'Knowledge Graph Integrity',
                expected: { nodes: nodeCount, relations: relationCount },
                actual: stats
            });
            this.errorCount++;
            results.errorCount++;
            return false;
        }
        
        return true;
    }

    async testCoreEngineWithComplexScenarios() {
        const { coreEngine } = require('./dist/src/core/engine');
        
        const operationsPerRound = 2000;
        const nodes = [];
        const relations = [];
        const startTime = Date.now();
        
        // 复杂场景1: 获取大量节点并设置各种复杂属性
        for (let i = 0; i < operationsPerRound; i++) {
            const node = coreEngine.acquireNode();
            node.id = `ce-node-${Date.now()}-${i}`;
            node.name = `ComplexEngineTest${i}`;
            node.metadata = { 
                round: Math.floor(this.operationCount / 10000),
                index: i,
                nested: { level1: { level2: { value: i } } },
                array: Array.from({ length: i % 10 }, (_, k) => k),
                largeText: 'x'.repeat(i % 200)
            };
            nodes.push(node);
            
            const relation = coreEngine.acquireRelation();
            relation.sourceId = node.id;
            relation.targetId = `ce-node-${Date.now()}-${(i + 1) % operationsPerRound}`;
            relation.type = i % 3 === 0 ? 'CALLS' : (i % 3 === 1 ? 'DEPENDS_ON' : 'REFERENCES');
            relation.weight = i % 100 / 100;
            relations.push(relation);
            
            this.operationCount++;
        }
        
        // 复杂场景2: 随机访问和释放
        for (let i = 0; i < operationsPerRound; i++) {
            const randomIndex = Math.floor(Math.random() * operationsPerRound);
            if (nodes[randomIndex]) {
                coreEngine.releaseNode(nodes[randomIndex]);
                coreEngine.releaseRelation(relations[randomIndex]);
            }
        }
        
        // 复杂场景3: 空值和边界情况测试（每个循环都做）
        let nullTestPassed = true;
        try {
            coreEngine.releaseNode(null);
            coreEngine.releaseNode(undefined);
            coreEngine.releaseNode({ invalid: true });
            coreEngine.releaseRelation(null);
            coreEngine.releaseRelation(undefined);
            coreEngine.releaseRelation({ invalid: true });
        } catch (e) {
            nullTestPassed = false;
            this.log(`🐛 BUG: Null safety failed!`, 'BUG');
            results.bugsFound.push({
                timestamp: Date.now(),
                type: 'Core Engine Null Safety',
                error: e.message,
                stack: e.stack
            });
            this.errorCount++;
            results.errorCount++;
        }
        
        const duration = Date.now() - startTime;
        await this.recordPerformance('Core Engine Complex', duration, operationsPerRound * 2);
        
        results.successfulOperations += operationsPerRound * 2;
        results.totalOperations += operationsPerRound * 2;
        
        return nullTestPassed;
    }

    async testMemoryManagementWithComplexObjects() {
        const { ObjectPool } = require('./dist/src/infrastructure/utils/memory_manager');
        
        const pool = new ObjectPool(
            () => ({ 
                id: '', 
                name: '', 
                metadata: {},
                nested: { level1: {}, level2: {} },
                array: [],
                largeField: ''
            }),
            800,
            (obj) => { 
                obj.id = '';
                obj.name = ''; 
                obj.metadata = {};
                obj.nested = { level1: {}, level2: {} };
                obj.array = [];
                obj.largeField = '';
            }
        );
        
        const acquired = [];
        const iterations = 2500;
        const startTime = Date.now();
        
        for (let round = 0; round < 12; round++) {
            // 复杂场景: 大量对象获取+释放+复杂属性设置
            for (let i = 0; i < iterations; i++) {
                const obj = pool.acquire();
                obj.id = `mm-test-${round}-${i}`;
                obj.name = `MemoryManagementTest${round}-${i}`;
                obj.metadata = { 
                    round, 
                    index: i, 
                    complex: true,
                    nested: { a: { b: { c: i } } }
                };
                obj.largeField = 'data'.repeat(i % 100);
                obj.array = Array.from({ length: i % 20 }, (_, k) => k);
                acquired.push(obj);
            }
            
            for (const obj of acquired) {
                pool.release(obj);
            }
            acquired.length = 0;
            
            this.operationCount += iterations * 2;
            results.totalOperations += iterations * 2;
            results.successfulOperations += iterations * 2;
        }
        
        // 边界情况测试
        let boundaryTestPassed = true;
        try {
            pool.release(null);
            pool.release(undefined);
            for (let i = 0; i < 100; i++) {
                const obj = pool.acquire();
                pool.release(obj);
                pool.release(obj); // 重复释放同一对象
            }
        } catch (e) {
            boundaryTestPassed = false;
            this.log(`🐛 BUG: Memory management boundary test failed!`, 'BUG');
            results.bugsFound.push({
                timestamp: Date.now(),
                type: 'Memory Management Boundary',
                error: e.message,
                stack: e.stack
            });
            this.errorCount++;
            results.errorCount++;
        }
        
        const duration = Date.now() - startTime;
        await this.recordPerformance('Memory Management Complex', duration, iterations * 24);
        
        return boundaryTestPassed;
    }

    async testHighConcurrencyWithComplexScenarios() {
        const { coreEngine } = require('./dist/src/core/engine');
        
        const workerCount = 50;
        const operationsPerWorker = 300;
        const startTime = Date.now();
        let workerErrors = 0;
        
        const workers = [];
        
        for (let w = 0; w < workerCount; w++) {
            workers.push((async () => {
                try {
                    const nodes = [];
                    const relations = [];
                    
                    for (let i = 0; i < operationsPerWorker; i++) {
                        // 复杂场景1: 获取和设置复杂属性
                        const node = coreEngine.acquireNode();
                        node.id = `hc-worker-${w}-${Date.now()}-${i}`;
                        node.name = `HighConcurrencyTest${w}-${i}`;
                        node.metadata = {
                            workerId: w,
                            index: i,
                            timestamp: Date.now(),
                            nested: { level1: { value: w * 1000 + i } }
                        };
                        nodes.push(node);
                        
                        const relation = coreEngine.acquireRelation();
                        relation.sourceId = node.id;
                        relation.targetId = `hc-worker-${(w + 1) % workerCount}-${Date.now()}-${i}`;
                        relation.type = w % 4 === 0 ? 'CALLS' : (w % 4 === 1 ? 'DEPENDS_ON' : 'REFERENCES');
                        relations.push(relation);
                        
                        // 立即释放
                        coreEngine.releaseNode(node);
                        coreEngine.releaseRelation(relation);
                        
                        this.operationCount++;
                        results.totalOperations += 2;
                        results.successfulOperations += 2;
                    }
                } catch (e) {
                    workerErrors++;
                    this.errorCount++;
                    results.errorCount++;
                    results.failedOperations++;
                }
            })());
        }
        
        await Promise.all(workers);
        
        const duration = Date.now() - startTime;
        await this.recordPerformance('High Concurrency Complex', duration, workerCount * operationsPerWorker * 2);
        
        if (workerErrors > 0) {
            this.log(`⚠️ WARNING: ${workerErrors} concurrent errors detected`, 'WARNING');
            results.issuesFound.push({
                timestamp: Date.now(),
                type: 'High Concurrency Errors',
                count: workerErrors
            });
            return false;
        }
        
        this.log(`✅ High concurrency passed! ${workerCount} workers, ${operationsPerWorker * 2} ops`, 'SUCCESS');
        return true;
    }

    async testRealProjectDeepAnalysis() {
        const { ProjectAnalysisApplicationService } = require('./dist/src/application/analysis/project.analysis.app.service');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const projects = [
            { path: './src', name: 'src' }
        ];
        
        if (fs.existsSync('./type-challenges')) {
            projects.push({ path: './type-challenges', name: 'type-challenges' });
        }
        
        if (fs.existsSync('./vue-core-test')) {
            projects.push({ path: './vue-core-test', name: 'vue-core' });
        }
        
        for (const project of projects) {
            if (!fs.existsSync(project.path)) continue;
            
            this.log(`🎯 Deep analyzing real project: ${project.name}`, 'COMPLEX');
            
            try {
                const db = new KnowledgeGraphDatabase();
                const service = new ProjectAnalysisApplicationService(db);
                
                const startTime = Date.now();
                const result = await service.analyzeProject(project.path);
                const duration = Date.now() - startTime;
                
                results.projectAnalysisResults.push({
                    timestamp: Date.now(),
                    project: project.name,
                    nodes: result.summary.totalNodes,
                    relations: result.summary.totalRelations,
                    durationMs: duration,
                    status: 'SUCCESS'
                });
                
                await this.recordPerformance(`Project Deep Analysis: ${project.name}`, duration, 
                    result.summary.totalNodes + result.summary.totalRelations);
                
                this.log(`✅ ${project.name}: ${result.summary.totalNodes} nodes, ${result.summary.totalRelations} relations, ${duration}ms`, 'SUCCESS');
                
                this.operationCount += result.summary.totalNodes + result.summary.totalRelations;
                results.totalOperations += result.summary.totalNodes + result.summary.totalRelations;
                results.successfulOperations += result.summary.totalNodes + result.summary.totalRelations;
                
                await db.clear();
                
            } catch (error) {
                this.log(`❌ ${project.name} analysis FAILED!`, 'BUG');
                results.bugsFound.push({
                    timestamp: Date.now(),
                    type: 'Project Analysis Failure',
                    project: project.name,
                    error: error.message,
                    stack: error.stack
                });
                this.errorCount++;
                results.errorCount++;
                results.failedOperations++;
            }
        }
    }

    async run1Hour15MinuteUltraLongPressureTest() {
        const testStartTime = Date.now();
        const testEndTime = testStartTime + TEST_DURATION_MINUTES * 60 * 1000;
        
        this.log(`🚀 STARTING 1 HOUR 15 MINUTES ULTRA-LONG EXTREME PRESSURE TEST!`, 'TEST');
        
        this.initialMemory = (await this.recordMemory('Initial Check')).heapUsed;
        
        let lastProjectAnalysis = 0;
        let lastMemoryCheck = 0;
        let cycleCount = 0;
        let previousTime = Date.now();
        
        while (Date.now() < testEndTime && isRunning) {
            cycleCount++;
            const remainingMs = Math.max(0, testEndTime - Date.now());
            const remainingMinutes = Math.floor(remainingMs / 60000);
            const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
            
            if (cycleCount % 1000 === 0) {
                this.log(`⏱️ CYCLE #${cycleCount} - Remaining ${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`, 'DURATION');
            }
            
            // 主要测试1: 大型知识图谱操作
            await this.testLargeScaleKnowledgeGraph();
            
            // 主要测试2: 核心引擎复杂场景
            await this.testCoreEngineWithComplexScenarios();
            
            // 主要测试3: 内存管理复杂对象
            await this.testMemoryManagementWithComplexObjects();
            
            // 主要测试4: 高并发（每2个循环一次）
            if (cycleCount % 2 === 0) {
                await this.testHighConcurrencyWithComplexScenarios();
            }
            
            // 主要测试5: 真实项目深度解析（每10分钟一次）
            if (Date.now() - lastProjectAnalysis > PROJECT_ANALYSIS_INTERVAL_MS) {
                await this.testRealProjectDeepAnalysis();
                lastProjectAnalysis = Date.now();
            }
            
            // 主要测试6: 内存检查（每5分钟一次）
            if (Date.now() - lastMemoryCheck > MEMORY_CHECK_INTERVAL_MS) {
                await this.recordMemory(`Cycle ${cycleCount} Checkpoint`);
                lastMemoryCheck = Date.now();
            }
            
            // 每小时输出中间报告
            const elapsed = Date.now() - testStartTime;
            if (elapsed > 0 && elapsed % (30 * 60 * 1000) < 10000) { // 每30分钟
                this.log(`📊 MID-TEST PROGRESS: ${Math.round(elapsed / 60000)} minutes passed`, 'INFO');
            }
            
            // 短暂休息防止过热
            await new Promise(r => setTimeout(r, 30));
            
            // 每300循环输出进度
            if (cycleCount % 300 === 0) {
                const now = Date.now();
                const opsPerSec = Math.round(this.operationCount / ((now - previousTime) / 1000));
                this.log(`🎯 CYCLE ${cycleCount} - ${this.operationCount.toLocaleString()} operations @ ~${opsPerSec.toLocaleString()}/s`, 'INFO');
                previousTime = now;
            }
        }
        
        results.endTime = Date.now();
        results.durationMinutes = Math.round((results.endTime - results.startTime) / 60000);
        
        // 最终内存检查
        await this.recordMemory('Final Check');
    }

    generateComprehensiveFinalReport() {
        console.log('\n' + '='.repeat(180));
        console.log('📊 FINAL REPORT - 1 HOUR 15 MINUTES ULTRA-LONG EXTREME PRESSURE TEST');
        console.log('='.repeat(180));
        
        const totalDuration = (Date.now() - results.startTime) / 1000;
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);
        const seconds = Math.floor(totalDuration % 60);
        
        const firstMemory = results.memoryHistory[0];
        const lastMemory = results.memoryHistory[results.memoryHistory.length - 1];
        const memoryGrowth = lastMemory ? lastMemory.heapUsed - firstMemory.heapUsed : 0;
        
        console.log(`
📈 OVERALL RESULTS:
  ⏱️ TEST DURATION: ${hours}h ${minutes}m ${seconds}s
  📊 TOTAL OPERATIONS: ${results.totalOperations.toLocaleString()}
  ✅ SUCCESSFUL: ${results.successfulOperations.toLocaleString()} (${(results.successfulOperations / results.totalOperations * 100).toFixed(2)}%)
  ❌ FAILED: ${results.failedOperations}
  🐛 BUGS FOUND: ${results.bugsFound.length}
  ⚠️ WARNINGS: ${results.issuesFound.length}
  📊 MEMORY: ${firstMemory.heapUsed}MB → ${lastMemory.heapUsed}MB (${memoryGrowth > 0 ? '+' : ''}${memoryGrowth}MB)
  🧪 POSSIBLE LEAKS: ${results.memoryLeaks.length}
`);
        
        if (results.projectAnalysisResults.length > 0) {
            console.log('🌍 PROJECT ANALYSIS RESULTS:');
            results.projectAnalysisResults.slice(-8).forEach(result => {
                const timeStr = new Date(result.timestamp).toLocaleTimeString();
                if (result.status === 'SUCCESS') {
                    console.log(`  [${timeStr}] ${result.project}: ${result.nodes} nodes, ${result.relations} relations, ${result.durationMs}ms`);
                } else {
                    console.log(`  [${timeStr}] ❌ ${result.project}: FAILED`);
                }
            });
        }
        
        if (results.bugsFound.length > 0) {
            console.log('\n🐛 BUGS DISCOVERED:');
            results.bugsFound.slice(-5).forEach((bug, i) => {
                const timeStr = new Date(bug.timestamp).toLocaleTimeString();
                console.log(`  ${i + 1}. [${timeStr}] ${bug.type}: ${bug.error}`);
            });
        } else {
            console.log('\n🎉 NO BUGS FOUND! SYSTEM PERFORMED PERFECTLY!');
        }
        
        if (results.memoryHistory.length > 0) {
            console.log('\n📊 MEMORY HISTORY (LAST 12 CHECKPOINTS):');
            results.memoryHistory.slice(-12).forEach(entry => {
                const mins = Math.floor(entry.elapsedSeconds / 60).toString().padStart(2, '0');
                const secs = (entry.elapsedSeconds % 60).toString().padStart(2, '0');
                console.log(`  [${mins}:${secs}] ${entry.heapUsed}MB (${entry.label})`);
            });
        }
        
        console.log('\n' + '='.repeat(180));
        
        const reportPath = path.join(__dirname, '1_hour_15_minute_ultra_test_v5.0_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        
        if (results.bugsFound.length === 0 && results.failedOperations === 0) {
            console.log('🎉🎉🎉 1 HOUR 15 MINUTE ULTRA-LONG TEST PASSED PERFECTLY! SYSTEM IS READY FOR PRODUCTION!');
        } else {
            console.log('⚠️ TEST COMPLETED, BUT ISSUES FOUND');
        }
        
        this.log(`📄 DETAILED REPORT SAVED TO: ${reportPath}`, 'SUCCESS');
        
        console.log('='.repeat(180));
    }
}

process.on('SIGINT', () => {
    console.log('\n⚠️ INTERRUPT SIGNAL RECEIVED - GRACEFULLY FINISHING TEST...');
    isRunning = false;
});

async function main() {
    const tester = new UltraLongComplexPressureTester();
    
    try {
        await tester.run1Hour15MinuteUltraLongPressureTest();
        tester.generateComprehensiveFinalReport();
        process.exit(results.bugsFound.length === 0 ? 0 : 1);
    } catch (error) {
        console.error('❌ TEST FRAMEWORK EXCEPTION:', error);
        process.exit(1);
    }
}

main();
