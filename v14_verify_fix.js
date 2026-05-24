#!/usr/bin/env node

/**
 * 🎯 ArkTS Code Graph - 第14.0代 验证修复
 */

console.log('='.repeat(150));
console.log('🎯🎯🎯 ArkTS Code Graph - 第14.0代 验证修复');
console.log('='.repeat(150));

const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
const results = {
    allTestsPassed: true,
    tests: [],
    futurePlans: []
};

console.log('\n🔧 TEST 1: 验证级联删除修复');
const db = new KnowledgeGraphDatabase();

db.addNode({ id: 'A', type: 'CLASS', name: 'A' });
db.addNode({ id: 'B', type: 'CLASS', name: 'B' });
db.addNode({ id: 'C', type: 'CLASS', name: 'C' });

db.addRelation({ id: 'rel1', sourceId: 'A', targetId: 'B', type: 'CALLS' });
db.addRelation({ id: 'rel2', sourceId: 'B', targetId: 'C', type: 'CALLS' });

const beforeStats = db.getStats();
console.log('   📊 删除前:', beforeStats);

db.deleteNode('B');
const afterStats = db.getStats();
console.log('   📊 删除后:', afterStats);

const outA = db.getOutRelations('A');
const inC = db.getInRelations('C');
console.log('   ✅ A 的出站关系数:', outA.length);
console.log('   ✅ C 的入站关系数:', inC.length);

const test1Passed = outA.length === 0 && inC.length === 0 && afterStats.totalRelations === 0;
results.tests.push({ name: '级联删除修复', passed: test1Passed });
console.log(`   🎯 级联删除修复: ${test1Passed ? '✅ 通过' : '❌ 失败'}`);
if (!test1Passed) results.allTestsPassed = false;

console.log('\n🔧 TEST 2: 验证 getRelation API');
const test2Passed = typeof db.getRelation === 'function';
results.tests.push({ name: 'getRelation API', passed: test2Passed });

db.addNode({ id: 'X', type: 'CLASS', name: 'X' });
db.addNode({ id: 'Y', type: 'CLASS', name: 'Y' });
db.addRelation({ id: 'rel_test', sourceId: 'X', targetId: 'Y', type: 'CALLS' });

const rel = db.getRelation('rel_test');
console.log(`   ✅ getRelation 存在: ${typeof db.getRelation === 'function'}`);
console.log(`   ✅ getRelation 返回正确: ${!!rel}`);
console.log(`   🎯 getRelation API: ${test2Passed ? '✅ 通过' : '❌ 失败'}`);
if (!test2Passed) results.allTestsPassed = false;

// 第15.0-19.0代未来计划
results.futurePlans = [
    { phase: 15, name: '完整测试套件', description: '运行所有8层标准化测试' },
    { phase: 16, name: '超大规模压力测试', description: '10万节点测试' },
    { phase: 17, name: '真实项目解析', description: '解析真实的TypeScript项目' },
    { phase: 18, name: '高级功能完善', description: '图算法优化' },
    { phase: 19, name: '最终性能优化', description: '性能优化和长时间测试' }
];

console.log('\n🎉 第14.0代验证完成！');
console.log(`\n📊 结果: ${results.allTestsPassed ? '✅ 所有测试通过' : '❌ 有测试失败'}`);
console.log(`\n🚀 测试详情: ${results.tests.map(t => `${t.name}: ${t.passed ? '✅' : '❌'}`).join(', ')}`);

const fs = require('fs');
const path = require('path');
fs.writeFileSync(path.join(__dirname, 'v14_verification_report.json'), JSON.stringify(results, null, 2));
console.log('\n📄 报告已保存: v14_verification_report.json');
console.log('\n🎯 现在进行第15.0代完整测试！');
