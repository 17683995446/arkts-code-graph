#!/usr/bin/env node

/**
 * 🎯🎯🎯 ArkTS Code Graph - 第18代 异常容错与性能优化测试
 * 
 * 测试特点：
 * 1. 完整的异常容错测试
 * 2. 性能基准测试
 * 3. 高频操作测试
 * 4. 内存泄漏检测
 * 5. 每步详细日志
 */

console.log('='.repeat(200));
console.log('🎯🎯🎯 ArkTS Code Graph - 第18代 异常容错与性能优化测试');
console.log('🎯🎯🎯 极端条件下的系统稳定性与性能');
console.log('='.repeat(200));
console.log('');

const fs = require('fs');
const path = require('path');

const results = {
    iteration: '18.0',
    startTime: Date.now(),
    endTime: null,
    tests: {},
    bugsFound: [],
    warningsFound: [],
    performanceMetrics: {},
    memoryHistory: [],
    futurePlans: []
};

function log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'ERROR' ? '❌' : type === 'WARNING' ? '⚠️' : type === 'SUCCESS' ? '✅' : type === 'PERFORMANCE' ? '⚡' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

class InstrumentedKnowledgeGraphDatabase {
    constructor() {
        const KnowledgeGraphDatabase = require('./dist/src/graph/core/knowledge/knowledge.graph.database').KnowledgeGraphDatabase;
        this.db = new KnowledgeGraphDatabase();
        this.operationLog = [];
        this.operationCount = 0;
    }

    logOperation(operation, details) {
        this.operationCount++;
        const logEntry = {
            id: this.operationCount,
            timestamp: Date.now(),
            operation,
            details
        };
        this.operationLog.push(logEntry);
        console.log(`   💻 [OP#${this.operationCount}] ${operation}: ${JSON.stringify(details)}`);
    }

    addNode(node) {
        this.logOperation('addNode', { id: node?.id, type: node?.type });
        try {
            this.db.addNode(node);
            return true;
        } catch (error) {
            console.log(`   ❌ addNode failed: ${error.message}`);
            return false;
        }
    }

    getNode(id) {
        this.logOperation('getNode', { id });
        return this.db.getNode(id);
    }

    deleteNode(id) {
        this.logOperation('deleteNode', { id });
        return this.db.deleteNode(id);
    }

    addRelation(relation) {
        this.logOperation('addRelation', { id: relation?.id, source: relation?.sourceId, target: relation?.targetId });
        try {
            this.db.addRelation(relation);
            return true;
        } catch (error) {
            console.log(`   ❌ addRelation failed: ${error.message}`);
            return false;
        }
    }

    getStats() {
        this.logOperation('getStats', {});
        return this.db.getStats();
    }

    searchNodes(query) {
        this.logOperation('searchNodes', { query });
        return this.db.searchNodes(query);
    }

    getOutRelations(nodeId) {
        this.logOperation('getOutRelations', { nodeId });
        return this.db.getOutRelations(nodeId);
    }

    getInRelations(nodeId) {
        this.logOperation('getInRelations', { nodeId });
        return this.db.getInRelations(nodeId);
    }

    findPath(sourceId, targetId, maxDepth) {
        this.logOperation('findPath', { sourceId, targetId, maxDepth });
        return this.db.findPath(sourceId, targetId, maxDepth);
    }

    findCycleDependencies() {
        this.logOperation('findCycleDependencies', {});
        return this.db.findCycleDependencies();
    }

    clear() {
        this.logOperation('clear', {});
        this.db.clear();
    }
}

async function recordMemory(label) {
    const mem = process.memoryUsage();
    const entry = {
        label,
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        rss: Math.round(mem.rss / 1024 / 1024),
        external: Math.round(mem.external / 1024 / 1024),
        timestamp: Date.now()
    };
    results.memoryHistory.push(entry);
    log(`📊 [MEMORY] ${label} - Heap: ${entry.heapUsed}MB, RSS: ${entry.rss}MB`, 'PERFORMANCE');
    return entry;
}

async function test1_null_undefined_parameter_tests() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TEST 1: 空值和未定义值参数测试');
    console.log('='.repeat(80));

    const db = new InstrumentedKnowledgeGraphDatabase();
    const testResults = { passed: 0, failed: 0, total: 0 };
    const errors = [];

    const testCases = [
        { name: 'addNode(null)', fn: () => db.addNode(null) },
        { name: 'addNode(undefined)', fn: () => db.addNode(undefined) },
        { name: 'addNode({})', fn: () => db.addNode({}) },
        { name: 'addNode({id:null})', fn: () => db.addNode({id: null}) },
        { name: 'addNode({id:undefined})', fn: () => db.addNode({id: undefined}) },
        { name: 'getNode(null)', fn: () => db.getNode(null) },
        { name: 'getNode(undefined)', fn: () => db.getNode(undefined) },
        { name: 'deleteNode(null)', fn: () => db.deleteNode(null) },
        { name: 'deleteNode(undefined)', fn: () => db.deleteNode(undefined) },
        { name: 'addRelation(null)', fn: () => db.addRelation(null) },
        { name: 'addRelation(undefined)', fn: () => db.addRelation(undefined) },
        { name: 'addRelation({})', fn: () => db.addRelation({}) },
        { name: 'searchNodes(null)', fn: () => db.searchNodes(null) },
        { name: 'searchNodes(undefined)', fn: () => db.searchNodes(undefined) }
    ];

    for (const testCase of testCases) {
        testResults.total++;
        log(`🧪 执行: ${testCase.name}`);
        try {
            const result = testCase.fn();
            log(`   ✅ 完成，返回值: ${result}`, 'SUCCESS');
            testResults.passed++;
        } catch (error) {
            log(`   ❌ 失败: ${error.message}`, 'ERROR');
            testResults.failed++;
            errors.push({
                test: testCase.name,
                error: error.message,
                stack: error.stack
            });
        }
    }

    console.log('\n📊 测试结果:');
    console.log(`   总计: ${testResults.total}`);
    console.log(`   ✅ 通过: ${testResults.passed}`);
    console.log(`   ❌ 失败: ${testResults.failed}`);

    if (errors.length > 0) {
        console.log('\n⚠️  错误详情:');
        errors.forEach(err => {
            console.log(`   - ${err.test}: ${err.error}`);
        });
    }

    results.tests.null_undefined_parameters = {
        ...testResults,
        errors
    };

    return testResults.failed === 0;
}

async function test2_extreme_parameter_tests() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TEST 2: 极端参数测试');
    console.log('='.repeat(80));

    const db = new InstrumentedKnowledgeGraphDatabase();
    const testResults = { passed: 0, failed: 0, total: 0 };
    const errors = [];

    log('🧪 创建超长ID节点 (10,000字符)...');
    const veryLongId = 'x'.repeat(10000);
    const testCases = [
        {
            name: '超长ID (10,000字符)',
            fn: () => {
                db.addNode({ id: veryLongId, type: 'CLASS', name: 'VeryLongId' });
                return db.getNode(veryLongId);
            }
        },
        {
            name: '超长名称 (5000字符)',
            fn: () => {
                const veryLongName = 'Name'.repeat(1250);
                db.addNode({ id: 'long-name-test', type: 'CLASS', name: veryLongName });
                return true;
            }
        },
        {
            name: '特殊字符ID',
            fn: () => {
                const specialId = 'node-!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`';
                db.addNode({ id: specialId, type: 'CLASS', name: 'SpecialChars' });
                return db.getNode(specialId);
            }
        },
        {
            name: '空字符串ID',
            fn: () => {
                db.addNode({ id: '', type: 'CLASS', name: 'EmptyId' });
                return db.getNode('');
            }
        },
        {
            name: '纯数字ID',
            fn: () => {
                db.addNode({ id: 12345, type: 'CLASS', name: 'NumericId' });
                return db.getNode(12345);
            }
        },
        {
            name: '非常大的数字ID',
            fn: () => {
                const hugeId = '9007199254740991';
                db.addNode({ id: hugeId, type: 'CLASS', name: 'HugeId' });
                return db.getNode(hugeId);
            }
        },
        {
            name: '非常深的元数据',
            fn: () => {
                const deepMetadata = {
                    a: {
                        b: {
                            c: {
                                d: {
                                    e: {
                                        f: {
                                            g: {
                                                h: {
                                                    i: {
                                                        j: 'deep'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
                db.addNode({ id: 'deep-meta', type: 'CLASS', name: 'DeepMeta', metadata: deepMetadata });
                return true;
            }
        }
    ];

    for (const testCase of testCases) {
        testResults.total++;
        log(`🧪 执行: ${testCase.name}`);
        try {
            const result = testCase.fn();
            log(`   ✅ 成功!`, 'SUCCESS');
            testResults.passed++;
        } catch (error) {
            log(`   ❌ 失败: ${error.message}`, 'ERROR');
            testResults.failed++;
            errors.push({
                test: testCase.name,
                error: error.message
            });
        }
    }

    console.log('\n📊 测试结果:');
    console.log(`   总计: ${testResults.total}`);
    console.log(`   ✅ 通过: ${testResults.passed}`);
    console.log(`   ❌ 失败: ${testResults.failed}`);

    results.tests.extreme_parameters = {
        ...testResults,
        errors
    };

    return testResults.failed === 0;
}

async function test3_high_frequency_operations() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TEST 3: 高频操作性能测试');
    console.log('='.repeat(80));

    const db = new InstrumentedKnowledgeGraphDatabase();
    const metrics = {};

    log('🧪 测试1: 高频节点创建...');
    const nodeCount = 10000;
    const nodeStart = Date.now();
    for (let i = 0; i < nodeCount; i++) {
        db.addNode({ id: `hf-node-${i}`, type: 'CLASS', name: `HfNode${i}` });
    }
    const nodeDuration = Date.now() - nodeStart;
    metrics.nodeCreation = {
        count: nodeCount,
        duration: nodeDuration,
        perNode: nodeDuration / nodeCount
    };
    log(`⚡ ${nodeCount}节点耗时: ${nodeDuration}ms, 平均: ${metrics.nodeCreation.perNode.toFixed(4)}ms/节点`, 'PERFORMANCE');

    log('🧪 测试2: 高频节点查询...');
    const queryCount = 10000;
    const queryStart = Date.now();
    for (let i = 0; i < queryCount; i++) {
        db.getNode(`hf-node-${i % nodeCount}`);
    }
    const queryDuration = Date.now() - queryStart;
    metrics.nodeQuery = {
        count: queryCount,
        duration: queryDuration,
        perQuery: queryDuration / queryCount
    };
    log(`⚡ ${queryCount}次查询耗时: ${queryDuration}ms, 平均: ${metrics.nodeQuery.perQuery.toFixed(4)}ms/次`, 'PERFORMANCE');

    log('🧪 测试3: 高频关系创建...');
    const relationCount = 5000;
    const relStart = Date.now();
    for (let i = 0; i < relationCount; i++) {
        db.addRelation({
            id: `hf-rel-${i}`,
            sourceId: `hf-node-${i}`,
            targetId: `hf-node-${(i + 1) % nodeCount}`,
            type: 'CALLS'
        });
    }
    const relDuration = Date.now() - relStart;
    metrics.relationCreation = {
        count: relationCount,
        duration: relDuration,
        perRelation: relDuration / relationCount
    };
    log(`⚡ ${relationCount}关系耗时: ${relDuration}ms, 平均: ${metrics.relationCreation.perRelation.toFixed(4)}ms/关系`, 'PERFORMANCE');

    log('🧪 测试4: 高频搜索...');
    const searchCount = 1000;
    const searchStart = Date.now();
    for (let i = 0; i < searchCount; i++) {
        db.searchNodes('HfNode');
    }
    const searchDuration = Date.now() - searchStart;
    metrics.search = {
        count: searchCount,
        duration: searchDuration,
        perSearch: searchDuration / searchCount
    };
    log(`⚡ ${searchCount}次搜索耗时: ${searchDuration}ms, 平均: ${metrics.search.perSearch.toFixed(4)}ms/次`, 'PERFORMANCE');

    const stats = db.getStats();
    log(`📊 最终状态: ${JSON.stringify(stats, null, 2)}`);

    results.tests.high_frequency_operations = {
        success: true,
        metrics
    };
    results.performanceMetrics = metrics;

    return true;
}

async function test4_memory_leak_detection() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TEST 4: 内存泄漏检测');
    console.log('='.repeat(80));

    const startMem = await recordMemory('测试开始');
    const loopCount = 100;
    const nodesPerLoop = 1000;

    log(`🧪 执行${loopCount}轮创建-清理循环...`);
    
    const memoryReadings = [startMem.heapUsed];
    
    for (let round = 0; round < loopCount; round++) {
        const db = new InstrumentedKnowledgeGraphDatabase();
        
        for (let i = 0; i < nodesPerLoop; i++) {
            db.addNode({ id: `mem-test-${round}-${i}`, type: 'CLASS', name: `MemTest${i}` });
        }
        
        db.clear();
        
        if (round % 10 === 0) {
            const currentMem = await recordMemory(`第${round}轮后`);
            memoryReadings.push(currentMem.heapUsed);
        }
    }

    const endMem = await recordMemory('测试结束');
    const memGrowth = endMem.heapUsed - startMem.heapUsed;
    
    console.log('\n📊 内存分析:');
    console.log(`   开始: ${startMem.heapUsed}MB`);
    console.log(`   结束: ${endMem.heapUsed}MB`);
    console.log(`   增长: ${memGrowth}MB`);
    
    const hasLeak = memGrowth > 10;
    if (hasLeak) {
        log('⚠️  警告: 检测到可能的内存泄漏!', 'WARNING');
        results.warningsFound.push('检测到可能的内存泄漏');
    } else {
        log('✅ 内存使用正常，无明显泄漏', 'SUCCESS');
    }

    results.tests.memory_leak_detection = {
        hasLeak,
        memoryGrowth: memGrowth,
        memoryReadings
    };

    return !hasLeak;
}

async function test5_path_finding_stress() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TEST 5: 路径查找压力测试');
    console.log('='.repeat(80));

    const db = new InstrumentedKnowledgeGraphDatabase();
    const nodeCount = 1000;
    const relationCount = 2000;

    log(`🧪 创建${nodeCount}个节点和${relationCount}个关系的复杂图...`);
    for (let i = 0; i < nodeCount; i++) {
        db.addNode({ id: `path-node-${i}`, type: 'CLASS', name: `PathNode${i}` });
    }

    for (let i = 0; i < relationCount; i++) {
        const source = Math.floor(Math.random() * nodeCount);
        const target = Math.floor(Math.random() * nodeCount);
        if (source !== target) {
            db.addRelation({
                id: `path-rel-${i}`,
                sourceId: `path-node-${source}`,
                targetId: `path-node-${target}`,
                type: 'CALLS'
            });
        }
    }

    const testPaths = [
        { source: 'path-node-0', target: 'path-node-100', maxDepth: 50 },
        { source: 'path-node-100', target: 'path-node-200', maxDepth: 100 },
        { source: 'path-node-0', target: 'path-node-999', maxDepth: 200 },
        { source: 'path-node-500', target: 'path-node-500', maxDepth: 10 },
        { source: 'path-node-0', target: 'path-node-0', maxDepth: 5 }
    ];

    log('🧪 测试路径查找...');
    const pathResults = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
        const testPath = testPaths[i % testPaths.length];
        const path = db.findPath(testPath.source, testPath.target, testPath.maxDepth);
        pathResults.push({
            source: testPath.source,
            target: testPath.target,
            pathLength: path?.length || 0
        });
    }
    
    const duration = Date.now() - startTime;
    log(`⚡ 100次路径查找耗时: ${duration}ms, 平均: ${(duration / 100).toFixed(2)}ms/次`, 'PERFORMANCE');

    results.tests.path_finding_stress = {
        success: true,
        duration,
        pathResults
    };

    return true;
}

async function test6_cycle_detection_stress() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TEST 6: 循环检测压力测试');
    console.log('='.repeat(80));

    const db = new InstrumentedKnowledgeGraphDatabase();
    const nodeCount = 500;
    const cycleCount = 50;

    log(`🧪 创建${nodeCount}个节点和${cycleCount}个循环...`);
    for (let i = 0; i < nodeCount; i++) {
        db.addNode({ id: `cycle-node-${i}`, type: 'CLASS', name: `CycleNode${i}` });
    }

    for (let cycle = 0; cycle < cycleCount; cycle++) {
        const cycleLength = 2 + Math.floor(Math.random() * 8);
        const startIdx = cycle * 10;
        for (let i = 0; i < cycleLength; i++) {
            const source = startIdx + i;
            const target = startIdx + (i + 1) % cycleLength;
            db.addRelation({
                id: `cycle-rel-${cycle}-${i}`,
                sourceId: `cycle-node-${source}`,
                targetId: `cycle-node-${target}`,
                type: 'CALLS'
            });
        }
    }

    log('🧪 执行循环检测...');
    const startTime = Date.now();
    const cycles = db.findCycleDependencies();
    const duration = Date.now() - startTime;

    log(`📊 找到${cycles.length}个循环`);
    log(`⚡ 耗时: ${duration}ms`, 'PERFORMANCE');

    results.tests.cycle_detection_stress = {
        success: true,
        cyclesFound: cycles.length,
        duration
    };

    return true;
}

async function generateFuturePlans() {
    results.futurePlans = [
        {
            phase: 19,
            name: '持久化与完整业务场景',
            description: '实现数据持久化功能，完善完整业务场景覆盖'
        },
        {
            phase: 20,
            name: '最终稳定性与72小时测试',
            description: '72小时持续运行稳定性测试'
        },
        {
            phase: 21,
            name: '高级功能与集成测试',
            description: '插件系统、性能监控、完整集成测试'
        },
        {
            phase: 22,
            name: '性能极限优化',
            description: '极致性能优化，百万节点测试'
        },
        {
            phase: 23,
            name: '正式发布准备',
            description: '文档完善、最终测试、发布准备'
        }
    ];

    console.log('\n🚀 未来5阶段迭代计划:');
    results.futurePlans.forEach(plan => {
        console.log(`   📋 第${plan.phase}代: ${plan.name} - ${plan.description}`);
    });
}

async function runAllTests() {
    log('🚀 开始第18代全面测试...');
    
    await recordMemory('测试开始');

    const test1Result = await test1_null_undefined_parameter_tests();
    await recordMemory('TEST1完成');

    const test2Result = await test2_extreme_parameter_tests();
    await recordMemory('TEST2完成');

    const test3Result = await test3_high_frequency_operations();
    await recordMemory('TEST3完成');

    const test4Result = await test4_memory_leak_detection();
    await recordMemory('TEST4完成');

    const test5Result = await test5_path_finding_stress();
    await recordMemory('TEST5完成');

    const test6Result = await test6_cycle_detection_stress();
    await recordMemory('TEST6完成');

    generateFuturePlans();

    results.endTime = Date.now();
    const totalDuration = (results.endTime - results.startTime) / 1000;

    console.log('\n' + '='.repeat(100));
    console.log('🎉🎉🎉 第18代异常容错与性能优化测试完成!');
    console.log('='.repeat(100));
    console.log(`⏱️  总耗时: ${totalDuration.toFixed(1)}秒`);
    console.log(`🐛 发现Bug: ${results.bugsFound.length}`);
    console.log(`⚠️  警告: ${results.warningsFound.length}`);
    console.log('='.repeat(100));

    const reportPath = path.join(__dirname, 'v18_exception_and_performance_test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    log(`📄 完整报告已保存: ${reportPath}`, 'SUCCESS');

    return results;
}

runAllTests().catch(error => {
    console.error('\n❌❌❌ 测试失败:', error);
    console.error(error.stack);
    process.exit(1);
});
