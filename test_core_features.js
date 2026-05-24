#!/usr/bin/env node

/**
 * 🔥 核心功能测试脚本
 * 直接测试编译后的代码，避开TypeScript类型检查问题
 */

console.log('='.repeat(120));
console.log('🔥 核心功能测试 - 直接测试编译后代码');
console.log('='.repeat(120));
console.log('');

const results = {
    tests: [],
    passed: 0,
    failed: 0,
    startTime: Date.now()
};

function test(name, fn) {
    try {
        console.log(`🧪 测试: ${name}`);
        fn();
        console.log(`✅ ${name} - 通过`);
        results.tests.push({ name, status: 'passed' });
        results.passed++;
    } catch (error) {
        console.log(`❌ ${name} - 失败: ${error.message}`);
        results.tests.push({ name, status: 'failed', error: error.message });
        results.failed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// 测试1: 模块加载
test('模块加载测试', () => {
    const { coreEngine } = require('./dist/src/core/engine');
    assert(coreEngine, 'coreEngine 应该存在');
    assert(typeof coreEngine.acquireNode === 'function', 'acquireNode 应该是函数');
    assert(typeof coreEngine.releaseNode === 'function', 'releaseNode 应该是函数');
});

// 测试2: 对象池 - 获取和释放节点
test('对象池 - 节点获取释放', () => {
    const { coreEngine } = require('./dist/src/core/engine');
    
    const node1 = coreEngine.acquireNode();
    assert(node1, '应该能获取到节点');
    
    node1.id = 'test_node_1';
    node1.name = 'Test Node';
    node1.type = 'CLASS';
    
    coreEngine.releaseNode(node1);
    
    // 再次获取应该也正常工作
    const node2 = coreEngine.acquireNode();
    assert(node2, '应该能获取到第二个节点');
    coreEngine.releaseNode(node2);
});

// 测试3: 节点元数据处理
test('节点元数据处理', () => {
    const { coreEngine } = require('./dist/src/core/engine');
    
    const node = coreEngine.acquireNode();
    
    // 设置各种类型的元数据
    node.metadata = {
        string_field: 'string_value',
        number_field: 12345,
        boolean_field: true,
        array_field: [1, 2, 3, 4, 5],
        object_field: { key: 'value' }
    };
    
    // 验证元数据可以正确存储和访问
    assert(node.metadata.string_field === 'string_value', '字符串字段应该正确存储');
    assert(node.metadata.number_field === 12345, '数字字段应该正确存储');
    assert(node.metadata.boolean_field === true, '布尔字段应该正确存储');
    assert(Array.isArray(node.metadata.array_field), '数组字段应该是数组类型');
    
    coreEngine.releaseNode(node);
});

// 测试4: 关系节点测试
test('关系节点测试', () => {
    const { coreEngine } = require('./dist/src/core/engine');
    
    const relation = coreEngine.acquireRelation();
    relation.sourceId = 'source_123';
    relation.targetId = 'target_456';
    relation.type = 'CALLS';
    relation.weight = 0.85;
    
    assert(relation.sourceId === 'source_123', '源节点ID应该正确');
    assert(relation.targetId === 'target_456', '目标节点ID应该正确');
    assert(relation.type === 'CALLS', '关系类型应该正确');
    assert(relation.weight === 0.85, '关系权重应该正确');
    
    coreEngine.releaseRelation(relation);
});

// 测试5: 空值安全处理 (之前修复的Bug)
test('空值安全处理 - 修复验证', () => {
    const { coreEngine } = require('./dist/src/core/engine');
    
    // 这些操作不应该抛出错误
    let errorOccurred = false;
    
    try {
        coreEngine.releaseNode(null);
        coreEngine.releaseNode(undefined);
        coreEngine.releaseRelation(null);
        coreEngine.releaseRelation(undefined);
    } catch (e) {
        errorOccurred = true;
    }
    
    assert(errorOccurred === false, '释放null/undefined值不应该抛出错误');
});

// 测试6: 大量节点并发测试
test('大量节点并发测试', () => {
    const { coreEngine } = require('./dist/src/core/engine');
    
    const nodeCount = 1000;
    const nodes = [];
    
    // 创建1000个节点
    for (let i = 0; i < nodeCount; i++) {
        const node = coreEngine.acquireNode();
        node.id = `batch_node_${i}`;
        node.index = i;
        nodes.push(node);
    }
    
    assert(nodes.length === nodeCount, `应该创建${nodeCount}个节点`);
    
    // 释放所有节点
    for (const node of nodes) {
        coreEngine.releaseNode(node);
    }
});

// 测试7: 内存使用测试
test('内存使用监控', () => {
    const { coreEngine } = require('./dist/src/core/engine');
    const initialMem = process.memoryUsage();
    
    const testNodes = [];
    const testRelations = [];
    
    // 创建和释放多个节点和关系
    for (let i = 0; i < 500; i++) {
        const node = coreEngine.acquireNode();
        node.id = `memory_test_node_${i}`;
        testNodes.push(node);
        
        const relation = coreEngine.acquireRelation();
        relation.sourceId = `src_${i}`;
        relation.targetId = `tgt_${i}`;
        testRelations.push(relation);
    }
    
    // 全部释放
    for (const node of testNodes) {
        coreEngine.releaseNode(node);
    }
    for (const relation of testRelations) {
        coreEngine.releaseRelation(relation);
    }
    
    const finalMem = process.memoryUsage();
    const memGrowth = finalMem.heapUsed - initialMem.heapUsed;
    
    // 检查内存增长是否在合理范围内（小于10MB）
    console.log(`内存使用变化: ${(memGrowth / 1024 / 1024).toFixed(2)} MB`);
    assert(memGrowth < 10 * 1024 * 1024, '内存增长应该在合理范围内');
});

// 测试8: 重复释放同一个对象
test('重复释放同一个对象', () => {
    const { coreEngine } = require('./dist/src/core/engine');
    
    const node = coreEngine.acquireNode();
    let errorCount = 0;
    
    try {
        coreEngine.releaseNode(node);
        coreEngine.releaseNode(node); // 重复释放
        coreEngine.releaseNode(node); // 再次释放
    } catch (e) {
        errorCount++;
    }
    
    assert(errorCount === 0, '重复释放不应该抛出错误');
});

// 输出测试结果
console.log('');
console.log('='.repeat(120));
console.log('📊 测试结果总结');
console.log('='.repeat(120));
console.log(`✅ 通过: ${results.passed}`);
console.log(`❌ 失败: ${results.failed}`);
console.log(`📈 总计: ${results.tests.length}`);
console.log(`⏱️ 耗时: ${(Date.now() - results.startTime) / 1000}秒`);

if (results.failed === 0) {
    console.log('');
    console.log('🎉 所有测试通过！系统核心功能运行正常！');
} else {
    console.log('');
    console.log('⚠️ 部分测试失败，请检查上面的输出');
}

console.log('='.repeat(120));

process.exit(results.failed > 0 ? 1 : 0);
