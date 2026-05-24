#!/usr/bin/env node

/**
 * 🎯🎯 ArkTS Code Graph - 分阶段精细测试方案 V9.0
 * 
 * 慢工出细活原则 - 每个阶段精细测试，细致发现问题
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(200));
console.log('🎯🎯 ArkTS Code Graph - 分阶段精细测试 V9.0');
console.log('🎯🎯 慢工出细活 - 每个阶段精细测试，细致发现问题');
console.log('='.repeat(200));
console.log('');

const results = {
  startTime: Date.now(),
  endTime: null,
  currentPhase: 0,
  bugsFound: [],
  warningsFound: [],
  phases: [],
  memoryHistory: [],
  detailedMetrics: {}
};

class MeticulousTestingEngine {
  constructor() {
    this.phaseStartTime = Date.now();
    this.lastLogTime = Date.now();
    this.phaseMetrics = {};
  }

  log(msg, type = 'INFO') {
    const elapsed = Math.floor((Date.now() - results.startTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    
    const icons = {
      'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 'INFO': 'ℹ️', 
      'TEST': '🧪', 'PERF': '⚡', 'DURATION': '⏱️', 'MEMORY': '📊', 
      'PHASE': '📦', 'DETAIL': '🔍'
    };
    
    console.log(`${icons[type] || 'ℹ️'} [${mins}:${secs}] ${msg}`);
  }

  async recordMemory(label = 'Memory') {
    const mem = process.memoryUsage();
    const entry = {
      label,
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      rss: Math.round(mem.rss / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
      timestamp: Date.now()
    };
    
    results.memoryHistory.push(entry);
    this.log(`📊 [${label}] Heap: ${entry.heapUsed}MB, RSS: ${entry.rss}MB`, 'MEMORY');
    return entry;
  }

  recordPhaseStart(phaseNumber, phaseName) {
    this.phaseStartTime = Date.now();
    results.currentPhase = phaseNumber;
    this.phaseMetrics = {
      phaseNumber,
      phaseName,
      startTime: Date.now(),
      tests: [],
      bugs: [],
      warnings: []
    };
    this.log(`📦 ============== PHASE ${phaseNumber}: ${phaseName} ==============`, 'PHASE');
  }

  recordPhaseEnd() {
    this.phaseMetrics.endTime = Date.now();
    this.phaseMetrics.duration = this.phaseMetrics.endTime - this.phaseMetrics.startTime;
    this.phaseMetrics.passed = this.phaseMetrics.bugs.length === 0;
    results.phases.push({...this.phaseMetrics});
    
    const phaseResult = this.phaseMetrics.passed ? '✅ PASSED' : '❌ FAILED';
    const duration = Math.round((this.phaseMetrics.duration) / 1000);
    
    this.log(`\n📦 PHASE ${this.phaseMetrics.phaseNumber} ${phaseResult} (${duration}s)\n`, 'PHASE');
  }

  recordTest(name, testFn) {
    const startTime = Date.now();
    let passed = true;
    let error = null;
    
    try {
      testFn();
    } catch (e) {
      passed = false;
      error = e;
      this.log(`🐛 [FAILED] ${name}`, 'BUG');
      this.phaseMetrics.bugs.push({name, error: e.message, stack: e.stack});
      results.bugsFound.push({phase: this.phaseMetrics.phaseNumber, name, error: e.message, stack: e.stack});
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    this.phaseMetrics.tests.push({
      name,
      passed,
      duration,
      error: error?.message
    });
    
    if (passed) {
      this.log(`✅ [PASSED] ${name} (${duration}ms)`, 'SUCCESS');
    }
  }

  recordWarning(msg, context = null) {
    this.log(`⚠️ ${msg}`, 'WARNING');
    this.phaseMetrics.warnings.push({msg, context, timestamp: Date.now()});
    results.warningsFound.push({phase: this.phaseMetrics.phaseNumber, msg, context});
  }

  async startPhase1BasicFunctionality() {
    this.recordPhaseStart(1, '基础功能深度测试');
    
    this.log('📦 Phase 1: 加载核心模块...');
    await this.recordMemory('Phase 1 Start');
    
    const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
    const { coreEngine } = require('./dist/src/core/engine');
    
    // === TEST 1: 基础节点操作 ===
    this.recordTest('创建单个节点', () => {
      const db = new KnowledgeGraphDatabase();
      db.addNode({
        id: 'phase1-test1-node1',
        type: 'CLASS',
        name: 'TestClass',
        filePath: '/test/class.ts',
        createdAt: new Date()
      });
      
      const retrieved = db.getNode('phase1-test1-node1');
      if (!retrieved || retrieved.name !== 'TestClass') {
        throw new Error('节点创建或检索失败');
      }
    });

    // === TEST 2: 批量节点操作 ===
    this.recordTest('批量创建100个节点', () => {
      const db = new KnowledgeGraphDatabase();
      for (let i = 0; i < 100; i++) {
        db.addNode({
          id: `phase1-test2-node-${i}`,
          type: i % 3 === 0 ? 'CLASS' : i % 3 === 1 ? 'FUNCTION' : 'VARIABLE',
          name: `Test${i}`,
          filePath: `/test/file-${i}.ts`,
          createdAt: new Date()
        });
      }
      
      const stats = db.getStats();
      if (stats.totalNodes !== 100) {
        throw new Error(`节点数量不符：期望100，实际${stats.totalNodes}`);
      }
    });

    // === TEST 3: 关系创建与查询 ===
    this.recordTest('关系创建与查询', () => {
      const db = new KnowledgeGraphDatabase();
      
      db.addNode({id: 'phase1-test3-nodeA', type: 'CLASS', name: 'ClassA', createdAt: new Date()});
      db.addNode({id: 'phase1-test3-nodeB', type: 'FUNCTION', name: 'funcB', createdAt: new Date()});
      db.addNode({id: 'phase1-test3-nodeC', type: 'CLASS', name: 'ClassC', createdAt: new Date()});
      
      db.addRelation({
        id: 'phase1-test3-rel1',
        sourceId: 'phase1-test3-nodeA',
        targetId: 'phase1-test3-nodeB',
        type: 'CALLS',
        weight: 1,
        createdAt: new Date()
      });
      
      db.addRelation({
        id: 'phase1-test3-rel2',
        sourceId: 'phase1-test3-nodeB',
        targetId: 'phase1-test3-nodeC',
        type: 'DEPENDS_ON',
        weight: 0.5,
        createdAt: new Date()
      });
      
      const outRelations = db.getOutRelations('phase1-test3-nodeA');
      if (outRelations.length !== 1) {
        throw new Error(`出站关系数量错误：期望1，实际${outRelations.length}`);
      }
      
      const inRelations = db.getInRelations('phase1-test3-nodeC');
      if (inRelations.length !== 1) {
        throw new Error(`入站关系数量错误：期望1，实际${inRelations.length}`);
      }
    });

    // === TEST 4: 类型查询 ===
    this.recordTest('按类型查询节点', () => {
      const db = new KnowledgeGraphDatabase();
      
      for (let i = 0; i < 20; i++) {
        db.addNode({
          id: `phase1-test4-node-${i}`,
          type: i < 10 ? 'CLASS' : 'FUNCTION',
          name: `Item${i}`,
          createdAt: new Date()
        });
      }
      
      const classes = db.getNodesByType('CLASS');
      const functions = db.getNodesByType('FUNCTION');
      
      if (classes.length !== 10) {
        throw new Error(`CLASS节点数量错误：期望10，实际${classes.length}`);
      }
      
      if (functions.length !== 10) {
        throw new Error(`FUNCTION节点数量错误：期望10，实际${functions.length}`);
      }
    });

    // === TEST 5: 统计功能 ===
    this.recordTest('统计功能', () => {
      const db = new KnowledgeGraphDatabase();
      
      for (let i = 0; i < 50; i++) {
        db.addNode({
          id: `phase1-test5-node-${i}`,
          type: ['CLASS', 'FUNCTION', 'VARIABLE', 'INTERFACE', 'TYPE'][i % 5],
          name: `Test${i}`,
          createdAt: new Date()
        });
      }
      
      for (let i = 0; i < 30; i++) {
        db.addRelation({
          id: `phase1-test5-rel-${i}`,
          sourceId: `phase1-test5-node-${i}`,
          targetId: `phase1-test5-node-${(i + 1) % 50}`,
          type: ['CALLS', 'DEPENDS_ON', 'REFERENCES'][i % 3],
          weight: Math.random(),
          createdAt: new Date()
        });
      }
      
      const stats = db.getStats();
      
      if (stats.totalNodes !== 50) {
        throw new Error(`总节点数错误：期望50，实际${stats.totalNodes}`);
      }
      
      if (stats.totalRelations !== 30) {
        throw new Error(`总关系数错误：期望30，实际${stats.totalRelations}`);
      }
      
      for (const type of ['CLASS', 'FUNCTION', 'VARIABLE', 'INTERFACE', 'TYPE']) {
        if (stats.nodeTypes[type] !== 10) {
          throw new Error(`${type}节点数量错误：期望10，实际${stats.nodeTypes[type]}`);
        }
      }
    });

    // === TEST 6: 搜索功能 ===
    this.recordTest('搜索功能', () => {
      const db = new KnowledgeGraphDatabase();
      
      const names = ['UserService', 'ProductService', 'UserRepository', 'ProductRepository', 'Utils'];
      for (let i = 0; i < names.length; i++) {
        db.addNode({
          id: `phase1-test6-node-${i}`,
          type: i % 2 === 0 ? 'CLASS' : 'FUNCTION',
          name: names[i],
          filePath: `/test/${names[i].toLowerCase()}.ts`,
          createdAt: new Date()
        });
      }
      
      const userResults = db.searchNodes('User');
      const productResults = db.searchNodes('Product');
      
      if (userResults.length !== 2) {
        throw new Error(`搜索"User"结果数量错误：期望2，实际${userResults.length}`);
      }
      
      if (productResults.length !== 2) {
        throw new Error(`搜索"Product"结果数量错误：期望2，实际${productResults.length}`);
      }
    });

    // === TEST 7: 清理功能 ===
    this.recordTest('清理功能', () => {
      const db = new KnowledgeGraphDatabase();
      
      for (let i = 0; i < 50; i++) {
        db.addNode({
          id: `phase1-test7-node-${i}`,
          type: 'CLASS',
          name: `Test${i}`,
          createdAt: new Date()
        });
        
        if (i < 25) {
          db.addRelation({
            id: `phase1-test7-rel-${i}`,
            sourceId: `phase1-test7-node-${i}`,
            targetId: `phase1-test7-node-${i + 1}`,
            type: 'CALLS',
            createdAt: new Date()
          });
        }
      }
      
      db.clear();
      
      const stats = db.getStats();
      if (stats.totalNodes !== 0 || stats.totalRelations !== 0) {
        throw new Error('清理后数据未完全清除');
      }
    });

    // === TEST 8: 对象池 ===
    this.recordTest('对象池功能', () => {
      const node1 = coreEngine.acquireNode();
      const node2 = coreEngine.acquireNode();
      
      node1.id = 'pool-node-1';
      node2.id = 'pool-node-2';
      
      coreEngine.releaseNode(node1);
      coreEngine.releaseNode(node2);
    });

    // === TEST 9: 对象池空值安全 ===
    this.recordTest('对象池空值安全', () => {
      try {
        coreEngine.releaseNode(null);
        coreEngine.releaseNode(undefined);
        coreEngine.releaseRelation(null);
        coreEngine.releaseRelation(undefined);
      } catch (e) {
        throw new Error('空值释放失败');
      }
    });

    // === TEST 10: 重复释放 ===
    this.recordTest('对象池重复释放', () => {
      const node = coreEngine.acquireNode();
      coreEngine.releaseNode(node);
      
      try {
        // 重复释放不应抛出错误
        coreEngine.releaseNode(node);
        coreEngine.releaseNode(node);
      } catch (e) {
        throw new Error('重复释放抛出异常');
      }
    });

    await this.recordMemory('Phase 1 End');
    this.recordPhaseEnd();
  }

  async startPhase2BoundaryConditions() {
    this.recordPhaseStart(2, '边界条件精细测试');
    
    await this.recordMemory('Phase 2 Start');
    
    const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
    
    // === TEST 1: 极端空值 ===
    this.recordTest('空值创建节点', () => {
      const db = new KnowledgeGraphDatabase();
      
      db.addNode({
        id: 'phase2-test1-null-node',
        type: 'CLASS',
        name: 'WithNulls',
        parentId: null,
        metadata: { nullVal: null, undefVal: undefined },
        createdAt: new Date()
      });
    });

    // === TEST 2: 特殊字符名称 ===
    this.recordTest('特殊字符名称', () => {
      const db = new KnowledgeGraphDatabase();
      
      const specialNames = [
        '📦EmojiName',
        'Test With Spaces',
        'Test-With-Hyphens',
        'Test_With_Underscores',
        'Test.With.Dots',
        '<script>alert("xss")</script>',
        '中文名称',
        '日本語名前',
        '한국어이름'
      ];
      
      for (let i = 0; i < specialNames.length; i++) {
        db.addNode({
          id: `phase2-test2-node-${i}`,
          type: 'CLASS',
          name: specialNames[i],
          createdAt: new Date()
        });
      }
    });

    // === TEST 3: 超长ID ===
    this.recordTest('超长ID', () => {
      const db = new KnowledgeGraphDatabase();
      const longId = 'x'.repeat(1000);
      
      db.addNode({
        id: longId,
        type: 'CLASS',
        name: 'LongIDTest',
        createdAt: new Date()
      });
      
      const retrieved = db.getNode(longId);
      if (!retrieved) {
        throw new Error('超长ID检索失败');
      }
    });

    // === TEST 4: 空字符串ID ===
    this.recordTest('空字符串ID', () => {
      const db = new KnowledgeGraphDatabase();
      
      try {
        db.addNode({
          id: '',
          type: 'CLASS',
          name: 'EmptyID',
          createdAt: new Date()
        });
      } catch (e) {
        // 这是可接受的，空ID应该被拒绝
      }
    });

    // === TEST 5: 极端大量节点 ===
    this.recordTest('1000节点', () => {
      const db = new KnowledgeGraphDatabase();
      
      for (let i = 0; i < 1000; i++) {
        db.addNode({
          id: `phase2-test5-node-${i}`,
          type: 'CLASS',
          name: `Class${i}`,
          metadata: { index: i, timestamp: Date.now(), data: 'x'.repeat(100) },
          createdAt: new Date()
        });
      }
      
      const stats = db.getStats();
      if (stats.totalNodes !== 1000) {
        throw new Error(`节点数量错误：期望1000，实际${stats.totalNodes}`);
      }
    });

    // === TEST 6: 循环引用 ===
    this.recordTest('循环引用', () => {
      const db = new KnowledgeGraphDatabase();
      
      db.addNode({id: 'phase2-test6-A', type: 'CLASS', name: 'A', createdAt: new Date()});
      db.addNode({id: 'phase2-test6-B', type: 'CLASS', name: 'B', createdAt: new Date()});
      db.addNode({id: 'phase2-test6-C', type: 'CLASS', name: 'C', createdAt: new Date()});
      
      db.addRelation({
        id: 'phase2-test6-rel1',
        sourceId: 'phase2-test6-A',
        targetId: 'phase2-test6-B',
        type: 'CALLS',
        createdAt: new Date()
      });
      
      db.addRelation({
        id: 'phase2-test6-rel2',
        sourceId: 'phase2-test6-B',
        targetId: 'phase2-test6-C',
        type: 'CALLS',
        createdAt: new Date()
      });
      
      db.addRelation({
        id: 'phase2-test6-rel3',
        sourceId: 'phase2-test6-C',
        targetId: 'phase2-test6-A',
        type: 'CALLS',
        createdAt: new Date()
      });
      
      db.addRelation({
        id: 'phase2-test6-self',
        sourceId: 'phase2-test6-A',
        targetId: 'phase2-test6-A',
        type: 'DEPENDS_ON',
        createdAt: new Date()
      });
    });

    // === TEST 7: 超大量元数据 ===
    this.recordTest('超大量元数据', () => {
      const db = new KnowledgeGraphDatabase();
      
      db.addNode({
        id: 'phase2-test7-node',
        type: 'CLASS',
        name: 'BigMetadata',
        metadata: {
          hugeString: 'x'.repeat(10000),
          deepNesting: {
            level1: {
              level2: {
                level3: {
                  level4: {
                    level5: 'deep'
                  }
                }
              }
            }
          }
        },
        createdAt: new Date()
      });
    });

    // === TEST 8: 重复ID ===
    this.recordTest('重复ID处理', () => {
      const db = new KnowledgeGraphDatabase();
      
      db.addNode({
        id: 'phase2-test8-duplicate',
        type: 'CLASS',
        name: 'Original',
        createdAt: new Date()
      });
      
      try {
        db.addNode({
          id: 'phase2-test8-duplicate',
          type: 'FUNCTION',
          name: 'Duplicate',
          createdAt: new Date()
        });
      } catch (e) {
        // 重复ID应该被适当处理
      }
    });

    await this.recordMemory('Phase 2 End');
    this.recordPhaseEnd();
  }

  async startPhase3ConcurrencyAndStress() {
    this.recordPhaseStart(3, '并发与压力测试');
    
    await this.recordMemory('Phase 3 Start');
    
    const { coreEngine } = require('./dist/src/core/engine');
    const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
    
    // === TEST 1: 100并发worker ===
    this.recordTest('100并发worker', async () => {
      const errors = [];
      const promises = [];
      
      for (let w = 0; w < 100; w++) {
        promises.push((async () => {
          try {
            for (let i = 0; i < 50; i++) {
              const node = coreEngine.acquireNode();
              node.id = `conc-${w}-${i}`;
              node.metadata = { w, i };
              
              const rel = coreEngine.acquireRelation();
              rel.sourceId = node.id;
              rel.targetId = `conc-${(w + 1) % 100}-${i}`;
              
              coreEngine.releaseNode(node);
              coreEngine.releaseRelation(rel);
            }
          } catch (e) {
            errors.push(e);
          }
        })());
      }
      
      await Promise.all(promises);
      
      if (errors.length > 0) {
        throw new Error(`并发错误：${errors.length}个错误`);
      }
    });

    // === TEST 2: 并行数据库操作 ===
    this.recordTest('并行数据库操作', async () => {
      const errors = [];
      const promises = [];
      
      for (let i = 0; i < 20; i++) {
        promises.push((async () => {
          try {
            const db = new KnowledgeGraphDatabase();
            for (let j = 0; j < 100; j++) {
              db.addNode({
                id: `par-${i}-${j}`,
                type: 'CLASS',
                name: `Parallel-${i}-${j}`,
                createdAt: new Date()
              });
            }
            
            for (let j = 0; j < 50; j++) {
              db.addRelation({
                id: `par-rel-${i}-${j}`,
                sourceId: `par-${i}-${j}`,
                targetId: `par-${i}-${(j + 1) % 100}`,
                type: 'CALLS',
                createdAt: new Date()
              });
            }
            
            db.getStats();
          } catch (e) {
            errors.push(e);
          }
        })());
      }
      
      await Promise.all(promises);
      
      if (errors.length > 0) {
        throw new Error(`并行错误：${errors.length}个错误`);
      }
    });

    // === TEST 3: 快速连续创建和清理 ===
    this.recordTest('快速连续创建和清理', async () => {
      const db = new KnowledgeGraphDatabase();
      
      for (let round = 0; round < 50; round++) {
        for (let i = 0; i < 100; i++) {
          db.addNode({
            id: `stress-${round}-${i}`,
            type: 'CLASS',
            name: `Stress${round}-${i}`,
            createdAt: new Date()
          });
        }
        
        db.clear();
      }
    });

    await this.recordMemory('Phase 3 End');
    this.recordPhaseEnd();
  }

  async startPhase4RealProject() {
    this.recordPhaseStart(4, '真实项目解析');
    
    await this.recordMemory('Phase 4 Start');
    
    let ProjectAnalysisApplicationService = null;
    try {
      const serviceModule = require('./dist/src/application/analysis/project.analysis.app.service');
      ProjectAnalysisApplicationService = serviceModule.ProjectAnalysisApplicationService;
    } catch (e) {
      this.log('⚠️ 项目分析服务不可用，跳过真实项目解析', 'WARNING');
    }
    
    if (ProjectAnalysisApplicationService) {
      const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
      
      // === TEST 1: 解析src项目 ===
      this.recordTest('解析src项目', async () => {
        if (fs.existsSync('./src')) {
          const db = new KnowledgeGraphDatabase();
          const service = new ProjectAnalysisApplicationService(db);
          const result = await service.analyzeProject('./src');
          
          if (result.summary.totalNodes === 0) {
            this.recordWarning('解析结果节点数为0');
          }
          
          await db.clear();
        } else {
          this.log('⚠️ src目录不存在', 'WARNING');
        }
      });
    }
    
    await this.recordMemory('Phase 4 End');
    this.recordPhaseEnd();
  }

  async startPhase5MemoryLeak() {
    this.recordPhaseStart(5, '内存泄漏检测');
    
    const initialMem = await this.recordMemory('Phase 5 Initial');
    
    const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
    
    for (let round = 0; round < 100; round++) {
      const db = new KnowledgeGraphDatabase();
      
      for (let i = 0; i < 500; i++) {
        db.addNode({
          id: `mem-test-${round}-${i}`,
          type: 'CLASS',
          name: `MemoryNode${i}`,
          metadata: {
            data: 'x'.repeat(100),
            round,
            index: i,
            timestamp: Date.now()
          },
          createdAt: new Date()
        });
        
        if (i < 250) {
          db.addRelation({
            id: `mem-rel-${round}-${i}`,
            sourceId: `mem-test-${round}-${i}`,
            targetId: `mem-test-${round}-${i + 1}`,
            type: 'CALLS',
            weight: 1,
            createdAt: new Date()
          });
        }
      }
      
      db.getStats();
      db.getAllNodes();
      
      await db.clear();
    }
    
    if (global.gc) {
      global.gc();
    }
    
    await new Promise(r => setTimeout(r, 100));
    
    const finalMem = await this.recordMemory('Phase 5 Final');
    
    const growth = finalMem.heapUsed - initialMem.heapUsed;
    
    if (growth > 50) {
      this.recordWarning(`内存增长过大：+${growth}MB`);
    } else if (growth < 0) {
      this.log(`✅ 内存优化良好：${growth}MB`, 'SUCCESS');
    } else {
      this.log(`✅ 内存增长在可接受范围：+${growth}MB`, 'SUCCESS');
    }
    
    this.recordPhaseEnd();
  }

  async runAllPhases() {
    await this.startPhase1BasicFunctionality();
    await new Promise(r => setTimeout(r, 100));
    
    await this.startPhase2BoundaryConditions();
    await new Promise(r => setTimeout(r, 100));
    
    await this.startPhase3ConcurrencyAndStress();
    await new Promise(r => setTimeout(r, 100));
    
    await this.startPhase4RealProject();
    await new Promise(r => setTimeout(r, 100));
    
    await this.startPhase5MemoryLeak();
  }

  generateFinalReport() {
    results.endTime = Date.now();
    
    console.log('\n' + '='.repeat(200));
    console.log('🎯🎯 分阶段精细测试 - 最终报告');
    console.log('='.repeat(200));
    
    const totalDuration = Math.round((results.endTime - results.startTime) / 1000);
    const mins = Math.floor(totalDuration / 60);
    const secs = totalDuration % 60;
    
    console.log(`
📊 整体统计：
  ⏱️ 总耗时：${mins}分${secs}秒
  📦 完成阶段：${results.phases.length}个
  🐛 发现问题：${results.bugsFound.length}个
  ⚠️ 警告数量：${results.warningsFound.length}个
    `);
    
    console.log('\n📦 各阶段结果：');
    console.log('─'.repeat(80));
    
    for (const phase of results.phases) {
      const phaseResult = phase.passed ? '✅ PASSED' : '❌ FAILED';
      const phaseDuration = Math.round(phase.duration / 1000);
      
      console.log(`
  PHASE ${phase.phaseNumber}: ${phase.phaseName}
    状态：${phaseResult}
    耗时：${phaseDuration}秒
    测试数：${phase.tests.length}
    问题数：${phase.bugs.length}
    警告数：${phase.warnings.length}
      `);
      
      for (const test of phase.tests) {
        const testStatus = test.passed ? '✅' : '❌';
        console.log(`      ${testStatus} ${test.name} (${test.duration}ms)`);
      }
      
      if (phase.bugs.length > 0) {
        console.log('\n      🐛 发现的问题：');
        for (const bug of phase.bugs) {
          console.log(`        - ${bug.name}: ${bug.error}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(200));
    
    const allPassed = results.bugsFound.length === 0;
    
    if (allPassed) {
      console.log('\n🎉🎉🎉 所有阶段完美通过！系统表现优秀！🎉🎉🎉\n');
    } else {
      console.log(`\n⚠️ 发现 ${results.bugsFound.length} 个问题需要修复\n`);
    }
    
    console.log('='.repeat(200));
    
    const reportPath = path.join(__dirname, 'meticulous_testing_report_v9.0.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 详细报告：${reportPath}`);
    
    return allPassed;
  }
}

async function main() {
  const tester = new MeticulousTestingEngine();
  
  try {
    await tester.runAllPhases();
    const success = tester.generateFinalReport();
    process.exit(success ? 0 : 1);
  } catch (e) {
    console.error('❌ 测试异常：', e);
    process.exit(1);
  }
}

main();
