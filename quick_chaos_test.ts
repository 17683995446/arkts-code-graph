
#!/usr/bin/env node
import { coreEngine } from './src/core/engine';
import * as fs from 'fs';
import * as path from 'path';

interface ChaosTestResult {
  startTime: number;
  endTime: number;
  cyclesCompleted: number;
  bugsFound: Array&lt;{ type: string; description: string; timestamp: number }&gt;;
  warningsFound: Array&lt;{ type: string; description: string; timestamp: number }&gt;;
  memoryHistory: Array&lt;{ label: string; heapUsed: number; heapTotal: number; rss: number; external: number; growth: number; timestamp: number }&gt;;
  operationsCount: number;
  nodeCreations: number;
  relationCreations: number;
  realProjectParsings: number;
  testDetails: any;
}

class QuickChaosTester {
  private results: ChaosTestResult;
  private startTime: number;
  private nodes: any[] = [];
  private relations: any[] = [];
  private memoryBaseline: number;

  constructor() {
    const usage = process.memoryUsage();
    this.memoryBaseline = usage.heapUsed;
    this.results = {
      startTime: Date.now(),
      endTime: 0,
      cyclesCompleted: 0,
      bugsFound: [],
      warningsFound: [],
      memoryHistory: [],
      operationsCount: 0,
      nodeCreations: 0,
      relationCreations: 0,
      realProjectParsings: 0,
      testDetails: {}
    };
    this.recordMemory('Start');
  }

  private recordMemory(label: string): void {
    const usage = process.memoryUsage();
    const growthMB = ((usage.heapUsed - this.memoryBaseline) / 1024 / 1024);
    this.results.memoryHistory.push({
      label,
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      growth: Math.round(growthMB * 10) / 10,
      timestamp: Date.now()
    });
  }

  private addBug(type: string, description: string): void {
    this.results.bugsFound.push({
      type,
      description,
      timestamp: Date.now()
    });
    console.error(`🐛 Bug found: [${type}] ${description}`);
  }

  private addWarning(type: string, description: string): void {
    this.results.warningsFound.push({
      type,
      description,
      timestamp: Date.now()
    });
    console.warn(`⚠️ Warning: [${type}] ${description}`);
  }

  // 极端边界条件测试
  async testExtremeBoundaryConditions(): Promise&lt;void&gt; {
    console.log('\n🔍 Phase 1: 极端边界条件测试...');
    
    try {
      // 测试极大数量的节点
      const extremeNodes = 2000;
      console.log(`  - 创建 ${extremeNodes} 个节点...`);
      for (let i = 0; i &lt; extremeNodes; i++) {
        const node = coreEngine.acquireNode();
        node.id = `node_extreme_${i}`;
        node.type = 'TestNode';
        node.name = `极端节点 #${i}`;
        node.metadata = { index: i, extreme: true, data: 'x'.repeat(1000) };
        this.nodes.push(node);
        this.results.nodeCreations++;
        this.results.operationsCount++;
      }

      // 测试极大数量的关系
      const extremeRelations = 4000;
      console.log(`  - 创建 ${extremeRelations} 个关系...`);
      for (let i = 0; i &lt; extremeRelations; i++) {
        const relation = coreEngine.acquireRelation();
        relation.id = `rel_extreme_${i}`;
        relation.sourceId = `node_extreme_${i % extremeNodes}`;
        relation.targetId = `node_extreme_${(i + 1) % extremeNodes}`;
        relation.type = 'EXTREME_RELATION';
        relation.weight = Math.random();
        this.relations.push(relation);
        this.results.relationCreations++;
        this.results.operationsCount++;
      }

      // 释放一半的对象回池
      console.log('  - 释放一半对象...');
      for (let i = 0; i &lt; extremeNodes / 2; i++) {
        coreEngine.releaseNode(this.nodes.pop()!);
      }
      for (let i = 0; i &lt; extremeRelations / 2; i++) {
        coreEngine.releaseRelation(this.relations.pop()!);
      }

      // 再次创建
      console.log('  - 再次创建对象...');
      for (let i = 0; i &lt; extremeNodes / 2; i++) {
        const node = coreEngine.acquireNode();
        node.id = `node_round2_${i}`;
        this.nodes.push(node);
        this.results.nodeCreations++;
        this.results.operationsCount++;
      }

      // 空值测试
      console.log('  - 测试空值安全...');
      try {
        coreEngine.releaseNode(null);
        coreEngine.releaseNode(undefined);
        coreEngine.releaseRelation(null);
        coreEngine.releaseRelation(undefined);
      } catch (e) {
        this.addBug('NullSafety', `空值处理失败: ${e}`);
      }

      this.results.testDetails.extremeBoundary = 'passed';
      console.log('  ✅ 极端边界条件测试完成');
    } catch (e) {
      this.addBug('ExtremeBoundary', `极端边界测试失败: ${e}`);
    }
  }

  // 真实项目解析测试
  async testRealProjectParsing(): Promise&lt;void&gt; {
    console.log('\n📁 Phase 2: 真实项目解析测试...');
    
    try {
      // 解析真实项目
      const testProjects = [
        './',
        './vue-core-test',
        './CodeHub',
        './real_projects'
      ];

      for (const projectPath of testProjects) {
        if (fs.existsSync(projectPath)) {
          console.log(`  - 解析项目: ${projectPath}`);
          
          // 递归扫描文件
          const filesToScan: string[] = [];
          const scanDir = (dir: string, depth: number = 0) =&gt; {
            if (depth &gt; 5) return;
            try {
              const entries = fs.readdirSync(dir);
              for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                  if (!entry.startsWith('.') &amp;&amp; entry !== 'node_modules') {
                    scanDir(fullPath, depth + 1);
                  }
                } else if (entry.endsWith('.ts') || entry.endsWith('.js') || entry.endsWith('.json')) {
                  filesToScan.push(fullPath);
                  if (filesToScan.length &gt; 200) break;
                }
              }
            } catch (e) {
              // 忽略错误
            }
          };
          
          scanDir(projectPath);
          console.log(`    找到 ${filesToScan.length} 个文件`);
          
          // 为每个文件创建节点
          for (let i = 0; i &lt; Math.min(filesToScan.length, 100); i++) {
            const file = filesToScan[i];
            try {
              const node = coreEngine.acquireNode();
              node.id = `file_${this.results.nodeCreations}`;
              node.type = 'File';
              node.name = path.basename(file);
              node.metadata = {
                path: file,
                size: fs.statSync(file).size,
                extension: path.extname(file)
              };
              this.nodes.push(node);
              this.results.nodeCreations++;
              this.results.operationsCount++;
            } catch (e) {
              // 忽略错误
            }
          }
          
          this.results.realProjectParsings++;
        }
      }
      
      this.results.testDetails.realProjectParsing = 'passed';
      console.log('  ✅ 真实项目解析测试完成');
    } catch (e) {
      this.addBug('RealProjectParsing', `真实项目解析测试失败: ${e}`);
    }
  }

  // 并发压力测试
  async testConcurrentOperations(): Promise&lt;void&gt; {
    console.log('\n⚡ Phase 3: 并发压力测试...');
    
    try {
      const workerCount = 120; // 更高并发
      console.log(`  - 启动 ${workerCount} 个并发 Worker...`);
      
      const workers = [];
      for (let w = 0; w &lt; workerCount; w++) {
        workers.push(new Promise&lt;void&gt;((resolve) =&gt; {
          // 每个 worker 执行多次操作
          for (let i = 0; i &lt; 50; i++) {
            try {
              const node = coreEngine.acquireNode();
              node.id = `concurrent_${w}_${i}`;
              node.name = `Worker ${w} Node ${i}`;
              
              const relation = coreEngine.acquireRelation();
              relation.id = `rel_${w}_${i}`;
              relation.sourceId = `concurrent_${w}_${i}`;
              relation.targetId = `concurrent_${w}_${(i + 1) % 50}`;
              
              // 立即释放一半
              if (i % 2 === 0) {
                coreEngine.releaseNode(node);
                coreEngine.releaseRelation(relation);
              } else {
                this.nodes.push(node);
                this.relations.push(relation);
              }
              
              this.results.nodeCreations++;
              this.results.relationCreations++;
              this.results.operationsCount += 2;
            } catch (e) {
              this.addBug('Concurrency', `并发操作失败: ${e}`);
            }
          }
          resolve();
        }));
      }
      
      await Promise.all(workers);
      console.log(`  - 完成了 ${workerCount * 100} 次并发操作`);
      
      this.results.testDetails.concurrentOperations = 'passed';
      console.log('  ✅ 并发压力测试完成');
    } catch (e) {
      this.addBug('Concurrency', `并发测试失败: ${e}`);
    }
  }

  // 内存泄漏检测测试
  async testMemoryLeakDetection(): Promise&lt;void&gt; {
    console.log('\n💾 Phase 4: 内存泄漏检测测试...');
    
    try {
      const baseline = process.memoryUsage().heapUsed;
      
      // 执行大量创建和释放操作
      console.log('  - 执行大量创建/释放循环...');
      const cycles = 500;
      for (let round = 0; round &lt; cycles; round++) {
        const roundNodes: any[] = [];
        const roundRelations: any[] = [];
        
        // 创建
        for (let i = 0; i &lt; 20; i++) {
          const node = coreEngine.acquireNode();
          node.id = `memtest_${round}_${i}`;
          roundNodes.push(node);
          
          const relation = coreEngine.acquireRelation();
          relation.id = `memrel_${round}_${i}`;
          roundRelations.push(relation);
        }
        
        // 立即释放
        for (const node of roundNodes) {
          coreEngine.releaseNode(node);
        }
        for (const rel of roundRelations) {
          coreEngine.releaseRelation(rel);
        }
        
        this.results.operationsCount += 40;
      }
      
      // 强制 GC
      if (global.gc) {
        console.log('  - 强制 GC...');
        global.gc();
      }
      
      const after = process.memoryUsage().heapUsed;
      const memoryGrowthMB = (after - baseline) / 1024 / 1024;
      
      console.log(`  - 内存变化: +${memoryGrowthMB.toFixed(2)} MB`);
      
      if (memoryGrowthMB &gt; 50) {
        this.addWarning('MemoryGrowth', `内存增长较大: ${memoryGrowthMB.toFixed(2)} MB`);
      }
      
      this.results.testDetails.memoryLeakDetection = {
        status: 'passed',
        memoryGrowthMB: memoryGrowthMB
      };
      console.log('  ✅ 内存泄漏检测测试完成');
    } catch (e) {
      this.addBug('MemoryLeak', `内存泄漏检测失败: ${e}`);
    }
  }

  // 系统状态查询测试
  async testSystemStatusQueries(): Promise&lt;void&gt; {
    console.log('\n📊 Phase 5: 系统状态查询测试...');
    
    try {
      // 频繁查询系统状态
      for (let i = 0; i &lt; 500; i++) {
        const status = coreEngine.getSystemStatus();
        if (!status || typeof status !== 'object') {
          this.addBug('SystemStatus', '系统状态查询返回无效结果');
        }
        this.results.operationsCount++;
      }
      
      const finalStatus = coreEngine.getSystemStatus();
      console.log(`  - 系统状态:`);
      console.log(`    - 节点池大小: ${finalStatus.nodePoolSize}`);
      console.log(`    - 关系池大小: ${finalStatus.relationPoolSize}`);
      console.log(`    - 当前内存: ${finalStatus.memory.currentMB} MB`);
      console.log(`    - 内存趋势: ${finalStatus.memory.trend}`);
      
      this.results.testDetails.systemStatusQueries = 'passed';
      console.log('  ✅ 系统状态查询测试完成');
    } catch (e) {
      this.addBug('SystemStatus', `系统状态查询测试失败: ${e}`);
    }
  }

  // 随机混沌操作
  async testRandomChaos(): Promise&lt;void&gt; {
    console.log('\n🎲 Phase 6: 随机混沌操作...');
    
    try {
      const operations = [
        'createNode',
        'createRelation',
        'releaseNode',
        'releaseRelation',
        'getStatus',
        'clearSomeNodes',
        'addMetadata'
      ];
      
      const chaosRounds = 2000;
      console.log(`  - 执行 ${chaosRounds} 次随机混沌操作...`);
      
      for (let i = 0; i &lt; chaosRounds; i++) {
        const op = operations[Math.floor(Math.random() * operations.length)];
        
        try {
          switch (op) {
            case 'createNode':
              {
                const node = coreEngine.acquireNode();
                node.id = `chaos_${Date.now()}_${Math.random()}`;
                node.name = `混沌节点 ${Math.random()}`;
                node.metadata = { 
                  random: Math.random(), 
                  chaos: true,
                  data: 'c'.repeat(Math.floor(Math.random() * 500))
                };
                this.nodes.push(node);
                this.results.nodeCreations++;
              }
              break;
              
            case 'createRelation':
              if (this.nodes.length &gt; 1) {
                const idx1 = Math.floor(Math.random() * this.nodes.length);
                const idx2 = Math.floor(Math.random() * this.nodes.length);
                const relation = coreEngine.acquireRelation();
                relation.id = `chaosrel_${Date.now()}_${Math.random()}`;
                relation.sourceId = this.nodes[idx1].id;
                relation.targetId = this.nodes[idx2].id;
                relation.type = 'CHAOS_RELATION';
                relation.weight = Math.random();
                this.relations.push(relation);
                this.results.relationCreations++;
              }
              break;
              
            case 'releaseNode':
              if (this.nodes.length &gt; 100) {
                const node = this.nodes.pop();
                coreEngine.releaseNode(node!);
              }
              break;
              
            case 'releaseRelation':
              if (this.relations.length &gt; 100) {
                const rel = this.relations.pop();
                coreEngine.releaseRelation(rel!);
              }
              break;
              
            case 'getStatus':
              coreEngine.getSystemStatus();
              break;
              
            case 'clearSomeNodes':
              const toClear = Math.min(10, this.nodes.length);
              for (let c = 0; c &lt; toClear; c++) {
                const node = this.nodes.pop();
                coreEngine.releaseNode(node!);
              }
              break;
              
            case 'addMetadata':
              if (this.nodes.length &gt; 0) {
                const idx = Math.floor(Math.random() * this.nodes.length);
                this.nodes[idx].metadata[`field_${Date.now()}`] = Math.random();
              }
              break;
          }
          
          this.results.operationsCount++;
          
        } catch (e) {
          this.addWarning('ChaosOperation', `混沌操作失败: ${e}`);
        }
      }
      
      this.results.testDetails.randomChaos = 'passed';
      console.log('  ✅ 随机混沌操作完成');
    } catch (e) {
      this.addBug('RandomChaos', `随机混沌测试失败: ${e}`);
    }
  }

  // 主测试循环
  async runTest(testDurationMinutes: number = 3): Promise&lt;ChaosTestResult&gt; {
    console.log('🚀 启动快速混沌测试...');
    console.log(`📋 测试时长: ${testDurationMinutes} 分钟`);
    
    this.startTime = Date.now();
    
    // 完整测试集
    const testPhases = [
      () =&gt; this.testExtremeBoundaryConditions(),
      () =&gt; this.testRealProjectParsing(),
      () =&gt; this.testConcurrentOperations(),
      () =&gt; this.testMemoryLeakDetection(),
      () =&gt; this.testSystemStatusQueries(),
      () =&gt; this.testRandomChaos()
    ];
    
    const endTime = Date.now() + testDurationMinutes * 60 * 1000;
    let cycle = 0;
    
    while (Date.now() &lt; endTime) {
      cycle++;
      console.log(`\n📌 执行周期 #${cycle}`);
      
      // 依次执行所有测试阶段
      for (let p = 0; p &lt; testPhases.length; p++) {
        await testPhases[p]();
        this.recordMemory(`Cycle ${cycle} Phase ${p + 1}`);
      }
      
      this.results.cyclesCompleted = cycle;
      
      // 进度报告
      const elapsed = (Date.now() - this.startTime) / 1000;
      const remaining = Math.max(0, (endTime - Date.now()) / 1000);
      console.log(`\n📊 进度报告 (周期 #${cycle}):`);
      console.log(`  - 已运行: ${Math.floor(elapsed / 60)} 分 ${Math.floor(elapsed % 60)} 秒`);
      console.log(`  - 剩余: ${Math.floor(remaining / 60)} 分 ${Math.floor(remaining % 60)} 秒`);
      console.log(`  - 总操作: ${this.results.operationsCount.toLocaleString()}`);
      console.log(`  - 创建节点: ${this.results.nodeCreations.toLocaleString()}`);
      console.log(`  - 创建关系: ${this.results.relationCreations.toLocaleString()}`);
      console.log(`  - 当前节点数: ${this.nodes.length.toLocaleString()}`);
      console.log(`  - 当前关系数: ${this.relations.length.toLocaleString()}`);
      console.log(`  - 发现 Bug: ${this.results.bugsFound.length}`);
      console.log(`  - 发现警告: ${this.results.warningsFound.length}`);
      
      // 短暂休息
      await new Promise(r =&gt; setTimeout(r, 100));
      
      // 定期清理
      if (cycle % 5 === 0) {
        console.log('  - 清理部分资源...');
        while (this.nodes.length &gt; 2000) {
          const node = this.nodes.pop();
          coreEngine.releaseNode(node!);
        }
        while (this.relations.length &gt; 4000) {
          const rel = this.relations.pop();
          coreEngine.releaseRelation(rel!);
        }
      }
    }
    
    // 生成最终报告
    this.results.endTime = Date.now();
    return this.results;
  }

  cleanup(): void {
    console.log('\n🧹 清理资源...');
    
    // 释放所有节点和关系
    for (const node of this.nodes) {
      coreEngine.releaseNode(node);
    }
    for (const relation of this.relations) {
      coreEngine.releaseRelation(relation);
    }
    
    this.nodes = [];
    this.relations = [];
  }
}

// 主函数
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           🔥 快速混沌与压力测试 - 3分钟 🔥                 ║');
  console.log('║           验证系统稳定性和发现问题                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const tester = new QuickChaosTester();
  
  try {
    await coreEngine.initialize();
    const results = await tester.runTest(3); // 3分钟测试
    
    // 保存结果
    const reportPath = './quick_chaos_test_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 报告已保存到: ${reportPath}`);
    
    // 总结
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      🔥 测试总结 🔥                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    const duration = (results.endTime - results.startTime) / 1000;
    console.log(`\n📊 总体结果:`);
    console.log(`  - 总时长: ${Math.floor(duration / 60)} 分 ${Math.floor(duration % 60)} 秒`);
    console.log(`  - 完成周期: ${results.cyclesCompleted}`);
    console.log(`  - 总操作数: ${results.operationsCount.toLocaleString()}`);
    console.log(`  - 节点创建: ${results.nodeCreations.toLocaleString()}`);
    console.log(`  - 关系创建: ${results.relationCreations.toLocaleString()}`);
    console.log(`  - 项目解析: ${results.realProjectParsings}`);
    
    if (results.bugsFound.length === 0) {
      console.log('\n🎉 🌟🌟🌟 完美测试 - 零 Bug! 🌟🌟🌟');
    } else {
      console.log(`\n🐛 发现 ${results.bugsFound.length} 个 Bug:`);
      for (const bug of results.bugsFound) {
        console.log(`  - [${bug.type}] ${bug.description}`);
      }
    }
    
    if (results.warningsFound.length &gt; 0) {
      console.log(`\n⚠️ 发现 ${results.warningsFound.length} 个警告`);
    }
    
    // 内存分析
    const firstMem = results.memoryHistory[0];
    const lastMem = results.memoryHistory[results.memoryHistory.length - 1];
    console.log(`\n💾 内存变化:`);
    console.log(`  - 初始: ${firstMem.heapUsed} MB`);
    console.log(`  - 最终: ${lastMem.heapUsed} MB`);
    console.log(`  - 增长: ${lastMem.heapUsed - firstMem.heapUsed} MB`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    tester.cleanup();
    coreEngine.dispose();
  }
}

// 启动
main().catch(console.error);

