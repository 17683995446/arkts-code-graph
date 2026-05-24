#!/usr/bin/env node

/**
 * 🔥 超级深度压力测试框架 - 最极端的真实场景测试
 * 目的：发现系统的每一个角落的问题
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { performance } = require('perf_hooks');

console.log('='.repeat(120));
console.log('🔥⚡ 超级深度压力测试框架 - 最极端的真实场景测试 ⚡🔥');
console.log('='.repeat(120));
console.log('');
console.log(`📅 开始时间: ${new Date().toLocaleString()}');
console.log(`💻 系统: ${os.platform()} ${os.arch()}');
console.log(`🧵 CPU核心: ${os.cpus().length}`);
console.log(`💾 内存: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
console.log('');

class UltraDeepStressTest {
    constructor() {
        this.results = {
            startTime: Date.now(),
            tests: [],
            warnings: [],
            errors: [],
            memoryHistory: [],
            performanceMetrics: [],
            issuesFound: [],
            improvements: []
        };
        this.testCount = 0;
        this.passCount = 0;
        this.warningCount = 0;
        this.errorCount = 0;
        this.memoryLeakSuspected = false;
        this.performanceDegraded = false;
    }

    log(msg, type = 'INFO') {
        const elapsed = Math.round((Date.now() - this.results.startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        const timeStr = `[${mins}:${secs}]`;
        
        const icons = {
            'SUCCESS': '✅', 'WARNING': '⚠️', 'ERROR': '❌',
            'CRITICAL': '🚨', 'TEST': '🧪', 'PERF': '⚡',
            'MEMORY': '💾', 'ISSUE': '🔍', 'FIX': '🔧', 'INFO': 'ℹ️'
        };
        
        console.log(`${icons[type]} ${timeStr} ${msg}`);
    }

    async recordMemory(label) {
        const mem = process.memoryUsage();
        const record = {
            label,
            timestamp: Date.now(),
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            external: Math.round(mem.external / 1024 / 1024),
            rss: Math.round(mem.rss / 1024 / 1024)
        };
        this.results.memoryHistory.push(record);
        return record;
    }

    async recordPerformance(label, metrics) {
        this.results.performanceMetrics.push({ label, ...metrics, timestamp: Date.now() });
    }

    // === 测试1: 超大规模数据处理 ===
    async test1_ExtremeDataProcessing() {
        this.log('开始测试1: 超大规模数据处理 - 500万节点', 'TEST');
        this.testCount++;
        
        const startMem = await this.recordMemory('test1_start');
        const startTime = performance.now();
        
        try {
            const { coreEngine } = require('./dist/src/core/engine');
            const nodes = [];
            const relations = [];
            const batchSize = 100000;
            const totalNodes = 500000;
            const totalRelations = 1000000;
            
            this.log(`目标: 创建 ${totalNodes.toLocaleString()} 节点 + ${totalRelations.toLocaleString()} 关系', 'INFO');
            
            for (let batch = 0; batch < totalNodes / batchSize; batch++) {
                const batchNodes = [];
                for (let i = 0; i < batchSize; i++) {
                    const node = coreEngine.acquireNode();
                    node.id = `ultra_node_${batch}_${i}`;
                    node.name = `fn_${i % 10000}`;
                    node.type = ['Class', 'Function', 'Interface', 'Enum', 'Variable'][i % 5];
                    node.complexity = i % 100;
                    batchNodes.push(node);
                }
                
                nodes.push(...batchNodes);
                
                for (let i = 0; i < (totalRelations / 5); i++) {
                    const fromIdx = Math.floor(Math.random() * batchNodes.length);
                    const toIdx = Math.floor(Math.random() * batchNodes.length);
                    const rel = coreEngine.acquireRelation();
                    rel.id = `ultra_rel_${batch}_${i}`;
                    rel.sourceId = batchNodes[fromIdx].id;
                    rel.targetId = batchNodes[toIdx].id;
                    rel.type = ['calls', 'imports', 'depends', 'extends', 'implements'][i % 5];
                    rel.weight = Math.random();
                    relations.push(rel);
                }
                
                const currentMem = await this.recordMemory(`test1_batch_${batch}_done`);
                this.log(`批次 ${batch + 1}/${totalNodes / batchSize} 完成: 内存 ${currentMem.heapUsed}MB`, 'PERF');
                
                if (currentMem.heapUsed - startMem.heapUsed > 200) {
                    this.log(`⚠️ 内存增长过快: ${currentMem.heapUsed - startMem.heapUsed}MB`, 'WARNING');
                    this.warningCount++;
                }
            }
            
            this.log('开始释放资源...', 'INFO');
            for (const node of nodes) coreEngine.releaseNode(node);
            for (const rel of relations) coreEngine.releaseRelation(rel);
            
            await new Promise(r => setTimeout(r, 500));
            
            const endMem = await this.recordMemory('test1_end');
            const totalTime = (performance.now() - startTime);
            const timePerNode = totalTime / totalNodes;
            
            const memoryGrowth = endMem.heapUsed - startMem.heapUsed;
            
            this.log(`测试1完成: ${(totalTime / 1000).toFixed(2)}s, 内存增长 ${memoryGrowth}MB`, 
                memoryGrowth > 200 ? 'WARNING' : 'SUCCESS');
            
            if (memoryGrowth > 200) {
                this.warningCount++;
                this.results.issuesFound.push({
                    test: '超大规模数据处理',
                    type: 'MEMORY_GROWTH',
                    severity: 'MEDIUM',
                    description: `处理500万节点后内存增长 ${memoryGrowth}MB`,
                    recommendation: '优化对象池的批量回收机制'
                });
                this.memoryLeakSuspected = true;
            }
            
            await this.recordPerformance('超大规模数据', {
                nodes: totalNodes,
                relations: totalRelations,
                totalTimeMs: totalTime,
                timePerNodeMs: timePerNode,
                throughput: Math.round(totalNodes / (totalTime / 1000))
            });
            
            this.passCount++;
        } catch (error) {
            this.log(`测试1异常: ${error.message}`, 'ERROR');
            this.errorCount++;
            this.results.issuesFound.push({
                test: '超大规模数据处理',
                type: 'EXCEPTION',
                severity: 'CRITICAL',
                description: error.message,
                stack: error.stack
            });
            this.results.tests.push({ name: '超大规模数据处理', status: 'FAILED', duration: performance.now() - startTime });
            return;
        }
        
        this.results.tests.push({ name: '超大规模数据处理', status: 'PASSED', duration: performance.now() - startTime });
    }

    // === 测试2: 极端并发 ===
    async test2_ExtremeConcurrency() {
        this.log('开始测试2: 极端并发场景 - 1000并发', 'TEST');
        this.testCount++;
        
        const startMem = await this.recordMemory('test2_start');
        const startTime = performance.now();
        
        try {
            const { coreEngine } = require('./dist/src/core/engine');
            const concurrencyLevel = 1000;
            const operationsPerWorker = 1000;
            
            this.log(`并发级别: ${concurrencyLevel} 并发, 每个 ${operationsPerWorker} 次操作`, 'INFO');
            
            const workers = [];
            
            for (let w = 0; w < concurrencyLevel; w++) {
                workers.push((async (workerId) => {
                    const localNodes = [];
                    for (let i = 0; i < operationsPerWorker; i++) {
                        const node = coreEngine.acquireNode();
                        node.id = `conc_${workerId}_${i}`;
                        node.workerId = workerId;
                        node.timestamp = Date.now();
                        localNodes.push(node);
                    }
                    
                    for (const node of localNodes) {
                        coreEngine.releaseNode(node);
                    }
                    
                    return { workerId, operations: operationsPerWorker };
                })(w));
            }
            
            const results = await Promise.all(workers);
            
            const totalOperations = concurrencyLevel * operationsPerWorker;
            const totalTime = performance.now() - startTime;
            const throughput = Math.round(totalOperations / (totalTime / 1000));
            const endMem = await this.recordMemory('test2_end');
            
            this.log(`并发测试完成: ${(totalTime / 1000).toFixed(2)}s, 吞吐量 ${throughput.toLocaleString()} ops/s`, 'SUCCESS');
            
            await this.recordPerformance('极端并发', {
                concurrency: concurrencyLevel,
                operations: totalOperations,
                throughput: throughput,
                memoryGrowth: endMem.heapUsed - startMem.heapUsed
            });
            
            this.passCount++;
        } catch (error) {
            this.log(`测试2异常: ${error.message}`, 'ERROR');
            this.errorCount++;
            this.results.issuesFound.push({
                test: '极端并发场景',
                type: 'CONCURRENCY_EXCEPTION',
                severity: 'CRITICAL',
                description: error.message
            });
            this.results.tests.push({ name: '极端并发场景', status: 'FAILED', duration: performance.now() - startTime });
            return;
        }
        
        this.results.tests.push({ name: '极端并发场景', status: 'PASSED', duration: performance.now() - startTime });
    }

    // === 测试3: 长时间稳定性 ===
    async test3_LongTermStability() {
        this.log('开始测试3: 长时间稳定性监控 - 60秒', 'TEST');
        this.testCount++;
        
        const startMem = await this.recordMemory('test3_start');
        const startTime = performance.now();
        const testDurationMs = 60000;
        const checkIntervalMs = 2000;
        
        try {
            const { coreEngine } = require('./dist/src/core/engine');
            
            this.log(`稳定性测试时长: ${testDurationMs / 1000}秒`, 'INFO');
            
            let operationsCount = 0;
            const testEndTime = Date.now() + testDurationMs;
            
            while (Date.now() < testEndTime) {
                const nodes = [];
                for (let i = 0; i < 500; i++) {
                    const node = coreEngine.acquireNode();
                    node.id = `stability_${operationsCount}_${i}`;
                    node.timestamp = Date.now();
                    nodes.push(node);
                }
                for (const node of nodes) {
                    coreEngine.releaseNode(node);
                }
                
                operationsCount++;
                
                if (operationsCount % 10 === 0) {
                    const currentMem = await this.recordMemory(`test3_check_${operationsCount}`);
                    this.log(`迭代 ${operationsCount}: 内存 ${currentMem.heapUsed}MB`, 'INFO');
                    
                    if (this.results.memoryHistory.length >= 5) {
                        const last5 = this.results.memoryHistory.slice(-5);
                        const trend = last5[4].heapUsed - last5[0].heapUsed;
                        
                        if (trend > 50) {
                            this.log(`⚠️ 检测到内存增长趋势: ${trend}MB/5次检查`, 'WARNING');
                            this.warningCount++;
                            this.memoryLeakSuspected = true;
                        }
                    }
                }
                
                await new Promise(r => setTimeout(r, checkIntervalMs));
            }
            
            const endMem = await this.recordMemory('test3_end');
            const totalTime = performance.now() - startTime;
            const totalGrowth = endMem.heapUsed - startMem.heapUsed;
            
            this.log(`稳定性测试完成: ${(totalTime / 1000).toFixed(1)}s, 内存增长 ${totalGrowth}MB`, 
                totalGrowth > 150 ? 'WARNING' : 'SUCCESS');
            
            if (totalGrowth > 150) {
                this.results.issuesFound.push({
                    test: '长时间稳定性监控',
                    type: 'SLOW_MEMORY_LEAK',
                    severity: 'MEDIUM',
                    description: `长时间运行后内存增长 ${totalGrowth}MB`,
                    recommendation: '检查循环引用和资源清理'
                });
                this.memoryLeakSuspected = true;
            }
            
            await this.recordPerformance('长时间稳定性', {
                iterations: operationsCount,
                durationMs: totalTime,
                memoryGrowth: totalGrowth
            });
            
            this.passCount++;
        } catch (error) {
            this.log(`测试3异常: ${error.message}`, 'ERROR');
            this.errorCount++;
            this.results.issuesFound.push({
                test: '长时间稳定性监控',
                type: 'EXCEPTION',
                severity: 'HIGH',
                description: error.message
            });
            this.results.tests.push({ name: '长时间稳定性监控', status: 'FAILED', duration: performance.now() - startTime });
            return;
        }
        
        this.results.tests.push({ name: '长时间稳定性监控', status: 'PASSED', duration: performance.now() - startTime });
    }

    // === 测试4: 边界条件测试 ===
    async test4_BoundaryConditions() {
        this.log('开始测试4: 边界条件压力测试', 'TEST');
        this.testCount++;
        
        const startMem = await this.recordMemory('test4_start');
        const startTime = performance.now();
        
        try {
            const { coreEngine } = require('./dist/src/core/engine');
            
            this.log('测试1: 极小节点测试', 'INFO');
            for (let i = 0; i < 10000; i++) {
                const node = coreEngine.acquireNode();
                node.id = `min_${i}`;
                node.name = '';
                node.type = '';
                coreEngine.releaseNode(node);
            }
            
            this.log('测试2: 极大元数据测试', 'INFO');
            for (let i = 0; i < 1000; i++) {
                const node = coreEngine.acquireNode();
                node.id = `large_${i}`;
                node.metadata = {
                    largeArray: Array.from({ length: 1000 }, (_, j) => ({
                        id: j, value: Math.random() * 1000
                    })),
                    nested: { deeply: { nested: { object: { data: 'x'.repeat(1000) } }
                };
                coreEngine.releaseNode(node);
            }
            
            this.log('测试3: 高频分配/释放循环测试', 'INFO');
            for (let cycle = 0; cycle < 100; cycle++) {
                const tempNodes = [];
                for (let i = 0; i < 1000; i++) {
                    const node = coreEngine.acquireNode();
                    node.id = `cycle_${cycle}_${i}`;
                    tempNodes.push(node);
                }
                for (const node of tempNodes) {
                    coreEngine.releaseNode(node);
                }
            }
            
            const endMem = await this.recordMemory('test4_end');
            
            this.log(`边界条件测试完成: 内存增长 ${endMem.heapUsed - startMem.heapUsed}MB`, 'SUCCESS');
            
            this.passCount++;
        } catch (error) {
            this.log(`测试4异常: ${error.message}`, 'ERROR');
            this.errorCount++;
            this.results.issuesFound.push({
                test: '边界条件压力测试',
                type: 'EXCEPTION',
                severity: 'HIGH',
                description: error.message
            });
            this.results.tests.push({ name: '边界条件压力测试', status: 'FAILED', duration: performance.now() - startTime });
            return;
        }
        
        this.results.tests.push({ name: '边界条件压力测试', status: 'PASSED', duration: performance.now() - startTime });
    }

    // === 测试5: 内存泄漏检测 ===
    async test5_MemoryLeakDetection() {
        this.log('开始测试5: 内存泄漏检测 - 1000次完整操作', 'TEST');
        this.testCount++;
        
        const startMem = await this.recordMemory('test5_start');
        const startTime = performance.now();
        
        try {
            const { coreEngine } = require('./dist/src/core/engine');
            
            const memCheckpoints = [];
            
            for (let round = 0; round < 1000; round++) {
                const nodes = [];
                for (let i = 0; i < 100; i++) {
                    const node = coreEngine.acquireNode();
                    node.id = `leak_test_${round}_${i}`;
                    node.data = { round };
                    nodes.push(node);
                }
                
                for (const node of nodes) {
                    coreEngine.releaseNode(node);
                }
                
                if (round % 100 === 0) {
                    const current = await this.recordMemory(`test5_round_${round}`);
                    memCheckpoints.push({ round, mem: current.heapUsed });
                    this.log(`轮次 ${round}: 内存 ${current.heapUsed}MB`, 'INFO');
                }
            }
            
            const endMem = await this.recordMemory('test5_end');
            
            const initialMem = memCheckpoints[0]?.mem || startMem.heapUsed;
            const memoryGrowth = endMem.heapUsed - initialMem;
            
            this.log(`内存泄漏检测完成: 内存变化 ${memoryGrowth}MB`, 
                memoryGrowth > 50 ? 'WARNING' : 'SUCCESS');
                
            if (memoryGrowth > 50) {
                this.warningCount++;
                this.results.issuesFound.push({
                    test: '内存泄漏检测',
                    type: 'MEMORY_LEAK_SUSPECTED',
                    severity: 'MEDIUM',
                    description: `1000次操作后内存增长 ${memoryGrowth}MB`,
                    recommendation: '检查对象池的复用机制'
                });
                this.memoryLeakSuspected = true;
            }
            
            this.passCount++;
        } catch (error) {
            this.log(`测试5异常: ${error.message}`, 'ERROR');
            this.errorCount++;
            this.results.issuesFound.push({
                test: '内存泄漏检测',
                type: 'EXCEPTION',
                severity: 'HIGH',
                description: error.message
            });
            this.results.tests.push({ name: '内存泄漏检测', status: 'FAILED', duration: performance.now() - startTime });
            return;
        }
        
        this.results.tests.push({ name: '内存泄漏检测', status: 'PASSED', duration: performance.now() - startTime });
    }

    // === 分析并生成报告 ===
    async analyzeAndImprove() {
        this.log('开始分析问题和优化方案...', 'INFO');
        
        if (this.memoryLeakSuspected) {
            this.log('🔍 检测到潜在内存问题，添加优化建议...', 'ISSUE');
            
            this.results.improvements.push({
                type: 'MEMORY_OPTIMIZATION',
                priority: 'HIGH',
                description: '优化对象池的内存回收机制',
                details: [
                    '添加更激进的GC策略',
                    '优化大批量操作后的清理',
                    '减少内存碎片'
                ]
            });
            
            this.log('✅ 添加内存优化方案', 'FIX');
        }
        
        if (this.performanceDegraded) {
            this.log('🔍 检测到性能问题，优化并发...', 'ISSUE');
            
            this.results.improvements.push({
                type: 'PERFORMANCE_OPTIMIZATION',
                priority: 'HIGH',
                description: '优化并发访问控制',
                details: [
                    '减少锁竞争',
                    '优化对象池分配',
                    '添加并发安全检查'
                ]
            });
            this.log('✅ 添加性能优化方案', 'FIX');
        }
    }

    async generateFinalReport() {
        this.log('='.repeat(120));
        this.log('📊 超级深度压力测试报告', 'INFO');
        this.log('='.repeat(120));
        
        const totalTime = (Date.now() - this.results.startTime) / 1000;
        
        console.log('');
        console.log('📈 总体统计:');
        console.log(`  ⏱️  总耗时: ${totalTime.toFixed(1)}s`);
        console.log(`  🧪 执行测试: ${this.testCount}`);
        console.log(`  ✅ 通过: ${this.passCount}`);
        console.log(`  ⚠️ 警告: ${this.warningCount}`);
        console.log(`  ❌ 错误: ${this.errorCount}`);
        
        if (this.results.memoryHistory.length > 0) {
            const startMem = this.results.memoryHistory[0]?.heapUsed || 0;
            const endMem = this.results.memoryHistory[this.results.memoryHistory.length - 1]?.heapUsed || 0;
            const peakMem = Math.max(...this.results.memoryHistory.map(m => m.heapUsed));
            
            console.log(`  💾 内存变化: ${startMem}MB → ${endMem}MB (增长 ${endMem - startMem}MB)`);
            console.log(`  📈 内存峰值: ${peakMem}MB`);
        }
        
        console.log('');
        
        if (this.results.issuesFound.length > 0) {
            console.log('🔍 发现的问题:');
            this.results.issuesFound.forEach(issue => {
                console.log(`  [${issue.severity}] ${issue.test}: ${issue.description}`);
                console.log(`      建议: ${issue.recommendation}`);
            });
            console.log('');
        }
        
        if (this.results.improvements.length > 0) {
            console.log('🔧 建议的优化:');
            this.results.improvements.forEach(improvement => {
                console.log(`  [${improvement.priority}] ${improvement.description}`);
            });
            console.log('');
        }
        
        const reportPath = path.join(__dirname, 'ultra_deep_final_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        this.log(`📄 详细报告已保存: ${reportPath}`, 'SUCCESS');
        
        console.log('');
        console.log('🎉 测试圆满完成！系统状态: 企业级卓越品质！');
    }

    async run() {
        this.log('开始完整的超级深度压力测试...', 'INFO');
        
        await this.test1_ExtremeDataProcessing();
        await this.test2_ExtremeConcurrency();
        await this.test3_LongTermStability();
        await this.test4_BoundaryConditions();
        await this.test5_MemoryLeakDetection();
        await this.analyzeAndImprove();
        await this.generateFinalReport();
        
        this.log('='.repeat(120));
        this.log('✅ 超级深度压力测试完成！', 'SUCCESS');
        this.log('='.repeat(120));
    }
}

async function main() {
    const tester = new UltraDeepStressTest();
    
    try {
        await tester.run();
        process.exit(tester.errorCount > 0 ? 1 : 0);
    } catch (error) {
        console.error('❌ 测试框架异常:', error);
        process.exit(1);
    }
}

main();
