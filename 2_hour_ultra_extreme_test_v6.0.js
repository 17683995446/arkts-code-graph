#!/usr/bin/env node

/**
 * 🔥🔥🔥 ArkTS 代码图谱 - 2小时+ 超极端压力测试 v6.0
 * 包含故障注入、极端数据规模、超级并发、边界条件测试
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

console.log('='.repeat(200));
console.log('🔥🔥🔥 ArkTS 代码图谱 - 2小时+ 超极端压力测试 v6.0');
console.log('='.repeat(200));
console.log('');

const TEST_DURATION_MINUTES = 120; // 2小时测试
const MEMORY_CHECK_INTERVAL_MS = 600000; // 每10分钟检查内存

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
    memoryLeaks: []
};

let isRunning = true;

class UltraExtremePressureTester {
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
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        
        const icons = {
            'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 
            'ISSUE': '🔍', 'FIX': '🔧', 'INFO': 'ℹ️', 
            'TEST': '🧪', 'PERF': '⚡', 'DURATION': '⏱️',
            'MEMORY': '📊', 'COMPLEX': '🎯', 'FAULT': '💥'
        };
        
        console.log(`${icons[type] || 'ℹ️'} [${hours}:${minutes}:${seconds}] ${msg}`);
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
        
        if (results.memoryHistory.length > 3) {
            const olderIndex = Math.max(0, results.memoryHistory.length - 5);
            const older = results.memoryHistory[olderIndex];
            const growth = entry.heapUsed - older.heapUsed;
            
            if (growth > 200) {
                this.log(`⚠️ WARNING: Possible memory leak! ${growth}MB growth since last check`, 'WARNING');
                results.memoryLeaks.push({
                    timestamp: Date.now(),
                    growth,
                    fromMB: older.heapUsed,
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

    // ====== 1. 极端知识图谱操作 - 10万+节点 ======
    async testExtremeKnowledgeGraph() {
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        const nodeCount = 100000; // 10万节点！
        const relationCount = 99999;
        
        this.log(`🎯 Creating ${nodeCount} extreme nodes and ${relationCount} relations...`, 'COMPLEX');
        
        const startTime = Date.now();
        
        for (let i = 0; i < nodeCount; i++) {
            const type = ['CLASS', 'FUNCTION', 'VARIABLE', 'TYPE', 'INTERFACE', 'ENUM', 'CONSTANT', 'NAMESPACE'][i % 8];
            db.createNode({
                id: `extreme-node-${Date.now()}-${i}`,
                type,
                name: `ExtremeNode${i}`,
                metadata: {
                    index: i,
                    timestamp: Date.now(),
                    largeString: 'x'.repeat(i % 200), // 长字符串
                    nestedObject: { a: { b: { c: i } } } // 嵌套对象
                }
            });
            this.operationCount++;
        }
        
        for (let i = 0; i < relationCount; i++) {
            const relationType = ['CALLS', 'DEPENDS_ON', 'EXTENDS', 'IMPLEMENTS', 'REFERENCES', 'USES', 'IMPORTS', 'HAS_MEMBER'][i % 8];
            db.createRelation({
                id: `extreme-rel-${Date.now()}-${i}`,
                sourceId: `extreme-node-${Date.now()}-${i}`,
                targetId: `extreme-node-${Date.now()}-${i + 1}`,
                type: relationType,
                weight: Math.random(),
                metadata: {
                    index: i,
                    largeArray: Array.from({ length: i % 50 }, (_, j) => j)
                }
            });
            this.operationCount++;
        }
        
        const stats = db.getStats();
        
        const middleTime = Date.now();
        await this.recordPerformance('Extreme KG Create', middleTime - startTime, nodeCount + relationCount);
        
        await db.clear();
        
        results.successfulOperations += nodeCount + relationCount;
        results.totalOperations += nodeCount + relationCount;
        
        if (stats.totalNodes !== nodeCount || stats.totalRelations !== relationCount) {
            this.log(`🐛 BUG: Node/relation count mismatch!`, 'BUG');
            results.bugsFound.push({
                timestamp: Date.now(),
                type: 'Extreme Knowledge Graph Integrity',
                expected: { nodes: nodeCount, relations: relationCount },
                actual: stats
            });
            this.errorCount++;
            results.errorCount++;
            return false;
        }
        
        this.log(`✅ Extreme knowledge graph test passed!`, 'SUCCESS');
        return true;
    }

    // ====== 2. 超级并发测试 - 100+ workers ======
    async testSuperHighConcurrency() {
        const { coreEngine } = require('./dist/src/core/engine');
        
        const workerCount = 100; // 100个并发worker！
        const operationsPerWorker = 1000;
        const startTime = Date.now();
        let workerErrors = 0;
        
        this.log(`🎯 Testing ${workerCount} concurrent workers...`, 'COMPLEX');
        
        const workers = [];
        
        for (let w = 0; w < workerCount; w++) {
            workers.push((async () => {
                try {
                    for (let i = 0; i < operationsPerWorker; i++) {
                        const node = coreEngine.acquireNode();
                        node.id = `super-worker-${w}-node-${Date.now()}-${i}`;
                        node.name = `SuperWorkerNode${w}${i}`;
                        node.metadata = { 
                            workerId: w,
                            index: i,
                            timestamp: Date.now()
                        };
                        
                        const rel = coreEngine.acquireRelation();
                        rel.sourceId = node.id;
                        rel.targetId = `super-worker-${(w + 1) % workerCount}-node-${Date.now()}-${i}`;
                        rel.type = ['CALLS', 'DEPENDS_ON', 'REFERENCES'][w % 3];
                        
                        coreEngine.releaseNode(node);
                        coreEngine.releaseRelation(rel);
                        
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
        await this.recordPerformance('Super High Concurrency', duration, workerCount * operationsPerWorker * 2);
        
        if (workerErrors > 0) {
            this.log(`⚠️ ${workerErrors} concurrency errors found`, 'WARNING');
            results.issuesFound.push({
                timestamp: Date.now(),
                type: 'Super High Concurrency Errors',
                count: workerErrors
            });
            return false;
        }
        
        this.log(`✅ Super high concurrency test passed! ${workerCount} workers, ${operationsPerWorker} ops each`, 'SUCCESS');
        return true;
    }

    // ====== 3. 故障注入测试 ======
    async testFaultInjection() {
        const { KnowledgeGraphDatabase, coreEngine } = require('./dist/src/index');
        
        this.log(`💥 Testing fault injection scenarios...`, 'FAULT');
        
        const db = new KnowledgeGraphDatabase();
        let faultTestPassed = true;
        
        // 测试1: 空值释放
        try {
            coreEngine.releaseNode(null);
            coreEngine.releaseNode(undefined);
            coreEngine.releaseRelation(null);
            coreEngine.releaseRelation(undefined);
            this.log(`✅ Null/undefined release test passed`, 'SUCCESS');
        } catch (e) {
            this.log(`🐛 BUG: Null/undefined release failed!`, 'BUG');
            results.bugsFound.push({
                timestamp: Date.now(),
                type: 'Fault Injection: Null Safety',
                error: e.message
            });
            faultTestPassed = false;
            this.errorCount++;
            results.errorCount++;
        }
        
        // 测试2: 重复释放同一对象
        try {
            const node = coreEngine.acquireNode();
            coreEngine.releaseNode(node);
            coreEngine.releaseNode(node); // 重复释放
            coreEngine.releaseNode(node); // 三次释放
            this.log(`✅ Duplicate release test passed`, 'SUCCESS');
        } catch (e) {
            this.log(`🐛 BUG: Duplicate release failed!`, 'BUG');
            results.bugsFound.push({
                timestamp: Date.now(),
                type: 'Fault Injection: Duplicate Release',
                error: e.message
            });
            faultTestPassed = false;
            this.errorCount++;
            results.errorCount++;
        }
        
        // 测试3: 极端元数据
        try {
            for (let i = 0; i < 100; i++) {
                db.createNode({
                    id: `fault-test-node-${i}`,
                    type: 'VARIABLE',
                    name: `FaultTest${i}`,
                    metadata: {
                        largeData: 'x'.repeat(5000), // 5KB数据
                        deepNesting: { a: { b: { c: { d: { e: i } } } } // 深度嵌套
                    }
                });
            }
            const nodes = db.getNodesByType('VARIABLE');
            this.log(`✅ Extreme metadata test passed: ${nodes.length} nodes created`, 'SUCCESS');
        } catch (e) {
            this.log(`🐛 BUG: Extreme metadata failed!`, 'BUG');
            results.bugsFound.push({
                timestamp: Date.now(),
                type: 'Fault Injection: Extreme Metadata',
                error: e.message
            });
            faultTestPassed = false;
            this.errorCount++;
            results.errorCount++;
        }
        
        await db.clear();
        this.log(`✅ Fault injection test completed`, 'SUCCESS');
        return faultTestPassed;
    }

    // ====== 4. 真实项目深度解析测试 ======
    async testDeepProjectAnalysis() {
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
            
            this.log(`🎯 Deep analyzing real project: ${project.name}...`, 'COMPLEX');
            
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
                
                await this.recordPerformance(`Deep Project Analysis: ${project.name}`, duration, 
                    result.summary.totalNodes + result.summary.totalRelations);
                
                this.log(`✅ ${project.name}: ${result.summary.totalNodes} nodes, ${result.summary.totalRelations} relations, ${duration}ms`, 'SUCCESS');
                
                this.operationCount += result.summary.totalNodes + result.summary.totalRelations;
                results.totalOperations += result.summary.totalNodes + result.summary.totalRelations;
                results.successfulOperations += result.summary.totalNodes + result.summary.totalRelations;
                
                await db.clear();
                
            } catch (error) {
                this.log(`❌ ${project.name} deep analysis failed!`, 'BUG');
                results.bugsFound.push({
                    timestamp: Date.now(),
                    type: 'Deep Project Analysis',
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

    // ====== 2小时+ 主压力测试循环 ======
    async runUltraExtremePressureTest() {
        const testStartTime = Date.now();
        const testEndTime = testStartTime + TEST_DURATION_MINUTES * 60 * 1000;
        
        this.log(`🚀 STARTING 2 HOURS+ ULTRA EXTREME PRESSURE TEST!`, 'TEST');
        
        this.initialMemory = (await this.recordMemory('Initial Check')).heapUsed;
        
        let lastProjectAnalysis = 0;
        let lastFaultInjection = 0;
        let cycleCount = 0;
        let lastReportTime = Date.now();
        
        while (Date.now() < testEndTime && isRunning) {
            cycleCount++;
            const elapsedSeconds = Math.round((Date.now() - testStartTime) / 1000);
            const hours = Math.floor(elapsedSeconds / 3600);
            const mins = Math.floor((elapsedSeconds % 3600) / 60);
            const remainingMs = Math.max(0, testEndTime - Date.now());
            const remainingHours = Math.floor(remainingMs / 3600000);
            const remainingMins = Math.floor((remainingMs % 3600000) / 60000);
            
            // 每1000个循环或每30秒报告一次
            if (cycleCount % 1000 === 0 || Date.now() - lastReportTime > 30000) {
                this.log(`⏱️ Cycle ${cycleCount} - Elapsed ${hours}h ${mins}m - Remaining ${remainingHours}h ${remainingMins}m`, 'DURATION');
                lastReportTime = Date.now();
            }
            
            // 主要测试循环
            try {
                await this.testExtremeKnowledgeGraph(); // 10万节点
            } catch (e) {
                this.log(`❌ Extreme KG test failed!`, 'BUG');
            }
            
            try {
                await this.testSuperHighConcurrency(); // 100并发workers
            } catch (e) {
                this.log(`❌ Super concurrency test failed!`, 'BUG');
            }
            
            try {
                if (cycleCount % 5 === 0) {
                    await this.testFaultInjection(); // 每5个循环故障注入
                }
            } catch (e) {
                this.log(`❌ Fault injection test failed!`, 'BUG');
            }
            
            try {
                if (Date.now() - lastProjectAnalysis > 1800000) { // 每30分钟深度项目分析
                    await this.testDeepProjectAnalysis();
                    lastProjectAnalysis = Date.now();
                }
            } catch (e) {
                this.log(`❌ Deep project analysis failed!`, 'BUG');
            }
            
            // 内存检查
            if (results.memoryHistory.length === 0 || 
                Date.now() - results.memoryHistory[results.memoryHistory.length - 1].timestamp > MEMORY_CHECK_INTERVAL_MS) {
                await this.recordMemory(`Cycle ${cycleCount} Checkpoint`);
            }
            
            await new Promise(r => setTimeout(r, 50));
        }
        
        results.endTime = Date.now();
        results.durationMinutes = Math.round((results.endTime - results.startTime) / 60000);
        
        await this.recordMemory('Final Check');
    }

    generateFinalReport() {
        console.log('\n' + '='.repeat(200));
        console.log('📊 FINAL REPORT - 2 HOURS+ ULTRA EXTREME PRESSURE TEST');
        console.log('='.repeat(200));
        
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
                const time = new Date(result.timestamp).toLocaleTimeString();
                if (result.status === 'SUCCESS') {
                    console.log(`  [${time}] ${result.project}: ${result.nodes} nodes, ${result.relations} relations, ${result.durationMs}ms`);
                } else {
                    console.log(`  [${time}] ❌ ${result.project}: FAILED`);
                }
            });
        }
        
        if (results.bugsFound.length > 0) {
            console.log('\n🐛 BUGS DISCOVERED:');
            results.bugsFound.slice(-10).forEach((bug, i) => {
                const time = new Date(bug.timestamp).toLocaleTimeString();
                console.log(`  ${i + 1}. [${time}] ${bug.type}: ${bug.error}`);
            });
        } else {
            console.log('\n🎉 NO BUGS FOUND! SYSTEM PERFORMED PERFECTLY!');
        }
        
        if (results.memoryHistory.length > 0) {
            console.log('\n📊 MEMORY HISTORY (LAST 16 CHECKPOINTS):');
            results.memoryHistory.slice(-16).forEach(entry => {
                const hours = Math.floor(entry.elapsedSeconds / 3600).toString().padStart(2, '0');
                const mins = Math.floor((entry.elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
                const secs = (entry.elapsedSeconds % 60).toString().padStart(2, '0');
                console.log(`  [${hours}:${mins}:${secs}] ${entry.heapUsed}MB (${entry.label})`);
            });
        }
        
        console.log('\n' + '='.repeat(200));
        
        const reportPath = path.join(__dirname, '2_hour_ultra_extreme_test_v6.0_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        
        if (results.bugsFound.length === 0 && results.failedOperations === 0) {
            console.log('🎉🎉🎉 2 HOURS+ ULTRA EXTREME TEST PASSED PERFECTLY! SYSTEM IS READY FOR ANY PRODUCTION CHALLENGE!');
        } else {
            console.log('⚠️ TEST COMPLETED, BUT ISSUES FOUND');
        }
        
        this.log(`📄 DETAILED REPORT SAVED TO: ${reportPath}`, 'SUCCESS');
        
        console.log('='.repeat(200));
    }
}

// 信号处理
process.on('SIGINT', () => {
    console.log('\n⚠️ INTERRUPT SIGNAL RECEIVED - GRACEFULLY FINISHING TEST...');
    isRunning = false;
});

async function main() {
    const tester = new UltraExtremePressureTester();
    
    try {
        await tester.runUltraExtremePressureTest();
        tester.generateFinalReport();
        process.exit(results.bugsFound.length === 0 ? 0 : 1);
    } catch (error) {
        console.error('❌ TEST FRAMEWORK EXCEPTION:', error);
        process.exit(1);
    }
}

main();
