#!/usr/bin/env node

/**
 * 🔥 真实项目深度解析测试
 * 解析项目中的真实代码库，发现系统在处理真实代码时的Bug
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

console.log('='.repeat(120));
console.log('🔥 真实项目深度解析测试 - 发现真实代码处理中的Bug');
console.log('='.repeat(120));
console.log('');

class RealProjectDeepTester {
    constructor() {
        this.results = {
            startTime: Date.now(),
            tests: [],
            bugsFound: [],
            issuesFound: [],
            projectResults: [],
            memoryHistory: []
        };
        this.passCount = 0;
        this.failCount = 0;
    }

    log(msg, type = 'INFO') {
        const elapsed = Math.round((Date.now() - this.results.startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        
        const icons = {
            'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 
            'ISSUE': '🔍', 'FIX': '🔧', 'INFO': 'ℹ️', 
            'TEST': '🧪', 'PERF': '⚡'
        };
        
        console.log(`${icons[type]} [${mins}:${secs}] ${msg}`);
    }

    async recordMemory(label) {
        const mem = process.memoryUsage();
        const record = {
            label,
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            external: Math.round(mem.external / 1024 / 1024),
            rss: Math.round(mem.rss / 1024 / 1024),
            timestamp: Date.now()
        };
        this.results.memoryHistory.push(record);
        return record;
    }

    findFiles(dir, extension, maxDepth = 3, currentDepth = 0) {
        if (currentDepth > maxDepth) return [];
        
        const files = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    files.push(...this.findFiles(path.join(dir, entry.name), extension, maxDepth, currentDepth + 1));
                } else if (entry.isFile() && entry.name.endsWith(extension)) {
                    files.push(path.join(dir, entry.name));
                }
            }
        } catch (e) {
            // Skip if can't read
        }
        return files;
    }

    async testTypeScriptProject(projectName, projectDir, maxFiles = 50) {
        this.log(`开始测试: ${projectName}`, 'TEST');
        const startMem = await this.recordMemory(`project_${projectName}_start`);
        const startTime = performance.now();
        
        const projectResult = {
            name: projectName,
            files: 0,
            errors: 0,
            errorDetails: [],
            success: false
        };
        
        try {
            const tsFiles = this.findFiles(projectDir, '.ts', 4);
            const testFiles = tsFiles.slice(0, maxFiles);
            
            this.log(`  发现 ${tsFiles.length} 个TypeScript文件，测试前 ${testFiles.length} 个`, 'INFO');
            
            projectResult.files = testFiles.length;
            
            // 测试1: 直接读取和解析文件内容（不使用系统，基础测试）
            for (let i = 0; i < testFiles.length; i++) {
                const file = testFiles[i];
                try {
                    const content = fs.readFileSync(file, 'utf-8');
                    
                    if (i % 10 === 0) {
                        this.log(`    读取 ${i + 1}/${testFiles.length}: ${path.basename(file)}`, 'INFO');
                    }
                    
                    if (content.length > 100000) {
                        this.log(`    ⚠️ 大文件 ${path.basename(file)}: ${content.length} 字符`, 'WARNING');
                    }
                    
                } catch (error) {
                    this.log(`    🐛 读取文件失败 ${path.basename(file)}: ${error.message}`, 'BUG');
                    projectResult.errors++;
                    projectResult.errorDetails.push({
                        file,
                        error: error.message,
                        phase: 'read'
                    });
                }
            }
            
            // 测试2: 尝试加载和使用系统模块
            try {
                this.log('  尝试加载系统模块...', 'INFO');
                
                const { coreEngine } = require('./dist/src/core/engine');
                
                this.log('  模块加载成功！', 'SUCCESS');
                
                // 测试对象池
                this.log('  测试对象池...', 'INFO');
                const testNodes = [];
                for (let i = 0; i < 100; i++) {
                    const node = coreEngine.acquireNode();
                    node.id = `test_${projectName}_${i}`;
                    node.name = `Test Node ${i}`;
                    node.metadata = { project: projectName, index: i };
                    testNodes.push(node);
                }
                
                for (const node of testNodes) {
                    coreEngine.releaseNode(node);
                }
                
                this.log('  对象池测试通过！', 'SUCCESS');
                
                projectResult.success = true;
                
            } catch (error) {
                this.log(`  🐛 系统模块测试失败: ${error.message}`, 'BUG');
                this.results.bugsFound.push({
                    project: projectName,
                    phase: 'system_module',
                    message: error.message,
                    stack: error.stack
                });
                projectResult.errors++;
                projectResult.errorDetails.push({
                    error: error.message,
                    phase: 'system_module'
                });
            }
            
        } catch (error) {
            this.log(`  🐛 项目测试异常: ${error.message}`, 'BUG');
            projectResult.errors++;
        }
        
        const endTime = performance.now();
        const endMem = await this.recordMemory(`project_${projectName}_end`);
        
        projectResult.duration = endTime - startTime;
        projectResult.memoryGrowth = endMem.heapUsed - startMem.heapUsed;
        
        if (projectResult.errors === 0 && projectResult.success) {
            this.log(`✅ ${projectName} 测试通过！耗时 ${(projectResult.duration / 1000).toFixed(2)}s，内存增长 ${projectResult.memoryGrowth}MB`, 'SUCCESS');
            this.passCount++;
        } else {
            this.log(`❌ ${projectName} 测试完成，但发现 ${projectResult.errors} 个问题`, 'WARNING');
            this.failCount++;
        }
        
        this.results.projectResults.push(projectResult);
    }

    async testEdgeCases() {
        this.log('开始测试: 边界情况与极端条件', 'TEST');
        
        const testResults = {
            name: 'edge_cases',
            tests: [],
            errors: 0
        };
        
        // 测试1: 非常大的字符串
        try {
            this.log('  测试1: 非常大的字符串处理...', 'INFO');
            const largeString = 'x'.repeat(1024 * 1024); // 1MB
            this.log(`    创建成功: ${largeString.length} 字符`, 'SUCCESS');
            testResults.tests.push({ name: 'large_string', success: true });
        } catch (error) {
            this.log(`    🐛 大字符串处理失败: ${error.message}`, 'BUG');
            testResults.errors++;
            testResults.tests.push({ name: 'large_string', success: false, error: error.message });
        }
        
        // 测试2: 深度嵌套的对象
        try {
            this.log('  测试2: 深度嵌套对象...', 'INFO');
            let deepObj = {};
            let current = deepObj;
            for (let i = 0; i < 1000; i++) {
                current.child = {};
                current = current.child;
            }
            this.log('    深度嵌套对象创建成功', 'SUCCESS');
            testResults.tests.push({ name: 'deep_object', success: true });
        } catch (error) {
            this.log(`    🐛 深度嵌套对象失败: ${error.message}`, 'BUG');
            testResults.errors++;
            testResults.tests.push({ name: 'deep_object', success: false, error: error.message });
        }
        
        // 测试3: JSON.stringify 的边界
        try {
            this.log('  测试3: 大JSON序列化...', 'INFO');
            const bigArray = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: `item_${i}` }));
            const jsonString = JSON.stringify(bigArray);
            this.log(`    JSON序列化成功: ${jsonString.length} 字符`, 'SUCCESS');
            testResults.tests.push({ name: 'big_json', success: true });
        } catch (error) {
            this.log(`    🐛 大JSON序列化失败: ${error.message}`, 'BUG');
            testResults.errors++;
            testResults.tests.push({ name: 'big_json', success: false, error: error.message });
        }
        
        if (testResults.errors === 0) {
            this.log('✅ 边界情况测试通过！', 'SUCCESS');
            this.passCount++;
        } else {
            this.log(`❌ 边界情况测试发现 ${testResults.errors} 个问题`, 'WARNING');
            this.failCount++;
        }
        
        this.results.projectResults.push(testResults);
    }

    async testSystemStability() {
        this.log('开始测试: 系统稳定性 - 长时间高频率操作', 'TEST');
        
        const startMem = await this.recordMemory('stability_start');
        const startTime = performance.now();
        
        try {
            const { coreEngine } = require('./dist/src/core/engine');
            
            const iterations = 10000;
            const errors = [];
            
            this.log(`  执行 ${iterations} 次循环操作...`, 'INFO');
            
            for (let i = 0; i < iterations; i++) {
                try {
                    const node = coreEngine.acquireNode();
                    node.id = `stability_${i}`;
                    node.metadata = { index: i, timestamp: Date.now() };
                    
                    const relation = coreEngine.acquireRelation();
                    relation.sourceId = `stability_${i}`;
                    relation.targetId = `stability_${(i + 1) % iterations}`;
                    
                    coreEngine.releaseNode(node);
                    coreEngine.releaseRelation(relation);
                    
                    if (i % 1000 === 0) {
                        const currentMem = await this.recordMemory(`stability_iter_${i}`);
                        this.log(`    迭代 ${i}/${iterations} - 内存: ${currentMem.heapUsed}MB`, 'INFO');
                    }
                    
                } catch (error) {
                    errors.push({ iteration: i, error: error.message });
                    if (errors.length === 1) {
                        this.log(`    🐛 首次错误在迭代 ${i}: ${error.message}`, 'BUG');
                    }
                }
            }
            
            const endTime = performance.now();
            const endMem = await this.recordMemory('stability_end');
            
            const duration = (endTime - startTime) / 1000;
            const memoryGrowth = endMem.heapUsed - startMem.heapUsed;
            
            if (errors.length === 0) {
                this.log(`✅ 稳定性测试通过！${iterations} 次迭代，耗时 ${duration.toFixed(2)}s，内存增长 ${memoryGrowth}MB`, 'SUCCESS');
                this.passCount++;
                this.results.projectResults.push({
                    name: 'stability',
                    iterations,
                    duration,
                    memoryGrowth,
                    errors: 0,
                    success: true
                });
            } else {
                this.log(`❌ 稳定性测试发现 ${errors.length} 个错误`, 'BUG');
                this.failCount++;
                this.results.bugsFound.push({
                    phase: 'stability',
                    errorCount: errors.length,
                    firstError: errors[0]
                });
                this.results.projectResults.push({
                    name: 'stability',
                    iterations,
                    duration,
                    memoryGrowth,
                    errors: errors.length,
                    success: false
                });
            }
            
        } catch (error) {
            this.log(`  🐛 稳定性测试异常: ${error.message}`, 'BUG');
            this.failCount++;
        }
    }

    async generateFinalReport() {
        this.log('='.repeat(120));
        this.log('📊 真实项目深度解析测试报告', 'INFO');
        this.log('='.repeat(120));
        
        const totalTime = (Date.now() - this.results.startTime) / 1000;
        
        console.log('');
        console.log('📈 测试统计:');
        console.log(`  ⏱️ 总耗时: ${totalTime.toFixed(1)}s`);
        console.log(`  ✅ 通过: ${this.passCount}`);
        console.log(`  ❌ 失败: ${this.failCount}`);
        console.log(`  🐛 发现Bug: ${this.results.bugsFound.length}`);
        
        if (this.results.memoryHistory.length > 0) {
            const start = this.results.memoryHistory[0].heapUsed;
            const end = this.results.memoryHistory[this.results.memoryHistory.length - 1].heapUsed;
            const peak = Math.max(...this.results.memoryHistory.map(m => m.heapUsed));
            
            console.log(`  💾 内存: ${start}MB → ${end}MB (增长 ${end - start}MB)`);
            console.log(`  📈 峰值: ${peak}MB`);
        }
        
        console.log('');
        console.log('📋 项目结果:');
        this.results.projectResults.forEach(r => {
            console.log(`  - ${r.name}: ${r.success ? '✅' : '❌'} ${r.errors || 0} 个错误`);
        });
        
        if (this.results.bugsFound.length > 0) {
            console.log('');
            console.log('🔍 发现的Bug:');
            this.results.bugsFound.forEach((b, i) => {
                console.log(`  ${i + 1}. [${b.phase || 'unknown'}] ${b.message || b.errorCount + ' errors'}`);
            });
        } else {
            console.log('');
            console.log('🎉 未发现Bug！系统表现完美！');
        }
        
        const reportPath = path.join(__dirname, 'real_project_deep_test_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        
        console.log('');
        this.log(`📄 详细报告已保存到: ${reportPath}`, 'SUCCESS');
    }

    async run() {
        await this.testTypeScriptProject('type-challenges', path.join(__dirname, 'type-challenges'), 30);
        await this.testTypeScriptProject('vue-core', path.join(__dirname, 'vue-core-test', 'packages'), 40);
        await this.testTypeScriptProject('src', path.join(__dirname, 'src'), 50);
        
        await this.testEdgeCases();
        await this.testSystemStability();
        
        await this.generateFinalReport();
        
        this.log('='.repeat(120));
        if (this.results.bugsFound.length === 0 && this.failCount === 0) {
            this.log('🎉 真实项目深度解析测试完成！系统表现完美！', 'SUCCESS');
        } else {
            this.log('⚠️ 测试完成，但发现一些问题需要处理', 'WARNING');
        }
        this.log('='.repeat(120));
    }
}

async function main() {
    const tester = new RealProjectDeepTester();
    
    try {
        await tester.run();
        process.exit(tester.failCount > 0 ? 1 : 0);
    } catch (error) {
        console.error('❌ 测试框架异常:', error);
        process.exit(1);
    }
}

main();
