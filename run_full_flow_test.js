#!/usr/bin/env node

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ArkTS Code Graph - 标准化全流程测试执行器
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * 这个文件包装了完整的测试套件，确保所有异步操作正确执行
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动标准化全流程测试...\n');

const child = spawn('node', [path.join(__dirname, 'comprehensive_full_flow_test_suite.js')], {
  cwd: __dirname,
  stdio: 'inherit'
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ 测试执行成功！');
  } else {
    console.error(`\n❌ 测试执行失败，退出码: ${code}`);
  }
  process.exit(code);
});

child.on('error', (err) => {
  console.error('❌ 启动测试进程失败:', err);
  process.exit(1);
});
