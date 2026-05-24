#!/usr/bin/env node

/**
 * 🎯 ArkTS Code Graph - 第13.0代 快速Bug发现测试
 */

console.log('='.repeat(150));
console.log('🎯🎯🎯 ArkTS Code Graph - 第13.0代 快速Bug发现');
console.log('='.repeat(150));

const results = {
    bugsFound: [],
    warningsFound: [],
    futurePlans: []
};

// 1. 发现级联删除Bug
console.log('\n🔧 TEST 1: 级联删除Bug测试');
const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
const db = new KnowledgeGraphDatabase();

console.log('   📦 创建节点 A, B, C');
db.addNode({ id: 'A', type: 'CLASS', name: 'A' });
db.addNode({ id: 'B', type: 'CLASS', name: 'B' });
db.addNode({ id: 'C', type: 'CLASS', name: 'C' });

console.log('   🔗 创建关系 A->B, B->C');
db.addRelation({ id: 'rel1', sourceId: 'A', targetId: 'B', type: 'CALLS' });
db.addRelation({ id: 'rel2', sourceId: 'B', targetId: 'C', type: 'CALLS' });

const beforeStats = db.getStats();
console.log('   📊 删除前:', beforeStats);

console.log('   🗑️ 删除节点 B');
db.deleteNode('B');

const afterStats = db.getStats();
console.log('   📊 删除后:', afterStats);

const outA = db.getOutRelations('A');
const inC = db.getInRelations('C');
console.log('   ⚠️ A 的出站关系数:', outA.length);
console.log('   ⚠️ C 的入站关系数:', inC.length);

if (outA.length > 0 || inC.length > 0) {
    console.log('   🚨 🚨 🚨 发现BUG！！！');
    console.log('   🚨 deleteNode 没有级联删除相关关系！');
    
    results.bugsFound.push({
        id: 'BUG-CASCADE-001',
        severity: 'CRITICAL',
        description: 'deleteNode 方法删除节点时没有级联删除相关的关系，导致孤立关系和数据不一致'
    });
}

// 2. 发现 getRelation 缺失问题
console.log('\n🔧 TEST 2: 检查API完整性');
if (typeof db.getRelation !== 'function') {
    console.log('   ⚠️ getRelation 方法缺失！');
    results.warningsFound.push('getRelation 方法缺失');
}

// 3. 生成未来迭代计划
results.futurePlans = [
    {
        phase: 14,
        name: '修复级联删除Bug',
        description: '修复 deleteNode 方法，添加级联删除功能'
    },
    {
        phase: 15,
        name: '添加缺失的API',
        description: '添加 getRelation 方法'
    },
    {
        phase: 16,
        name: '全面测试验证',
        description: '运行完整测试套件验证修复'
    },
    {
        phase: 17,
        name: '真实项目测试',
        description: '对真实项目进行解析测试'
    },
    {
        phase: 18,
        name: '性能优化',
        description: '进行性能优化和长时间压力测试'
    }
];

console.log('\n🎉 第13.0代测试完成！');
console.log(`🐛 Bugs found: ${results.bugsFound.length}`);
console.log(`⚠️ Warnings: ${results.warningsFound.length}`);

const fs = require('fs');
const path = require('path');
fs.writeFileSync(path.join(__dirname, 'v13_bug_report.json'), JSON.stringify(results, null, 2));

console.log('\n📄 报告已保存: v13_bug_report.json');
console.log('\n🚀 现在开始第14.0代 - 修复Bug！');
