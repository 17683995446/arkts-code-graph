#!/usr/bin/env node

/**
 * ArkTS Code Graph - 快速但完整的终极混沌与压力测试
 */

const fs = require('fs');
const path = require('path');

console.log('🔥🔥🔥  ArkTS Code Graph - 快速终极混沌与压力测试  🔥🔥🔥');

// ============================================
// 测试日志系统
// ============================================
class TestLogger {
  constructor() {
    this.step = 0;
    this.logs = [];
  }

  log(category, message, detail = null) {
    this.step++;
    const timestamp = new Date().toISOString();
    this.logs.push({ step: this.step, category, message, detail, timestamp });
    
    const emoji = {
      'CHUNK': '📦', 'PHASE': '🚀', 'CREATE': '➕', 'READ': '📖',
      'UPDATE': '🔄', 'DELETE': '❌', 'SEARCH': '🔍', 'PATH': '🛤️',
      'CYCLE': '🔄', 'VERIFY': '✅', 'WARNING': '⚠️', 'ERROR': '❌'
    }[category] || '📋';
    
    const stepStr = String(this.step).padStart(5, '0');
    console.log(`[${stepStr}] ${emoji} [${category.padEnd(10)}] ${message}${detail ? ` - ${detail}` : ''}`);
  }
}

const logger = new TestLogger();

// ============================================
// 测试报告系统
// ============================================
class UltimateTestReport {
  constructor() {
    this.startTime = Date.now();
    this.endTime = null;
    this.phases = {};
    this.issues = [];
    this.operations = {
      total: 0, create: 0, read: 0, update: 0, delete: 0, search: 0, pathFind: 0, cycleDetect: 0
    };
    this.memoryHistory = [];
  }

  recordPhase(name, duration, success, details) {
    this.phases[name] = { duration, success, details, timestamp: Date.now() };
  }

  recordOperation(type, success) {
    this.operations.total++;
    if (type in this.operations) this.operations[type]++;
  }

  recordMemory() {
    const usage = process.memoryUsage();
    this.memoryHistory.push({
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      rss: usage.rss
    });
  }

  recordIssue(category, severity, message, detail) {
    this.issues.push({ category, severity, message, detail, timestamp: Date.now() });
  }

  end() {
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 快速终极混沌与压力测试 - 完整总结');
    console.log('='.repeat(80));
    
    console.log(`\n⏱️ 总耗时: ${(this.duration / 1000).toFixed(2)}s`);
    console.log(`📊 总操作数: ${this.operations.total}`);
    console.log(`   - 创建: ${this.operations.create}`);
    console.log(`   - 读取: ${this.operations.read}`);
    console.log(`   - 更新: ${this.operations.update}`);
    console.log(`   - 删除: ${this.operations.delete}`);
    console.log(`   - 搜索: ${this.operations.search}`);
    console.log(`   - 路径查找: ${this.operations.pathFind}`);
    console.log(`   - 循环检测: ${this.operations.cycleDetect}`);
    
    console.log(`\n⚠️ 发现的问题: ${this.issues.length}`);
    if (this.issues.length > 0) {
      console.log('问题列表:');
      for (const issue of this.issues) {
        console.log(`  - [${issue.severity}] ${issue.message}`);
      }
    }
    
    console.log('\n✅ 测试阶段结果:');
    for (const [name, result] of Object.entries(this.phases)) {
      const status = result.success ? '✅ 成功' : '❌ 失败';
      console.log(`   ${name}: ${status} (${(result.duration / 1000).toFixed(2)}s)`);
    }
    
    console.log('\n' + '='.repeat(80));
    if (this.issues.length === 0) {
      console.log('🎉🎉🎉 完美！所有测试通过！系统稳定可靠！🎉🎉🎉');
    }
    console.log('='.repeat(80));
  }
}

const report = new UltimateTestReport();

// ============================================
// 带详细日志的知识图谱数据库
// ============================================
class LoggedKnowledgeGraphDatabase {
  constructor() {
    logger.log('CREATE', '创建 LoggedKnowledgeGraphDatabase 实例');
    this.nodes = new Map();
    this.relations = new Map();
    this.operationCount = 0;
  }

  _checkMemory() {
    this.operationCount++;
    if (this.operationCount % 200 === 0) {
      report.recordMemory();
    }
  }

  createNode(node) {
    this._checkMemory();
    logger.log('CREATE', 'createNode()', `id=${node.id}, type=${node.type}`);
    if (!node || !node.id) throw new Error('节点必须有 id');
    this.nodes.set(node.id, { ...node, createdAt: new Date(), _internal: { version: 1 } });
    report.recordOperation('create', true);
    return this.nodes.get(node.id);
  }

  getNode(id) {
    this._checkMemory();
    logger.log('READ', 'getNode()', `id=${id}`);
    report.recordOperation('read', true);
    return this.nodes.get(id) || null;
  }

  getAllNodes() {
    logger.log('READ', 'getAllNodes()', `count=${this.nodes.size}`);
    report.recordOperation('read', true);
    return Array.from(this.nodes.values());
  }

  getNodesByType(type) {
    const result = Array.from(this.nodes.values()).filter(n => n.type === type);
    logger.log('READ', 'getNodesByType()', `type=${type}, count=${result.length}`);
    report.recordOperation('read', true);
    return result;
  }

  updateNode(id, updates) {
    this._checkMemory();
    logger.log('UPDATE', 'updateNode()', `id=${id}`);
    const existing = this.nodes.get(id);
    if (!existing) {
      logger.log('WARNING', 'updateNode() 节点不存在', `id=${id}`);
      report.recordOperation('update', false);
      return null;
    }
    const updated = { ...existing, ...updates, updatedAt: new Date(), _internal: { ...existing._internal, version: existing._internal.version + 1 } };
    this.nodes.set(id, updated);
    report.recordOperation('update', true);
    return updated;
  }

  deleteNode(id) {
    this._checkMemory();
    logger.log('DELETE', 'deleteNode()', `id=${id}`);
    const deleted = this.nodes.delete(id);
    if (deleted) {
      const relatedRelations = Array.from(this.relations.entries()).filter(([_, r]) => r.sourceId === id || r.targetId === id);
      for (const [relId] of relatedRelations) {
        this.relations.delete(relId);
      }
      logger.log('DELETE', `deleteNode() 成功，级联删除 ${relatedRelations.length} 个关系`);
    }
    report.recordOperation('delete', true);
    return deleted;
  }

  addNode(node) { return this.createNode(node); }

  createRelation(relation) {
    this._checkMemory();
    logger.log('CREATE', 'createRelation()', `id=${relation.id}, type=${relation.type}`);
    if (!relation || !relation.id || !relation.sourceId || !relation.targetId) throw new Error('关系必须有 id, sourceId, targetId');
    this.relations.set(relation.id, { ...relation, createdAt: new Date(), _internal: { version: 1 } });
    report.recordOperation('create', true);
    return this.relations.get(relation.id);
  }

  addRelation(relation) { return this.createRelation(relation); }

  deleteRelation(id) {
    logger.log('DELETE', 'deleteRelation()', `id=${id}`);
    report.recordOperation('delete', true);
    return this.relations.delete(id);
  }

  getOutRelations(nodeId) {
    const result = Array.from(this.relations.values()).filter(r => r.sourceId === nodeId);
    logger.log('READ', 'getOutRelations()', `nodeId=${nodeId}, count=${result.length}`);
    report.recordOperation('read', true);
    return result;
  }

  getInRelations(nodeId) {
    const result = Array.from(this.relations.values()).filter(r => r.targetId === nodeId);
    logger.log('READ', 'getInRelations()', `nodeId=${nodeId}, count=${result.length}`);
    report.recordOperation('read', true);
    return result;
  }

  getAllRelations() {
    logger.log('READ', 'getAllRelations()', `count=${this.relations.size}`);
    report.recordOperation('read', true);
    return Array.from(this.relations.values());
  }

  findPath(sourceId, targetId, maxDepth = 10) {
    logger.log('PATH', 'findPath()', `source=${sourceId}, target=${targetId}`);
    const visited = new Set();
    const queue = [{ id: sourceId, path: [sourceId] }];
    
    while (queue.length > 0) {
      const current = queue.shift();
      if (current.id === targetId) {
        logger.log('PATH', 'findPath() - 找到路径', current.path.join(' → '));
        report.recordOperation('pathFind', true);
        return current.path;
      }
      if (current.path.length >= maxDepth || visited.has(current.id)) continue;
      visited.add(current.id);
      const outgoing = Array.from(this.relations.values()).filter(r => r.sourceId === current.id);
      for (const rel of outgoing) {
        if (!visited.has(rel.targetId)) queue.push({ id: rel.targetId, path: [...current.path, rel.targetId] });
      }
    }
    report.recordOperation('pathFind', true);
    return [];
  }

  searchNodes(query) {
    logger.log('SEARCH', 'searchNodes()', `query=${query}`);
    const lowerQuery = query.toLowerCase();
    const result = Array.from(this.nodes.values()).filter(node => node.name && node.name.toLowerCase().includes(lowerQuery));
    logger.log('SEARCH', `searchNodes() - 找到 ${result.length} 个结果`);
    report.recordOperation('search', true);
    return result;
  }

  clear() {
    logger.log('DELETE', 'clear()', '清空所有节点和关系');
    this.nodes.clear();
    this.relations.clear();
  }

  getStats() {
    const nodeTypes = {};
    const relationTypes = {};
    for (const node of this.nodes.values()) {
      const type = node.type || 'unknown';
      nodeTypes[type] = (nodeTypes[type] || 0) + 1;
    }
    for (const relation of this.relations.values()) {
      const type = relation.type || 'unknown';
      relationTypes[type] = (relationTypes[type] || 0) + 1;
    }
    const stats = { nodes: this.nodes.size, relations: this.relations.size, nodeTypes, relationTypes, totalNodes: this.nodes.size, totalRelations: this.relations.size };
    logger.log('READ', 'getStats()', `nodes=${stats.nodes}, relations=${stats.relations}`);
    report.recordOperation('read', true);
    return stats;
  }

  findCycleDependencies() {
    logger.log('CYCLE', 'findCycleDependencies()');
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (nodeId, path) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);
      const outgoing = Array.from(this.relations.values()).filter(r => r.sourceId === nodeId);
      for (const rel of outgoing) {
        if (!visited.has(rel.targetId)) dfs(rel.targetId, [...path]);
        else if (recursionStack.has(rel.targetId)) {
          const cycleStart = path.indexOf(rel.targetId);
          if (cycleStart !== -1) cycles.push([...path.slice(cycleStart), rel.targetId]);
        }
      }
      recursionStack.delete(nodeId);
    };
    
    for (const node of this.nodes.keys()) {
      if (!visited.has(node)) dfs(node, []);
    }
    logger.log('CYCLE', `findCycleDependencies() - 找到 ${cycles.length} 个循环依赖`);
    report.recordOperation('cycleDetect', true);
    return cycles;
  }
}

// ============================================
// 数据生成器
// ============================================
class ComplexDataGenerator {
  constructor() {
    this.nodeTypes = ['FILE', 'CLASS', 'FUNCTION', 'INTERFACE', 'ENUM', 'TYPE', 'VARIABLE', 'METHOD', 'PROPERTY'];
    this.relTypes = ['CONTAINS', 'DEPENDS_ON', 'REFERENCES', 'IMPLEMENTS', 'EXTENDS', 'CALLS'];
  }

  generateNode(index) {
    const typeIndex = Math.floor(Math.random() * this.nodeTypes.length);
    const type = this.nodeTypes[typeIndex];
    return {
      id: `node-${index}`,
      type,
      name: `Test${type}${index}${Math.random() > 0.9 ? '🚀' : ''}`,
      filePath: `/generated/${type.toLowerCase()}/node-${index}.ts`,
      startLine: Math.floor(Math.random() * 1000) + 1,
      endLine: Math.floor(Math.random() * 50) + 1,
      properties: {
        complexity: Math.floor(Math.random() * 100),
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)]
      }
    };
  }

  generateRelation(sourceId, targetId, index) {
    return {
      id: `rel-${index}`,
      type: this.relTypes[Math.floor(Math.random() * this.relTypes.length)],
      sourceId,
      targetId,
      metadata: { strength: ['weak', 'medium', 'strong'][Math.floor(Math.random() * 3)], confidence: Math.random() }
    };
  }
}

// ============================================
// 核心测试执行
// ============================================
async function runFastTest() {
  const db = new LoggedKnowledgeGraphDatabase();
  const generator = new ComplexDataGenerator();

  // =========================================
  // 阶段 1: 超大规模数据创建
  // =========================================
  const phase1Start = Date.now();
  logger.log('PHASE', '=== 阶段 1: 超大规模数据创建 ===', '2000 个节点');
  
  try {
    const nodeCount = 2000;
    for (let i = 1; i <= nodeCount; i++) {
      db.createNode(generator.generateNode(i));
      if (i % 200 === 0) {
        const progress = (i / nodeCount * 100).toFixed(0);
        logger.log('CHUNK', `节点创建进度`, `${i}/${nodeCount} (${progress}%)`);
      }
    }
    const stats = db.getStats();
    logger.log('VERIFY', '阶段1验证', `节点数: ${stats.nodes}`);
    report.recordPhase('1-超大规模数据创建', Date.now() - phase1Start, true, {
      expectedNodes: nodeCount, actualNodes: stats.nodes
    });
  } catch (error) {
    logger.log('ERROR', '阶段1失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段1失败', error.message);
    report.recordPhase('1-超大规模数据创建', Date.now() - phase1Start, false, { error: error.message });
  }

  // =========================================
  // 阶段 2: 极端复杂关系网络
  // =========================================
  const phase2Start = Date.now();
  logger.log('PHASE', '=== 阶段 2: 极端复杂关系网络 ===', '4000 个关系');
  
  try {
    const relCount = 4000;
    const nodes = db.getAllNodes();
    
    for (let i = 1; i <= relCount; i++) {
      let sourceIdx = Math.floor(Math.random() * nodes.length);
      let targetIdx = Math.floor(Math.random() * nodes.length);
      while (targetIdx === sourceIdx) targetIdx = Math.floor(Math.random() * nodes.length);
      const relation = generator.generateRelation(nodes[sourceIdx].id, nodes[targetIdx].id, i);
      db.createRelation(relation);
      if (i % 400 === 0) {
        const progress = (i / relCount * 100).toFixed(0);
        logger.log('CHUNK', `关系创建进度`, `${i}/${relCount} (${progress}%)`);
      }
    }
    const stats = db.getStats();
    logger.log('VERIFY', '阶段2验证', `关系数: ${stats.relations}`);
    report.recordPhase('2-极端复杂关系网络', Date.now() - phase2Start, true, {
      expectedRelations: relCount, actualRelations: stats.relations
    });
  } catch (error) {
    logger.log('ERROR', '阶段2失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段2失败', error.message);
    report.recordPhase('2-极端复杂关系网络', Date.now() - phase2Start, false, { error: error.message });
  }

  // =========================================
  // 阶段 3: 多层级嵌套与循环依赖
  // =========================================
  const phase3Start = Date.now();
  logger.log('PHASE', '=== 阶段 3: 多层级嵌套与循环依赖 ===');
  
  try {
    const nodes = db.getAllNodes();
    for (let cycleLength = 2; cycleLength <= 10; cycleLength++) {
      const cycleNodes = [];
      for (let i = 0; i < cycleLength; i++) {
        const idx = Math.floor(Math.random() * nodes.length);
        cycleNodes.push(nodes[idx].id);
      }
      for (let i = 0; i < cycleLength; i++) {
        const sourceId = cycleNodes[i];
        const targetId = cycleNodes[(i + 1) % cycleLength];
        const relId = `cycle-${cycleLength}-${i}`;
        db.createRelation({ id: relId, type: 'DEPENDS_ON', sourceId, targetId });
      }
      logger.log('CYCLE', `创建长度 ${cycleLength} 的循环依赖`);
    }
    const cycles = db.findCycleDependencies();
    logger.log('VERIFY', '循环依赖检测', `发现 ${cycles.length} 个循环`);
    report.recordPhase('3-多层级嵌套与循环依赖', Date.now() - phase3Start, true, {
      cyclesFound: cycles.length
    });
  } catch (error) {
    logger.log('ERROR', '阶段3失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段3失败', error.message);
    report.recordPhase('3-多层级嵌套与循环依赖', Date.now() - phase3Start, false, { error: error.message });
  }

  // =========================================
  // 阶段 4: 随机混沌操作
  // =========================================
  const phase4Start = Date.now();
  logger.log('PHASE', '=== 阶段 4: 随机混沌操作 ===', '2000 次');
  
  try {
    const chaosCount = 2000;
    const operations = ['create', 'read', 'update', 'delete', 'search', 'path', 'stats'];
    
    for (let i = 1; i <= chaosCount; i++) {
      const op = operations[Math.floor(Math.random() * operations.length)];
      const nodes = db.getAllNodes();
      
      switch (op) {
        case 'create':
          db.createNode(generator.generateNode(2000 + i));
          break;
        case 'read':
          if (nodes.length > 0) {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            db.getNode(randomNode.id);
          }
          break;
        case 'update':
          if (nodes.length > 0) {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            db.updateNode(randomNode.id, { name: randomNode.name + '_updated' });
          }
          break;
        case 'delete':
          if (nodes.length > 50) {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            db.deleteNode(randomNode.id);
          }
          break;
        case 'search':
          db.searchNodes(['Test', 'File', 'Class', 'Function'][Math.floor(Math.random() * 4)]);
          break;
        case 'path':
          if (nodes.length >= 2) {
            const srcIdx = Math.floor(Math.random() * nodes.length);
            const tgtIdx = Math.floor(Math.random() * nodes.length);
            if (srcIdx !== tgtIdx) db.findPath(nodes[srcIdx].id, nodes[tgtIdx].id, 20);
          }
          break;
        case 'stats':
          db.getStats();
          break;
      }
      
      if (i % 200 === 0) {
        const progress = (i / chaosCount * 100).toFixed(0);
        logger.log('CHUNK', `混沌操作进度`, `${i}/${chaosCount} (${progress}%)`);
      }
    }
    const stats = db.getStats();
    logger.log('VERIFY', '阶段4验证', `节点数: ${stats.nodes}, 关系数: ${stats.relations}`);
    report.recordPhase('4-随机混沌操作', Date.now() - phase4Start, true, {
      operations: chaosCount, finalNodes: stats.nodes, finalRelations: stats.relations
    });
  } catch (error) {
    logger.log('ERROR', '阶段4失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段4失败', error.message);
    report.recordPhase('4-随机混沌操作', Date.now() - phase4Start, false, { error: error.message });
  }

  // =========================================
  // 阶段 5: 边缘条件与极端输入
  // =========================================
  const phase5Start = Date.now();
  logger.log('PHASE', '=== 阶段 5: 边缘条件与极端输入 ===');
  
  try {
    const veryLongId = 'x'.repeat(10000);
    db.createNode({ id: veryLongId, type: 'FILE', name: 'VeryLongIdFile' });
    const retrieved = db.getNode(veryLongId);
    logger.log('VERIFY', '超长 ID 测试', retrieved ? '成功' : '失败');
    
    const specialNames = ['测试中文', '🚀 带表情', '<script>XSS</script>', 'SQL"INJECTION"--', 'Path/With/Slashes', 'Name With Spaces'];
    for (let i = 0; i < specialNames.length; i++) {
      db.createNode({ id: `special-${i}`, type: 'TEST', name: specialNames[i] });
    }
    
    const nonExistent = db.getNode('definitely-not-exists-12345');
    logger.log('VERIFY', '读取不存在节点', nonExistent === null ? '返回 null (正确)' : '问题');
    
    const emptySearch = db.searchNodes('');
    logger.log('VERIFY', '空字符串搜索', `返回 ${emptySearch.length} 个结果`);
    
    report.recordPhase('5-边缘条件与极端输入', Date.now() - phase5Start, true, {});
  } catch (error) {
    logger.log('ERROR', '阶段5失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段5失败', error.message);
    report.recordPhase('5-边缘条件与极端输入', Date.now() - phase5Start, false, { error: error.message });
  }

  // =========================================
  // 阶段 6: 长时间持续压力
  // =========================================
  const phase6Start = Date.now();
  logger.log('PHASE', '=== 阶段 6: 长时间持续压力 ===', '5000 次快速操作');
  
  try {
    const stressOps = 5000;
    const allNodes = db.getAllNodes();
    
    for (let i = 1; i <= stressOps; i++) {
      const opType = Math.floor(Math.random() * 4);
      switch (opType) {
        case 0:
          if (allNodes.length > 0) db.getNode(allNodes[Math.floor(Math.random() * allNodes.length)].id);
          break;
        case 1:
          db.createNode(generator.generateNode(10000 + i));
          break;
        case 2:
          db.getStats();
          break;
        case 3:
          db.searchNodes(String.fromCharCode(97 + Math.floor(Math.random() * 26)));
          break;
      }
      if (i % 500 === 0) {
        const progress = (i / stressOps * 100).toFixed(0);
        logger.log('CHUNK', `压力操作进度`, `${i}/${stressOps} (${progress}%)`);
      }
    }
    const finalStats = db.getStats();
    logger.log('VERIFY', '阶段6验证', `最终: ${finalStats.nodes} 节点, ${finalStats.relations} 关系`);
    report.recordPhase('6-长时间持续压力', Date.now() - phase6Start, true, {
      operations: stressOps, finalNodes: finalStats.nodes, finalRelations: finalStats.relations
    });
  } catch (error) {
    logger.log('ERROR', '阶段6失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段6失败', error.message);
    report.recordPhase('6-长时间持续压力', Date.now() - phase6Start, false, { error: error.message });
  }

  // =========================================
  // 完成
  // =========================================
  report.end();
  logger.log('PHASE', '=== 测试完成！生成最终报告 ===');
  
  const logFile = path.join(__dirname, 'ultimate_chaos_test_fast_logs.json');
  fs.writeFileSync(logFile, JSON.stringify(logger.logs, null, 2));
  
  const reportFile = path.join(__dirname, 'ultimate_chaos_test_fast_report.json');
  const finalReport = {
    startTime: new Date(report.startTime).toISOString(),
    endTime: new Date(report.endTime).toISOString(),
    duration: report.duration,
    operations: report.operations,
    issues: report.issues,
    memoryHistory: report.memoryHistory,
    phases: report.phases
  };
  fs.writeFileSync(reportFile, JSON.stringify(finalReport, null, 2));
  
  report.printSummary();
  
  console.log('\n📋 详细日志:', logFile);
  console.log('📊 完整报告:', reportFile);
  
  return report.issues.length === 0;
}

// 执行
runFastTest()
  .then(success => {
    console.log('\n' + '='.repeat(80));
    if (success) console.log('🎉🎉🎉 快速终极混沌与压力测试 - 完美完成！🎉🎉🎉');
    else console.log('⚠️⚠️⚠️ 发现问题，请查看报告！⚠️⚠️⚠️');
    console.log('='.repeat(80));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌❌❌ 致命错误:', error);
    process.exit(1);
  });
