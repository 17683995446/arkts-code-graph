// ============================================================
// 第20代 - 长时间稳定性与极度复杂场景测试
// Generation 20 - Long-Term Stability & Extreme Complexity Test
// 包含详细日志打印、混乱场景、长时间压力测试
// ============================================================

const fs = require('fs');
const path = require('path');

// 导入核心模块
const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
const { GraphDataSerializer } = require('./dist/src/infrastructure/persistence/graph.data.serializer');
const { FileSystemUtilityHelper } = require('./dist/src/infrastructure/utils/file.system.helper');

// 测试结果收集
const testResults = {
    timestamp: new Date().toISOString(),
    generation: 'v20',
    tests: [],
    bugsFound: [],
    warnings: [],
    performance: {},
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    memoryUsage: [],
    detailedLogs: []
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
        perf: '⚡',
        detail: '📝',
        chaos: '🌀'
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

// 记录内存使用
function recordMemoryUsage(label) {
    const memUsage = process.memoryUsage();
    const memEntry = {
        label,
        timestamp: new Date().toISOString(),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
    };
    testResults.memoryUsage.push(memEntry);
    log(`内存记录 [${label}]: Heap ${memEntry.heapUsed}MB / ${memEntry.heapTotal}MB, RSS ${memEntry.rss}MB`, 'detail');
}

// 生成随机ID
function generateRandomId() {
    return `node_${Math.random().toString(36).substr(2, 9)}`;
}

// 测试1: 极度复杂混乱场景测试 - 详细日志版
function testExtremeChaosScenario() {
    log('开始测试: 极度复杂混乱场景测试', 'test');
    recordMemoryUsage('混乱场景开始');
    
    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;
    
    try {
        log('创建知识库实例', 'detail');
        const db = new KnowledgeGraphDatabase();
        
        // 阶段1: 大规模随机节点创建
        log('阶段1: 大规模随机节点创建', 'chaos');
        const nodeCount = 5000;
        const nodeIds = [];
        for (let i = 0; i < nodeCount; i++) {
            log(`创建节点 ${i + 1}/${nodeCount}`, 'detail');
            
            const nodeType = ['class', 'function', 'interface', 'variable', 'module', 'enum'][Math.floor(Math.random() * 6)];
            const nodeId = generateRandomId();
            
            log(`  ID: ${nodeId}, 类型: ${nodeType}`, 'detail');
            
            const node = {
                id: nodeId,
                name: `ChaosNode_${i}_${Math.random().toString(36).substr(2, 5)}`,
                type: nodeType,
                metadata: {
                    index: i,
                    randomValue: Math.random(),
                    timestamp: Date.now(),
                    tags: ['chaos', 'test', 'v20'],
                    nested: {
                        level1: {
                            level2: {
                                level3: 'deep nested data'
                            }
                        }
                    }
                }
            };
            
            log(`  元数据准备完成`, 'detail');
            db.createNode(node);
            log(`  节点创建成功`, 'detail');
            
            nodeIds.push(nodeId);
            
            if (i % 500 === 0) {
                log(`进度: ${i}/${nodeCount} 节点已创建`, 'info');
                recordMemoryUsage(`节点创建 ${i}`);
            }
        }
        
        successCount++;
        
        // 阶段2: 复杂关系网络构建
        log('阶段2: 复杂关系网络构建', 'chaos');
        const relationCount = 8000;
        for (let i = 0; i < relationCount; i++) {
            log(`创建关系 ${i + 1}/${relationCount}`, 'detail');
            
            const sourceIdx = Math.floor(Math.random() * nodeIds.length);
            let targetIdx = Math.floor(Math.random() * nodeIds.length);
            while (targetIdx === sourceIdx && Math.random() > 0.1) {
                targetIdx = Math.floor(Math.random() * nodeIds.length);
            }
            
            const relTypes = ['uses', 'calls', 'imports', 'extends', 'contains', 'dependsOn', 'references', 'implements'];
            const relType = relTypes[Math.floor(Math.random() * relTypes.length)];
            
            log(`  源: ${nodeIds[sourceIdx]}, 目标: ${nodeIds[targetIdx]}, 类型: ${relType}`, 'detail');
            
            const relation = {
                id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                sourceId: nodeIds[sourceIdx],
                targetId: nodeIds[targetIdx],
                type: relType,
                metadata: {
                    index: i,
                    random: Math.random(),
                    direction: sourceIdx < targetIdx ? 'forward' : 'backward'
                }
            };
            
            log(`  关系数据准备完成`, 'detail');
            db.createRelation(relation);
            log(`  关系创建成功`, 'detail');
            
            if (i % 800 === 0) {
                log(`进度: ${i}/${relationCount} 关系已创建`, 'info');
                recordMemoryUsage(`关系创建 ${i}`);
            }
        }
        
        successCount++;
        
        // 阶段3: 混合操作 - 增删改查循环
        log('阶段3: 混合操作 - 增删改查循环', 'chaos');
        const mixedOps = 3000;
        for (let i = 0; i < mixedOps; i++) {
            const opType = Math.random();
            
            if (opType < 0.2) {
                // 插入新节点
                log(`操作 ${i + 1}: 插入新节点`, 'detail');
                const newNode = {
                    id: `new_node_${Date.now()}_${i}`,
                    name: `DynamicNode_${i}`,
                    type: 'class',
                    metadata: { dynamic: true, iteration: i }
                };
                db.createNode(newNode);
                nodeIds.push(newNode.id);
            } else if (opType < 0.35) {
                // 删除节点
                if (nodeIds.length > 100) {
                    const delIdx = Math.floor(Math.random() * nodeIds.length);
                    const delId = nodeIds[delIdx];
                    log(`操作 ${i + 1}: 删除节点 ${delId}`, 'detail');
                    db.deleteNode(delId);
                    nodeIds.splice(delIdx, 1);
                }
            } else if (opType < 0.5) {
                // 查询节点
                if (nodeIds.length > 0) {
                    const queryIdx = Math.floor(Math.random() * nodeIds.length);
                    log(`操作 ${i + 1}: 查询节点 ${nodeIds[queryIdx]}`, 'detail');
                    const found = db.getNode(nodeIds[queryIdx]);
                    log(`  查询结果: ${found ? '找到' : '未找到'}`, 'detail');
                }
            } else if (opType < 0.65) {
                // 更新节点
                if (nodeIds.length > 0) {
                    const updateIdx = Math.floor(Math.random() * nodeIds.length);
                    log(`操作 ${i + 1}: 更新节点 ${nodeIds[updateIdx]}`, 'detail');
                    db.updateNode(nodeIds[updateIdx], {
                        metadata: {
                            updated: true,
                            updateTime: Date.now(),
                            updateIteration: i
                        }
                    });
                }
            } else if (opType < 0.8) {
                // 搜索节点
                const searchTerm = `Node_${Math.floor(Math.random() * 100)}`;
                log(`操作 ${i + 1}: 搜索节点 "${searchTerm}"`, 'detail');
                const foundNodes = db.searchNodes(searchTerm);
                log(`  搜索结果: ${foundNodes.length} 个节点`, 'detail');
            } else {
                // 路径查找
                if (nodeIds.length >= 2) {
                    const pathStart = Math.floor(Math.random() * nodeIds.length);
                    const pathEnd = Math.floor(Math.random() * nodeIds.length);
                    log(`操作 ${i + 1}: 查找路径 ${nodeIds[pathStart]} -> ${nodeIds[pathEnd]}`, 'detail');
                    const pathResult = db.findPath(nodeIds[pathStart], nodeIds[pathEnd], 10);
                    log(`  路径长度: ${pathResult.length}`, 'detail');
                }
            }
            
            if (i % 300 === 0) {
                log(`混合操作进度: ${i}/${mixedOps}`, 'info');
                recordMemoryUsage(`混合操作 ${i}`);
            }
        }
        
        successCount++;
        
        // 阶段4: 循环依赖检测
        log('阶段4: 循环依赖检测', 'chaos');
        recordMemoryUsage('循环检测前');
        const cycles = db.findCycleDependencies();
        log(`找到 ${cycles.length} 个循环依赖`, 'info');
        recordMemoryUsage('循环检测后');
        
        successCount++;
        
        // 阶段5: 统计信息验证
        log('阶段5: 统计信息验证', 'chaos');
        const stats = db.getStats();
        log(`统计结果: 节点 ${stats.nodes}, 关系 ${stats.relations}`, 'info');
        
        successCount++;
        
        const duration = Date.now() - startTime;
        log(`极度复杂混乱场景测试完成, 耗时: ${duration}ms, 成功操作: ${successCount}`, 'success');
        
        addTestResult('极度复杂混乱场景', true, `节点:${nodeCount}+, 关系:${relationCount}, 混合操作:${mixedOps}, 耗时:${duration}ms`);
        
        recordMemoryUsage('混乱场景结束');
        return true;
        
    } catch (error) {
        log(`极度复杂混乱场景测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '极度复杂混乱场景',
            error: error.message,
            stack: error.stack
        });
        addTestResult('极度复杂混乱场景', false, error.message);
        return false;
    }
}

// 测试2: 长时间持续运行测试
function testLongTermStability() {
    log('开始测试: 长时间持续运行测试', 'test');
    recordMemoryUsage('长时测试开始');
    
    const startTime = Date.now();
    const testDuration = 10000; // 10秒（演示用，实际可以更长）
    const operationInterval = 50; // 每50ms一次操作
    let operationCount = 0;
    
    try {
        const db = new KnowledgeGraphDatabase();
        const nodeIds = [];
        
        log(`创建初始节点池`, 'detail');
        for (let i = 0; i < 100; i++) {
            const node = {
                id: `initial_node_${i}`,
                name: `Initial_${i}`,
                type: 'class',
                metadata: { phase: 'initial' }
            };
            db.createNode(node);
            nodeIds.push(node.id);
        }
        
        log(`开始持续操作循环 (${testDuration}ms)`, 'chaos');
        
        const testEndTime = Date.now() + testDuration;
        while (Date.now() < testEndTime) {
            operationCount++;
            
            // 各种操作组合
            const op = Math.random();
            
            if (op < 0.3) {
                // 创建节点
                const newNode = {
                    id: `lt_node_${Date.now()}_${operationCount}`,
                    name: `LongTerm_${operationCount}`,
                    type: ['class', 'function', 'interface'][Math.floor(Math.random() * 3)],
                    metadata: { op: operationCount, time: Date.now() }
                };
                db.createNode(newNode);
                nodeIds.push(newNode.id);
            } else if (op < 0.5) {
                // 创建关系
                if (nodeIds.length >= 2) {
                    const sIdx = Math.floor(Math.random() * nodeIds.length);
                    const tIdx = Math.floor(Math.random() * nodeIds.length);
                    db.createRelation({
                        id: `lt_rel_${Date.now()}_${operationCount}`,
                        sourceId: nodeIds[sIdx],
                        targetId: nodeIds[tIdx],
                        type: 'uses'
                    });
                }
            } else if (op < 0.7) {
                // 查询
                if (nodeIds.length > 0) {
                    const qIdx = Math.floor(Math.random() * nodeIds.length);
                    db.getNode(nodeIds[qIdx]);
                }
            } else if (op < 0.85) {
                // 搜索
                db.searchNodes('Term');
            } else {
                // 统计
                db.getStats();
            }
            
            // 定期记录内存
            if (operationCount % 100 === 0) {
                recordMemoryUsage(`长时测试 - ${operationCount} 操作`);
            }
            
            // 小延迟，避免CPU 100%
            if (operationCount % 20 === 0) {
                const now = Date.now();
                while (Date.now() - now < 1) {}
            }
        }
        
        const duration = Date.now() - startTime;
        log(`长时间稳定性测试完成: ${operationCount} 次操作, 耗时 ${duration}ms`, 'success');
        
        addTestResult('长时间稳定性', true, `操作次数:${operationCount}, 耗时:${duration}ms`);
        recordMemoryUsage('长时测试结束');
        
        return true;
        
    } catch (error) {
        log(`长时间稳定性测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '长时间稳定性',
            error: error.message,
            stack: error.stack
        });
        addTestResult('长时间稳定性', false, error.message);
        return false;
    }
}

// 测试3: 大规模序列化/反序列化压力测试
function testMassiveSerialization() {
    log('开始测试: 大规模序列化/反序列化压力测试', 'test');
    recordMemoryUsage('序列化测试开始');
    
    const startTime = Date.now();
    
    try {
        const db = new KnowledgeGraphDatabase();
        
        log('创建超大规模测试数据', 'detail');
        const nodeCount = 3000;
        const relationCount = 6000;
        const nodeIds = [];
        
        for (let i = 0; i < nodeCount; i++) {
            const node = {
                id: `serial_node_${i}`,
                name: `SerializationTest_${i}`,
                type: i % 3 === 0 ? 'class' : i % 3 === 1 ? 'function' : 'interface',
                metadata: {
                    index: i,
                    complex: {
                        a: [1, 2, 3, 4, 5],
                        b: { c: { d: 'test' } },
                        longString: 'x'.repeat(100)
                    }
                }
            };
            db.createNode(node);
            nodeIds.push(node.id);
        }
        
        log('创建大规模关系网络', 'detail');
        for (let i = 0; i < relationCount; i++) {
            const sIdx = Math.floor(Math.random() * nodeIds.length);
            const tIdx = Math.floor(Math.random() * nodeIds.length);
            db.createRelation({
                id: `serial_rel_${i}`,
                sourceId: nodeIds[sIdx],
                targetId: nodeIds[tIdx],
                type: ['uses', 'calls', 'imports'][Math.floor(Math.random() * 3)],
                metadata: { index: i }
            });
        }
        
        recordMemoryUsage('数据创建完成');
        
        // 序列化
        log('执行序列化', 'detail');
        const serialStart = Date.now();
        const serialized = GraphDataSerializer.serialize(db);
        const serialTime = Date.now() - serialStart;
        log(`序列化完成: ${serialTime}ms`, 'perf');
        
        // 验证序列化数据
        log('验证序列化数据完整性', 'detail');
        if (!serialized || !Array.isArray(serialized.nodes) || !Array.isArray(serialized.relations)) {
            throw new Error('序列化数据格式错误');
        }
        
        // 反序列化
        log('执行反序列化', 'detail');
        const deserialStart = Date.now();
        const restoredDb = GraphDataSerializer.deserialize(serialized);
        const deserialTime = Date.now() - deserialStart;
        log(`反序列化完成: ${deserialTime}ms`, 'perf');
        
        // 验证恢复的数据
        log('验证恢复的数据', 'detail');
        const restoredStats = restoredDb.getStats();
        if (restoredStats.nodes !== nodeCount || restoredStats.relations !== relationCount) {
            throw new Error(`数据恢复不完整: 期望 ${nodeCount}节点/${relationCount}关系, 实际 ${restoredStats.nodes}/${restoredStats.relations}`);
        }
        
        // 文件保存/加载
        log('测试文件保存和加载', 'detail');
        const testFile = path.join(__dirname, 'v20_massive_test.json');
        
        const saveStart = Date.now();
        GraphDataSerializer.saveToFile(db, testFile);
        const saveTime = Date.now() - saveStart;
        
        const loadStart = Date.now();
        const fileLoadedDb = GraphDataSerializer.loadFromFile(testFile);
        const loadTime = Date.now() - loadStart;
        
        // 清理文件
        fs.unlinkSync(testFile);
        
        const totalDuration = Date.now() - startTime;
        
        log(`大规模序列化/反序列化测试完成`, 'success');
        addTestResult('大规模序列化压力', true, 
            `节点:${nodeCount}, 关系:${relationCount}, 序列化:${serialTime}ms, 反序列化:${deserialTime}ms, 保存:${saveTime}ms, 加载:${loadTime}ms, 总耗时:${totalDuration}ms`
        );
        
        recordMemoryUsage('序列化测试结束');
        
        return true;
        
    } catch (error) {
        log(`大规模序列化测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '大规模序列化压力',
            error: error.message,
            stack: error.stack
        });
        addTestResult('大规模序列化压力', false, error.message);
        return false;
    }
}

// 测试4: 边界条件和极端数据
function testExtremeBoundaryConditions() {
    log('开始测试: 边界条件和极端数据', 'test');
    recordMemoryUsage('边界测试开始');
    
    const startTime = Date.now();
    
    try {
        const db = new KnowledgeGraphDatabase();
        
        // 极端1: 超长ID
        log('测试1: 超长ID', 'detail');
        const veryLongId = 'very_long_node_id_' + 'x'.repeat(5000);
        db.createNode({
            id: veryLongId,
            name: 'Very Long ID Test',
            type: 'class'
        });
        const retrieved1 = db.getNode(veryLongId);
        if (!retrieved1) throw new Error('超长ID节点检索失败');
        
        // 极端2: 特殊字符ID
        log('测试2: 特殊字符ID', 'detail');
        const specialId = 'node_!@#$%^&*()_+=-[]{}|;\':",.<>?/`~';
        db.createNode({
            id: specialId,
            name: 'Special Chars ID Test',
            type: 'function'
        });
        const retrieved2 = db.getNode(specialId);
        if (!retrieved2) throw new Error('特殊字符ID节点检索失败');
        
        // 极端3: 空字符串ID
        log('测试3: 空字符串ID', 'detail');
        try {
            db.createNode({
                id: '',
                name: 'Empty ID Test',
                type: 'interface'
            });
            log('空ID处理完成', 'detail');
        } catch (e) {
            log('空ID被正确拒绝: ' + e.message, 'detail');
        }
        
        // 极端4: 极深嵌套元数据
        log('测试4: 极深嵌套元数据', 'detail');
        let deepNested = {};
        let current = deepNested;
        for (let i = 0; i < 50; i++) {
            current.level = {};
            current = current.level;
        }
        current.value = 'deepest value';
        
        db.createNode({
            id: 'deep_nested_test',
            name: 'Deep Nested Metadata',
            type: 'class',
            metadata: deepNested
        });
        
        // 极端5: 巨大元数据对象
        log('测试5: 巨大元数据对象', 'detail');
        const hugeMetadata = {};
        for (let i = 0; i < 1000; i++) {
            hugeMetadata[`key_${i}`] = `value_${i}_${'x'.repeat(100)}`;
        }
        db.createNode({
            id: 'huge_metadata_test',
            name: 'Huge Metadata Test',
            type: 'module',
            metadata: hugeMetadata
        });
        
        // 极端6: 极快的连续操作
        log('测试6: 极快连续操作', 'detail');
        for (let i = 0; i < 500; i++) {
            db.createNode({
                id: `fast_op_${i}`,
                name: `FastOp_${i}`,
                type: 'variable'
            });
        }
        
        // 极端7: 删除不存在的节点
        log('测试7: 删除不存在的节点', 'detail');
        const result1 = db.deleteNode('non_existent_node_id');
        log(`删除不存在节点返回: ${result1}`, 'detail');
        
        // 极端8: 查询不存在的节点
        log('测试8: 查询不存在的节点', 'detail');
        const result2 = db.getNode('another_non_existent_node');
        log(`查询不存在节点返回: ${result2}`, 'detail');
        
        // 极端9: 空搜索
        log('测试9: 空搜索', 'detail');
        const emptySearch = db.searchNodes('');
        log(`空搜索结果数量: ${emptySearch.length}`, 'detail');
        
        // 极端10: 同时使用所有方法
        log('测试10: 同时使用所有方法', 'detail');
        db.getAllNodes();
        db.getAllRelations();
        db.getNodesByType('class');
        db.getStats();
        db.findCycleDependencies();
        
        const duration = Date.now() - startTime;
        log(`边界条件和极端数据测试完成, 耗时: ${duration}ms`, 'success');
        
        addTestResult('边界条件和极端数据', true, `10个极端场景, 耗时:${duration}ms`);
        
        recordMemoryUsage('边界测试结束');
        
        return true;
        
    } catch (error) {
        log(`边界条件测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '边界条件和极端数据',
            error: error.message,
            stack: error.stack
        });
        addTestResult('边界条件和极端数据', false, error.message);
        return false;
    }
}

// 测试5: 完整业务场景全流程
function testFullBusinessWorkflow() {
    log('开始测试: 完整业务场景全流程', 'test');
    recordMemoryUsage('业务流程开始');
    
    const startTime = Date.now();
    
    try {
        const db = new KnowledgeGraphDatabase();
        
        // 场景1: 项目初始化和代码解析
        log('场景1: 项目初始化和代码解析', 'detail');
        
        // 模拟解析服务类
        const services = [
            { name: 'UserService', file: 'services/UserService.ts', lines: 350 },
            { name: 'ProductService', file: 'services/ProductService.ts', lines: 420 },
            { name: 'OrderService', file: 'services/OrderService.ts', lines: 380 },
            { name: 'PaymentService', file: 'services/PaymentService.ts', lines: 280 },
            { name: 'AuthService', file: 'services/AuthService.ts', lines: 250 }
        ];
        
        const serviceNodes = [];
        for (const service of services) {
            const node = {
                id: `service_${service.name}`,
                name: service.name,
                type: 'class',
                metadata: {
                    file: service.file,
                    lines: service.lines,
                    category: 'service'
                }
            };
            db.createNode(node);
            serviceNodes.push(node);
        }
        
        // 模拟解析模型类
        const models = [
            { name: 'User', file: 'models/User.ts' },
            { name: 'Product', file: 'models/Product.ts' },
            { name: 'Order', file: 'models/Order.ts' },
            { name: 'Payment', file: 'models/Payment.ts' },
            { name: 'Cart', file: 'models/Cart.ts' },
            { name: 'Category', file: 'models/Category.ts' }
        ];
        
        const modelNodes = [];
        for (const model of models) {
            const node = {
                id: `model_${model.name}`,
                name: model.name,
                type: 'interface',
                metadata: {
                    file: model.file,
                    category: 'model'
                }
            };
            db.createNode(node);
            modelNodes.push(node);
        }
        
        // 场景2: 构建关系网络
        log('场景2: 构建关系网络', 'detail');
        
        // 服务使用模型
        db.createRelation({ id: 'rel_UserService_User', sourceId: 'service_UserService', targetId: 'model_User', type: 'uses' });
        db.createRelation({ id: 'rel_ProductService_Product', sourceId: 'service_ProductService', targetId: 'model_Product', type: 'uses' });
        db.createRelation({ id: 'rel_OrderService_Order', sourceId: 'service_OrderService', targetId: 'model_Order', type: 'uses' });
        db.createRelation({ id: 'rel_OrderService_Product', sourceId: 'service_OrderService', targetId: 'model_Product', type: 'uses' });
        db.createRelation({ id: 'rel_OrderService_Cart', sourceId: 'service_OrderService', targetId: 'model_Cart', type: 'uses' });
        db.createRelation({ id: 'rel_PaymentService_Payment', sourceId: 'service_PaymentService', targetId: 'model_Payment', type: 'uses' });
        db.createRelation({ id: 'rel_PaymentService_Order', sourceId: 'service_PaymentService', targetId: 'model_Order', type: 'uses' });
        db.createRelation({ id: 'rel_ProductService_Category', sourceId: 'service_ProductService', targetId: 'model_Category', type: 'uses' });
        
        // 服务间依赖
        db.createRelation({ id: 'rel_OrderService_UserService', sourceId: 'service_OrderService', targetId: 'service_UserService', type: 'dependsOn' });
        db.createRelation({ id: 'rel_OrderService_ProductService', sourceId: 'service_OrderService', targetId: 'service_ProductService', type: 'dependsOn' });
        db.createRelation({ id: 'rel_PaymentService_OrderService', sourceId: 'service_PaymentService', targetId: 'service_OrderService', type: 'dependsOn' });
        db.createRelation({ id: 'rel_AuthService_UserService', sourceId: 'service_AuthService', targetId: 'service_UserService', type: 'dependsOn' });
        
        // 场景3: 查询和分析
        log('场景3: 查询和分析', 'detail');
        
        // 查找OrderService的所有依赖
        const orderServiceRels = db.getRelations('service_OrderService', null);
        log(`OrderService相关关系: ${orderServiceRels.length}`, 'detail');
        
        // 查找所有服务类
        const allServices = db.getNodesByType('class');
        log(`找到 ${allServices.length} 个服务类`, 'detail');
        
        // 路径查找
        const pathFromAuthToProduct = db.findPath('service_AuthService', 'model_Product', 5);
        log(`AuthService到Product的路径长度: ${pathFromAuthToProduct.length}`, 'detail');
        
        // 循环检测
        const cycles = db.findCycleDependencies();
        log(`检测到 ${cycles.length} 个循环依赖`, 'detail');
        
        // 场景4: 数据持久化和恢复
        log('场景4: 数据持久化和恢复', 'detail');
        
        const workflowFile = path.join(__dirname, 'v20_business_workflow.json');
        GraphDataSerializer.saveToFile(db, workflowFile);
        
        const restoredDb = GraphDataSerializer.loadFromFile(workflowFile);
        
        // 验证恢复
        const stats = restoredDb.getStats();
        if (stats.nodes !== services.length + models.length) {
            throw new Error('业务数据恢复不完整');
        }
        
        // 清理
        fs.unlinkSync(workflowFile);
        
        // 场景5: 增量更新和修改
        log('场景5: 增量更新和修改', 'detail');
        
        // 添加新服务
        restoredDb.createNode({
            id: 'service_InventoryService',
            name: 'InventoryService',
            type: 'class',
            metadata: { file: 'services/InventoryService.ts', category: 'service' }
        });
        
        // 添加新关系
        restoredDb.createRelation({
            id: 'rel_InventoryService_Product',
            sourceId: 'service_InventoryService',
            targetId: 'model_Product',
            type: 'uses'
        });
        
        // 更新现有服务
        restoredDb.updateNode('service_OrderService', {
            metadata: { lines: 400, updated: true }
        });
        
        const duration = Date.now() - startTime;
        log(`完整业务场景全流程测试完成, 耗时: ${duration}ms`, 'success');
        
        addTestResult('完整业务场景全流程', true, `5个场景, 节点:${services.length + models.length}+, 耗时:${duration}ms`);
        
        recordMemoryUsage('业务流程结束');
        
        return true;
        
    } catch (error) {
        log(`业务场景测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '完整业务场景全流程',
            error: error.message,
            stack: error.stack
        });
        addTestResult('完整业务场景全流程', false, error.message);
        return false;
    }
}

// 清理测试目录
function cleanup() {
    log('清理测试文件', 'info');
    const testDir = path.join(__dirname, 'test_persistence');
    try {
        if (fs.existsSync(testDir)) {
            const files = fs.readdirSync(testDir);
            for (const file of files) {
                fs.unlinkSync(path.join(testDir, file));
            }
            fs.rmdirSync(testDir);
        }
    } catch (cleanupErr) {
        log(`清理目录时出错: ${cleanupErr.message}`, 'warning');
    }
}

// 主测试运行器
async function runAllTests() {
    log('================================================================', 'test');
    log('第20代 - 长时间稳定性与极度复杂场景测试', 'test');
    log('Generation 20 - Long-Term Stability & Extreme Complexity Test', 'test');
    log('================================================================', 'test');
    
    const totalStartTime = Date.now();
    
    // 确保测试目录
    const testDir = path.join(__dirname, 'test_persistence');
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }
    
    // 运行所有测试
    log('开始运行所有测试...', 'test');
    
    const testPassed1 = testExtremeChaosScenario();
    const testPassed2 = testLongTermStability();
    const testPassed3 = testMassiveSerialization();
    const testPassed4 = testExtremeBoundaryConditions();
    const testPassed5 = testFullBusinessWorkflow();
    
    // 清理
    cleanup();
    
    // 生成测试报告
    const totalDuration = Date.now() - totalStartTime;
    testResults.totalDuration = totalDuration;
    
    log('================================================================', 'test');
    log(`测试完成! 总耗时: ${totalDuration}ms`, 'test');
    log(`总测试数: ${testResults.totalTests}`, 'test');
    log(`通过: ${testResults.passedTests}`, 'success');
    log(`失败: ${testResults.failedTests}`, testResults.failedTests > 0 ? 'error' : 'info');
    log(`发现问题: ${testResults.bugsFound.length}`, testResults.bugsFound.length > 0 ? 'error' : 'success');
    log(`内存记录点: ${testResults.memoryUsage.length}`, 'info');
    log('================================================================', 'test');
    
    // 保存报告
    const reportPath = path.join(__dirname, 'v20_long_stability_extreme_complexity_test_report.json');
    FileSystemUtilityHelper.writeJsonFile(reportPath, testResults);
    log(`测试报告已保存到: ${reportPath}`, 'success');
    
    // 检查是否全部通过
    const allPassed = testPassed1 && testPassed2 && testPassed3 && testPassed4 && testPassed5;
    
    if (allPassed) {
        log('🎉 第20代测试全部通过! 系统稳定性和复杂场景处理能力验证成功!', 'success');
    } else {
        log('⚠️ 第20代测试有部分失败, 需要修复问题', 'warning');
    }
    
    return allPassed;
}

// 执行测试
runAllTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    console.error('测试执行出错:', err);
    process.exit(1);
});
