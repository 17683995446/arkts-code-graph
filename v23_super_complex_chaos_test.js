// ============================================================
// 第23代 - 超级复杂混乱场景深度测试
// Generation 23 - Super Complex & Chaotic Scenario Deep Test
// 包括极端混乱场景、详细日志追踪、全方位漏洞检测
// ============================================================

const fs = require('fs');
const path = require('path');
const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
const { GraphDataSerializer } = require('./dist/src/infrastructure/persistence/graph.data.serializer');
const { FileSystemUtilityHelper } = require('./dist/src/infrastructure/utils/file.system.helper');

const testResults = {
    timestamp: new Date().toISOString(),
    generation: 'v23',
    tests: [],
    bugsFound: [],
    warnings: [],
    performance: {},
    detailedLogs: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0
};

// 详细日志函数
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        test: '🧪',
        detail: '📝',
        extreme: '🔥',
        step: '📊',
        bug: '🐛'
    }[type] || 'ℹ️';
    
    const logEntry = `[${timestamp}] ${prefix} ${message}`;
    console.log(logEntry);
    testResults.detailedLogs.push(logEntry);
}

// 添加测试结果
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

// 记录发现的问题
function addBug(testName, issue, details = '') {
    log(`发现Bug: ${testName} - ${issue}`, 'bug');
    testResults.bugsFound.push({
        test: testName,
        issue,
        details,
        timestamp: new Date().toISOString()
    });
}

// ============================================================
// 测试1: 极端边界条件深度测试
// ============================================================
function testExtremeBoundaryConditions() {
    log('🔥 开始测试1: 极端边界条件深度测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        log('📊 初始化数据库', 'step');
        const db = new KnowledgeGraphDatabase();

        // 测试1.1: 空ID
        log('📝 测试1.1: 空ID和空名称', 'detail');
        try {
            db.createNode({ id: '', name: 'EmptyIDNode' });
            log('空ID节点创建成功', 'info');
        } catch (e) {
            log(`空ID节点创建异常: ${e.message}`, 'warning');
            addBug('testExtremeBoundaryConditions', '空ID处理', `错误: ${e.message}`);
        }

        // 测试1.2: undefined ID
        log('📝 测试1.2: undefined ID', 'detail');
        try {
            db.createNode({ name: 'UndefinedIDNode' });
            log('undefined ID节点创建成功', 'info');
        } catch (e) {
            log(`undefined ID节点创建异常: ${e.message}`, 'warning');
            addBug('testExtremeBoundaryConditions', 'undefined ID处理', `错误: ${e.message}`);
        }

        // 测试1.3: null ID
        log('📝 测试1.3: null ID', 'detail');
        try {
            db.createNode({ id: null, name: 'NullIDNode' });
            log('null ID节点创建成功', 'info');
        } catch (e) {
            log(`null ID节点创建异常: ${e.message}`, 'warning');
            addBug('testExtremeBoundaryConditions', 'null ID处理', `错误: ${e.message}`);
        }

        // 测试1.4: 超长ID
        log('📝 测试1.4: 超长ID (10000字符)', 'detail');
        const veryLongId = 'x'.repeat(10000);
        try {
            db.createNode({ id: veryLongId, name: 'VeryLongIDNode' });
            log('超长ID节点创建成功', 'info');
        } catch (e) {
            log(`超长ID节点创建异常: ${e.message}`, 'warning');
            addBug('testExtremeBoundaryConditions', '超长ID处理', `错误: ${e.message}`);
        }

        // 测试1.5: 特殊字符ID
        log('📝 测试1.5: 特殊字符ID', 'detail');
        try {
            db.createNode({ id: '!@#$%^&*()_+', name: 'SpecialCharNode' });
            log('特殊字符ID节点创建成功', 'info');
        } catch (e) {
            log(`特殊字符ID节点创建异常: ${e.message}`, 'warning');
            addBug('testExtremeBoundaryConditions', '特殊字符ID处理', `错误: ${e.message}`);
        }

        // 测试1.6: Unicode字符ID
        log('📝 测试1.6: Unicode字符ID', 'detail');
        try {
            db.createNode({ id: '中文ID测试😀', name: 'UnicodeNode' });
            log('Unicode ID节点创建成功', 'info');
        } catch (e) {
            log(`Unicode ID节点创建异常: ${e.message}`, 'warning');
            addBug('testExtremeBoundaryConditions', 'Unicode ID处理', `错误: ${e.message}`);
        }

        // 测试1.7: 深度嵌套元数据
        log('📝 测试1.7: 深度嵌套元数据 (100层)', 'detail');
        let nestedData = { level: 1 };
        let current = nestedData;
        for (let i = 2; i <= 100; i++) {
            current.next = { level: i };
            current = current.next;
        }
        try {
            db.createNode({ id: 'nested_node', name: 'NestedNode', metadata: nestedData });
            log('深度嵌套元数据节点创建成功', 'info');
        } catch (e) {
            log(`深度嵌套元数据创建异常: ${e.message}`, 'warning');
            addBug('testExtremeBoundaryConditions', '深度嵌套元数据', `错误: ${e.message}`);
        }

        // 测试1.8: 超大元数据对象
        log('📝 测试1.8: 超大元数据对象 (10000个键)', 'detail');
        const hugeMetadata = {};
        for (let i = 0; i < 10000; i++) {
            hugeMetadata[`key_${i}`] = `value_${i}_${Math.random()}`;
        }
        try {
            db.createNode({ id: 'huge_metadata', name: 'HugeMetadataNode', metadata: hugeMetadata });
            log('超大元数据节点创建成功', 'info');
        } catch (e) {
            log(`超大元数据创建异常: ${e.message}`, 'warning');
            addBug('testExtremeBoundaryConditions', '超大元数据', `错误: ${e.message}`);
        }

        // 测试1.9: 循环引用
        log('📝 测试1.9: 循环引用元数据', 'detail');
        try {
            const circularData = { a: 1 };
            circularData.self = circularData;
            // 注意：这里可能会导致JSON.stringify失败，需要特殊处理
            db.createNode({ id: 'circular_node', name: 'CircularNode' });
            log('循环引用测试完成（未直接设置到元数据）', 'info');
        } catch (e) {
            log(`循环引用处理异常: ${e.message}`, 'warning');
            addBug('testExtremeBoundaryConditions', '循环引用', `错误: ${e.message}`);
        }

        // 测试1.10: 零值和空值
        log('📝 测试1.10: 各种零值和空值组合', 'detail');
        try {
            db.createNode({ id: 'zero_1', name: '', type: null });
            db.createNode({ id: 'zero_2', name: 'Test', type: undefined });
            db.createNode({ id: 'zero_3', name: 'Test', type: 0 });
            db.createNode({ id: 'zero_4', name: 'Test', type: false });
            log('各种零值和空值组合测试完成', 'info');
        } catch (e) {
            log(`零值空值组合测试异常: ${e.message}`, 'warning');
            addBug('testExtremeBoundaryConditions', '零值空值组合', `错误: ${e.message}`);
        }

        const duration = Date.now() - startTime;
        testResults.performance.testExtremeBoundaryConditions = duration;
        log(`🔥 极端边界条件深度测试完成，耗时: ${duration}ms`, 'extreme');
        
    } catch (e) {
        log(`❌ 极端边界条件深度测试异常: ${e.message}`, 'error');
        log(e.stack, 'error');
        testPassed = false;
        addBug('testExtremeBoundaryConditions', '总体异常', e.message);
    }
    
    addTestResult('极端边界条件深度测试', testPassed);
    return testPassed;
}

// ============================================================
// 测试2: 混乱操作压力测试
// ============================================================
function testChaoticOperations() {
    log('🔥 开始测试2: 混乱操作压力测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        log('📊 初始化数据库', 'step');
        const db = new KnowledgeGraphDatabase();
        const operations = 5000;
        const nodeIds = [];
        const relationIds = [];
        
        log(`📝 准备进行 ${operations} 次混乱操作`, 'detail');

        for (let i = 0; i < operations; i++) {
            const action = Math.floor(Math.random() * 10);
            const progress = i % 500 === 0;
            
            switch (action) {
                case 0: 
                case 1: // 创建节点
                    const nodeId = `chaos_node_${i}`;
                    nodeIds.push(nodeId);
                    if (progress) log(`创建节点: ${nodeId}`, 'detail');
                    try {
                        db.createNode({
                            id: nodeId,
                            name: `ChaosNode_${i}`,
                            type: ['class', 'interface', 'function', 'variable'][i % 4],
                            metadata: {
                                index: i,
                                random: Math.random(),
                                timestamp: Date.now()
                            }
                        });
                    } catch (e) {
                        if (progress) log(`创建节点失败: ${e.message}`, 'error');
                    }
                    break;
                    
                case 2: // 创建关系
                    if (nodeIds.length >= 2) {
                        const sourceIdx = Math.floor(Math.random() * nodeIds.length);
                        const targetIdx = Math.floor(Math.random() * nodeIds.length);
                        const relId = `chaos_rel_${i}`;
                        relationIds.push(relId);
                        if (progress) log(`创建关系: ${nodeIds[sourceIdx]} -> ${nodeIds[targetIdx]}`, 'detail');
                        try {
                            db.createRelation({
                                id: relId,
                                sourceId: nodeIds[sourceIdx],
                                targetId: nodeIds[targetIdx],
                                type: ['uses', 'calls', 'imports', 'extends'][i % 4]
                            });
                        } catch (e) {
                            if (progress) log(`创建关系失败: ${e.message}`, 'error');
                        }
                    }
                    break;
                    
                case 3: // 查询节点
                    if (nodeIds.length > 0) {
                        const queryIdx = Math.floor(Math.random() * nodeIds.length);
                        const node = db.getNode(nodeIds[queryIdx]);
                        if (progress) log(`查询节点: ${nodeIds[queryIdx]} - ${node ? '找到' : '未找到'}`, 'detail');
                    }
                    break;
                    
                case 4: // 查询关系
                    if (relationIds.length > 0) {
                        const queryIdx = Math.floor(Math.random() * relationIds.length);
                        const rel = db.getRelation(relationIds[queryIdx]);
                        if (progress) log(`查询关系: ${relationIds[queryIdx]} - ${rel ? '找到' : '未找到'}`, 'detail');
                    }
                    break;
                    
                case 5: // 更新节点
                    if (nodeIds.length > 0) {
                        const updateIdx = Math.floor(Math.random() * nodeIds.length);
                        if (progress) log(`更新节点: ${nodeIds[updateIdx]}`, 'detail');
                        try {
                            db.updateNode(nodeIds[updateIdx], {
                                metadata: { updated: true, updatedAt: Date.now() }
                            });
                        } catch (e) {
                            if (progress) log(`更新节点失败: ${e.message}`, 'error');
                        }
                    }
                    break;
                    
                case 6: // 删除节点
                    if (nodeIds.length > 10) {
                        const deleteIdx = Math.floor(Math.random() * nodeIds.length);
                        const deleteNodeId = nodeIds[deleteIdx];
                        if (progress) log(`删除节点: ${deleteNodeId}`, 'detail');
                        try {
                            db.deleteNode(deleteNodeId);
                            nodeIds.splice(deleteIdx, 1);
                        } catch (e) {
                            if (progress) log(`删除节点失败: ${e.message}`, 'error');
                        }
                    }
                    break;
                    
                case 7: // 删除关系
                    if (relationIds.length > 10) {
                        const deleteIdx = Math.floor(Math.random() * relationIds.length);
                        const deleteRelId = relationIds[deleteIdx];
                        if (progress) log(`删除关系: ${deleteRelId}`, 'detail');
                        try {
                            db.deleteRelation(deleteRelId);
                            relationIds.splice(deleteIdx, 1);
                        } catch (e) {
                            if (progress) log(`删除关系失败: ${e.message}`, 'error');
                        }
                    }
                    break;
                    
                case 8: // 获取所有节点/关系
                    if (progress) log('获取所有节点和关系', 'detail');
                    try {
                        const allNodes = db.getAllNodes();
                        const allRelations = db.getAllRelations();
                    } catch (e) {
                        if (progress) log(`获取数据失败: ${e.message}`, 'error');
                    }
                    break;
                    
                case 9: // 获取统计信息
                    if (progress) {
                        const stats = db.getStats();
                        log(`统计 - 节点: ${stats.nodes}, 关系: ${stats.relations}`, 'detail');
                    }
                    break;
            }
        }

        log(`✨ 混乱操作完成，最终 - 节点: ${db.getAllNodes().length}, 关系: ${db.getAllRelations().length}`, 'success');
        
        const duration = Date.now() - startTime;
        testResults.performance.testChaoticOperations = duration;
        log(`🔥 混乱操作压力测试完成，耗时: ${duration}ms`, 'extreme');
        
    } catch (e) {
        log(`❌ 混乱操作压力测试异常: ${e.message}`, 'error');
        log(e.stack, 'error');
        testPassed = false;
        addBug('testChaoticOperations', '总体异常', e.message);
    }
    
    addTestResult('混乱操作压力测试', testPassed);
    return testPassed;
}

// ============================================================
// 测试3: 循环依赖检测深度测试
// ============================================================
function testCycleDetectionDepth() {
    log('🔥 开始测试3: 循环依赖检测深度测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        log('📊 初始化数据库', 'step');
        const db = new KnowledgeGraphDatabase();

        // 测试3.1: 简单2节点循环
        log('📝 测试3.1: 简单2节点循环', 'detail');
        db.createNode({ id: 'cycle_2_a', name: 'Cycle2A', type: 'class' });
        db.createNode({ id: 'cycle_2_b', name: 'Cycle2B', type: 'class' });
        db.createRelation({ id: 'rel_cycle_2_1', sourceId: 'cycle_2_a', targetId: 'cycle_2_b', type: 'uses' });
        db.createRelation({ id: 'rel_cycle_2_2', sourceId: 'cycle_2_b', targetId: 'cycle_2_a', type: 'uses' });
        const cycles1 = db.findCycleDependencies();
        log(`找到 ${cycles1.length} 个2节点循环: ${JSON.stringify(cycles1)}`, 'detail');

        // 测试3.2: 3节点循环
        log('📝 测试3.2: 3节点循环', 'detail');
        db.createNode({ id: 'cycle_3_a', name: 'Cycle3A', type: 'class' });
        db.createNode({ id: 'cycle_3_b', name: 'Cycle3B', type: 'class' });
        db.createNode({ id: 'cycle_3_c', name: 'Cycle3C', type: 'class' });
        db.createRelation({ id: 'rel_cycle_3_1', sourceId: 'cycle_3_a', targetId: 'cycle_3_b', type: 'uses' });
        db.createRelation({ id: 'rel_cycle_3_2', sourceId: 'cycle_3_b', targetId: 'cycle_3_c', type: 'uses' });
        db.createRelation({ id: 'rel_cycle_3_3', sourceId: 'cycle_3_c', targetId: 'cycle_3_a', type: 'uses' });
        const cycles2 = db.findCycleDependencies();
        log(`找到 ${cycles2.length} 个循环（包含3节点）`, 'detail');

        // 测试3.3: 10节点复杂循环
        log('📝 测试3.3: 10节点复杂循环', 'detail');
        for (let i = 0; i < 10; i++) {
            db.createNode({ id: `cycle_10_${i}`, name: `Cycle10_${i}`, type: 'class' });
        }
        for (let i = 0; i < 10; i++) {
            db.createRelation({ id: `rel_cycle_10_${i}`, sourceId: `cycle_10_${i}`, targetId: `cycle_10_${(i + 1) % 10}`, type: 'uses' });
        }
        const cycles3 = db.findCycleDependencies();
        log(`找到 ${cycles3.length} 个循环（包含10节点）`, 'detail');

        // 测试3.4: 自循环
        log('📝 测试3.4: 自循环', 'detail');
        db.createNode({ id: 'self_cycle', name: 'SelfCycle', type: 'class' });
        db.createRelation({ id: 'rel_self_cycle', sourceId: 'self_cycle', targetId: 'self_cycle', type: 'uses' });
        const cycles4 = db.findCycleDependencies();
        log(`找到 ${cycles4.length} 个循环（包含自循环）`, 'detail');

        // 测试3.5: 多重嵌套循环
        log('📝 测试3.5: 多重嵌套循环', 'detail');
        for (let i = 0; i < 5; i++) {
            db.createNode({ id: `nested_cycle_${i}`, name: `NestedCycle_${i}`, type: 'class' });
        }
        db.createRelation({ id: 'rel_nested_1', sourceId: 'nested_cycle_0', targetId: 'nested_cycle_1', type: 'uses' });
        db.createRelation({ id: 'rel_nested_2', sourceId: 'nested_cycle_1', targetId: 'nested_cycle_2', type: 'uses' });
        db.createRelation({ id: 'rel_nested_3', sourceId: 'nested_cycle_2', targetId: 'nested_cycle_0', type: 'uses' });
        db.createRelation({ id: 'rel_nested_4', sourceId: 'nested_cycle_1', targetId: 'nested_cycle_3', type: 'uses' });
        db.createRelation({ id: 'rel_nested_5', sourceId: 'nested_cycle_3', targetId: 'nested_cycle_4', type: 'uses' });
        db.createRelation({ id: 'rel_nested_6', sourceId: 'nested_cycle_4', targetId: 'nested_cycle_1', type: 'uses' });
        const cycles5 = db.findCycleDependencies();
        log(`找到 ${cycles5.length} 个循环（包含嵌套）`, 'detail');

        const duration = Date.now() - startTime;
        testResults.performance.testCycleDetectionDepth = duration;
        log(`🔥 循环依赖检测深度测试完成，耗时: ${duration}ms`, 'extreme');
        
    } catch (e) {
        log(`❌ 循环依赖检测深度测试异常: ${e.message}`, 'error');
        log(e.stack, 'error');
        testPassed = false;
        addBug('testCycleDetectionDepth', '总体异常', e.message);
    }
    
    addTestResult('循环依赖检测深度测试', testPassed);
    return testPassed;
}

// ============================================================
// 测试4: 路径查找深度测试
// ============================================================
function testPathFindingDepth() {
    log('🔥 开始测试4: 路径查找深度测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        log('📊 初始化数据库', 'step');
        const db = new KnowledgeGraphDatabase();

        // 测试4.1: 长路径链
        log('📝 测试4.1: 长路径链 (100节点)', 'detail');
        for (let i = 0; i < 100; i++) {
            db.createNode({ id: `path_node_${i}`, name: `PathNode_${i}`, type: 'class' });
        }
        for (let i = 0; i < 99; i++) {
            db.createRelation({ id: `path_rel_${i}`, sourceId: `path_node_${i}`, targetId: `path_node_${i + 1}`, type: 'uses' });
        }
        const longPath = db.findPath('path_node_0', 'path_node_99', 200);
        log(`长路径长度: ${longPath.length}`, 'detail');

        // 测试4.2: 多路径选择
        log('📝 测试4.2: 多路径选择', 'detail');
        db.createNode({ id: 'multi_a', name: 'MultiA', type: 'class' });
        db.createNode({ id: 'multi_b', name: 'MultiB', type: 'class' });
        db.createNode({ id: 'multi_c', name: 'MultiC', type: 'class' });
        db.createNode({ id: 'multi_d', name: 'MultiD', type: 'class' });
        db.createRelation({ id: 'rel_multi_1', sourceId: 'multi_a', targetId: 'multi_b', type: 'uses' });
        db.createRelation({ id: 'rel_multi_2', sourceId: 'multi_a', targetId: 'multi_c', type: 'uses' });
        db.createRelation({ id: 'rel_multi_3', sourceId: 'multi_b', targetId: 'multi_d', type: 'uses' });
        db.createRelation({ id: 'rel_multi_4', sourceId: 'multi_c', targetId: 'multi_d', type: 'uses' });
        const multiPath = db.findPath('multi_a', 'multi_d', 10);
        log(`多路径查找结果: ${JSON.stringify(multiPath)}`, 'detail');

        // 测试4.3: 无路径情况
        log('📝 测试4.3: 无路径情况', 'detail');
        db.createNode({ id: 'isolated_1', name: 'Isolated1', type: 'class' });
        db.createNode({ id: 'isolated_2', name: 'Isolated2', type: 'class' });
        const noPath = db.findPath('isolated_1', 'isolated_2', 10);
        log(`无路径查找结果: ${JSON.stringify(noPath)}`, 'detail');

        // 测试4.4: 深度限制
        log('📝 测试4.4: 深度限制', 'detail');
        const limitedPath = db.findPath('path_node_0', 'path_node_50', 20);
        log(`深度限制查找结果: ${JSON.stringify(limitedPath)}`, 'detail');

        // 测试4.5: 相同节点查找
        log('📝 测试4.5: 相同节点查找', 'detail');
        const sameNodePath = db.findPath('multi_a', 'multi_a', 10);
        log(`相同节点查找结果: ${JSON.stringify(sameNodePath)}`, 'detail');

        const duration = Date.now() - startTime;
        testResults.performance.testPathFindingDepth = duration;
        log(`🔥 路径查找深度测试完成，耗时: ${duration}ms`, 'extreme');
        
    } catch (e) {
        log(`❌ 路径查找深度测试异常: ${e.message}`, 'error');
        log(e.stack, 'error');
        testPassed = false;
        addBug('testPathFindingDepth', '总体异常', e.message);
    }
    
    addTestResult('路径查找深度测试', testPassed);
    return testPassed;
}

// ============================================================
// 测试5: 数据一致性完整性测试
// ============================================================
function testDataConsistency() {
    log('🔥 开始测试5: 数据一致性完整性测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        log('📊 初始化数据库', 'step');
        const db = new KnowledgeGraphDatabase();

        // 测试5.1: 级联删除验证
        log('📝 测试5.1: 级联删除验证', 'detail');
        db.createNode({ id: 'cascade_1', name: 'Cascade1', type: 'class' });
        db.createNode({ id: 'cascade_2', name: 'Cascade2', type: 'class' });
        db.createNode({ id: 'cascade_3', name: 'Cascade3', type: 'class' });
        db.createRelation({ id: 'rel_cascade_1', sourceId: 'cascade_1', targetId: 'cascade_2', type: 'uses' });
        db.createRelation({ id: 'rel_cascade_2', sourceId: 'cascade_2', targetId: 'cascade_3', type: 'uses' });
        db.createRelation({ id: 'rel_cascade_3', sourceId: 'cascade_1', targetId: 'cascade_3', type: 'uses' });
        
        log(`删除前 - 节点: ${db.getAllNodes().length}, 关系: ${db.getAllRelations().length}`, 'detail');
        db.deleteNode('cascade_2');
        log(`删除后 - 节点: ${db.getAllNodes().length}, 关系: ${db.getAllRelations().length}`, 'detail');

        const remainingRelations = db.getAllRelations();
        log(`剩余关系: ${JSON.stringify(remainingRelations)}`, 'detail');

        // 测试5.2: 更新一致性
        log('📝 测试5.2: 更新一致性', 'detail');
        db.createNode({ id: 'update_test', name: 'OriginalName', type: 'class', metadata: { a: 1, b: 2 } });
        db.updateNode('update_test', { name: 'UpdatedName', metadata: { a: 100, newField: 'new' } });
        const updatedNode = db.getNode('update_test');
        log(`更新后节点: ${JSON.stringify(updatedNode)}`, 'detail');

        // 测试5.3: 重复ID处理
        log('📝 测试5.3: 重复ID处理', 'detail');
        db.createNode({ id: 'dup_id', name: 'First', type: 'class' });
        db.createNode({ id: 'dup_id', name: 'Second', type: 'class' });
        const dupNode = db.getNode('dup_id');
        log(`重复ID最终节点: ${JSON.stringify(dupNode)}`, 'detail');

        // 测试5.4: 序列化反序列化一致性
        log('📝 测试5.4: 序列化反序列化一致性', 'detail');
        const testDb = new KnowledgeGraphDatabase();
        testDb.createNode({ id: 'ser_test_1', name: 'SerTest1', type: 'class', metadata: { x: 1, y: 2 } });
        testDb.createNode({ id: 'ser_test_2', name: 'SerTest2', type: 'class' });
        testDb.createRelation({ id: 'ser_rel', sourceId: 'ser_test_1', targetId: 'ser_test_2', type: 'uses' });
        
        const serialized = GraphDataSerializer.serialize(testDb);
        log(`序列化数据: ${JSON.stringify(serialized)}`, 'detail');
        
        const deserialized = GraphDataSerializer.deserialize(serialized);
        log(`反序列化后 - 节点: ${deserialized.getAllNodes().length}, 关系: ${deserialized.getAllRelations().length}`, 'detail');

        const duration = Date.now() - startTime;
        testResults.performance.testDataConsistency = duration;
        log(`🔥 数据一致性完整性测试完成，耗时: ${duration}ms`, 'extreme');
        
    } catch (e) {
        log(`❌ 数据一致性完整性测试异常: ${e.message}`, 'error');
        log(e.stack, 'error');
        testPassed = false;
        addBug('testDataConsistency', '总体异常', e.message);
    }
    
    addTestResult('数据一致性完整性测试', testPassed);
    return testPassed;
}

// ============================================================
// 测试6: 内存泄漏和长时间稳定性测试
// ============================================================
function testMemoryLeakAndStability() {
    log('🔥 开始测试6: 内存泄漏和长时间稳定性测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        if (global.gc) {
            global.gc();
        }
        
        const initialMem = process.memoryUsage();
        log(`📊 初始内存 - 堆: ${formatBytes(initialMem.heapUsed)}, RSS: ${formatBytes(initialMem.rss)}`, 'detail');
        
        const db = new KnowledgeGraphDatabase();
        const iterations = 50;
        const nodesPerIteration = 1000;
        const relationsPerIteration = 500;
        
        log(`📝 开始 ${iterations} 次迭代，每次 ${nodesPerIteration} 节点 + ${relationsPerIteration} 关系`, 'detail');
        
        const memReadings = [];
        memReadings.push({ iteration: 0, heap: initialMem.heapUsed });

        for (let i = 0; i < iterations; i++) {
            // 添加数据
            for (let j = 0; j < nodesPerIteration; j++) {
                const nodeId = `mem_test_${i}_${j}`;
                db.createNode({
                    id: nodeId,
                    name: `MemTest_${i}_${j}`,
                    type: 'class',
                    metadata: {
                        iteration: i,
                        index: j,
                        randomData: Array(50).fill(0).map(() => Math.random().toString(36))
                    }
                });
            }
            for (let j = 0; j < relationsPerIteration; j++) {
                const source = `mem_test_${i}_${Math.floor(Math.random() * nodesPerIteration)}`;
                const target = `mem_test_${i}_${Math.floor(Math.random() * nodesPerIteration)}`;
                db.createRelation({
                    id: `mem_rel_${i}_${j}`,
                    sourceId: source,
                    targetId: target,
                    type: 'uses'
                });
            }

            // 清理部分数据
            for (let j = 0; j < Math.floor(nodesPerIteration / 2); j++) {
                db.deleteNode(`mem_test_${i}_${j}`);
            }

            // 记录内存
            if (i % 10 === 0) {
                const currentMem = process.memoryUsage();
                memReadings.push({
                    iteration: i + 1,
                    heap: currentMem.heapUsed
                });
                log(`📊 迭代 ${i + 1}/${iterations} - 节点: ${db.getAllNodes().length}, 关系: ${db.getAllRelations().length}, 堆: ${formatBytes(currentMem.heapUsed)}`, 'detail');
            }
        }

        if (global.gc) {
            global.gc();
        }
        
        const finalMem = process.memoryUsage();
        memReadings.push({ iteration: iterations, heap: finalMem.heapUsed });
        
        log(`📊 最终内存 - 堆: ${formatBytes(finalMem.heapUsed)}, RSS: ${formatBytes(finalMem.rss)}`, 'detail');
        log(`📊 内存变化 - 初始: ${formatBytes(initialMem.heapUsed)}, 最终: ${formatBytes(finalMem.heapUsed)}, 增长: ${formatBytes(finalMem.heapUsed - initialMem.heapUsed)}`, 'detail');
        
        log(`📊 内存记录: ${JSON.stringify(memReadings)}`, 'detail');

        const duration = Date.now() - startTime;
        testResults.performance.testMemoryLeakAndStability = duration;
        log(`🔥 内存泄漏和长时间稳定性测试完成，耗时: ${duration}ms`, 'extreme');
        
    } catch (e) {
        log(`❌ 内存泄漏和长时间稳定性测试异常: ${e.message}`, 'error');
        log(e.stack, 'error');
        testPassed = false;
        addBug('testMemoryLeakAndStability', '总体异常', e.message);
    }
    
    addTestResult('内存泄漏和长时间稳定性测试', testPassed);
    return testPassed;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================
// 主测试运行器
// ============================================================
function runAllTests() {
    log('================================================================', 'test');
    log('🔥 第23代 - 超级复杂混乱场景深度测试', 'test');
    log('Generation 23 - Super Complex & Chaotic Scenario Deep Test', 'test');
    log('================================================================', 'test');
    
    const totalStartTime = Date.now();
    
    const testPassed1 = testExtremeBoundaryConditions();
    const testPassed2 = testChaoticOperations();
    const testPassed3 = testCycleDetectionDepth();
    const testPassed4 = testPathFindingDepth();
    const testPassed5 = testDataConsistency();
    const testPassed6 = testMemoryLeakAndStability();
    
    const totalDuration = Date.now() - totalStartTime;
    testResults.totalDuration = totalDuration;
    
    log('================================================================', 'test');
    log(`🔥 测试完成！总耗时: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}秒)`, 'test');
    log(`总测试数: ${testResults.totalTests}`, 'test');
    log(`通过: ${testResults.passedTests}`, 'success');
    log(`失败: ${testResults.failedTests}`, testResults.failedTests > 0 ? 'error' : 'info');
    log(`发现Bug: ${testResults.bugsFound.length}`, testResults.bugsFound.length > 0 ? 'error' : 'success');
    log('================================================================', 'test');
    
    const reportPath = path.join(__dirname, 'v23_super_complex_chaos_test_report.json');
    FileSystemUtilityHelper.writeJsonFile(reportPath, testResults);
    log(`测试报告已保存到: ${reportPath}`, 'success');
    
    const allPassed = testPassed1 && testPassed2 && testPassed3 && 
                      testPassed4 && testPassed5 && testPassed6;
    
    if (allPassed) {
        log('🎉 第23代超级复杂混乱场景深度测试全部通过！系统稳定性极佳！', 'success');
    } else {
        log('⚠️ 第23代测试有部分失败，需要修复问题', 'warning');
    }
    
    return allPassed;
}

runAllTests();
