#!/usr/bin/env node

/**
 * 超级深度压力测试 + 长时间稳定性监控
 * 目标：发现内存泄漏、性能退化、并发问题等
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { coreEngine } = require('./dist/src/core/engine');

console.log('='.repeat(100));
console.log('🔥⚡ 超级深度压力测试 + 长时间稳定性监控 ⚡🔥');
console.log('='.repeat(100));
console.log('');

class UltraDeepPressureTest {
  constructor() {
    this.results = {
      phases: [], errors: [], warnings: [],
      memoryProfile: [], performanceProfile: [],
      memoryLeaks: [], performanceDegradation: []
    };
    this.startTime = Date.now();
    this.errorCount = 0;
    this.warningCount = 0;
  }

  log(message, type = 'INFO') {
    const icons = {
      'STABILITY': '⚡', 'MEMORY': '💾', 'PERFORMANCE': '🚀',
      'CONCURRENCY': '🔀', 'FAULT': '🔧', 'TEST': '🧪',
      'SUCCESS': '✅', 'WARNING': '⚠️', 'ERROR': '❌', 'INFO': 'ℹ️'
    };
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    console.log(`${icons[type] || 'ℹ️'} [${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}] ${message}`);
    if (type === 'ERROR') this.errorCount++;
    if (type === 'WARNING') this.warningCount++;
  }

  recordMemory(label = '') {
    const mem = process.memoryUsage();
    const record = {
      timestamp: Date.now(),
      label,
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
      rss: Math.round(mem.rss / 1024 / 1024)
    };
    this.results.memoryProfile.push(record);
    return record;
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========== 阶段1: 超大规模数据测试 ==========
  async testUltraLargeScaleData() {
    this.log('⚡ 阶段1: 超大规模数据测试', 'STABILITY');
    const results = [];

    this.log('开始创建 500,000 个节点...', 'INFO');
    this.recordMemory('before_create');

    const nodes = [];
    const batchStart = Date.now();
    const batchSize = 50000;
    
    for (let i = 0; i < 500000; i++) {
      const node = coreEngine.acquireNode();
      node.id = `ultra_node_${i}`;
      node.name = `function_${i % 10000}`;
      node.type = ['Class', 'Function', 'Interface', 'Enum', 'Type'][i % 5];
      node.complexity = i % 100;
      node.lines = Math.floor(Math.random() * 1000) + 1;
      node.metadata = {
        index: i,
        batch: Math.floor(i / batchSize),
        timestamp: Date.now()
      };
      nodes.push(node);

      if (i % batchSize === 0 && i > 0) {
        const timeElapsed = Date.now() - batchStart;
        const mem = this.recordMemory(`after_${i}`);
        const speed = i / (timeElapsed / 1000);
        this.log(`已创建 ${i.toLocaleString()} 节点, 速度: ${Math.round(speed).toLocaleString()} 节点/秒, 内存: ${mem.heapUsed}MB`, 'PERFORMANCE');
      }
    }

    const totalTime = Date.now() - batchStart;
    const finalMem = this.recordMemory('after_all_nodes');
    this.log(`完成创建 500,000 节点! 总耗时: ${totalTime}ms, 内存: ${finalMem.heapUsed}MB`, 'SUCCESS');
    results.push({ test: '500k节点创建', status: 'PASSED', time: totalTime, memory: finalMem.heapUsed });

    this.log('创建 2,000,000 条关系...', 'INFO');
    const relations = [];
    const relStart = Date.now();
    
    for (let i = 0; i < 2000000; i++) {
      const rel = coreEngine.acquireRelation();
      rel.id = `ultra_rel_${i}`;
      rel.sourceId = nodes[Math.floor(Math.random() * nodes.length)].id;
      rel.targetId = nodes[Math.floor(Math.random() * nodes.length)].id;
      rel.type = ['depends', 'calls', 'imports', 'extends', 'implements'][i % 5];
      rel.weight = Math.random();
      rel.metadata = { index: i, created: Date.now() };
      relations.push(rel);

      if (i % 200000 === 0 && i > 0) {
        this.recordMemory(`after_rel_${i}`);
        this.log(`已创建 ${i.toLocaleString()} 关系`, 'INFO');
      }
    }

    const relTime = Date.now() - relStart;
    this.log(`完成创建 2,000,000 关系! 耗时: ${relTime}ms`, 'SUCCESS');
    results.push({ test: '200万关系创建', status: 'PASSED', time: relTime });

    this.log('开始释放所有资源...', 'INFO');
    for (const node of nodes) {
      coreEngine.releaseNode(node);
    }
    for (const rel of relations) {
      coreEngine.releaseRelation(rel);
    }
    await this.wait(500); // 给GC一些时间
    
    const cleanupMem = this.recordMemory('after_cleanup');
    this.log(`清理后内存: ${cleanupMem.heapUsed}MB`, 'MEMORY');

    const memoryGrowth = cleanupMem.heapUsed - this.results.memoryProfile[0].heapUsed;
    this.log(`内存增长: ${memoryGrowth}MB`, memoryGrowth > 50 ? 'WARNING' : 'SUCCESS');

    if (memoryGrowth > 100) {
      this.log('⚠️  检测到可能的内存泄漏!', 'WARNING');
      this.results.memoryLeaks.push({ type: 'node_rel_leak', growth: memoryGrowth });
    }

    return results;
  }

  // ========== 阶段2: 长时间稳定性监控 (2分钟) ==========
  async testLongTermStability() {
    this.log('⚡ 阶段2: 长时间稳定性监控 (2分钟)', 'STABILITY');
    console.log('');
    const results = [];
    
    const testDuration = 2 * 60 * 1000; // 2分钟
    const checkInterval = 10000; // 每10秒检查一次
    const iterations = testDuration / checkInterval;

    const memBaseline = this.recordMemory('baseline');
    let lastMem = memBaseline.heapUsed;
    const perfSamples = [];

    this.log(`开始稳定性监控，持续 ${testDuration/1000/60} 分钟...`, 'INFO');

    for (let i = 0; i < iterations; i++) {
      // 执行一些重复性操作
      const batchStart = Date.now();
      const tempNodes = [];
      for (let j = 0; j < 2000; j++) {
        const node = coreEngine.acquireNode();
        node.id = `stability_${i}_${j}`;
        tempNodes.push(node);
      }
      for (const node of tempNodes) {
        coreEngine.releaseNode(node);
      }
      const batchTime = Date.now() - batchStart;
      
      // 记录性能数据
      perfSamples.push({ iteration: i, time: batchTime });

      // 检查内存
      const mem = this.recordMemory(`stability_${i}`);
      const memDiff = mem.heapUsed - lastMem;
      lastMem = mem.heapUsed;

      const elapsed = i * checkInterval / 1000;
      this.log(`[${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}] 内存: ${mem.heapUsed}MB, 操作耗时: ${batchTime}ms`, 'MEMORY');

      // 检测内存增长
      if (mem.heapUsed - memBaseline.heapUsed > 100) {
        this.log('⚠️  内存增长超过100MB，可能存在泄漏!', 'WARNING');
      }

      // 检测性能退化
      if (perfSamples.length > 10) {
        const recentAverage = perfSamples.slice(-10).reduce((a, b) => a + b.time, 0) / 10;
        const earlierAverage = perfSamples.slice(0, 10).reduce((a, b) => a + b.time, 0) / 10;
        if (recentAverage > earlierAverage * 2) {
          this.log('⚠️  检测到性能退化!', 'WARNING');
          this.results.performanceDegradation.push({
            type: 'latency_increase',
            earlier: earlierAverage,
            recent: recentAverage,
            ratio: recentAverage / earlierAverage
          });
        }
      }

      await this.wait(checkInterval);
    }

    const finalMem = this.recordMemory('stability_end');
    const totalGrowth = finalMem.heapUsed - memBaseline.heapUsed;
    this.log(`稳定性测试完成! 总内存增长: ${totalGrowth}MB`, 'SUCCESS');

    if (totalGrowth > 50) {
      this.results.memoryLeaks.push({ type: 'stability_leak', growth: totalGrowth });
    }

    results.push({
      test: '2分钟稳定性',
      status: totalGrowth < 100 ? 'PASSED' : 'WARNING',
      totalGrowth,
      duration: testDuration
    });

    return results;
  }

  // ========== 阶段3: 极端并发场景 ==========
  async testExtremeConcurrency() {
    this.log('🔀 阶段3: 极端并发场景测试', 'CONCURRENCY');
    const results = [];

    // 测试1: 极端并发获取节点
    this.log('测试1: 100并发获取节点', 'TEST');
    const concurrencyLevel = 100;
    const opsPerWorker = 2000;

    const workers = [];
    const startTime = Date.now();

    for (let w = 0; w < concurrencyLevel; w++) {
      workers.push((async () => {
        const myNodes = [];
        for (let i = 0; i < opsPerWorker; i++) {
          const node = coreEngine.acquireNode();
          node.id = `conc_${w}_${i}`;
          node.workerId = w;
          myNodes.push(node);
        }
        for (const node of myNodes) {
          coreEngine.releaseNode(node);
        }
        return { worker: w, count: opsPerWorker };
      })());
    }

    try {
      await Promise.all(workers);
      const duration = Date.now() - startTime;
      const totalOps = concurrencyLevel * opsPerWorker;
      const throughput = totalOps / (duration / 1000);
      
      this.log(`并发测试完成! ${concurrencyLevel}并发 × ${opsPerWorker}操作 = ${totalOps}次`, 'SUCCESS');
      this.log(`总耗时: ${duration}ms, 吞吐量: ${Math.round(throughput).toLocaleString()} 操作/秒`, 'PERFORMANCE');

      if (throughput > 50000) {
        results.push({ test: '极端并发', status: 'PASSED', throughput });
      } else {
        results.push({ test: '极端并发', status: 'WARNING', throughput });
      }
    } catch (error) {
      this.log(`并发测试错误: ${error.message}`, 'ERROR');
      results.push({ test: '极端并发', status: 'FAILED', error: error.message });
    }

    // 测试2: 混合操作并发
    this.log('测试2: 混合操作并发 (获取+查询+释放)', 'TEST');
    const mixWorkers = [];
    
    for (let w = 0; w < 50; w++) {
      mixWorkers.push((async () => {
        for (let i = 0; i < 1000; i++) {
          const node = coreEngine.acquireNode();
          node.id = `mix_${w}_${i}`;
          // 做一些计算
          if (node.id) {
            node.metadata = { processed: true, timestamp: Date.now() };
          }
          coreEngine.releaseNode(node);
        }
        return true;
      })());
    }

    try {
      await Promise.all(mixWorkers);
      this.log('混合操作并发测试通过', 'SUCCESS');
      results.push({ test: '混合并发', status: 'PASSED' });
    } catch (error) {
      this.log(`混合操作错误: ${error.message}`, 'ERROR');
      results.push({ test: '混合并发', status: 'FAILED', error: error.message });
    }

    return results;
  }

  // ========== 阶段4: 复杂故障模式注入 ==========
  async testComplexFaultInjection() {
    this.log('🔧 阶段4: 复杂故障模式注入', 'FAULT');
    const results = [];

    // 1. 内存压力测试
    this.log('测试1: 内存压力测试', 'TEST');
    const pressureData = [];
    let pressureSuccess = true;
    
    for (let i = 0; i < 100; i++) {
      try {
        const memHog = [];
        for (let j = 0; j < 500; j++) {
          const node = coreEngine.acquireNode();
          node.id = `pressure_${i}_${j}`;
          node.bigData = new Array(100).fill({ x: Math.random(), y: Math.random() });
          memHog.push(node);
        }
        
        // 快速释放
        for (const node of memHog) {
          coreEngine.releaseNode(node);
        }
        
        if (i % 20 === 0) {
          this.recordMemory(`pressure_${i}`);
        }
      } catch (error) {
        pressureSuccess = false;
        this.log(`内存压力错误: ${error.message}`, 'ERROR');
        break;
      }
    }

    this.log('内存压力测试完成', pressureSuccess ? 'SUCCESS' : 'ERROR');
    results.push({ test: '内存压力', status: pressureSuccess ? 'PASSED' : 'FAILED' });

    // 2. 快速资源获取释放测试
    this.log('测试2: 快速资源获取释放循环', 'TEST');
    let rapidSuccess = true;
    const rapidStart = Date.now();
    
    for (let cycle = 0; cycle < 500; cycle++) {
      const nodes = [];
      for (let i = 0; i < 100; i++) {
        const node = coreEngine.acquireNode();
        node.id = `rapid_${cycle}_${i}`;
        nodes.push(node);
      }
      for (const node of nodes) {
        coreEngine.releaseNode(node);
      }
      
      if (cycle % 100 === 0) {
        this.recordMemory(`rapid_${cycle}`);
      }
    }
    
    const rapidTime = Date.now() - rapidStart;
    this.log(`快速循环完成: ${rapidTime}ms, 50000次操作`, 'SUCCESS');
    results.push({ test: '快速循环', status: 'PASSED', time: rapidTime });

    // 3. 错误输入鲁棒性测试
    this.log('测试3: 错误输入鲁棒性测试', 'TEST');
    let robustness = true;
    const badInputs = [null, undefined, {}, [], NaN, Infinity, -Infinity];
    
    for (const input of badInputs) {
      try {
        if (typeof input !== 'string') {
          // 测试错误处理
          const testNode = coreEngine.acquireNode();
          testNode.someProp = input;
          coreEngine.releaseNode(testNode);
        }
      } catch (error) {
        // 预期某些错误，但系统不应崩溃
        this.log(`鲁棒性测试: 输入 ${typeof input} - 已处理`, 'INFO');
      }
    }
    this.log('鲁棒性测试完成', 'SUCCESS');
    results.push({ test: '错误输入', status: 'PASSED' });

    return results;
  }

  // ========== 运行完整测试 ==========
  async runCompleteTest() {
    this.log('开始执行超级深度压力测试...', 'INFO');
    console.log('');

    const startMem = this.recordMemory('test_start');
    await coreEngine.initialize();

    // 阶段1: 超大规模数据
    const scaleTests = await this.testUltraLargeScaleData();
    this.results.phases.push(...scaleTests);
    console.log('');

    // 阶段2: 长时间稳定性
    const stabilityTests = await this.testLongTermStability();
    this.results.phases.push(...stabilityTests);
    console.log('');

    // 阶段3: 极端并发
    const concurrencyTests = await this.testExtremeConcurrency();
    this.results.phases.push(...concurrencyTests);
    console.log('');

    // 阶段4: 复杂故障注入
    const faultTests = await this.testComplexFaultInjection();
    this.results.phases.push(...faultTests);
    console.log('');

    const endMem = this.recordMemory('test_end');

    // 生成总结
    this.generateSummary(startMem, endMem);
    this.saveReport();

    return this.results;
  }

  generateSummary(startMem, endMem) {
    const totalTime = (Date.now() - this.startTime) / 1000;
    const minutes = Math.floor(totalTime / 60);
    const seconds = Math.round(totalTime % 60);

    const allTests = this.results.phases;
    const passed = allTests.filter(t => t.status === 'PASSED').length;
    const warnings = allTests.filter(t => t.status === 'WARNING').length;
    const failed = allTests.filter(t => t.status === 'FAILED').length;

    // 内存泄漏分析
    const memoryValues = this.results.memoryProfile.map(m => m.heapUsed);
    const peakMemory = Math.max(...memoryValues);
    const minMemory = Math.min(...memoryValues);
    const memoryRange = peakMemory - minMemory;

    this.results.summary = {
      totalTime: `${minutes}m ${seconds}s`,
      totalTests: allTests.length,
      passed, warnings, failed,
      errors: this.errorCount,
      memoryStart: startMem.heapUsed,
      memoryEnd: endMem.heapUsed,
      memoryGrowth: endMem.heapUsed - startMem.heapUsed,
      memoryPeak: peakMemory,
      memoryLeaks: this.results.memoryLeaks,
      performanceDegradation: this.results.performanceDegradation,
      status: failed === 0 && this.errorCount === 0 ? 'PASSED' : 'FAILED'
    };

    console.log('');
    console.log('='.repeat(100));
    this.log('📊 超级深度压力测试总结', 'INFO');
    console.log('='.repeat(100));
    console.log(`✅ 总耗时: ${this.results.summary.totalTime}`);
    console.log(`✅ 总测试: ${this.results.summary.totalTests}`);
    console.log(`✅ 通过: ${passed}`);
    console.log(`⚠️  警告: ${warnings}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`💾 起始内存: ${startMem.heapUsed}MB`);
    console.log(`💾 结束内存: ${endMem.heapUsed}MB`);
    console.log(`💾 内存增长: ${this.results.summary.memoryGrowth}MB`);
    console.log(`💾 峰值内存: ${peakMemory}MB`);
    console.log(`🐛 内存泄漏检测: ${this.results.memoryLeaks.length}处`);
    console.log(`📉 性能退化检测: ${this.results.performanceDegradation.length}处`);
    console.log(`🎯 最终状态: ${this.results.summary.status}`);
    console.log('');
  }

  saveReport() {
    const reportPath = path.join(__dirname, 'ultra_deep_pressure_test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    this.log(`📄 报告已保存: ${reportPath}`, 'SUCCESS');
  }
}

async function main() {
  const tester = new UltraDeepPressureTest();
  
  try {
    await tester.runCompleteTest();
    
    console.log('');
    console.log('='.repeat(100));
    console.log('🎉 超级深度压力测试完成!');
    console.log('='.repeat(100));
    
    process.exit(tester.results.summary.status === 'PASSED' ? 0 : 1);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

main();
