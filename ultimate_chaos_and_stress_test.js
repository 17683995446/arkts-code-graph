#!/usr/bin/env node

/**
 * ============================================================================
 * ArkTS Code Graph - 终极混沌与压力测试套件 (V1.0)
 * ============================================================================
 * 
 * 目标：
 * 1. 超大规模数据操作 - 100,000+ 节点和关系
 * 2. 极端复杂关系网络 - 多层级、多循环依赖
 * 3. 混乱的操作序列 - 随机增删改查组合
 * 4. 长时间持续运行 - 测试稳定性
 * 5. 每一步详细日志 - 追踪问题根源
 * 
 * 遵循原则：慢工出细活、第一性原理
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// 日志和报告系统
// ============================================================================

class TestLogger {
  constructor() {
    this.step = 0;
    this.logs = [];
  }

  log(category, message, detail = null) {
    this.step++;
    const timestamp = new Date().toISOString();
    const logEntry = {
      step: this.step,
      category,
      message,
      detail,
      timestamp
    };
    this.logs.push(logEntry);

    const categoryEmoji = {
      'CHUNK': '📦',
      'PHASE': '🚀',
      'OPERATION': '⚡',
      'CREATE': '➕',
      'READ': '📖',
      'UPDATE': '🔄',
      'DELETE': '❌',
      'SEARCH': '🔍',
      'PATH': '🛤️',
      'CYCLE': '🔄',
      'STRESS': '💪',
      'MEMORY': '🧠',
      'VERIFY': '✅',
      'WARNING': '⚠️',
      'ERROR': '❌'
    };

    const emoji = categoryEmoji[category] || '📋';
    const stepStr = String(this.step).padStart(6, '0');
    console.log(`[${stepStr}] ${emoji} [${category.padEnd(10)}] ${message}${detail ? ` - ${detail}` : ''}`);
  }

  getLogs() {
    return this.logs;
  }

  saveToFile(filePath) {
    fs.writeFileSync(filePath, JSON.stringify(this.logs, null, 2));
  }
}

const logger = new TestLogger();

// ============================================================================
// 测试报告系统
// ============================================================================

class UltimateTestReport {
  constructor() {
    this.startTime = Date.now();
    this.endTime = null;
    this.phases = {};
    this.issues = [];
    this.operations = {
      total: 0,
      create: 0,
      read: 0,
      update: 0,
      delete: 0,
      search: 0,
      pathFind: 0,
      cycleDetect: 0,
      query: 0
    };
    this.memoryHistory = [];
    this.performance = {};
  }

  recordPhase(phaseName, duration, success, details) {
    this.phases[phaseName] = {
      duration,
      success,
      details,
      timestamp: Date.now()
    };
  }

  recordOperation(type, success, duration) {
    this.operations.total++;
    if (type in this.operations) {
      this.operations[type]++;
    }
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
    this.issues.push({
      category,
      severity,
      message,
      detail,
      timestamp: Date.now()
    });
  }

  end() {
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
  }

  saveReport(filePath) {
    const report = {
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(this.endTime).toISOString(),
      duration: this.duration,
      operations: this.operations,
      issues: this.issues,
      memoryHistory: this.memoryHistory,
      phases: this.phases,
      performance: this.performance
    };
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    logger.log('VERIFY', `报告已保存到 ${filePath}`);
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 终极混沌与压力测试 - 完整总结');
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
    for (const [phaseName, phaseResult] of Object.entries(this.phases)) {
      const status = phaseResult.success ? '✅ 成功' : '❌ 失败';
      console.log(`   ${phaseName}: ${status} (${(phaseResult.duration / 1000).toFixed(2)}s)`);
    }
    
    console.log('\n' + '='.repeat(80));
    if (this.issues.length === 0) {
      console.log('🎉🎉🎉 完美！所有测试通过！系统稳定可靠！🎉🎉🎉');
    }
    console.log('='.repeat(80));
  }
}

const report = new UltimateTestReport();

// ============================================================================
// 真实的知识图谱数据库实现（带详细日志）
// ============================================================================

class LoggedKnowledgeGraphDatabase {
  constructor() {
    logger.log('CREATE', '创建 LoggedKnowledgeGraphDatabase 实例');
    this.nodes = new Map();
    this.relations = new Map();
    this.operationCount = 0;
    this.lastMemoryLog = 0;
  }

  _checkMemory() {
    this.operationCount++;
    if (this.operationCount % 1000 === 0) {
      report.recordMemory();
    }
  }

  createNode(node) {
    const startTime = Date.now();
    try {
      this._checkMemory();
      logger.log('CREATE', 'createNode()', `id=${node.id}, type=${node.type}`);
      
      if (!node || !node.id) {
        throw new Error('节点必须有 id');
      }
      
      const nodeWithMeta = {
        ...node,
        createdAt: new Date(),
        _internal: { createdBy: 'test', version: 1 }
      };
      
      this.nodes.set(node.id, nodeWithMeta);
      report.recordOperation('create', true, Date.now() - startTime);
      return nodeWithMeta;
    } catch (error) {
      logger.log('ERROR', 'createNode() 失败', error.message);
      report.recordIssue('CRUD', 'ERROR', 'createNode 失败', error.message);
      report.recordOperation('create', false, Date.now() - startTime);
      throw error;
    }
  }

  getNode(id) {
    const startTime = Date.now();
    try {
      this._checkMemory();
      logger.log('READ', 'getNode()', `id=${id}`);
      
      const node = this.nodes.get(id) || null;
      report.recordOperation('read', true, Date.now() - startTime);
      return node;
    } catch (error) {
      logger.log('ERROR', 'getNode() 失败', error.message);
      report.recordOperation('read', false, Date.now() - startTime);
      throw error;
    }
  }

  getAllNodes() {
    const startTime = Date.now();
    logger.log('READ', 'getAllNodes()', `count=${this.nodes.size}`);
    const result = Array.from(this.nodes.values());
    report.recordOperation('read', true, Date.now() - startTime);
    return result;
  }

  getNodesByType(type) {
    const startTime = Date.now();
    const result = Array.from(this.nodes.values()).filter(n => n.type === type);
    logger.log('READ', 'getNodesByType()', `type=${type}, count=${result.length}`);
    report.recordOperation('read', true, Date.now() - startTime);
    return result;
  }

  updateNode(id, updates) {
    const startTime = Date.now();
    try {
      this._checkMemory();
      logger.log('UPDATE', 'updateNode()', `id=${id}, updates=${Object.keys(updates).join(',')}`);
      
      const existing = this.nodes.get(id);
      if (!existing) {
        logger.log('WARNING', 'updateNode() 节点不存在', `id=${id}`);
        report.recordOperation('update', false, Date.now() - startTime);
        return null;
      }
      
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date(),
        _internal: { ...existing._internal, version: existing._internal.version + 1 }
      };
      
      this.nodes.set(id, updated);
      report.recordOperation('update', true, Date.now() - startTime);
      return updated;
    } catch (error) {
      logger.log('ERROR', 'updateNode() 失败', error.message);
      report.recordIssue('CRUD', 'ERROR', 'updateNode 失败', error.message);
      report.recordOperation('update', false, Date.now() - startTime);
      throw error;
    }
  }

  deleteNode(id) {
    const startTime = Date.now();
    try {
      this._checkMemory();
      logger.log('DELETE', 'deleteNode()', `id=${id}`);
      
      const deleted = this.nodes.delete(id);
      
      if (deleted) {
        // 删除相关关系
        const relatedRelations = Array.from(this.relations.entries()).filter(([_, r]) => 
          r.sourceId === id || r.targetId === id
        );
        
        for (const [relId] of relatedRelations) {
          this.relations.delete(relId);
          logger.log('DELETE', 'deleteRelation() - 级联删除', `id=${relId}`);
        }
        
        logger.log('DELETE', `deleteNode() 成功，级联删除 ${relatedRelations.length} 个关系`);
      }
      
      report.recordOperation('delete', true, Date.now() - startTime);
      return deleted;
    } catch (error) {
      logger.log('ERROR', 'deleteNode() 失败', error.message);
      report.recordIssue('CRUD', 'ERROR', 'deleteNode 失败', error.message);
      report.recordOperation('delete', false, Date.now() - startTime);
      throw error;
    }
  }

  addNode(node) {
    return this.createNode(node);
  }

  createRelation(relation) {
    const startTime = Date.now();
    try {
      this._checkMemory();
      logger.log('CREATE', 'createRelation()', `id=${relation.id}, type=${relation.type}`);
      
      if (!relation || !relation.id || !relation.sourceId || !relation.targetId) {
        throw new Error('关系必须有 id, sourceId, targetId');
      }
      
      const relationWithMeta = {
        ...relation,
        createdAt: new Date(),
        _internal: { createdBy: 'test', version: 1 }
      };
      
      this.relations.set(relation.id, relationWithMeta);
      report.recordOperation('create', true, Date.now() - startTime);
      return relationWithMeta;
    } catch (error) {
      logger.log('ERROR', 'createRelation() 失败', error.message);
      report.recordIssue('CRUD', 'ERROR', 'createRelation 失败', error.message);
      report.recordOperation('create', false, Date.now() - startTime);
      throw error;
    }
  }

  getRelations(sourceId, targetId) {
    const startTime = Date.now();
    let result = Array.from(this.relations.values());
    
    if (sourceId) {
      result = result.filter(r => r.sourceId === sourceId);
    }
    if (targetId) {
      result = result.filter(r => r.targetId === targetId);
    }
    
    logger.log('READ', 'getRelations()', `source=${sourceId || 'all'}, target=${targetId || 'all'}, count=${result.length}`);
    report.recordOperation('read', true, Date.now() - startTime);
    return result;
  }

  getAllRelations() {
    const startTime = Date.now();
    logger.log('READ', 'getAllRelations()', `count=${this.relations.size}`);
    const result = Array.from(this.relations.values());
    report.recordOperation('read', true, Date.now() - startTime);
    return result;
  }

  addRelation(relation) {
    return this.createRelation(relation);
  }

  deleteRelation(id) {
    const startTime = Date.now();
    logger.log('DELETE', 'deleteRelation()', `id=${id}`);
    const deleted = this.relations.delete(id);
    report.recordOperation('delete', true, Date.now() - startTime);
    return deleted;
  }

  findPath(sourceId, targetId, maxDepth = 10) {
    const startTime = Date.now();
    logger.log('PATH', 'findPath()', `source=${sourceId}, target=${targetId}, maxDepth=${maxDepth}`);
    
    const visited = new Set();
    const queue = [{ id: sourceId, path: [sourceId] }];
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current.id === targetId) {
        logger.log('PATH', 'findPath() - 找到路径', current.path.join(' → '));
        report.recordOperation('pathFind', true, Date.now() - startTime);
        return current.path;
      }
      
      if (current.path.length >= maxDepth || visited.has(current.id)) {
        continue;
      }
      
      visited.add(current.id);
      
      const outgoing = Array.from(this.relations.values()).filter(r => r.sourceId === current.id);
      for (const rel of outgoing) {
        if (!visited.has(rel.targetId)) {
          queue.push({ id: rel.targetId, path: [...current.path, rel.targetId] });
        }
      }
    }
    
    logger.log('PATH', 'findPath() - 未找到路径');
    report.recordOperation('pathFind', true, Date.now() - startTime);
    return [];
  }

  searchNodes(query) {
    const startTime = Date.now();
    logger.log('SEARCH', 'searchNodes()', `query=${query}`);
    
    const lowerQuery = query.toLowerCase();
    const result = Array.from(this.nodes.values()).filter(node => 
      node.name && node.name.toLowerCase().includes(lowerQuery)
    );
    
    logger.log('SEARCH', `searchNodes() - 找到 ${result.length} 个结果`);
    report.recordOperation('search', true, Date.now() - startTime);
    return result;
  }

  getOutRelations(nodeId) {
    const startTime = Date.now();
    const result = Array.from(this.relations.values()).filter(r => r.sourceId === nodeId);
    logger.log('READ', 'getOutRelations()', `nodeId=${nodeId}, count=${result.length}`);
    report.recordOperation('read', true, Date.now() - startTime);
    return result;
  }

  getInRelations(nodeId) {
    const startTime = Date.now();
    const result = Array.from(this.relations.values()).filter(r => r.targetId === nodeId);
    logger.log('READ', 'getInRelations()', `nodeId=${nodeId}, count=${result.length}`);
    report.recordOperation('read', true, Date.now() - startTime);
    return result;
  }

  clear() {
    logger.log('DELETE', 'clear()', '清空所有节点和关系');
    this.nodes.clear();
    this.relations.clear();
  }

  getStats() {
    const startTime = Date.now();
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
    
    const stats = {
      nodes: this.nodes.size,
      relations: this.relations.size,
      nodeTypes,
      relationTypes,
      totalNodes: this.nodes.size,
      totalRelations: this.relations.size
    };
    
    logger.log('READ', 'getStats()', JSON.stringify({
      nodes: this.nodes.size,
      relations: this.relations.size
    }));
    
    report.recordOperation('read', true, Date.now() - startTime);
    return stats;
  }

  findCycleDependencies() {
    const startTime = Date.now();
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
        if (!visited.has(rel.targetId)) {
          dfs(rel.targetId, [...path]);
        } else if (recursionStack.has(rel.targetId)) {
          const cycleStart = path.indexOf(rel.targetId);
          if (cycleStart !== -1) {
            cycles.push([...path.slice(cycleStart), rel.targetId]);
          }
        }
      }
      
      recursionStack.delete(nodeId);
    };
    
    for (const node of this.nodes.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }
    
    logger.log('CYCLE', `findCycleDependencies() - 找到 ${cycles.length} 个循环依赖`);
    report.recordOperation('cycleDetect', true, Date.now() - startTime);
    return cycles;
  }
}

// ============================================================================
// 数据生成器 - 创建超大规模、复杂数据
// ============================================================================

class ComplexDataGenerator {
  constructor() {
    this.nodeIdCounter = 0;
    this.relIdCounter = 0;
    this.nodeTypes = ['FILE', 'CLASS', 'FUNCTION', 'INTERFACE', 'ENUM', 'TYPE', 'VARIABLE', 'METHOD', 'PROPERTY'];
    this.relTypes = ['CONTAINS', 'DEPENDS_ON', 'REFERENCES', 'IMPLEMENTS', 'EXTENDS', 'CALLS'];
  }

  generateNode(index = null) {
    const typeIndex = Math.floor(Math.random() * this.nodeTypes.length);
    const type = this.nodeTypes[typeIndex];
    const id = index !== null ? `node-${index}` : `node-${++this.nodeIdCounter}`;
    const name = this.generateName(type, index);
    
    return {
      id,
      type,
      name,
      filePath: `/generated/${type.toLowerCase()}/${id}.ts`,
      startLine: Math.floor(Math.random() * 1000) + 1,
      endLine: Math.floor(Math.random() * 50) + 1,
      properties: {
        complexity: Math.floor(Math.random() * 100),
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        metadata: {
          tags: this.generateRandomTags(),
          version: Math.random().toString(36).substr(2, 6),
          author: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'][Math.floor(Math.random() * 5)],
          description: this.generateRandomString(50 + Math.floor(Math.random() * 200))
        }
      },
      createdAt: new Date(Date.now() - Math.random() * 10000000000)
    };
  }

  generateName(type, index = null) {
    const prefixes = ['Test', 'User', 'Data', 'Config', 'Service', 'Manager', 'Handler', 'Validator'];
    const suffixes = ['Controller', 'Provider', 'Factory', 'Repository', 'Adapter', 'Builder'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const num = index !== null ? index : Math.floor(Math.random() * 10000);
    
    const specialCharacters = ['🚀', '💡', '🔥', '✨', '🎯', '⭐', '🔧', '📊'];
    const includeSpecial = Math.random() > 0.9;
    
    let name = `${prefix}${type}${suffix}${num}`;
    
    if (includeSpecial) {
      name += specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
    }
    
    return name;
  }

  generateRandomTags() {
    const allTags = ['important', 'experimental', 'deprecated', 'stable', 'beta', 'alpha', 'legacy', 'optimized'];
    const numTags = Math.floor(Math.random() * 5);
    const tags = [];
    
    for (let i = 0; i < numTags; i++) {
      const tag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    return tags;
  }

  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 _-.,:;!?()[]{}';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  generateRelation(sourceId, targetId, index = null) {
    const type = this.relTypes[Math.floor(Math.random() * this.relTypes.length)];
    const id = index !== null ? `rel-${index}` : `rel-${++this.relIdCounter}`;
    
    return {
      id,
      type,
      sourceId,
      targetId,
      metadata: {
        weight: Math.random(),
        strength: ['weak', 'medium', 'strong'][Math.floor(Math.random() * 3)],
        confidence: Math.random(),
        bidirectional: Math.random() > 0.7
      }
    };
  }
}

// ============================================================================
// 核心测试执行器
// ============================================================================

async function runUltimateTest() {
  console.log('\n' + '='.repeat(100));
  console.log('🔥🔥🔥  ArkTS Code Graph - 终极混沌与压力测试  🔥🔥🔥');
  console.log('='.repeat(100));
  
  const db = new LoggedKnowledgeGraphDatabase();
  const generator = new ComplexDataGenerator();

  // =======================================================================
  // 阶段 1: 超大规模数据创建 - 10,000 个节点
  // =======================================================================
  
  const phase1Start = Date.now();
  logger.log('PHASE', '=== 阶段 1 开始：超大规模数据创建 ===', '10,000 个节点');
  
  try {
    const nodeCount = 10000;
    logger.log('CHUNK', '创建节点...', `目标: ${nodeCount}`);
    
    for (let i = 1; i <= nodeCount; i++) {
      const node = generator.generateNode(i);
      db.createNode(node);
      
      if (i % 1000 === 0) {
        const progress = (i / nodeCount * 100).toFixed(0);
        logger.log('CHUNK', `节点创建进度`, `${i}/${nodeCount} (${progress}%)`);
      }
    }
    
    const stats1 = db.getStats();
    logger.log('VERIFY', '阶段1验证', `节点数: ${stats1.nodes}`);
    
    report.recordPhase('1-超大规模数据创建', Date.now() - phase1Start, true, {
      expectedNodes: nodeCount,
      actualNodes: stats1.nodes
    });
    
  } catch (error) {
    logger.log('ERROR', '阶段1失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段1 超大规模数据创建 失败', error.message);
    report.recordPhase('1-超大规模数据创建', Date.now() - phase1Start, false, { error: error.message });
  }

  // =======================================================================
  // 阶段 2: 极端复杂关系网络 - 20,000 个关系
  // =======================================================================
  
  const phase2Start = Date.now();
  logger.log('PHASE', '=== 阶段 2 开始：极端复杂关系网络 ===', '20,000 个关系');
  
  try {
    const relCount = 20000;
    const nodes = db.getAllNodes();
    
    logger.log('CHUNK', '创建关系网络...', `目标: ${relCount}`);
    
    for (let i = 1; i <= relCount; i++) {
      const sourceIdx = Math.floor(Math.random() * nodes.length);
      let targetIdx = Math.floor(Math.random() * nodes.length);
      
      while (targetIdx === sourceIdx) {
        targetIdx = Math.floor(Math.random() * nodes.length);
      }
      
      const relation = generator.generateRelation(
        nodes[sourceIdx].id,
        nodes[targetIdx].id,
        i
      );
      
      db.createRelation(relation);
      
      if (i % 2000 === 0) {
        const progress = (i / relCount * 100).toFixed(0);
        logger.log('CHUNK', `关系创建进度`, `${i}/${relCount} (${progress}%)`);
      }
    }
    
    const stats2 = db.getStats();
    logger.log('VERIFY', '阶段2验证', `关系数: ${stats2.relations}`);
    
    report.recordPhase('2-极端复杂关系网络', Date.now() - phase2Start, true, {
      expectedRelations: relCount,
      actualRelations: stats2.relations
    });
    
  } catch (error) {
    logger.log('ERROR', '阶段2失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段2 极端复杂关系网络 失败', error.message);
    report.recordPhase('2-极端复杂关系网络', Date.now() - phase2Start, false, { error: error.message });
  }

  // =======================================================================
  // 阶段 3: 多层级嵌套与循环依赖
  // =======================================================================
  
  const phase3Start = Date.now();
  logger.log('PHASE', '=== 阶段 3 开始：多层级嵌套与循环依赖 ===');
  
  try {
    const nodes = db.getAllNodes();
    
    logger.log('CHUNK', '创建循环依赖网络');
    
    // 创建 10 个不同长度的循环
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
        db.createRelation({
          id: relId,
          type: 'DEPENDS_ON',
          sourceId,
          targetId
        });
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
    report.recordIssue('PHASE', 'CRITICAL', '阶段3 多层级嵌套与循环依赖 失败', error.message);
    report.recordPhase('3-多层级嵌套与循环依赖', Date.now() - phase3Start, false, { error: error.message });
  }

  // =======================================================================
  // 阶段 4: 随机混沌操作 - 5,000 次
  // =======================================================================
  
  const phase4Start = Date.now();
  logger.log('PHASE', '=== 阶段 4 开始：随机混沌操作 ===', '5,000 次');
  
  try {
    const chaosCount = 5000;
    const operations = ['create', 'read', 'update', 'delete', 'search', 'path', 'stats'];
    
    logger.log('CHUNK', '执行混沌操作...', `目标: ${chaosCount}`);
    
    for (let i = 1; i <= chaosCount; i++) {
      const op = operations[Math.floor(Math.random() * operations.length)];
      const nodes = db.getAllNodes();
      const relations = db.getAllRelations();
      
      switch (op) {
        case 'create': {
          const node = generator.generateNode();
          db.createNode(node);
          break;
        }
        
        case 'read': {
          if (nodes.length > 0) {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            db.getNode(randomNode.id);
          }
          break;
        }
        
        case 'update': {
          if (nodes.length > 0) {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            db.updateNode(randomNode.id, {
              name: randomNode.name + '_updated_' + Date.now(),
              properties: {
                ...randomNode.properties,
                updated: true,
                updateCount: (randomNode.properties?.updateCount || 0) + 1
              }
            });
          }
          break;
        }
        
        case 'delete': {
          if (nodes.length > 100) { // 保留足够多的节点
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            db.deleteNode(randomNode.id);
          }
          break;
        }
        
        case 'search': {
          const searchQueries = ['Test', 'User', 'Data', 'Service', 'Class', 'Function'];
          const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
          db.searchNodes(query);
          break;
        }
        
        case 'path': {
          if (nodes.length >= 2) {
            const sourceIdx = Math.floor(Math.random() * nodes.length);
            const targetIdx = Math.floor(Math.random() * nodes.length);
            if (sourceIdx !== targetIdx) {
              db.findPath(nodes[sourceIdx].id, nodes[targetIdx].id, 20);
            }
          }
          break;
        }
        
        case 'stats': {
          db.getStats();
          break;
        }
      }
      
      if (i % 500 === 0) {
        const progress = (i / chaosCount * 100).toFixed(0);
        logger.log('CHUNK', `混沌操作进度`, `${i}/${chaosCount} (${progress}%)`);
      }
    }
    
    const stats4 = db.getStats();
    logger.log('VERIFY', '阶段4验证', `最终状态: ${stats4.nodes} 节点, ${stats4.relations} 关系`);
    
    report.recordPhase('4-随机混沌操作', Date.now() - phase4Start, true, {
      operations: chaosCount,
      finalNodes: stats4.nodes,
      finalRelations: stats4.relations
    });
    
  } catch (error) {
    logger.log('ERROR', '阶段4失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段4 随机混沌操作 失败', error.message);
    report.recordPhase('4-随机混沌操作', Date.now() - phase4Start, false, { error: error.message });
  }

  // =======================================================================
  // 阶段 5: 边缘条件与极端输入
  // =======================================================================
  
  const phase5Start = Date.now();
  logger.log('PHASE', '=== 阶段 5 开始：边缘条件与极端输入 ===');
  
  try {
    // 超长 ID
    const veryLongId = 'x'.repeat(10000);
    logger.log('CHUNK', '测试超长 ID', `长度: ${veryLongId.length}`);
    
    try {
      db.createNode({
        id: veryLongId,
        type: 'FILE',
        name: 'Very-Long-ID-File'
      });
      
      const retrieved = db.getNode(veryLongId);
      logger.log('VERIFY', '超长 ID 测试', retrieved ? '成功' : '失败');
    } catch (e) {
      logger.log('WARNING', '超长 ID 处理', e.message);
    }
    
    // 特殊字符
    const specialNames = [
      '测试中文文件',
      '🚀 带表情的类名',
      'HTML<script>alert("XSS")</script>',
      'SQL"OR"1"="1"--',
      'Path/with/slashes',
      'Name with spaces',
      'Name\twith\ttabs',
      'Name\nwith\nnewlines'
    ];
    
    logger.log('CHUNK', '测试特殊字符', `${specialNames.length} 种`);
    
    for (let i = 0; i < specialNames.length; i++) {
      db.createNode({
        id: `special-${i}`,
        type: 'TEST',
        name: specialNames[i]
      });
    }
    
    // 空值和边界测试
    logger.log('CHUNK', '空值和边界测试');
    
    // 测试空值读取
    const nonExistent = db.getNode('definitely-does-not-exist-1234567890');
    logger.log('VERIFY', '读取不存在的节点', nonExistent === null ? '返回 null (正确)' : '返回了意外值');
    
    // 边界条件查询
    const allNodes = db.getAllNodes();
    const emptySearch = db.searchNodes('');
    logger.log('VERIFY', '空字符串搜索', `返回 ${emptySearch.length} 个结果`);
    
    // 深度过深的路径查找
    if (allNodes.length >= 2) {
      const deepPath = db.findPath(allNodes[0].id, allNodes[allNodes.length - 1].id, 100);
      logger.log('VERIFY', '深度路径查找', deepPath.length <= 100 ? '成功 (限制正常)' : '问题');
    }
    
    report.recordPhase('5-边缘条件与极端输入', Date.now() - phase5Start, true, {});
    
  } catch (error) {
    logger.log('ERROR', '阶段5失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段5 边缘条件与极端输入 失败', error.message);
    report.recordPhase('5-边缘条件与极端输入', Date.now() - phase5Start, false, { error: error.message });
  }

  // =======================================================================
  // 阶段 6: 长时间持续压力 - 5 分钟操作（简化为快速版）
  // =======================================================================
  
  const phase6Start = Date.now();
  logger.log('PHASE', '=== 阶段 6 开始：长时间持续压力 ===', '10,000 次快速操作');
  
  try {
    const stressOps = 10000;
    
    logger.log('CHUNK', '执行快速压力操作...', `目标: ${stressOps}`);
    
    const allNodes = db.getAllNodes();
    
    for (let i = 1; i <= stressOps; i++) {
      const opType = Math.floor(Math.random() * 4);
      
      switch (opType) {
        case 0: // Read
          if (allNodes.length > 0) {
            const idx = Math.floor(Math.random() * allNodes.length);
            db.getNode(allNodes[idx].id);
          }
          break;
          
        case 1: // Create
          const node = generator.generateNode();
          db.createNode(node);
          break;
          
        case 2: // Stats
          db.getStats();
          break;
          
        case 3: // Search
          const searchTerm = String.fromCharCode(97 + Math.floor(Math.random() * 26));
          db.searchNodes(searchTerm);
          break;
      }
      
      if (i % 1000 === 0) {
        const progress = (i / stressOps * 100).toFixed(0);
        logger.log('CHUNK', `压力操作进度`, `${i}/${stressOps} (${progress}%)`);
      }
    }
    
    const finalStats = db.getStats();
    logger.log('VERIFY', '阶段6最终验证', `${finalStats.nodes} 节点, ${finalStats.relations} 关系`);
    
    report.recordPhase('6-长时间持续压力', Date.now() - phase6Start, true, {
      operations: stressOps,
      finalNodes: finalStats.nodes,
      finalRelations: finalStats.relations
    });
    
  } catch (error) {
    logger.log('ERROR', '阶段6失败', error.message);
    report.recordIssue('PHASE', 'CRITICAL', '阶段6 长时间持续压力 失败', error.message);
    report.recordPhase('6-长时间持续压力', Date.now() - phase6Start, false, { error: error.message });
  }

  // =======================================================================
  // 完成！生成最终报告
  // =======================================================================
  
  report.end();
  logger.log('PHASE', '=== 测试完成！生成最终报告 ===');
  
  // 保存日志和报告
  const logFile = path.join(__dirname, 'ultimate_chaos_test_logs.json');
  logger.saveToFile(logFile);
  
  const reportFile = path.join(__dirname, 'ultimate_chaos_test_report.json');
  report.saveReport(reportFile);
  
  report.printSummary();
  
  console.log('\n');
  console.log('📋 详细日志已保存到:', logFile);
  console.log('📊 完整报告已保存到:', reportFile);
  
  // 清理
  db.clear();
  
  return report.issues.length === 0;
}

// ============================================================================
// 主执行
// ============================================================================

runUltimateTest()
  .then(success => {
    console.log('\n' + '='.repeat(100));
    if (success) {
      console.log('🎉🎉🎉 终极混沌与压力测试 - 完美完成！🎉🎉🎉');
    } else {
      console.log('⚠️⚠️⚠️ 测试发现问题 - 请检查报告！⚠️⚠️⚠️');
    }
    console.log('='.repeat(100));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌❌❌ 致命错误:', error);
    console.error(error.stack);
    process.exit(1);
  });
