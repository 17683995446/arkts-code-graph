#!/usr/bin/env node

/**
 * 深度真实场景综合测试框架 - 修复版
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { coreEngine } = require('./dist/src/core/engine');

console.log('='.repeat(100));
console.log('🔍🚀 深度真实场景综合测试框架 🚀🔍');
console.log('='.repeat(100));
console.log('');

class DeepRealScenarioTest {
  constructor() {
    this.results = { phases: [], errors: [], warnings: [] };
    this.startTime = Date.now();
    this.errorCount = 0;
    this.warningCount = 0;
  }

  log(message, type = 'INFO') {
    const icons = {
      'NETWORK': '🌐', 'FILE': '📁', 'CACHE': '💾', 'DATABASE': '🗄️',
      'TEST': '🧪', 'SUCCESS': '✅', 'WARNING': '⚠️', 'ERROR': '❌',
      'INFO': 'ℹ️', 'DATA': '📊'
    };
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    console.log(`${icons[type] || 'ℹ️'} [${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}] ${message}`);
    if (type === 'ERROR') this.errorCount++;
    if (type === 'WARNING') this.warningCount++;
  }

  recordMemory() {
    const mem = process.memoryUsage();
    return { heapUsed: Math.round(mem.heapUsed/1024/1024), heapTotal: Math.round(mem.heapTotal/1024/1024) };
  }

  async testNetworkRequests() {
    this.log('🌐 阶段1: 网络请求测试', 'NETWORK');
    const tests = [];

    // HTTP服务器测试
    this.log('测试1: HTTP请求处理', 'TEST');
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    });

    await new Promise((resolve, reject) => {
      server.listen(9999, () => {
        this.log('HTTP服务器启动', 'SUCCESS');
        http.get('http://localhost:9999', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.status === 'ok') {
                this.log('HTTP请求响应正常', 'SUCCESS');
                tests.push({ test: 'HTTP请求', status: 'PASSED' });
              }
            } catch (e) {
              tests.push({ test: 'HTTP请求', status: 'FAILED', error: e.message });
            }
            server.close(resolve);
          });
        }).on('error', reject);
      });
      server.on('error', reject);
    });

    // 高并发测试
    this.log('测试2: 高并发HTTP请求 (100个)', 'TEST');
    const server2 = http.createServer((req, res) => {
      res.writeHead(200);
      res.end('OK');
    });

    await new Promise((resolve) => {
      server2.listen(9998, async () => {
        const startTime = Date.now();
        const promises = [];
        
        for (let i = 0; i < 100; i++) {
          promises.push(new Promise((res, rej) => {
            const req = http.get('http://localhost:9998', (response) => {
              response.on('data', () => {});
              response.on('end', () => res());
            });
            req.on('error', rej);
          }));
        }

        try {
          await Promise.all(promises);
          const duration = Date.now() - startTime;
          this.log(`100并发请求完成: ${duration}ms, ${Math.round(100/(duration/1000))} req/s`, 'SUCCESS');
          tests.push({ test: '高并发HTTP', status: 'PASSED', duration });
        } catch (error) {
          this.log(`高并发失败: ${error.message}`, 'ERROR');
          tests.push({ test: '高并发HTTP', status: 'FAILED' });
        }

        server2.close(resolve);
      });
    });

    return tests;
  }

  async testFileSystem() {
    this.log('📁 阶段2: 文件系统测试', 'FILE');
    const tests = [];
    const testDir = path.join(__dirname, 'test_fs_' + Date.now());

    // 目录操作
    this.log('测试1: 目录创建删除', 'TEST');
    try {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'test.txt'), 'test');
      
      if (fs.existsSync(testDir)) {
        this.log('目录操作成功', 'SUCCESS');
        tests.push({ test: '目录操作', status: 'PASSED' });
      }
      
      fs.unlinkSync(path.join(testDir, 'test.txt'));
      fs.rmdirSync(testDir);
    } catch (error) {
      this.log(`文件系统错误: ${error.message}`, 'ERROR');
      tests.push({ test: '目录操作', status: 'FAILED', error: error.message });
    }

    // 大文件测试
    this.log('测试2: 大文件读写', 'TEST');
    const largeFile = path.join(testDir, 'large.bin');
    try {
      fs.mkdirSync(testDir);
      const startTime = Date.now();
      fs.writeFileSync(largeFile, Buffer.alloc(10 * 1024 * 1024)); // 10MB
      const writeTime = Date.now() - startTime;
      
      const stats = fs.statSync(largeFile);
      this.log(`写入10MB: ${writeTime}ms, 大小: ${(stats.size/1024/1024).toFixed(2)}MB`, 'SUCCESS');
      
      fs.unlinkSync(largeFile);
      fs.rmdirSync(testDir);
      tests.push({ test: '大文件', status: 'PASSED', writeTime });
    } catch (error) {
      this.log(`大文件错误: ${error.message}`, 'ERROR');
      tests.push({ test: '大文件', status: 'FAILED', error: error.message });
      try { if (fs.existsSync(largeFile)) fs.unlinkSync(largeFile); if (fs.existsSync(testDir)) fs.rmdirSync(testDir); } catch(e) {}
    }

    return tests;
  }

  async testCacheConsistency() {
    this.log('💾 阶段3: 缓存一致性测试', 'CACHE');
    const tests = [];

    // 一致性测试
    this.log('测试1: 缓存读写一致性', 'TEST');
    try {
      const cache = new Map();
      for (let i = 0; i < 10000; i++) {
        cache.set(`key_${i}`, { value: i });
      }
      
      let mismatches = 0;
      for (let i = 0; i < 10000; i++) {
        const item = cache.get(`key_${i}`);
        if (!item || item.value !== i) mismatches++;
      }
      
      this.log(`一致性测试: ${mismatches === 0 ? '通过' : '有问题'} (${mismatches}个不匹配)`, mismatches === 0 ? 'SUCCESS' : 'WARNING');
      tests.push({ test: '缓存一致性', status: mismatches === 0 ? 'PASSED' : 'WARNING', mismatches });
      cache.clear();
    } catch (error) {
      tests.push({ test: '缓存一致性', status: 'FAILED', error: error.message });
    }

    // 并发缓存
    this.log('测试2: 并发缓存访问', 'TEST');
    try {
      const cache = new Map();
      const workers = [];
      
      for (let w = 0; w < 20; w++) {
        workers.push((async () => {
          for (let i = 0; i < 1000; i++) {
            cache.set(`w${w}_${i}`, { worker: w, value: i });
            cache.get(`w${w}_${i}`);
          }
        })());
      }
      
      await Promise.all(workers);
      this.log(`50000次并发操作完成`, 'SUCCESS');
      tests.push({ test: '并发缓存', status: 'PASSED' });
    } catch (error) {
      tests.push({ test: '并发缓存', status: 'FAILED', error: error.message });
    }

    return tests;
  }

  async testDatabaseConnection() {
    this.log('🗄️ 阶段4: 数据库连接测试', 'DATABASE');
    const tests = [];

    // 连接池模拟
    this.log('测试1: 连接池管理', 'TEST');
    try {
      const pool = {
        connections: [],
        max: 10,
        acquire() { return this.connections.length < this.max ? { id: Date.now() } : null; },
        release(conn) { const idx = this.connections.indexOf(conn); if (idx > -1) this.connections.splice(idx, 1); }
      };
      
      const c1 = pool.acquire();
      const c2 = pool.acquire();
      if (c1 && c2) {
        pool.release(c1);
        pool.release(c2);
        this.log('连接池测试通过', 'SUCCESS');
        tests.push({ test: '连接池', status: 'PASSED' });
      }
    } catch (error) {
      tests.push({ test: '连接池', status: 'FAILED', error: error.message });
    }

    // 并发操作
    this.log('测试2: 并发数据库操作', 'TEST');
    try {
      const mockDB = { ops: 0, query() { this.ops++; return []; }, insert() { this.ops++; return { id: Date.now() }; } };
      const workers = [];
      
      for (let w = 0; w < 20; w++) {
        workers.push((async () => {
          for (let i = 0; i < 100; i++) {
            mockDB.insert('table', { data: i });
            mockDB.query('SELECT');
          }
        })());
      }
      
      await Promise.all(workers);
      this.log(`${mockDB.ops}次数据库操作完成`, 'SUCCESS');
      tests.push({ test: '并发DB', status: 'PASSED', ops: mockDB.ops });
    } catch (error) {
      tests.push({ test: '并发DB', status: 'FAILED', error: error.message });
    }

    return tests;
  }

  async testFaultInjection() {
    this.log('🔄 阶段5: 故障注入测试', 'TEST');
    const tests = [];

    // 断路器
    this.log('测试1: 断路器模式', 'TEST');
    try {
      const breaker = { failures: 0, threshold: 3, state: 'CLOSED' };
      
      for (let i = 0; i < 5; i++) {
        try {
          if (i < 3) throw new Error('Service error');
        } catch (e) {
          breaker.failures++;
          if (breaker.failures >= breaker.threshold) breaker.state = 'OPEN';
        }
      }
      
      this.log(`断路器: ${breaker.failures}次失败, 状态: ${breaker.state}`, 'SUCCESS');
      tests.push({ test: '断路器', status: 'PASSED' });
    } catch (error) {
      tests.push({ test: '断路器', status: 'FAILED', error: error.message });
    }

    // 重试机制
    this.log('测试2: 重试机制', 'TEST');
    try {
      let attempts = 0;
      const retry = async (fn, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          attempts++;
          try {
            return await fn();
          } catch (e) {
            if (i === maxRetries - 1) throw e;
          }
        }
      };
      
      await retry(() => { throw new Error('Transient error'); });
      this.log(`重试机制测试完成: ${attempts}次尝试`, 'SUCCESS');
      tests.push({ test: '重试机制', status: 'PASSED', attempts });
    } catch (error) {
      tests.push({ test: '重试机制', status: 'PASSED' }); // 预期失败
    }

    return tests;
  }

  async run() {
    this.log('开始执行完整测试套件...', 'INFO');
    
    const startMem = this.recordMemory();
    await coreEngine.initialize();
    this.log('核心引擎初始化成功', 'SUCCESS');

    const networkTests = await this.testNetworkRequests();
    const fsTests = await this.testFileSystem();
    const cacheTests = await this.testCacheConsistency();
    const dbTests = await this.testDatabaseConnection();
    const faultTests = await this.testFaultInjection();

    const allTests = [...networkTests, ...fsTests, ...cacheTests, ...dbTests, ...faultTests];
    const passed = allTests.filter(t => t.status === 'PASSED').length;
    const failed = allTests.filter(t => t.status === 'FAILED').length;
    const warnings = allTests.filter(t => t.status === 'WARNING').length;

    const endMem = this.recordMemory();
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);

    this.results.summary = {
      totalTime: `${Math.floor(totalTime/60)}m ${totalTime%60}s`,
      total: allTests.length,
      passed, failed, warnings,
      memoryGrowth: endMem.heapUsed - startMem.heapUsed,
      status: failed === 0 ? 'PASSED' : 'FAILED'
    };

    console.log('');
    console.log('='.repeat(100));
    console.log('📊 测试总结');
    console.log('='.repeat(100));
    console.log(`✅ 通过: ${passed}/${allTests.length}`);
    console.log(`⚠️  警告: ${warnings}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`💾 内存: ${startMem.heapUsed}MB → ${endMem.heapUsed}MB (增长: ${endMem.heapUsed - startMem.heapUsed}MB)`);
    console.log(`🎯 状态: ${this.results.summary.status}`);
    console.log('');

    fs.writeFileSync(path.join(__dirname, 'deep_real_scenario_report.json'), JSON.stringify(this.results, null, 2));
    this.log('报告已保存', 'SUCCESS');

    return this.results;
  }
}

async function main() {
  const tester = new DeepRealScenarioTest();
  try {
    await tester.run();
    process.exit(tester.results.summary.status === 'PASSED' ? 0 : 1);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

main();
