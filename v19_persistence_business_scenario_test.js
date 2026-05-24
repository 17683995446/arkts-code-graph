// ============================================================
// 第19代 - 持久化与完整业务场景测试
// Generation 19 - Persistence & Full Business Scenario Test
// 包含数据持久化、完整业务流程、多格式存储
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
    generation: 'v19',
    tests: [],
    bugsFound: [],
    warnings: [],
    performance: {},
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
        perf: '⚡'
    }[type] || 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

// 添加测试结果
function addTestResult(name, passed, details = '') {
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

// 测试1: 基础数据序列化测试
function testBasicSerialization() {
    log('开始测试: 基础数据序列化测试', 'test');
    const startTime = Date.now();
    
    try {
        // 创建测试数据库
        const db = new KnowledgeGraphDatabase();
        
        // 添加测试数据
        log('添加测试节点...', 'info');
        db.createNode({ id: 'node_1', name: 'UserService', type: 'class', metadata: { file: 'UserService.ts' } });
        db.createNode({ id: 'node_2', name: 'ProductService', type: 'class', metadata: { file: 'ProductService.ts' } });
        db.createNode({ id: 'node_3', name: 'User', type: 'interface', metadata: { file: 'user.ts' } });
        db.createNode({ id: 'node_4', name: 'Product', type: 'interface', metadata: { file: 'product.ts' } });
        
        log('添加测试关系...', 'info');
        db.createRelation({ id: 'rel_1', sourceId: 'node_1', targetId: 'node_3', type: 'uses' });
        db.createRelation({ id: 'rel_2', sourceId: 'node_2', targetId: 'node_4', type: 'uses' });
        db.createRelation({ id: 'rel_3', sourceId: 'node_1', targetId: 'node_2', type: 'dependsOn' });
        
        // 序列化
        log('执行序列化...', 'info');
        const serialized = GraphDataSerializer.serialize(db);
        
        // 验证序列化结果
        const valid = serialized && 
            Array.isArray(serialized.nodes) && 
            Array.isArray(serialized.relations) && 
            serialized.nodes.length === 4 && 
            serialized.relations.length === 3;
        
        const duration = Date.now() - startTime;
        testResults.performance.basicSerialization = duration;
        
        if (valid) {
            log(`基础数据序列化测试通过 (${duration}ms)`, 'success');
            addTestResult('基础数据序列化', true, `节点:4, 关系:3, 耗时:${duration}ms`);
            return true;
        } else {
            log('基础数据序列化测试失败', 'error');
            addTestResult('基础数据序列化', false, '序列化结果验证失败');
            return false;
        }
    } catch (error) {
        log(`基础数据序列化测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '基础数据序列化',
            error: error.message,
            stack: error.stack
        });
        addTestResult('基础数据序列化', false, error.message);
        return false;
    }
}

// 测试2: 反序列化测试
function testDeserialization() {
    log('开始测试: 反序列化测试', 'test');
    const startTime = Date.now();
    
    try {
        // 创建测试数据
        const testData = {
            nodes: [
                { id: 'test_node_1', name: 'TestClass1', type: 'class', metadata: { test: true } },
                { id: 'test_node_2', name: 'TestClass2', type: 'class', metadata: { test: true } }
            ],
            relations: [
                { id: 'test_rel_1', sourceId: 'test_node_1', targetId: 'test_node_2', type: 'calls' }
            ],
            version: '1.0.0',
            createdAt: new Date().toISOString()
        };
        
        // 反序列化
        log('执行反序列化...', 'info');
        const db = GraphDataSerializer.deserialize(testData);
        
        // 验证
        const valid = db && 
            db.getAllNodes().length === 2 && 
            db.getAllRelations().length === 1 &&
            db.getNode('test_node_1') &&
            db.getNode('test_node_2') &&
            db.getRelation('test_rel_1');
        
        const duration = Date.now() - startTime;
        testResults.performance.deserialization = duration;
        
        if (valid) {
            log(`反序列化测试通过 (${duration}ms)`, 'success');
            addTestResult('反序列化', true, `节点:2, 关系:1, 耗时:${duration}ms`);
            return true;
        } else {
            log('反序列化测试失败', 'error');
            addTestResult('反序列化', false, '反序列化结果验证失败');
            return false;
        }
    } catch (error) {
        log(`反序列化测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '反序列化',
            error: error.message,
            stack: error.stack
        });
        addTestResult('反序列化', false, error.message);
        return false;
    }
}

// 测试3: 文件持久化存储测试
function testFilePersistence() {
    log('开始测试: 文件持久化存储测试', 'test');
    const startTime = Date.now();
    
    try {
        // 准备测试目录
        const testDir = path.join(__dirname, 'test_persistence');
        const testFile = path.join(testDir, 'graph_data.json');
        
        log(`测试目录: ${testDir}`, 'info');
        
        // 创建数据库并添加数据
        const db = new KnowledgeGraphDatabase();
        for (let i = 1; i <= 50; i++) {
            db.createNode({
                id: `persist_node_${i}`,
                name: `PersistClass${i}`,
                type: 'class',
                metadata: { index: i, timestamp: Date.now() }
            });
        }
        for (let i = 1; i <= 30; i++) {
            db.createRelation({
                id: `persist_rel_${i}`,
                sourceId: `persist_node_${i}`,
                targetId: `persist_node_${i + 1}`,
                type: 'related'
            });
        }
        
        // 保存到文件
        log('保存到文件...', 'info');
        GraphDataSerializer.saveToFile(db, testFile);
        
        // 验证文件存在
        if (!FileSystemUtilityHelper.fileExists(testFile)) {
            throw new Error('保存文件不存在');
        }
        
        // 从文件加载
        log('从文件加载...', 'info');
        const loadedDb = GraphDataSerializer.loadFromFile(testFile);
        
        // 验证
        const valid = loadedDb && 
            loadedDb.getAllNodes().length === 50 && 
            loadedDb.getAllRelations().length === 30;
        
        const duration = Date.now() - startTime;
        testResults.performance.filePersistence = duration;
        
        // 清理测试文件
        try {
            if (FileSystemUtilityHelper.fileExists(testFile)) {
                fs.unlinkSync(testFile);
            }
        } catch (cleanupErr) {
            log(`清理文件时出错: ${cleanupErr.message}`, 'warning');
        }
        
        if (valid) {
            log(`文件持久化存储测试通过 (${duration}ms)`, 'success');
            addTestResult('文件持久化存储', true, `节点:50, 关系:30, 耗时:${duration}ms`);
            return true;
        } else {
            log('文件持久化存储测试失败', 'error');
            addTestResult('文件持久化存储', false, '持久化存储验证失败');
            return false;
        }
    } catch (error) {
        log(`文件持久化存储测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '文件持久化存储',
            error: error.message,
            stack: error.stack
        });
        addTestResult('文件持久化存储', false, error.message);
        return false;
    }
}

// 测试4: 完整业务场景 - 真实项目解析和持久化
function testFullBusinessScenario() {
    log('开始测试: 完整业务场景测试', 'test');
    const startTime = Date.now();
    
    try {
        // 场景1: 初始化项目数据库
        log('场景1: 初始化项目数据库...', 'info');
        const projectDb = new KnowledgeGraphDatabase();
        
        // 添加真实项目节点
        const projectNodes = [
            { id: 'proj_file_UserService', name: 'UserService', type: 'class', metadata: { file: 'UserService.ts', lines: 150 } },
            { id: 'proj_file_ProductService', name: 'ProductService', type: 'class', metadata: { file: 'ProductService.ts', lines: 230 } },
            { id: 'proj_file_Helpers', name: 'Helpers', type: 'module', metadata: { file: 'helpers.ts', lines: 190 } },
            { id: 'proj_file_User', name: 'User', type: 'interface', metadata: { file: 'user.ts', lines: 40 } },
            { id: 'proj_file_Product', name: 'Product', type: 'interface', metadata: { file: 'product.ts', lines: 55 } },
            { id: 'proj_func_login', name: 'login', type: 'function', metadata: { file: 'UserService.ts', line: 10 } },
            { id: 'proj_func_createUser', name: 'createUser', type: 'function', metadata: { file: 'UserService.ts', line: 30 } },
            { id: 'proj_func_createProduct', name: 'createProduct', type: 'function', metadata: { file: 'ProductService.ts', line: 15 } }
        ];
        
        for (const node of projectNodes) {
            projectDb.createNode(node);
        }
        
        // 添加真实项目关系
        const projectRelations = [
            { id: 'proj_rel_1', sourceId: 'proj_file_UserService', targetId: 'proj_file_User', type: 'uses' },
            { id: 'proj_rel_2', sourceId: 'proj_file_ProductService', targetId: 'proj_file_Product', type: 'uses' },
            { id: 'proj_rel_3', sourceId: 'proj_file_UserService', targetId: 'proj_file_Helpers', type: 'imports' },
            { id: 'proj_rel_4', sourceId: 'proj_file_ProductService', targetId: 'proj_file_Helpers', type: 'imports' },
            { id: 'proj_rel_5', sourceId: 'proj_file_UserService', targetId: 'proj_func_login', type: 'contains' },
            { id: 'proj_rel_6', sourceId: 'proj_file_UserService', targetId: 'proj_func_createUser', type: 'contains' },
            { id: 'proj_rel_7', sourceId: 'proj_file_ProductService', targetId: 'proj_func_createProduct', type: 'contains' },
            { id: 'proj_rel_8', sourceId: 'proj_func_login', targetId: 'proj_file_User', type: 'returns' }
        ];
        
        for (const rel of projectRelations) {
            projectDb.createRelation(rel);
        }
        
        log(`场景1完成: ${projectNodes.length}个节点, ${projectRelations.length}个关系`, 'success');
        
        // 场景2: 持久化存储
        log('场景2: 持久化存储...', 'info');
        const scenarioTestFile = path.join(__dirname, 'test_persistence', 'business_scenario.json');
        GraphDataSerializer.saveToFile(projectDb, scenarioTestFile);
        
        // 场景3: 重新加载并验证
        log('场景3: 重新加载...', 'info');
        const reloadedDb = GraphDataSerializer.loadFromFile(scenarioTestFile);
        
        const validScenario = reloadedDb && 
            reloadedDb.getAllNodes().length === projectNodes.length && 
            reloadedDb.getAllRelations().length === projectRelations.length &&
            reloadedDb.getNode('proj_file_UserService') &&
            reloadedDb.getNode('proj_file_ProductService');
        
        // 清理
        try {
            if (FileSystemUtilityHelper.fileExists(scenarioTestFile)) {
                fs.unlinkSync(scenarioTestFile);
            }
        } catch (cleanupErr) {
            log(`清理场景文件时出错: ${cleanupErr.message}`, 'warning');
        }
        
        const duration = Date.now() - startTime;
        testResults.performance.fullBusinessScenario = duration;
        
        if (validScenario) {
            log(`完整业务场景测试通过 (${duration}ms)`, 'success');
            addTestResult('完整业务场景', true, `节点:${projectNodes.length}, 关系:${projectRelations.length}, 耗时:${duration}ms`);
            return true;
        } else {
            log('完整业务场景测试失败', 'error');
            addTestResult('完整业务场景', false, '业务场景验证失败');
            return false;
        }
    } catch (error) {
        log(`完整业务场景测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '完整业务场景',
            error: error.message,
            stack: error.stack
        });
        addTestResult('完整业务场景', false, error.message);
        return false;
    }
}

// 测试5: 大规模数据持久化测试
function testLargeScalePersistence() {
    log('开始测试: 大规模数据持久化测试', 'test');
    const startTime = Date.now();
    
    try {
        // 创建大规模测试数据库
        const largeDb = new KnowledgeGraphDatabase();
        
        log('创建大规模节点...', 'info');
        const nodeCount = 1000;
        const relationCount = 800;
        
        for (let i = 1; i <= nodeCount; i++) {
            largeDb.createNode({
                id: `large_node_${i}`,
                name: `LargeScaleClass${i}`,
                type: i % 3 === 0 ? 'class' : i % 3 === 1 ? 'interface' : 'function',
                metadata: { index: i, size: 'large', test: true }
            });
        }
        
        for (let i = 1; i <= relationCount; i++) {
            const source = i;
            const target = (i % nodeCount) + 1;
            largeDb.createRelation({
                id: `large_rel_${i}`,
                sourceId: `large_node_${source}`,
                targetId: `large_node_${target}`,
                type: 'related'
            });
        }
        
        // 序列化
        log('序列化大规模数据...', 'info');
        const serializeStart = Date.now();
        const serializedLarge = GraphDataSerializer.serialize(largeDb);
        const serializeTime = Date.now() - serializeStart;
        
        // 验证
        log('验证序列化结果...', 'info');
        const largeFile = path.join(__dirname, 'test_persistence', 'large_scale.json');
        const saveStart = Date.now();
        GraphDataSerializer.saveToFile(largeDb, largeFile);
        const saveTime = Date.now() - saveStart;
        
        // 加载
        log('加载大规模数据...', 'info');
        const loadStart = Date.now();
        const loadedLarge = GraphDataSerializer.loadFromFile(largeFile);
        const loadTime = Date.now() - loadStart;
        
        const validLarge = loadedLarge && 
            loadedLarge.getAllNodes().length === nodeCount && 
            loadedLarge.getAllRelations().length === relationCount;
        
        // 清理
        try {
            if (FileSystemUtilityHelper.fileExists(largeFile)) {
                fs.unlinkSync(largeFile);
            }
        } catch (cleanupErr) {
            log(`清理大规模文件时出错: ${cleanupErr.message}`, 'warning');
        }
        
        const duration = Date.now() - startTime;
        testResults.performance.largeScalePersistence = {
            total: duration,
            serialize: serializeTime,
            save: saveTime,
            load: loadTime
        };
        
        if (validLarge) {
            log(`大规模数据持久化测试通过 (总耗时: ${duration}ms, 序列化: ${serializeTime}ms, 保存: ${saveTime}ms, 加载: ${loadTime}ms)`, 'success');
            addTestResult('大规模数据持久化', true, `节点:${nodeCount}, 关系:${relationCount}, 总耗时:${duration}ms`);
            return true;
        } else {
            log('大规模数据持久化测试失败', 'error');
            addTestResult('大规模数据持久化', false, '大规模持久化验证失败');
            return false;
        }
    } catch (error) {
        log(`大规模数据持久化测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '大规模数据持久化',
            error: error.message,
            stack: error.stack
        });
        addTestResult('大规模数据持久化', false, error.message);
        return false;
    }
}

// 测试6: 数据一致性验证
function testDataConsistency() {
    log('开始测试: 数据一致性验证', 'test');
    const startTime = Date.now();
    
    try {
        // 创建数据库
        const db = new KnowledgeGraphDatabase();
        
        // 添加复杂节点
        const node1 = db.createNode({ id: 'consist_1', name: 'ConsistTest1', type: 'class', metadata: { a: 1, b: 'test', c: true } });
        const node2 = db.createNode({ id: 'consist_2', name: 'ConsistTest2', type: 'interface', metadata: { x: 100, y: 'data' } });
        
        // 添加关系
        const rel1 = db.createRelation({ id: 'consist_rel_1', sourceId: 'consist_1', targetId: 'consist_2', type: 'uses' });
        
        // 序列化
        const serialized = GraphDataSerializer.serialize(db);
        
        // 验证序列化数据一致性
        const node1InSerial = serialized.nodes.find(n => n.id === 'consist_1');
        const node2InSerial = serialized.nodes.find(n => n.id === 'consist_2');
        const rel1InSerial = serialized.relations.find(r => r.id === 'consist_rel_1');
        
        const consistent = node1InSerial && node2InSerial && rel1InSerial &&
            node1InSerial.name === 'ConsistTest1' &&
            node1InSerial.metadata.a === 1 &&
            node1InSerial.metadata.b === 'test' &&
            node2InSerial.metadata.x === 100 &&
            node2InSerial.metadata.y === 'data' &&
            rel1InSerial.type === 'uses';
        
        const duration = Date.now() - startTime;
        testResults.performance.dataConsistency = duration;
        
        if (consistent) {
            log(`数据一致性验证通过 (${duration}ms)`, 'success');
            addTestResult('数据一致性验证', true, `耗时:${duration}ms`);
            return true;
        } else {
            log('数据一致性验证失败', 'error');
            addTestResult('数据一致性验证', false, '数据不一致');
            return false;
        }
    } catch (error) {
        log(`数据一致性验证错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '数据一致性验证',
            error: error.message,
            stack: error.stack
        });
        addTestResult('数据一致性验证', false, error.message);
        return false;
    }
}

// 测试7: 异常边界条件
function testEdgeCases() {
    log('开始测试: 边界条件', 'test');
    const startTime = Date.now();
    
    try {
        // 空数据库
        log('测试空数据库...', 'info');
        const emptyDb = new KnowledgeGraphDatabase();
        const emptySerialized = GraphDataSerializer.serialize(emptyDb);
        const validEmpty = emptySerialized.nodes.length === 0 && emptySerialized.relations.length === 0;
        
        // 单个节点
        log('测试单个节点...', 'info');
        const singleDb = new KnowledgeGraphDatabase();
        singleDb.createNode({ id: 'single', name: 'SingleNode', type: 'class' });
        const singleSerialized = GraphDataSerializer.serialize(singleDb);
        const validSingle = singleSerialized.nodes.length === 1;
        
        // 自环关系
        log('测试自环...', 'info');
        const loopDb = new KnowledgeGraphDatabase();
        loopDb.createNode({ id: 'loop_node', name: 'LoopTest', type: 'class' });
        loopDb.createRelation({ id: 'loop_rel', sourceId: 'loop_node', targetId: 'loop_node', type: 'self' });
        const loopSerialized = GraphDataSerializer.serialize(loopDb);
        const validLoop = loopSerialized.relations.length === 1;
        
        const duration = Date.now() - startTime;
        testResults.performance.edgeCases = duration;
        
        const allValid = validEmpty && validSingle && validLoop;
        
        if (allValid) {
            log(`边界条件测试通过 (${duration}ms)`, 'success');
            addTestResult('边界条件', true, `空库:${validEmpty}, 单节点:${validSingle}, 自环:${validLoop}, 总耗时:${duration}ms`);
            return true;
        } else {
            log('边界条件测试失败', 'error');
            addTestResult('边界条件', false, '部分边界条件测试失败');
            return false;
        }
    } catch (error) {
        log(`边界条件测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '边界条件',
            error: error.message,
            stack: error.stack
        });
        addTestResult('边界条件', false, error.message);
        return false;
    }
}

// 测试8: 完整业务流程 - 多次保存、修改、再保存
function testMultipleOperations() {
    log('开始测试: 多次操作业务流程', 'test');
    const startTime = Date.now();
    
    try {
        const testDir = path.join(__dirname, 'test_persistence');
        const file1 = path.join(testDir, 'step1.json');
        const file2 = path.join(testDir, 'step2.json');
        
        // 步骤1: 初始化保存
        log('步骤1: 初始化保存...', 'info');
        const db1 = new KnowledgeGraphDatabase();
        db1.createNode({ id: 'op1_node1', name: 'Step1Class', type: 'class' });
        db1.createNode({ id: 'op1_node2', name: 'Step1Interface', type: 'interface' });
        db1.createRelation({ id: 'op1_rel', sourceId: 'op1_node1', targetId: 'op1_node2', type: 'uses' });
        GraphDataSerializer.saveToFile(db1, file1);
        
        // 步骤2: 加载并修改
        log('步骤2: 加载并修改...', 'info');
        const db2 = GraphDataSerializer.loadFromFile(file1);
        db2.createNode({ id: 'op2_node3', name: 'Step2Function', type: 'function' });
        db2.createRelation({ id: 'op2_rel', sourceId: 'op2_node3', targetId: 'op1_node1', type: 'calls' });
        db2.updateNode('op1_node1', { metadata: { updated: true, step: 2 } });
        GraphDataSerializer.saveToFile(db2, file2);
        
        // 步骤3: 最终验证
        log('步骤3: 最终验证...', 'info');
        const db3 = GraphDataSerializer.loadFromFile(file2);
        
        const valid = db3.getAllNodes().length === 3 && 
            db3.getAllRelations().length === 2 &&
            db3.getNode('op1_node1').metadata.updated === true;
        
        // 清理
        try {
            if (FileSystemUtilityHelper.fileExists(file1)) fs.unlinkSync(file1);
            if (FileSystemUtilityHelper.fileExists(file2)) fs.unlinkSync(file2);
        } catch (cleanupErr) {
            log(`清理多操作文件时出错: ${cleanupErr.message}`, 'warning');
        }
        
        const duration = Date.now() - startTime;
        testResults.performance.multipleOperations = duration;
        
        if (valid) {
            log(`多次操作业务流程测试通过 (${duration}ms)`, 'success');
            addTestResult('多次操作业务流程', true, `耗时:${duration}ms`);
            return true;
        } else {
            log('多次操作业务流程测试失败', 'error');
            addTestResult('多次操作业务流程', false, '多次操作验证失败');
            return false;
        }
    } catch (error) {
        log(`多次操作业务流程测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '多次操作业务流程',
            error: error.message,
            stack: error.stack
        });
        addTestResult('多次操作业务流程', false, error.message);
        return false;
    }
}

// 清理测试目录
function cleanup() {
    const testDir = path.join(__dirname, 'test_persistence');
    try {
        if (FileSystemUtilityHelper.fileExists(testDir)) {
            // 移除测试目录下的所有文件
            const files = fs.readdirSync(testDir);
            for (const file of files) {
                const filePath = path.join(testDir, file);
                fs.unlinkSync(filePath);
            }
            fs.rmdirSync(testDir);
        }
    } catch (cleanupErr) {
        log(`清理目录时出错: ${cleanupErr.message}`, 'warning');
    }
}

// 主测试运行器
async function runAllTests() {
    log('============================================================', 'test');
    log('第19代 - 持久化与完整业务场景测试', 'test');
    log('Generation 19 - Persistence & Full Business Scenario Test', 'test');
    log('============================================================', 'test');
    
    const totalStartTime = Date.now();
    
    // 确保测试目录
    const testDir = path.join(__dirname, 'test_persistence');
    FileSystemUtilityHelper.ensureDir(testDir);
    
    // 运行所有测试
    const testPassed1 = testBasicSerialization();
    const testPassed2 = testDeserialization();
    const testPassed3 = testFilePersistence();
    const testPassed4 = testFullBusinessScenario();
    const testPassed5 = testLargeScalePersistence();
    const testPassed6 = testDataConsistency();
    const testPassed7 = testEdgeCases();
    const testPassed8 = testMultipleOperations();
    
    // 清理
    cleanup();
    
    // 生成测试报告
    const totalDuration = Date.now() - totalStartTime;
    testResults.totalDuration = totalDuration;
    
    log('============================================================', 'test');
    log(`测试完成！总耗时: ${totalDuration}ms`, 'test');
    log(`总测试数: ${testResults.totalTests}`, 'test');
    log(`通过: ${testResults.passedTests}`, 'success');
    log(`失败: ${testResults.failedTests}`, testResults.failedTests > 0 ? 'error' : 'info');
    log(`发现问题: ${testResults.bugsFound.length}`, testResults.bugsFound.length > 0 ? 'error' : 'success');
    log('============================================================', 'test');
    
    // 保存报告
    const reportPath = path.join(__dirname, 'v19_persistence_business_scenario_test_report.json');
    FileSystemUtilityHelper.writeJsonFile(reportPath, testResults);
    log(`测试报告已保存到: ${reportPath}`, 'success');
    
    // 检查是否全部通过
    const allPassed = testPassed1 && testPassed2 && testPassed3 &&
                      testPassed4 && testPassed5 &&
                      testPassed6 && testPassed7 && testPassed8;
    
    if (allPassed) {
        log('🎉 第19代测试全部通过！系统已达到生产级持久化能力！', 'success');
    } else {
        log('⚠️  第19代测试有部分失败，需要修复问题', 'warning');
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
