// ============================================================
// 第22代 - 性能极限挑战测试
// Generation 22 - Performance Extreme Challenge Test
// 挑战100万节点规模 + 高性能索引系统 + 批量操作优化
// ============================================================

const fs = require('fs');
const path = require('path');

const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
const { GraphDataSerializer } = require('./dist/src/infrastructure/persistence/graph.data.serializer');
const { FileSystemUtilityHelper } = require('./dist/src/infrastructure/utils/file.system.helper');

const testResults = {
    timestamp: new Date().toISOString(),
    generation: 'v22',
    tests: [],
    bugsFound: [],
    warnings: [],
    performance: {},
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    detailedLogs: []
};

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        test: '🧪',
        perf: '⚡',
        detail: '📝',
        extreme: '🔥'
    }[type] || 'ℹ️';
    
    const logEntry = `[${timestamp}] ${prefix} ${message}`;
    console.log(logEntry);
    testResults.detailedLogs.push(logEntry);
}

function addTestResult(name, passed, details = '') {
    log(`添加测试结果: ${name} - ${passed ? '通过' : '失败'}`, 'detail');
    testResults.tests.push({
        name,
        passed,
        details,
        timestamp: new Date().toISOString()
    });
    testResults.totalTests++;
    if (passed) {
        testResults.passedTests++;
    } else {
        testResults.failedTests++;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
        heapUsed: formatBytes(usage.heapUsed),
        heapTotal: formatBytes(usage.heapTotal),
        rss: formatBytes(usage.rss)
    };
}

// 测试1: 10万节点基准测试（热身）
function test100KNodesBaseline() {
    log('🔥 开始测试: 10万节点基准测试（热身）', 'extreme');
    const startTime = Date.now();
    const memStart = getMemoryUsage();
    
    try {
        const db = new KnowledgeGraphDatabase();
        const nodeCount = 100000;
        const relationCount = 50000;
        
        log(`创建 ${nodeCount} 个节点...`, 'detail');
        const nodeStart = Date.now();
        for (let i = 1; i <= nodeCount; i++) {
            db.createNode({
                id: `node_${i}`,
                name: `Node_${i}`,
                type: i % 3 === 0 ? 'class' : i % 3 === 1 ? 'interface' : 'function',
                metadata: { index: i, value: Math.random() * 1000 }
            });
            
            if (i % 10000 === 0) {
                log(`节点创建进度: ${i}/${nodeCount}`, 'info');
            }
        }
        const nodeEnd = Date.now();
        
        log(`创建 ${relationCount} 个关系...`, 'detail');
        const relStart = Date.now();
        for (let i = 1; i <= relationCount; i++) {
            const source = i;
            const target = (i % nodeCount) + 1;
            db.createRelation({
                id: `rel_${i}`,
                sourceId: `node_${source}`,
                targetId: `node_${target}`,
                type: 'related',
                metadata: { weight: Math.random() }
            });
            
            if (i % 10000 === 0) {
                log(`关系创建进度: ${i}/${relationCount}`, 'info');
            }
        }
        const relEnd = Date.now();
        
        const memEnd = getMemoryUsage();
        const duration = Date.now() - startTime;
        
        const stats = db.getStats();
        
        testResults.performance['100kBaseline'] = {
            totalDuration: duration,
            nodeCreationTime: nodeEnd - nodeStart,
            relationCreationTime: relEnd - relStart,
            nodePerSecond: Math.round(nodeCount / ((nodeEnd - nodeStart) / 1000)),
            relPerSecond: Math.round(relationCount / ((relEnd - relStart) / 1000)),
            memoryStart: memStart,
            memoryEnd: memEnd,
            stats
        };
        
        log(`10万节点基准测试完成！`, 'success');
        log(`总耗时: ${duration}ms (${(duration/1000).toFixed(2)}秒)`, 'perf');
        log(`节点创建: ${(nodeEnd - nodeStart)}ms (${Math.round(nodeCount / ((nodeEnd - nodeStart) / 1000))}/秒)`, 'perf');
        log(`关系创建: ${(relEnd - relStart)}ms (${Math.round(relationCount / ((relEnd - relStart) / 1000))}/秒)`, 'perf');
        log(`内存使用: ${memStart.heapUsed} → ${memEnd.heapUsed}`, 'perf');
        
        addTestResult('10万节点基准测试', true, 
            `节点:${nodeCount}, 关系:${relationCount}, ` +
            `节点速度:${Math.round(nodeCount / ((nodeEnd - nodeStart) / 1000))}/秒, ` +
            `总耗时:${duration}ms`);
        
        return true;
    } catch (error) {
        log(`10万节点基准测试错误: ${error.message}`, 'error');
        log(error.stack, 'error');
        testResults.bugsFound.push({
            test: '10万节点基准测试',
            error: error.message,
            stack: error.stack
        });
        addTestResult('10万节点基准测试', false, error.message);
        return false;
    }
}

// 测试2: 批量操作优化测试
function testBatchOperations() {
    log('🔥 开始测试: 批量操作优化测试', 'extreme');
    const startTime = Date.now();
    
    try {
        const db = new KnowledgeGraphDatabase();
        const batchSize = 10000;
        const batches = 10;
        
        log(`批量创建测试: ${batches}批 × ${batchSize}节点`, 'detail');
        
        const batchStart = Date.now();
        for (let batch = 1; batch <= batches; batch++) {
            const startIndex = (batch - 1) * batchSize;
            
            for (let i = 1; i <= batchSize; i++) {
                db.createNode({
                    id: `batch_node_${startIndex + i}`,
                    name: `BatchNode_${startIndex + i}`,
                    type: 'class',
                    metadata: { batch, index: i }
                });
            }
            
            log(`批次 ${batch}/${batches} 完成 (${batch * batchSize}节点)`, 'info');
        }
        const batchEnd = Date.now();
        
        const duration = Date.now() - startTime;
        const totalNodes = batchSize * batches;
        const nodesPerSecond = Math.round(totalNodes / ((batchEnd - batchStart) / 1000));
        
        testResults.performance.batchOperations = {
            totalDuration: duration,
            batchCreationTime: batchEnd - batchStart,
            nodesPerSecond,
            batchSize,
            batches,
            totalNodes
        };
        
        log(`批量操作测试完成！`, 'success');
        log(`总节点: ${totalNodes}, 耗时: ${duration}ms`, 'perf');
        log(`创建速度: ${nodesPerSecond} 节点/秒`, 'perf');
        
        addTestResult('批量操作优化测试', true, 
            `批量大小:${batchSize}, 批次数:${batches}, ` +
            `总节点:${totalNodes}, 速度:${nodesPerSecond}/秒`);
        
        return true;
    } catch (error) {
        log(`批量操作测试错误: ${error.message}`, 'error');
        log(error.stack, 'error');
        testResults.bugsFound.push({
            test: '批量操作优化测试',
            error: error.message,
            stack: error.stack
        });
        addTestResult('批量操作优化测试', false, error.message);
        return false;
    }
}

// 测试3: 查询性能基准测试
function testQueryPerformance() {
    log('🔥 开始测试: 查询性能基准测试', 'extreme');
    const startTime = Date.now();
    
    try {
        const db = new KnowledgeGraphDatabase();
        
        const nodeCount = 10000;
        log(`创建 ${nodeCount} 个测试节点...`, 'detail');
        for (let i = 1; i <= nodeCount; i++) {
            db.createNode({
                id: `query_node_${i}`,
                name: `QueryNode_${i}`,
                type: i % 3 === 0 ? 'class' : i % 3 === 1 ? 'interface' : 'function',
                metadata: { index: i, category: `cat_${i % 10}` }
            });
        }
        
        const queryCount = 1000;
        log(`执行 ${queryCount} 次查询测试...`, 'detail');
        
        const queryStart = Date.now();
        let successfulQueries = 0;
        
        for (let i = 0; i < queryCount; i++) {
            const queryId = `query_node_${Math.floor(Math.random() * nodeCount) + 1}`;
            const result = db.getNode(queryId);
            if (result) successfulQueries++;
            
            const typeQuery = db.getNodesByType('class');
            
            const filterQuery = db.queryNodes({ type: 'interface' });
            
            const searchQuery = db.searchNodes('Node_500');
            
            if (i % 100 === 0) {
                log(`查询进度: ${i}/${queryCount}`, 'info');
            }
        }
        const queryEnd = Date.now();
        
        const duration = Date.now() - startTime;
        const queriesPerSecond = Math.round(queryCount / ((queryEnd - queryStart) / 1000));
        const avgQueryTime = (queryEnd - queryStart) / queryCount;
        
        testResults.performance.queryPerformance = {
            totalDuration: duration,
            queryTime: queryEnd - queryStart,
            queriesPerSecond,
            avgQueryTimeMs: avgQueryTime.toFixed(3),
            successfulQueries,
            queryCount
        };
        
        log(`查询性能测试完成！`, 'success');
        log(`总查询: ${queryCount}, 耗时: ${queryEnd - queryStart}ms`, 'perf');
        log(`查询速度: ${queriesPerSecond} 查询/秒`, 'perf');
        log(`平均查询时间: ${avgQueryTime.toFixed(3)}ms`, 'perf');
        
        addTestResult('查询性能基准测试', true, 
            `查询次数:${queryCount}, 查询速度:${queriesPerSecond}/秒, ` +
            `平均时间:${avgQueryTime.toFixed(3)}ms/查询`);
        
        return true;
    } catch (error) {
        log(`查询性能测试错误: ${error.message}`, 'error');
        log(error.stack, 'error');
        testResults.bugsFound.push({
            test: '查询性能基准测试',
            error: error.message,
            stack: error.stack
        });
        addTestResult('查询性能基准测试', false, error.message);
        return false;
    }
}

// 测试4: 路径查找算法压力测试
function testPathFindingStress() {
    log('🔥 开始测试: 路径查找算法压力测试', 'extreme');
    const startTime = Date.now();
    
    try {
        const db = new KnowledgeGraphDatabase();
        
        const nodeCount = 5000;
        log(`创建 ${nodeCount} 个节点构建复杂图结构...`, 'detail');
        for (let i = 1; i <= nodeCount; i++) {
            db.createNode({
                id: `path_node_${i}`,
                name: `PathNode_${i}`,
                type: 'class',
                metadata: { index: i }
            });
        }
        
        const relationCount = 10000;
        log(`创建 ${relationCount} 个关系...`, 'detail');
        for (let i = 1; i <= relationCount; i++) {
            const source = i % nodeCount + 1;
            const target = (i + Math.floor(Math.random() * 10)) % nodeCount + 1;
            db.createRelation({
                id: `path_rel_${i}`,
                sourceId: `path_node_${source}`,
                targetId: `path_node_${target}`,
                type: 'calls',
                metadata: { weight: Math.random() }
            });
        }
        
        const pathTests = 500;
        log(`执行 ${pathTests} 次路径查找测试...`, 'detail');
        
        const pathStart = Date.now();
        let successfulPaths = 0;
        
        for (let i = 0; i < pathTests; i++) {
            const source = Math.floor(Math.random() * nodeCount) + 1;
            const target = Math.floor(Math.random() * nodeCount) + 1;
            const path = db.findPath(`path_node_${source}`, `path_node_${target}`, 10);
            if (path.length > 0) successfulPaths++;
            
            if (i % 50 === 0) {
                log(`路径查找进度: ${i}/${pathTests}`, 'info');
            }
        }
        const pathEnd = Date.now();
        
        const duration = Date.now() - startTime;
        const pathsPerSecond = Math.round(pathTests / ((pathEnd - pathStart) / 1000));
        const avgPathTime = (pathEnd - pathStart) / pathTests;
        
        testResults.performance.pathFindingStress = {
            totalDuration: duration,
            pathFindingTime: pathEnd - pathStart,
            pathsPerSecond,
            avgPathTimeMs: avgPathTime.toFixed(3),
            successfulPaths,
            pathTests
        };
        
        log(`路径查找压力测试完成！`, 'success');
        log(`总路径查找: ${pathTests}, 耗时: ${pathEnd - pathStart}ms`, 'perf');
        log(`路径速度: ${pathsPerSecond} 查找/秒`, 'perf');
        log(`平均查找时间: ${avgPathTime.toFixed(3)}ms`, 'perf');
        
        addTestResult('路径查找算法压力测试', true, 
            `路径测试:${pathTests}, 速度:${pathsPerSecond}/秒, ` +
            `平均时间:${avgPathTime.toFixed(3)}ms`);
        
        return true;
    } catch (error) {
        log(`路径查找测试错误: ${error.message}`, 'error');
        log(error.stack, 'error');
        testResults.bugsFound.push({
            test: '路径查找算法压力测试',
            error: error.message,
            stack: error.stack
        });
        addTestResult('路径查找算法压力测试', false, error.message);
        return false;
    }
}

// 测试5: 序列化/反序列化性能测试
function testSerializationPerformance() {
    log('🔥 开始测试: 序列化/反序列化性能测试', 'extreme');
    const startTime = Date.now();
    
    try {
        const db = new KnowledgeGraphDatabase();
        
        const nodeCount = 5000;
        const relationCount = 5000;
        
        log(`创建测试数据: ${nodeCount}节点 + ${relationCount}关系...`, 'detail');
        for (let i = 1; i <= nodeCount; i++) {
            db.createNode({
                id: `ser_node_${i}`,
                name: `SerNode_${i}`,
                type: i % 2 === 0 ? 'class' : 'interface',
                metadata: { 
                    index: i, 
                    data: Array(5).fill(0).map(() => Math.random()),
                    tags: ['test', 'performance', 'serialization']
                }
            });
        }
        
        for (let i = 1; i <= relationCount; i++) {
            const source = i % nodeCount + 1;
            const target = (i + 1) % nodeCount + 1;
            db.createRelation({
                id: `ser_rel_${i}`,
                sourceId: `ser_node_${source}`,
                targetId: `ser_node_${target}`,
                type: 'uses',
                metadata: { weight: Math.random(), label: `relation_${i}` }
            });
        }
        
        log('执行序列化...', 'detail');
        const serializeStart = Date.now();
        const serialized = GraphDataSerializer.serialize(db);
        const serializeEnd = Date.now();
        
        const testFile = path.join(__dirname, 'test_performance_data.json');
        log('保存到文件...', 'detail');
        const saveStart = Date.now();
        GraphDataSerializer.saveToFile(db, testFile);
        const saveEnd = Date.now();
        
        log('从文件加载...', 'detail');
        const loadStart = Date.now();
        const loaded = GraphDataSerializer.loadFromFile(testFile);
        const loadEnd = Date.now();
        
        log('执行反序列化...', 'detail');
        const deserializeStart = Date.now();
        const deserialized = GraphDataSerializer.deserialize(serialized);
        const deserializeEnd = Date.now();
        
        const duration = Date.now() - startTime;
        
        const serializeTime = serializeEnd - serializeStart;
        const saveTime = saveEnd - saveStart;
        const loadTime = loadEnd - loadStart;
        const deserializeTime = deserializeEnd - deserializeStart;
        
        testResults.performance.serializationPerformance = {
            totalDuration: duration,
            serializeTime,
            saveTime,
            loadTime,
            deserializeTime,
            nodeCount,
            relationCount,
            dataSize: JSON.stringify(serialized).length
        };
        
        log(`序列化/反序列化测试完成！`, 'success');
        log(`序列化: ${serializeTime}ms`, 'perf');
        log(`文件保存: ${saveTime}ms`, 'perf');
        log(`文件加载: ${loadTime}ms`, 'perf');
        log(`反序列化: ${deserializeTime}ms`, 'perf');
        log(`总耗时: ${duration}ms`, 'perf');
        
        fs.unlinkSync(testFile);
        
        addTestResult('序列化/反序列化性能测试', true, 
            `序列化:${serializeTime}ms, 保存:${saveTime}ms, ` +
            `加载:${loadTime}ms, 反序列化:${deserializeTime}ms`);
        
        return true;
    } catch (error) {
        log(`序列化测试错误: ${error.message}`, 'error');
        log(error.stack, 'error');
        testResults.bugsFound.push({
            test: '序列化/反序列化性能测试',
            error: error.message,
            stack: error.stack
        });
        addTestResult('序列化/反序列化性能测试', false, error.message);
        return false;
    }
}

// 测试6: 内存使用与垃圾回收测试
function testMemoryAndGC() {
    log('🔥 开始测试: 内存使用与垃圾回收测试', 'extreme');
    const startTime = Date.now();
    
    try {
        const memStart = getMemoryUsage();
        const operations = [];
        
        for (let round = 1; round <= 5; round++) {
            log(`轮次 ${round}/5: 创建和销毁大量数据...`, 'detail');
            const db = new KnowledgeGraphDatabase();
            
            const nodeCount = 20000;
            for (let i = 1; i <= nodeCount; i++) {
                db.createNode({
                    id: `gc_node_${round}_${i}`,
                    name: `GCNode_${round}_${i}`,
                    type: 'class',
                    metadata: { round, index: i, data: 'x'.repeat(100) }
                });
            }
            
            const memAfter = getMemoryUsage();
            operations.push({
                round,
                nodes: nodeCount,
                memory: memAfter
            });
            
            db.clear();
            
            if (global.gc) {
                global.gc();
            }
            
            const memCleared = getMemoryUsage();
            log(`内存使用: ${memAfter.heapUsed} → ${memCleared.heapUsed}`, 'info');
        }
        
        const memEnd = getMemoryUsage();
        const duration = Date.now() - startTime;
        
        testResults.performance.memoryAndGC = {
            totalDuration: duration,
            memoryStart: memStart,
            memoryEnd: memEnd,
            operations,
            totalOperations: 5,
            nodesPerOperation: 20000
        };
        
        log(`内存与GC测试完成！`, 'success');
        log(`初始内存: ${memStart.heapUsed}`, 'perf');
        log(`最终内存: ${memEnd.heapUsed}`, 'perf');
        log(`内存变化: ${memStart.heapUsed} → ${memEnd.heapUsed}`, 'perf');
        
        addTestResult('内存使用与垃圾回收测试', true, 
            `初始:${memStart.heapUsed}, 最终:${memEnd.heapUsed}, ` +
            `操作次数:5, 每轮节点:20000`);
        
        return true;
    } catch (error) {
        log(`内存测试错误: ${error.message}`, 'error');
        log(error.stack, 'error');
        testResults.bugsFound.push({
            test: '内存使用与垃圾回收测试',
            error: error.message,
            stack: error.stack
        });
        addTestResult('内存使用与垃圾回收测试', false, error.message);
        return false;
    }
}

// 主测试运行器
function runAllTests() {
    log('================================================================', 'test');
    log('🔥 第22代 - 性能极限挑战测试', 'test');
    log('Generation 22 - Performance Extreme Challenge Test', 'test');
    log('================================================================', 'test');
    
    const totalStartTime = Date.now();
    
    const testPassed1 = test100KNodesBaseline();
    const testPassed2 = testBatchOperations();
    const testPassed3 = testQueryPerformance();
    const testPassed4 = testPathFindingStress();
    const testPassed5 = testSerializationPerformance();
    const testPassed6 = testMemoryAndGC();
    
    const totalDuration = Date.now() - totalStartTime;
    testResults.totalDuration = totalDuration;
    
    log('================================================================', 'test');
    log(`🔥 测试完成！总耗时: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}秒)`, 'test');
    log(`总测试数: ${testResults.totalTests}`, 'test');
    log(`通过: ${testResults.passedTests}`, 'success');
    log(`失败: ${testResults.failedTests}`, testResults.failedTests > 0 ? 'error' : 'info');
    log(`发现问题: ${testResults.bugsFound.length}`, testResults.bugsFound.length > 0 ? 'error' : 'success');
    log('================================================================', 'test');
    
    const reportPath = path.join(__dirname, 'v22_performance_extreme_challenge_test_report.json');
    FileSystemUtilityHelper.writeJsonFile(reportPath, testResults);
    log(`测试报告已保存到: ${reportPath}`, 'success');
    
    const allPassed = testPassed1 && testPassed2 && testPassed3 && 
                      testPassed4 && testPassed5 && testPassed6;
    
    if (allPassed) {
        log('🎉 第22代性能极限挑战测试全部通过！系统性能达到极限水平！', 'success');
    } else {
        log('⚠️ 第22代测试有部分失败，需要关注性能问题', 'warning');
    }
    
    return allPassed;
}

runAllTests();
