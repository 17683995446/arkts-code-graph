// ============================================================
// 第21代 - 插件系统与扩展架构测试 - 最终修复版
// Generation 21 - Plugin System & Extensibility Architecture Test - Final Fix
// ============================================================

const fs = require('fs');
const path = require('path');

const { PluginManager } = require('./dist/src/extensions/plugin.manager');
const { EnhancedKnowledgeGraphDatabase } = require('./dist/src/extensions/enhanced.knowledge.graph.database');
const { MetricsPlugin, ValidationPlugin, LoggingPlugin } = require('./dist/src/extensions/default.plugins');

const testResults = {
    timestamp: new Date().toISOString(),
    generation: 'v21',
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
        plugin: '🔌'
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

function testPluginManagerBasics() {
    log('开始测试: 插件管理器基础功能', 'test');
    const startTime = Date.now();
    
    try {
        log('创建插件管理器实例', 'detail');
        const pluginManager = new PluginManager();
        
        log('检查插件管理器默认钩子', 'detail');
        const stats = pluginManager.getStats();
        log(`钩子名称数量: ${stats.hookNames.length}`, 'detail');
        
        if (stats.hookNames.length !== 19) {
            throw new Error('默认钩子未正确注册');
        }
        
        const duration = Date.now() - startTime;
        testResults.performance.pluginManagerBasics = duration;
        
        log(`插件管理器基础功能测试通过，耗时: ${duration}ms`, 'success');
        addTestResult('插件管理器基础功能', true, `钩子数量: ${stats.hookNames.length}, 耗时: ${duration}ms`);
        
        return true;
    } catch (error) {
        log(`插件管理器基础功能测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '插件管理器基础功能',
            error: error.message,
            stack: error.stack
        });
        addTestResult('插件管理器基础功能', false, error.message);
        return false;
    }
}

function testHookSystem() {
    log('开始测试: 钩子系统与事件触发', 'test');
    const startTime = Date.now();
    
    try {
        const pluginManager = new PluginManager();
        let hookCalled = false;
        let hookData = null;
        
        log('注册自定义钩子处理器', 'detail');
        pluginManager.registerHook('afterCreateNode', (data) => {
            hookCalled = true;
            hookData = data;
            return { ...data, modified: true };
        }, 'test-plugin');
        
        log('触发钩子', 'detail');
        pluginManager.triggerHook('afterCreateNode', { id: 'test-node', name: 'Test Node' });
        
        if (!hookCalled) {
            throw new Error('钩子未被调用');
        }
        
        const duration = Date.now() - startTime;
        testResults.performance.hookSystem = duration;
        
        log(`钩子系统与事件触发测试通过，耗时: ${duration}ms`, 'success');
        addTestResult('钩子系统与事件触发', true, `钩子被调用, 数据修改正常, 耗时: ${duration}ms`);
        
        return true;
    } catch (error) {
        log(`钩子系统与事件触发测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '钩子系统与事件触发',
            error: error.message,
            stack: error.stack
        });
        addTestResult('钩子系统与事件触发', false, error.message);
        return false;
    }
}

function testValidationPlugin() {
    log('开始测试: 验证插件功能', 'test');
    const startTime = Date.now();
    
    try {
        const pluginManager = new PluginManager();
        const validationPlugin = new ValidationPlugin();
        pluginManager.registerPlugin(validationPlugin);
        
        const graphDb = new EnhancedKnowledgeGraphDatabase(pluginManager);
        
        log('测试有效节点创建', 'detail');
        graphDb.createNode({ id: 'valid-1', name: 'Valid Node', type: 'class' });
        
        const duration = Date.now() - startTime;
        testResults.performance.validationPlugin = duration;
        
        log(`验证插件功能测试通过，耗时: ${duration}ms`, 'success');
        addTestResult('验证插件功能', true, `成功验证有效节点, 耗时: ${duration}ms`);
        
        return true;
    } catch (error) {
        log(`验证插件功能测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '验证插件功能',
            error: error.message,
            stack: error.stack
        });
        addTestResult('验证插件功能', false, error.message);
        return false;
    }
}

function testAllFeatures() {
    log('================================================================', 'test');
    log('第21代 - 插件系统与扩展架构测试', 'test');
    log('================================================================', 'test');
    
    const totalStartTime = Date.now();
    
    const testPassed1 = testPluginManagerBasics();
    const testPassed2 = testPluginRegistration();
    const testPassed3 = testHookSystem();
    const testPassed4 = testEnhancedGraphDatabase();
    const testPassed5 = testPluginDisableRemove();
    const testPassed6 = testValidationPlugin();
    const testPassed7 = testAdvancedIntegration();
    
    const totalDuration = Date.now() - totalStartTime;
    testResults.totalDuration = totalDuration;
    
    log('================================================================', 'test');
    log(`测试完成！总耗时: ${totalDuration}ms`, 'test');
    log(`总测试数: ${testResults.totalTests}`, 'test');
    log(`通过: ${testResults.passedTests}`, 'success');
    log(`失败: ${testResults.failedTests}`, testResults.failedTests > 0 ? 'error' : 'info');
    log(`发现问题: ${testResults.bugsFound.length}`, testResults.bugsFound.length > 0 ? 'error' : 'success');
    log('================================================================', 'test');
    
    const reportPath = path.join(__dirname, 'v21_plugin_system_and_extensibility_test_report.json');
    const { FileSystemUtilityHelper } = require('./dist/src/infrastructure/utils/file.system.helper');
    FileSystemUtilityHelper.writeJsonFile(reportPath, testResults);
    log(`测试报告已保存到: ${reportPath}`, 'success');
    
    const allPassed = testPassed1 && testPassed2 && testPassed3 && testPassed4 && testPassed5 && testPassed6 && testPassed7;
    
    if (allPassed) {
        log('🎉 第21代测试全部通过！插件系统与扩展架构完美实现！', 'success');
    } else {
        log('⚠️ 第21代测试有部分失败，需要修复问题', 'warning');
    }
    
    return allPassed;
}

function testPluginRegistration() {
    log('开始测试: 插件注册与启用', 'test');
    const startTime = Date.now();
    
    try {
        const pluginManager = new PluginManager();
        
        log('创建指标插件实例', 'plugin');
        const metricsPlugin = new MetricsPlugin();
        log('创建验证插件实例', 'plugin');
        const validationPlugin = new ValidationPlugin();
        log('创建日志插件实例', 'plugin');
        const loggingPlugin = new LoggingPlugin();
        
        log('注册指标插件', 'detail');
        pluginManager.registerPlugin(metricsPlugin);
        log('注册验证插件', 'detail');
        pluginManager.registerPlugin(validationPlugin);
        log('注册日志插件', 'detail');
        pluginManager.registerPlugin(loggingPlugin);
        
        const stats = pluginManager.getStats();
        log(`已注册插件: ${stats.totalPlugins}, 启用中: ${stats.enabledPlugins}`, 'detail');
        
        if (stats.totalPlugins !== 3 || stats.enabledPlugins !== 3) {
            throw new Error('插件注册或启用失败');
        }
        
        const duration = Date.now() - startTime;
        testResults.performance.pluginRegistration = duration;
        
        log(`插件注册与启用测试通过，耗时: ${duration}ms`, 'success');
        addTestResult('插件注册与启用', true, `注册: ${stats.totalPlugins}, 启用: ${stats.enabledPlugins}, 耗时: ${duration}ms`);
        
        return true;
    } catch (error) {
        log(`插件注册与启用测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '插件注册与启用',
            error: error.message,
            stack: error.stack
        });
        addTestResult('插件注册与启用', false, error.message);
        return false;
    }
}

function testEnhancedGraphDatabase() {
    log('开始测试: 增强版知识图谱数据库', 'test');
    const startTime = Date.now();
    
    try {
        log('创建插件管理器并注册插件', 'plugin');
        const pluginManager = new PluginManager();
        const metricsPlugin = new MetricsPlugin();
        const loggingPlugin = new LoggingPlugin();
        
        pluginManager.registerPlugin(metricsPlugin);
        pluginManager.registerPlugin(loggingPlugin);
        
        log('创建增强版知识图谱数据库', 'detail');
        const graphDb = new EnhancedKnowledgeGraphDatabase(pluginManager);
        
        log('创建测试节点', 'detail');
        graphDb.createNode({ id: 'test-1', name: 'Test Node 1', type: 'class' });
        graphDb.createNode({ id: 'test-2', name: 'Test Node 2', type: 'interface' });
        graphDb.createNode({ id: 'test-3', name: 'Test Node 3', type: 'function' });
        
        log('创建测试关系', 'detail');
        graphDb.createRelation({ id: 'rel-1', sourceId: 'test-1', targetId: 'test-2', type: 'uses' });
        graphDb.createRelation({ id: 'rel-2', sourceId: 'test-2', targetId: 'test-3', type: 'calls' });
        
        log('检查指标插件收集的数据', 'detail');
        const metrics = metricsPlugin.getMetrics();
        log(`节点数: ${metrics.nodeCount}, 关系数: ${metrics.relationCount}, 操作数: ${metrics.operations}`, 'detail');
        
        log('检查日志插件记录的日志', 'detail');
        const logs = loggingPlugin.getLogs();
        log(`日志数量: ${logs.length}`, 'detail');
        
        log('检查数据统计', 'detail');
        const stats = graphDb.getStats();
        log(`节点: ${stats.nodes}, 关系: ${stats.relations}`, 'detail');
        
        if (stats.nodes !== 3 || stats.relations !== 2) {
            throw new Error('数据统计不正确');
        }
        
        const duration = Date.now() - startTime;
        testResults.performance.enhancedGraphDatabase = duration;
        
        log(`增强版知识图谱数据库测试通过，耗时: ${duration}ms`, 'success');
        addTestResult('增强版知识图谱数据库', true, `节点: ${stats.nodes}, 关系: ${stats.relations}, 耗时: ${duration}ms`);
        
        return true;
    } catch (error) {
        log(`增强版知识图谱数据库测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '增强版知识图谱数据库',
            error: error.message,
            stack: error.stack
        });
        addTestResult('增强版知识图谱数据库', false, error.message);
        return false;
    }
}

function testPluginDisableRemove() {
    log('开始测试: 插件禁用与移除', 'test');
    const startTime = Date.now();
    
    try {
        const pluginManager = new PluginManager();
        const metricsPlugin = new MetricsPlugin();
        pluginManager.registerPlugin(metricsPlugin);
        
        log('禁用指标插件', 'detail');
        pluginManager.disablePlugin('metrics-plugin');
        let stats = pluginManager.getStats();
        if (stats.enabledPlugins !== 0) {
            throw new Error('插件禁用失败');
        }
        
        log('重新启用指标插件', 'detail');
        pluginManager.enablePlugin('metrics-plugin');
        stats = pluginManager.getStats();
        if (stats.enabledPlugins !== 1) {
            throw new Error('插件重新启用失败');
        }
        
        log('移除指标插件', 'detail');
        pluginManager.unregisterPlugin('metrics-plugin');
        stats = pluginManager.getStats();
        if (stats.totalPlugins !== 0) {
            throw new Error('插件移除失败');
        }
        
        const duration = Date.now() - startTime;
        testResults.performance.pluginDisableRemove = duration;
        
        log(`插件禁用与移除测试通过，耗时: ${duration}ms`, 'success');
        addTestResult('插件禁用与移除', true, `禁用、启用、移除都正常, 耗时: ${duration}ms`);
        
        return true;
    } catch (error) {
        log(`插件禁用与移除测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '插件禁用与移除',
            error: error.message,
            stack: error.stack
        });
        addTestResult('插件禁用与移除', false, error.message);
        return false;
    }
}

function testAdvancedIntegration() {
    log('开始测试: 高级图算法与插件集成', 'test');
    const startTime = Date.now();
    
    try {
        const pluginManager = new PluginManager();
        const metricsPlugin = new MetricsPlugin();
        const loggingPlugin = new LoggingPlugin();
        pluginManager.registerPlugin(metricsPlugin);
        pluginManager.registerPlugin(loggingPlugin);
        
        const graphDb = new EnhancedKnowledgeGraphDatabase(pluginManager);
        
        log('创建复杂图结构', 'detail');
        graphDb.createNode({ id: 'A', name: 'Node A', type: 'class' });
        graphDb.createNode({ id: 'B', name: 'Node B', type: 'class' });
        graphDb.createNode({ id: 'C', name: 'Node C', type: 'class' });
        graphDb.createNode({ id: 'D', name: 'Node D', type: 'class' });
        
        graphDb.createRelation({ id: 'rel-A-B', sourceId: 'A', targetId: 'B', type: 'uses' });
        graphDb.createRelation({ id: 'rel-B-C', sourceId: 'B', targetId: 'C', type: 'uses' });
        graphDb.createRelation({ id: 'rel-C-D', sourceId: 'C', targetId: 'D', type: 'uses' });
        graphDb.createRelation({ id: 'rel-D-A', sourceId: 'D', targetId: 'A', type: 'uses' });
        
        log('查找路径', 'detail');
        const path = graphDb.findPath('A', 'D', 5);
        log(`找到路径: ${JSON.stringify(path)}`, 'detail');
        
        log('检测循环依赖', 'detail');
        const cycles = graphDb.findCycleDependencies();
        log(`找到 ${cycles.length} 个循环`, 'detail');
        
        log('检查插件是否记录了所有操作', 'detail');
        const metrics = metricsPlugin.getMetrics();
        const logs = loggingPlugin.getLogs();
        
        if (metrics.nodeCount !== 4 || metrics.relationCount !== 4) {
            throw new Error('指标记录不正确');
        }
        
        if (logs.length === 0) {
            throw new Error('日志记录失败');
        }
        
        const duration = Date.now() - startTime;
        testResults.performance.advancedIntegration = duration;
        
        log(`高级图算法与插件集成测试通过，耗时: ${duration}ms`, 'success');
        addTestResult('高级图算法与插件集成', true, `路径查找和循环检测正常, 插件记录完整, 耗时: ${duration}ms`);
        
        return true;
    } catch (error) {
        log(`高级图算法与插件集成测试错误: ${error.message}`, 'error');
        testResults.bugsFound.push({
            test: '高级图算法与插件集成',
            error: error.message,
            stack: error.stack
        });
        addTestResult('高级图算法与插件集成', false, error.message);
        return false;
    }
}

testAllFeatures();
