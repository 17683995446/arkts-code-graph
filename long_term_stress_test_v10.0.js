#!/usr/bin/env node

/**
 * 🎯🎯 长期大规模压力测试 V10.0
 * 
 * 慢工出细活 - 15分钟超长压力测试，发现潜在问题
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(200));
console.log('🎯🎯 ArkTS Code Graph - 长期大规模压力测试 V10.0');
console.log('🎯🎯 15分钟超长压力测试 - 发现潜在问题');
console.log('='.repeat(200));
console.log('');

const TEST_DURATION = 15 * 60 * 1000; // 15分钟

const results = {
  startTime: Date.now(),
  endTime: null,
  cyclesCompleted: 0,
  bugsFound: [],
  warningsFound: [],
  memoryHistory: [],
  operationsStats: {
    total: 0,
    nodesCreated: 0,
    relationsCreated: 0,
    queries: 0,
    clearOps: 0
  },
  issues: []
};

class LongTermStressTester {
  constructor() {
    this.cycleCount = 0;
    this.lastReport = Date.now();
    this.lastMemory = null;
    this.startTime = Date.now();
  }

  log(msg, type = 'INFO') {
    const elapsed = Math.floor((Date.now() - results.startTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    
    const icons = {
      'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 
      'INFO': 'ℹ️', 'TEST': '🧪', 'PERF': '⚡', 
      'DURATION': '⏱️', 'MEMORY': '📊', 'PROGRESS': '📈'
    };
    
    console.log(`${icons[type] || 'ℹ️'} [${mins}:${secs}] ${msg}`);
  }

  async recordMemory(label = 'Memory') {
    const mem = process.memoryUsage();
    const heapUsed = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotal = Math.round(mem.heapTotal / 1024 / 1024);
    const rss = Math.round(mem.rss / 1024 / 1024);
    const external = Math.round(mem.external / 1024 / 1024);
    
    let growth = 0;
    if (this.lastMemory) {
      growth = heapUsed - this.lastMemory;
    }
    this.lastMemory = heapUsed;
    
    const entry = {
      label,
      heapUsed,
      heapTotal,
      rss,
      external,
      growth,
      timestamp: Date.now()
    };
    
    results.memoryHistory.push(entry);
    return entry;
  }

  async runStressCycle() {
    const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
    const { coreEngine } = require('./dist/src/core/engine');
    
    const db = new KnowledgeGraphDatabase();
    
    // 1. 大量节点创建
    for (let i = 0; i < 1000; i++) {
      const nodeId = `stress-${this.cycleCount}-node-${i}`;
      const nodeType = ['CLASS', 'FUNCTION', 'VARIABLE', 'INTERFACE', 'TYPE'][i % 5];
      
      db.addNode({
        id: nodeId,
        type: nodeType,
        name: `StressNode${this.cycleCount}-${i}`,
        filePath: `/stress/${this.cycleCount}/file-${i}.ts`,
        metadata: {
          index: i,
          cycle: this.cycleCount,
          timestamp: Date.now(),
          data: 'x'.repeat(100)
        },
        createdAt: new Date()
      });
      
      results.operationsStats.nodesCreated++;
      results.operationsStats.total++;
    }
    
    // 2. 关系创建
    for (let i = 0; i < 500; i++) {
      const srcId = `stress-${this.cycleCount}-node-${i}`;
      const tgtId = `stress-${this.cycleCount}-node-${(i + 1) % 1000}`;
      
      db.addRelation({
        id: `stress-${this.cycleCount}-rel-${i}`,
        sourceId: srcId,
        targetId: tgtId,
        type: ['CALLS', 'DEPENDS_ON', 'REFERENCES'][i % 3],
        weight: Math.random(),
        metadata: {
          cycle: this.cycleCount,
          index: i
        },
        createdAt: new Date()
      });
      
      results.operationsStats.relationsCreated++;
      results.operationsStats.total++;
    }
    
    // 3. 查询操作
    for (let i = 0; i < 200; i++) {
      db.getAllNodes();
      db.getAllRelations();
      db.getNodesByType(['CLASS', 'FUNCTION', 'VARIABLE'][i % 3]);
      
      const searchTerm = `Node${i % 100}`;
      db.searchNodes(searchTerm);
      
      results.operationsStats.queries++;
      results.operationsStats.total++;
    }
    
    // 4. 统计
    db.getStats();
    
    // 5. 对象池测试
    for (let i = 0; i < 500; i++) {
      const node = coreEngine.acquireNode();
      node.id = `pool-${this.cycleCount}-${i}`;
      node.metadata = { cycle: this.cycleCount, index: i };
      coreEngine.releaseNode(node);
      
      const rel = coreEngine.acquireRelation();
      rel.sourceId = `pool-${this.cycleCount}-${i}`;
      rel.targetId = `pool-${this.cycleCount}-${(i + 1) % 500}`;
      coreEngine.releaseRelation(rel);
      
      results.operationsStats.total++;
    }
    
    // 6. 空值安全测试
    coreEngine.releaseNode(null);
    coreEngine.releaseNode(undefined);
    coreEngine.releaseRelation(null);
    coreEngine.releaseRelation(undefined);
    
    // 7. 清理
    db.clear();
    results.operationsStats.clearOps++;
    
    this.cycleCount++;
    results.cyclesCompleted++;
  }

  async runLongTermTest() {
    const startTime = Date.now();
    const endTime = startTime + TEST_DURATION;
    
    this.log('🚀 开始15分钟长期压力测试...', 'TEST');
    await this.recordMemory('Start');
    
    while (Date.now() < endTime) {
      try {
        await this.runStressCycle();
        
        // 每100个循环报告一次
        if (this.cycleCount % 100 === 0) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          const remaining = Math.round((endTime - Date.now()) / 1000);
          
          this.log(
            `📈 进度：${this.cycleCount} cycles, 耗时${elapsed}s, 剩余${remaining}s`,
            'PROGRESS'
          );
          
          const mem = await this.recordMemory(`Cycle ${this.cycleCount}`);
          const memGrowth = mem.heapUsed - results.memoryHistory[0].heapUsed;
          
          if (memGrowth > 200) {
            this.log(`⚠️ 内存增长过大：+${memGrowth}MB`, 'WARNING');
            results.warningsFound.push({
              type: 'memory_growth',
              value: memGrowth,
              cycle: this.cycleCount
            });
          }
        }
        
        if (Date.now() - this.lastReport > 60000) {
          // 每分钟报告
          this.generateProgressReport();
          this.lastReport = Date.now();
        }
        
        // 短暂休息，防止完全占用CPU
        await new Promise(r => setTimeout(r, 10));
        
      } catch (e) {
        this.log(`🐛 压力测试异常：${e.message}`, 'BUG');
        
        results.bugsFound.push({
          cycle: this.cycleCount,
          error: e.message,
          stack: e.stack,
          timestamp: Date.now()
        });
      }
    }
    
    await this.recordMemory('Final');
    results.endTime = Date.now();
    
    return true;
  }

  generateProgressReport() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const progress = (elapsed / (TEST_DURATION / 1000) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(100));
    console.log(`📈 压力测试进度：${progress}%`);
    console.log('='.repeat(100));
    console.log(`
📊 目前统计：
  🔄 完成循环：${this.cycleCount}次
  📦 创建节点：${results.operationsStats.nodesCreated.toLocaleString()}个
  🔗 创建关系：${results.operationsStats.relationsCreated.toLocaleString()}个
  🔍 查询操作：${results.operationsStats.queries.toLocaleString()}次
  🧹 清理操作：${results.operationsStats.clearOps.toLocaleString()}次
  总操作数：${results.operationsStats.total.toLocaleString()}次
  🐛 发现问题：${results.bugsFound.length}个
  ⚠️ 警告数量：${results.warningsFound.length}个
    `);
    
    if (results.memoryHistory.length > 0) {
      const first = results.memoryHistory[0];
      const last = results.memoryHistory[results.memoryHistory.length - 1];
      
      console.log(`
📊 内存使用：
  初始内存：${first.heapUsed}MB
  最新内存：${last.heapUsed}MB
  内存增长：${last.heapUsed - first.heapUsed > 0 ? '+' : ''}${last.heapUsed - first.heapUsed}MB
      `);
    }
    
    console.log('='.repeat(100) + '\n');
  }

  generateFinalReport() {
    const totalDuration = Math.round((results.endTime - results.startTime) / 1000);
    const mins = Math.floor(totalDuration / 60);
    const secs = totalDuration % 60;
    
    console.log('\n' + '='.repeat(200));
    console.log('🎯🎯 长期大规模压力测试 - 最终报告');
    console.log('='.repeat(200));
    
    console.log(`
📊 总体统计：
  ⏱️ 总耗时：${mins}分${secs}秒
  🔄 完成循环：${results.cyclesCompleted}次
  📦 创建节点：${results.operationsStats.nodesCreated.toLocaleString()}个
  🔗 创建关系：${results.operationsStats.relationsCreated.toLocaleString()}个
  🔍 查询操作：${results.operationsStats.queries.toLocaleString()}次
  🧹 清理操作：${results.operationsStats.clearOps.toLocaleString()}次
  总操作数：${results.operationsStats.total.toLocaleString()}次
  🐛 发现问题：${results.bugsFound.length}个
  ⚠️ 警告数量：${results.warningsFound.length}个
    `);
    
    console.log('\n📊 内存分析：');
    console.log('─'.repeat(80));
    
    if (results.memoryHistory.length > 0) {
      const first = results.memoryHistory[0];
      const last = results.memoryHistory[results.memoryHistory.length - 1];
      
      console.log(`
  初始内存：${first.heapUsed}MB
  最终内存：${last.heapUsed}MB
  内存增长：${last.heapUsed - first.heapUsed > 0 ? '+' : ''}${last.heapUsed - first.heapUsed}MB
      `);
      
      const heapReadings = results.memoryHistory.map(m => m.heapUsed);
      const avgHeap = Math.round(heapReadings.reduce((a, b) => a + b, 0) / heapReadings.length);
      const maxHeap = Math.max(...heapReadings);
      const minHeap = Math.min(...heapReadings);
      
      console.log(`
  平均内存：${avgHeap}MB
  最大内存：${maxHeap}MB
  最小内存：${minHeap}MB
      `);
    }
    
    console.log('─'.repeat(80));
    
    if (results.bugsFound.length > 0) {
      console.log('\n🐛 发现的问题：');
      for (const bug of results.bugsFound.slice(0, 10)) {
        console.log(`
  📦 循环：${bug.cycle}
  📝 时间：${new Date(bug.timestamp).toISOString()}
  ❌ 错误：${bug.error}
        `);
      }
      
      if (results.bugsFound.length > 10) {
        console.log(`  ...还有${results.bugsFound.length - 10}个`);
      }
    } else {
      console.log('\n🎉🎉🎉 压力测试完美通过！未发现任何问题！🎉🎉🎉');
    }
    
    console.log('\n' + '='.repeat(200));
    
    const reportPath = path.join(__dirname, 'long_term_stress_test_report_v10.0.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 详细报告：${reportPath}`);
    
    return results.bugsFound.length === 0;
  }
}

async function main() {
  const tester = new LongTermStressTester();
  
  try {
    await tester.runLongTermTest();
    const success = tester.generateFinalReport();
    process.exit(success ? 0 : 1);
  } catch (e) {
    console.error('❌ 压力测试异常：', e);
    process.exit(1);
  }
}

main();
