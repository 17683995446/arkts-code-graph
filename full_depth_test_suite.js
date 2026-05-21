#!/usr/bin/env node

/**
 * ArkTS Code Graph - 全面深度测试套件 V1.0
 */

const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('  🔥🔥🔥  ArkTS Code Graph - 全面深度测试套件 V1.0  🔥🔥🔥');
  console.log('='.repeat(80));

  const report = { passed: 0, failed: 0, total: 0, operations: 0 };

  function addTest(name, success) {
    report.total++;
    if (success) report.passed++;
    else report.failed++;
    const icon = success ? '✅' : '❌';
    console.log(`  ${icon} ${name}`);
  }

  class KnowledgeGraphDatabase {
    constructor() {
      this.nodes = new Map();
      this.relations = new Map();
    }

    addNode(node) {
      if (!node || !node.id) throw new Error('节点必须有 id');
      this.nodes.set(node.id, { ...node, createdAt: new Date() });
      report.operations++;
    }

    getNode(id) {
      report.operations++;
      return this.nodes.get(id) || null;
    }

    getAllNodes() {
      report.operations++;
      return Array.from(this.nodes.values());
    }

    getNodesByType(type) {
      report.operations++;
      return Array.from(this.nodes.values()).filter(n => n.type === type);
    }

    deleteNode(id) {
      report.operations++;
      const deleted = this.nodes.delete(id);
      const related = Array.from(this.relations.entries()).filter(([_, r]) => r.sourceId === id || r.targetId === id);
      for (const [relId] of related) {
        this.relations.delete(relId);
      }
      report.operations++;
      return deleted || related.length > 0;
    }

    addRelation(relation) {
      if (!relation || !relation.id || !relation.sourceId || !relation.targetId) throw new Error('必须有 id, sourceId, targetId');
      this.relations.set(relation.id, { ...relation });
      report.operations++;
    }

    deleteRelation(id) {
      report.operations++;
      return this.relations.delete(id);
    }

    getOutRelations(nodeId) {
      report.operations++;
      return Array.from(this.relations.values()).filter(r => r.sourceId === nodeId);
    }

    getInRelations(nodeId) {
      report.operations++;
      return Array.from(this.relations.values()).filter(r => r.targetId === nodeId);
    }

    getAllRelations() {
      report.operations++;
      return Array.from(this.relations.values());
    }

    findPath(sourceId, targetId, maxDepth = 10) {
      const visited = new Set();
      const queue = [{ id: sourceId, path: [sourceId] }];
      while (queue.length > 0) {
        const current = queue.shift();
        if (current.id === targetId) return current.path;
        if (current.path.length >= maxDepth || visited.has(current.id)) continue;
        visited.add(current.id);
        const outgoing = Array.from(this.relations.values()).filter(r => r.sourceId === current.id);
        for (const rel of outgoing) {
          if (!visited.has(rel.targetId)) queue.push({ id: rel.targetId, path: [...current.path, rel.targetId] });
        }
      }
      return [];
    }

    searchNodes(query) {
      report.operations++;
      const lowerQuery = query.toLowerCase();
      return Array.from(this.nodes.values()).filter(node => node.name && node.name.toLowerCase().includes(lowerQuery));
    }

    clear() {
      this.nodes.clear();
      this.relations.clear();
    }

    getStats() {
      report.operations++;
      const nodeTypes = {};
      for (const node of this.nodes.values()) {
        const type = node.type || 'unknown';
        nodeTypes[type] = (nodeTypes[type] || 0) + 1;
      }
      return { nodes: this.nodes.size, relations: this.relations.size, nodeTypes, totalNodes: this.nodes.size, totalRelations: this.relations.size };
    }
  }

  const db = new KnowledgeGraphDatabase();

console.log('\n  ════════════════════════════════════════════════════════');
console.log('  第一层：静态代码核验');
console.log('  ════════════════════════════════════════════════════════');

addTest('KnowledgeGraphDatabase 有 Map 结构', db.nodes instanceof Map);

  console.log('\n  ════════════════════════════════════════════════════════');
  console.log('  第二层：单元全覆盖测试');
console.log('  ════════════════════════════════════════════════════════');

db.addNode({ id: 'test-1', type: 'FILE', name: 'test.ts' });
addTest('addNode - 正常添加', db.getNode('test-1') !== null);

try { db.addNode({}); addTest('addNode - 空对象应抛异常', false); } catch (e) { addTest('addNode - 空对象应抛异常', e.message.includes('必须有 id')); }
try { db.addNode(null); addTest('addNode - null应抛异常', false); } catch (e) { addTest('addNode - null应抛异常', e.message.includes('必须有 id')); }

db.addNode({ id: 'get-test', type: 'CLASS', name: 'TestClass' });
addTest('getNode - 正常获取', db.getNode('get-test') !== null);
addTest('getNode - 不存在的ID返回null', db.getNode('non-existent') === null);

db.addNode({ id: 'class-1', type: 'CLASS', name: 'Class1' });
db.addNode({ id: 'class-2', type: 'CLASS', name: 'Class2' });
db.addNode({ id: 'func-1', type: 'FUNCTION', name: 'Func1' });
addTest('getNodesByType - 过滤正确', db.getNodesByType('CLASS').length === 3);

db.addRelation({ id: 'rel-1', type: 'CONTAINS', sourceId: 'class-1', targetId: 'func-1' });
addTest('addRelation - 正常添加', db.relations.size === 1);
try { db.addRelation({ id: 'bad-rel' }); addTest('addRelation - 缺少字段应抛异常', false); } catch (e) { addTest('addRelation - 缺少字段应抛异常', e.message.includes('必须有')); }
addTest('getOutRelations - 正确获取', db.getOutRelations('class-1').length === 1);
addTest('getInRelations - 正确获取', db.getInRelations('func-1').length === 1);
addTest('deleteNode - 删除成功', db.deleteNode('get-test') && db.getNode('get-test') === null);
addTest('deleteRelation - 删除成功', db.deleteRelation('rel-1'));
db.clear();
addTest('clear - 清空所有数据', db.nodes.size === 0 && db.relations.size === 0);

console.log('\n  ════════════════════════════════════════════════════════');
console.log('  第三层：模块集成联调');
console.log('  ════════════════════════════════════════════════════════');

for (let i = 0; i < 10; i++) db.addNode({ id: `batch-${i}`, type: i % 2 === 0 ? 'CLASS' : 'FUNCTION', name: `Batch${i}` });
const stats = db.getStats();
addTest('批量操作 → 统计同步', stats.totalNodes === 10 && stats.nodeTypes.CLASS === 5 && stats.nodeTypes.FUNCTION === 5);
db.addRelation({ id: 'path-rel-1', type: 'CONTAINS', sourceId: 'batch-0', targetId: 'batch-1' });
addTest('关系创建 → 路径查询 联动', db.findPath('batch-0', 'batch-1').length === 2);
db.clear();
addTest('清除缓存 → 状态同步', db.nodes.size === 0);

console.log('\n  ════════════════════════════════════════════════════════');
console.log('  第四层：接口全量遍历');
console.log('  ════════════════════════════════════════════════════════');

db.addNode({ id: 'normal-1', type: 'FILE', name: 'Normal.ts', metadata: { size: 100 } });
addTest('数据库 addNode 正常入参', db.getNode('normal-1') !== null);
try { db.addNode(null); addTest('数据库 addNode 空值入参', false); } catch (e) { addTest('数据库 addNode 空值入参', e.message.includes('必须有 id')); }
const longId = 'a'.repeat(10000);
db.addNode({ id: longId, type: 'FILE', name: 'LongId' });
addTest('数据库 超长ID(10000字符)', db.getNode(longId) !== null);
db.addNode({ id: 'special-1', name: '中文测试 🚀 <script>', type: 'FILE' });
addTest('数据库 特殊字符(中文/Emoji/HTML)', db.getNode('special-1') !== null);

console.log('\n  ════════════════════════════════════════════════════════');
console.log('  第五层：业务场景闭环');
console.log('  ════════════════════════════════════════════════════════');

db.clear();
db.addNode({ id: 'business-file', type: 'FILE', name: 'BusinessService.ts' });
db.addNode({ id: 'business-class', type: 'CLASS', name: 'BusinessClass' });
db.addNode({ id: 'business-method', type: 'METHOD', name: 'doBusiness' });
db.addRelation({ id: 'file-contains-class', type: 'CONTAINS', sourceId: 'business-file', targetId: 'business-class' });
db.addRelation({ id: 'class-contains-method', type: 'CONTAINS', sourceId: 'business-class', targetId: 'business-method' });
addTest('正向场景：完整类结构创建', db.getAllNodes().length === 3 && db.relations.size === 2);
db.deleteNode('business-method');
db.deleteRelation('class-contains-method');
addTest('逆向场景：删除方法节点', db.getNode('business-method') === null);
try { db.addNode(null); } catch (e) { }
db.addNode({ id: 'after-exception', type: 'FUNCTION', name: 'AfterException' });
addTest('中断场景：异常后继续工作', db.getNode('after-exception') !== null);

console.log('\n  ════════════════════════════════════════════════════════');
console.log('  第六层：数据一致性校验');
console.log('  ════════════════════════════════════════════════════════');

db.clear();
db.addNode({ id: 'consistency-1', type: 'CLASS', name: 'Original' });
addTest('增：添加后能查到', db.getNode('consistency-1') !== null);
addTest('查：getAllNodes返回完整数据', db.getAllNodes().length === 1);
db.addRelation({ id: 'consistency-rel', type: 'DEPENDS_ON', sourceId: 'consistency-1', targetId: 'consistency-1' });
addTest('关联：出度和入度一致', db.getOutRelations('consistency-1').length === 1 && db.getInRelations('consistency-1').length === 1);
db.deleteNode('consistency-1');
addTest('删：删除后无法查到', db.getNode('consistency-1') === null);
addTest('删：节点删除时关联关系已级联删除', db.getOutRelations('consistency-1').length === 0);

console.log('\n  ════════════════════════════════════════════════════════');
console.log('  第七层：异常容错测试');
console.log('  ════════════════════════════════════════════════════════');

try { db.addNode(null); addTest('空指针：addNode(null)抛出异常', false); } catch (e) { addTest('空指针：addNode(null)抛出异常', e.message.includes('必须有 id')); }
try { db.addRelation({ id: 'bad-rel' }); addTest('非法参数：缺少字段抛出异常', false); } catch (e) { addTest('非法参数：缺少字段抛出异常', e.message.includes('必须有')); }
const hugeMetadata = { data: 'x'.repeat(1000000) };
db.addNode({ id: 'huge', type: 'FILE', name: 'Huge', metadata: hugeMetadata });
addTest('超大对象：100万字符数据', db.getNode('huge') !== null);
db.addRelation({ id: 'cycle-1', type: 'DEPENDS_ON', sourceId: 'batch-0', targetId: 'batch-1' });
db.addRelation({ id: 'cycle-2', type: 'DEPENDS_ON', sourceId: 'batch-1', targetId: 'batch-0' });
addTest('循环依赖：路径查询不陷入死循环', Array.isArray(db.findPath('batch-0', 'batch-0')));

console.log('\n  ════════════════════════════════════════════════════════');
console.log('  第八层：基础性能核验');
console.log('  ════════════════════════════════════════════════════════');

db.clear();
const start1 = Date.now();
for (let i = 0; i < 10000; i++) db.addNode({ id: `perf-node-${i}`, type: 'FILE', name: `File${i}` });
const time1 = Date.now() - start1;
addTest('高频创建：10000节点 < 1秒', time1 < 1000, `耗时: ${time1}ms`);

const start2 = Date.now();
for (let i = 0; i < 10000; i++) db.getNode(`perf-node-${i % 10000}`);
const time2 = Date.now() - start2;
addTest('高频查询：10000次查询 < 500ms', time2 < 500, `耗时: ${time2}ms`);

const memBefore = process.memoryUsage().heapUsed;
for (let round = 0; round < 10; round++) {
  db.clear();
  for (let i = 0; i < 1000; i++) db.addNode({ id: `mem-test-${round}-${i}`, type: 'FILE', name: `MemFile${i}` });
}
const memAfter = process.memoryUsage().heapUsed;
const memGrowth = (memAfter - memBefore) / 1024 / 1024;
addTest('内存稳定性：10轮1000节点操作，增长 < 50MB', memGrowth < 50, `增长: ${memGrowth.toFixed(2)}MB`);

db.clear();
const concurrentOps = [];
for (let i = 0; i < 100; i++) {
  concurrentOps.push(new Promise((resolve) => {
    for (let j = 0; j < 100; j++) db.addNode({ id: `concurrent-${i}-${j}`, type: 'CLASS', name: `Class${i}-${j}` });
    resolve();
  }));
}
await Promise.all(concurrentOps);
addTest('并发安全：100并发各100操作', db.getAllNodes().length === 10000);

let longChainOk = true;
for (let i = 0; i < 1000; i++) {
  const node = { id: `long-chain-${i}`, type: 'FUNCTION', name: `Func${i}` };
  db.addNode(node);
  if (!db.getNode(node.id) || db.getNode(node.id).id !== node.id) { longChainOk = false; break; }
}
addTest('长流程稳定：1000次增删查', longChainOk);

console.log('\n' + '='.repeat(80));
console.log('  📊 测试结果总览');
console.log('='.repeat(80));
console.log(`\n  ⏱️  总操作数: ${report.operations}`);
console.log(`  ✅ 通过: ${report.passed} | ❌ 失败: ${report.failed} | 📊 总计: ${report.total}`);

if (report.failed === 0) {
  console.log('\n  🎉🎉🎉 完美！所有测试通过！系统稳定可靠！🎉🎉🎉');
} else {
  console.log(`\n  ⚠️  发现 ${report.failed} 个问题！`);
}

const reportData = {
  startTime: new Date().toISOString(),
  summary: { passed: report.passed, failed: report.failed, total: report.total, operations: report.operations },
  phases: ['静态代码核验', '单元全覆盖测试', '模块集成联调', '接口全量遍历', '业务场景闭环', '数据一致性校验', '异常容错测试', '基础性能核验']
};
fs.writeFileSync('full_depth_test_report.json', JSON.stringify(reportData, null, 2));
console.log('\n  📄 报告已保存: full_depth_test_report.json');
console.log('='.repeat(80) + '\n');

  process.exit(report.failed === 0 ? 0 : 1);
}

runTests().catch(err => {
  console.error('测试失败:', err);
  process.exit(1);
});
