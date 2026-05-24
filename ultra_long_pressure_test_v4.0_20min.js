#!/usr/bin/env node

/**
 * 🔥🔥🔥 ArkTS 代码图谱 - 超长时间压力测试 v4.0
 * 20分钟真实场景压力测试 - 发现真实运行时Bug
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

console.log('='.repeat(160));
console.log('🔥🔥🔥 ArkTS 代码图谱 - 超长时间极端压力测试 v4.0 (20分钟)');
console.log('='.repeat(160));
console.log('');

const TEST_DURATION_MINUTES = 20;
const MEMORY_CHECK_INTERVAL_MS = 60000;

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

class UltraLongPressureTester {
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
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        
        const icons = {
            'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 
            'ISSUE': '🔍', 'FIX': '🔧', 'INFO': 'ℹ️', 
            'TEST': '🧪', 'PERF': '⚡', 'DURATION': '⏱️',
            'MEMORY': '📊'
        };
        
        console.log(`${icons[type] || 'ℹ️'} [${mins}:${secs}] ${msg}`);
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
        
        if (results.memoryHistory.length > 5) {
            const recent = results.memoryHistory.slice(-10);
            const first = recent[0];
            const last = recent[recent.length - 1];
            const growth = last.heapUsed - first.heapUsed;
            
            if (growth > 100) {
                this.log(`⚠️ 警告: 可能的内存泄漏! 最近增长 ${growth}MB`, 'WARNING');
                results.memoryLeaks.push({
                    timestamp: Date.now(),
                    growth,
                    fromMB: first.heapUsed,
                    toMB: last.heapUsed
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

    async testKnowledgeGraphOperations() {
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        const nodeCount = 2000;
        const relationCount = 1999;
        
        const startTime = Date.now();
        
        for (let i = 0; i < nodeCount; i++) {
            const type = i % 4 === 0 ? 'CLASS' : i % 4 === 1 ? 'FUNCTION' : i % 4 === 2 ? 'VARIABLE' : 'TYPE';
            db.createNode({
                id: `test-node-${Date.now()}-${i}`,
                type,
                name: `TestNode${i}`,
                metadata: { 
                    index: i, 
                    timestamp: Date.now(),
                    testRound: Math.floor(this.operationCount / 1000)
                }
            });
            this.operationCount++;
        }
        
        for (let i = 0; i < relationCount; i++) {
            db.createRelation({
                id: `test-rel-${Date.now()}-${i}`,
                sourceId: `test-node-${Date.now()}-${i}`,
                targetId: `test-node-${Date.now()}-${i + 1}`,
                type: i % 2 === 0 ? 'CALLS' : 'DEPENDS_ON',
                weight: Math.random()
            });
            this.operationCount++;
        }
        
        const stats = db.getStats();
        
        const middleTime = Date.now();
        await this.recordPerformance('Create Nodes & Relations', middleTime - startTime, nodeCount + relationCount);
        
        await db.clear();
        
        const totalDuration = Date.now() - startTime;
        
        results.successfulOperations += nodeCount + relationCount;
        results.totalOperations += nodeCount + relationCount;
        
        if (nodeCount !== stats.totalNodes || relationCount !== stats.totalRelations) {
            this.log(`🐛 Bug: 节点/关系数量不匹配! 期望: ${nodeCount}/${relationCount}, 实际: ${stats.totalNodes}/${stats.totalRelations}`, 'BUG');
            results.bugsFound.push({
                timestamp: Date.now(),
                type: 'KnowledgeGraph Integrity',
                expected: { nodes: nodeCount, relations: relationCount },
                actual: stats
            });
            this.errorCount++;
            results.errorCount++;
            return false;
        }
        
        return true;
    }

    async testCoreEngineObjectPool() {
        const { coreEngine } = require('./dist/src/core/engine');
        
        const operations = 1000;
        const nodes = [];
        const relations = [];
        const startTime = Date.now();
        
        for (let i = 0; i < operations; i++) {
            const node = coreEngine.acquireNode();
            node.id = `engine-node-${Date.now()}-${i}`;
            node.name = `EngineTest${i}`;
            node.metadata = { 
                test: 'ultra-long', 
                round: Math.floor(this.operationCount / 1000)
            };
            nodes.push(node);
            
            const rel = coreEngine.acquireRelation();
            rel.sourceId = `engine-node-${Date.now()}-${i}`;
            rel.targetId = `engine-node-${Date.now()}-${(i + 1) % operations}`;
            rel.type = 'TEST_RELATION';
            relations.push(rel);
            
            this.operationCount++;
        }
        
        for (const node of nodes) {
            coreEngine.releaseNode(node);
        }
        for (const rel of relations) {
            coreEngine.releaseRelation(rel);
        }
        
        let nullTestPassed = true;
        try {
            coreEngine.releaseNode(null);
            coreEngine.releaseNode(undefined);
            coreEngine.releaseRelation(null);
            coreEngine.releaseRelation(undefined);
        } catch (e) {
            nullTestPassed = false;
            this.log(`🐛 Bug: 空值安全失败! ${e.message}`, 'BUG');
            results.bugsFound.push({
                timestamp: Date.now(),
                type: 'Null Safety',
                error: e.message
            });
            this.errorCount++;
            results.errorCount++;
        }
        
        const duration = Date.now() - startTime;
        await this.recordPerformance('CoreEngine ObjectPool', duration, operations * 2);
        
        results.successfulOperations += operations * 2;
        results.totalOperations += operations * 2;
        
        return nullTestPassed;
    }

    async testMemoryManagement() {
        const { ObjectPool } = require('./dist/src/infrastructure/utils/memory_manager');
        
        const pool = new ObjectPool(
            () => ({ id: '', name: '', metadata: {} }),
            500,
            (obj) => { obj.id = ''; obj.name = ''; obj.metadata = {}; }
        );
        
        const acquired = [];
        const iterations = 1000;
        const startTime = Date.now();
        
        for (let round = 0; round < 10; round++) {
            for (let i = 0; i < iterations; i++) {
                const obj = pool.acquire();
                obj.id = `mem-test-${round}-${i}`;
                obj.name = `MemTest${round}-${i}`;
                obj.metadata = { round, index: i };
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
        
        try {
            pool.release(null);
            pool.release(undefined);
        } catch (e) {
            this.log(`🐛 Bug: 内存管理空值安全失败! ${e.message}`, 'BUG');
            results.bugsFound.push({
                timestamp: Date.now(),
                type: 'MemoryManager Null Safety',
                error: e.message
            });
            this.errorCount++;
            results.errorCount++;
            return false;
        }
        
        const duration = Date.now() - startTime;
        await this.recordPerformance('MemoryManagement', duration, iterations * 20);
        
        return true;
    }

    async testProjectAnalysis() {
        const { ProjectAnalysisApplicationService } = require('./dist/src/application/analysis/project.analysis.app.service');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const projects = [
            { path: './src', name: 'src' }
        ];
        
        if (fs.existsSync('./type-challenges')) {
            projects.push({ path: './type-challenges', name: 'type-challenges' });
        }
        
        for (const project of projects) {
            if (!fs.existsSync(project.path)) continue;
            
            this.log(`🌍 分析真实项目: ${project.name}`, 'TEST');
            
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
                
                await this.recordPerformance(`ProjectAnalysis:${project.name}`, duration, result.summary.totalNodes + result.summary.totalRelations);
                
                this.log(`✅ ${project.name}: ${result.summary.totalNodes} 节点, ${result.summary.totalRelations} 关系, ${duration}ms`, 'SUCCESS');
                
                this.operationCount += result.summary.totalNodes + result.summary.totalRelations;
                results.totalOperations += result.summary.totalNodes + result.summary.totalRelations;
                results.successfulOperations += result.summary.totalNodes + result.summary.totalRelations;
                
                await db.clear();
                
            } catch (error) {
                this.log(`❌ ${project.name} 分析失败: ${error.message}`, 'BUG');
                results.bugsFound.push({
                    timestamp: Date.now(),
                    type: 'ProjectAnalysis',
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

    async testConcurrency() {
        const { coreEngine } = require('./dist/src/core/engine');
        
        const numWorkers = 30;
        const operationsPerWorker = 200;
        const startTime = Date.now();
        let workerErrors = 0;
        
        const workers = [];
        
        for (let w = 0; w < numWorkers; w++) {
            workers.push((async () => {
                try {
                    const nodes = [];
                    const relations = [];
                    
                    for (let i = 0; i < operationsPerWorker; i++) {
                        const node = coreEngine.acquireNode();
                        node.id = `worker-${w}-node-${Date.now()}-${i}`;
                        node.metadata = { 
                            worker: w, 
                            index: i, 
                            timestamp: Date.now() 
                        };
                        nodes.push(node);
                        
                        const rel = coreEngine.acquireRelation();
                        rel.sourceId = node.id;
                        rel.targetId = `worker-${(w + 1) % numWorkers}-node-${Date.now()}-${i}`;
                        relations.push(rel);
                        
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
        await this.recordPerformance('ConcurrencyTest', duration, numWorkers * operationsPerWorker * 2);
        
        if (workerErrors > 0) {
            this.log(`⚠️ 并发测试发现 ${workerErrors} 个错误`, 'WARNING');
            results.issuesFound.push({
                timestamp: Date.now(),
                type: 'Concurrency Errors',
                count: workerErrors
            });
            return false;
        }
        
        this.log(`✅ 并发测试通过! ${numWorkers} 个 workers, ${operationsPerWorker * 2} 次操作`, 'SUCCESS');
        return true;
    }

    async runUltraLongTest() {
        const testStartTime = Date.now();
        const testEndTime = testStartTime + TEST_DURATION_MINUTES * 60 * 1000;
        
        this.log(`🚀 开始超长时间压力测试 - 持续 ${TEST_DURATION_MINUTES} 分钟`, 'TEST');
        
        this.initialMemory = (await this.recordMemory('Start')).heapUsed;
        
        let lastProjectAnalysis = 0;
        let cycleCount = 0;
        
        while (Date.now() < testEndTime && isRunning) {
            cycleCount++;
            const remainingMs = Math.max(0, testEndTime - Date.now());
            const remainingMins = Math.floor(remainingMs / 60000);
            const remainingSecs = Math.floor((remainingMs % 60000) / 1000);
            
            if (cycleCount % 50 === 0) {
                this.log(`⏱️ 循环 #${cycleCount} - 剩余 ${remainingMins}:${remainingSecs.toString().padStart(2, '0')}`, 'DURATION');
            }
            
            await this.testKnowledgeGraphOperations();
            await this.testCoreEngineObjectPool();
            await this.testMemoryManagement();
            
            if (cycleCount % 3 === 0) {
                await this.testConcurrency();
            }
            
            if (Date.now() - lastProjectAnalysis > 300000) {
                await this.testProjectAnalysis();
                lastProjectAnalysis = Date.now();
            }
            
            if (results.memoryHistory.length === 0 || 
                Date.now() - results.memoryHistory[results.memoryHistory.length - 1].timestamp > MEMORY_CHECK_INTERVAL_MS) {
                await this.recordMemory(`Cycle ${cycleCount}`);
            }
            
            await new Promise(r => setTimeout(r, 50));
        }
        
        results.endTime = Date.now();
        results.durationMinutes = Math.round((results.endTime - results.startTime) / 60000);
    }

    generateFinalReport() {
        console.log('\n' + '='.repeat(160));
        console.log('📊 超长时间压力测试 - 最终报告');
        console.log('='.repeat(160));
        
        const totalDuration = (Date.now() - results.startTime) / 1000;
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);
        const seconds = Math.floor(totalDuration % 60);
        
        const firstMemory = results.memoryHistory[0];
        const lastMemory = results.memoryHistory[results.memoryHistory.length - 1];
        const memoryGrowth = lastMemory ? lastMemory.heapUsed - firstMemory.heapUsed : 0;
        
        console.log(`
📈 总体统计:
  ⏱️ 测试时长: ${hours}h ${minutes}m ${seconds}s
  📊 总操作数: ${results.totalOperations.toLocaleString()}
  ✅ 成功操作: ${results.successfulOperations.toLocaleString()}
  ❌ 失败操作: ${results.failedOperations.toLocaleString()}
  🐛 发现Bug: ${results.bugsFound.length}
  ⚠️ 警告问题: ${results.issuesFound.length}
  📊 内存变化: ${firstMemory.heapUsed}MB → ${lastMemory.heapUsed}MB (${memoryGrowth > 0 ? '+' : ''}${memoryGrowth}MB)
  🧪 潜在内存泄漏: ${results.memoryLeaks.length} 个
`);
        
        if (results.projectAnalysisResults.length > 0) {
            console.log('🌍 项目分析结果:');
            results.projectAnalysisResults.slice(-10).forEach(result => {
                const time = new Date(result.timestamp).toISOString();
                console.log(`  [${time}] ${result.project}: ${result.nodes} 节点, ${result.relations} 关系, ${result.durationMs}ms`);
            });
        }
        
        if (results.bugsFound.length > 0) {
            console.log('\n🐛 发现的Bug:');
            results.bugsFound.slice(-10).forEach((bug, i) => {
                const time = new Date(bug.timestamp).toISOString();
                console.log(`  ${i + 1}. [${time}] ${bug.type}: ${bug.error}`);
            });
        } else {
            console.log('\n🎉 0个Bug发现! 系统表现完美!');
        }
        
        if (results.memoryHistory.length > 0) {
            console.log('\n📊 内存历史:');
            results.memoryHistory.slice(-15).forEach(entry => {
                const mins = Math.floor(entry.elapsedSeconds / 60).toString().padStart(2, '0');
                const secs = (entry.elapsedSeconds % 60).toString().padStart(2, '0');
                console.log(`  [${mins}:${secs}] ${entry.heapUsed}MB (${entry.label})`);
            });
        }
        
        console.log('\n' + '='.repeat(160));
        
        const reportPath = path.join(__dirname, 'ultra_long_pressure_test_v4.0_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        
        if (results.bugsFound.length === 0 && results.failedOperations === 0) {
            console.log('🎉🎉🎉 超长时间压力测试完美通过! 系统状态: 完美!');
        } else {
            console.log('⚠️ 测试完成，但发现问题需要处理');
        }
        
        this.log(`📄 详细报告已保存: ${reportPath}`, 'SUCCESS');
        
        console.log('='.repeat(160));
    }
}

process.on('SIGINT', () => {
    console.log('\n⚠️ 收到中断信号，正在结束测试...');
    isRunning = false;
});

async function main() {
    const tester = new UltraLongPressureTester();
    
    try {
        await tester.runUltraLongTest();
        tester.generateFinalReport();
        process.exit(results.bugsFound.length === 0 ? 0 : 1);
    } catch (error) {
        console.error('❌ 测试框架异常:', error);
        process.exit(1);
    }
}

main();
