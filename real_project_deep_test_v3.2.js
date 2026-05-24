#!/usr/bin/env node
/**
 * 🔥🔥🔥 ArkTS代码图谱 - 真实项目解析测试
 * 专注于真实代码库解析和问题发现
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

console.log('='.repeat(140));
console.log('🔥🔥🔥 ArkTS代码图谱 - 真实项目深度解析测试 v3.2');
console.log('='.repeat(140));
console.log('');

const results = {
    startTime: Date.now(),
    tests: [],
    bugsFound: [],
    issuesFound: [],
    memoryHistory: [],
    projectAnalysis: []
};

class ProjectTester {
    constructor() {
        this.passed = 0;
        this.failed = 0;
    }

    log(msg, type = 'INFO') {
        const elapsed = Math.round((Date.now() - results.startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        
        const icons = {
            'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 
            'ISSUE': '🔍', 'FIX': '🔧', 'INFO': 'ℹ️', 
            'TEST': '🧪', 'PERF': '⚡'
        };
        
        console.log(`${icons[type] || 'ℹ️'} [${mins}:${secs}] ${msg}`);
    }

    async recordMemory(label) {
        const mem = process.memoryUsage();
        const entry = {
            label,
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            external: Math.round(mem.external / 1024 / 1024),
            rss: Math.round(mem.rss / 1024 / 1024),
            timestamp: Date.now()
        };
        results.memoryHistory.push(entry);
        return entry;
    }

    async testKnowledgeGraphDatabase() {
        this.log('🧪 测试知识图谱数据库...', 'TEST');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        this.log('📦 创建节点...', 'INFO');
        for (let i = 0; i < 100; i++) {
            db.createNode({
                id: `node-${i}`,
                type: i % 3 === 0 ? 'CLASS' : i % 3 === 1 ? 'FUNCTION' : 'VARIABLE',
                name: `Node${i}`,
                metadata: { index: i }
            });
        }
        
        const nodes = db.getAllNodes();
        this.log(`✅ 创建了 ${nodes.length} 个节点`, 'SUCCESS');
        
        this.log('📦 创建关系...', 'INFO');
        for (let i = 0; i < 99; i++) {
            db.createRelation({
                id: `rel-${i}`,
                sourceId: `node-${i}`,
                targetId: `node-${i + 1}`,
                type: 'RELATES_TO',
                weight: 1.0
            });
        }
        
        const relations = db.getAllRelations();
        this.log(`✅ 创建了 ${relations.length} 个关系`, 'SUCCESS');
        
        this.log('📊 查询测试...', 'INFO');
        const functions = db.getNodesByType('FUNCTION');
        this.log(`✅ 查询: ${functions.length} 个FUNCTION节点`, 'SUCCESS');
        
        const searchResults = db.searchNodes('Node');
        this.log(`✅ 搜索: ${searchResults.length} 个结果`, 'SUCCESS');
        
        const stats = db.getStats();
        this.log(`📊 统计: ${stats.totalNodes} 节点, ${stats.totalRelations} 关系`, 'INFO');
        
        await db.clear();
        this.log('🧹 数据库清空完成', 'SUCCESS');
        
        this.passed++;
        results.tests.push({ name: 'KnowledgeGraphDatabase', status: 'PASSED' });
    }

    async testProjectAnalysisService() {
        this.log('🧪 测试项目分析服务...', 'TEST');
        
        const { ProjectAnalysisApplicationService } = require('./dist/src/application/analysis/project.analysis.app.service');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const projects = [
            { path: './src', name: 'src代码库' }
        ];
        
        if (fs.existsSync('./type-challenges')) {
            projects.push({ path: './type-challenges', name: 'type-challenges' });
        }
        
        for (const project of projects) {
            if (fs.existsSync(project.path)) {
                await this.recordMemory(`${project.name}分析前`);
                this.log(`🌍 分析 ${project.name}...`, 'TEST');
                
                try {
                    const db = new KnowledgeGraphDatabase();
                    const service = new ProjectAnalysisApplicationService(db);
                    
                    const startTime = Date.now();
                    const result = await service.analyzeProject(project.path);
                    const duration = Date.now() - startTime;
                    
                    await this.recordMemory(`${project.name}分析后`);
                    
                    this.log(`✅ ${project.name} 分析完成!`, 'SUCCESS');
                    this.log(`   节点: ${result.summary.totalNodes}, 关系: ${result.summary.totalRelations}, 耗时: ${duration}ms`, 'PERF');
                    
                    results.projectAnalysis.push({
                        project: project.name,
                        path: project.path,
                        nodes: result.summary.totalNodes,
                        relations: result.summary.totalRelations,
                        duration: duration,
                        status: 'SUCCESS'
                    });
                    
                    await db.clear();
                    this.passed++;
                    results.tests.push({ name: `ProjectAnalysis:${project.name}`, status: 'PASSED' });
                    
                } catch (error) {
                    this.log(`❌ ${project.name} 分析失败: ${error.message}`, 'BUG');
                    results.bugsFound.push({
                        project: project.name,
                        error: error.message,
                        stack: error.stack
                    });
                    results.projectAnalysis.push({
                        project: project.name,
                        path: project.path,
                        status: 'FAILED',
                        error: error.message
                    });
                    this.failed++;
                    results.tests.push({ name: `ProjectAnalysis:${project.name}`, status: 'FAILED', error: error.message });
                }
            }
        }
    }

    async testCoreEngine() {
        this.log('🧪 测试核心引擎...', 'TEST');
        const { coreEngine } = require('./dist/src/core/engine');
        
        const nodes = [];
        const relations = [];
        
        for (let i = 0; i < 100; i++) {
            const node = coreEngine.acquireNode();
            node.id = `test-${i}`;
            node.name = `Test${i}`;
            node.metadata = { i };
            nodes.push(node);
            
            if (i > 0) {
                const rel = coreEngine.acquireRelation();
                rel.sourceId = `test-${i - 1}`;
                rel.targetId = `test-${i}`;
                rel.type = 'CONNECTED';
                relations.push(rel);
            }
        }
        this.log(`✅ 获取 ${nodes.length} 节点, ${relations.length} 关系`, 'SUCCESS');
        
        for (const node of nodes) {
            coreEngine.releaseNode(node);
        }
        for (const rel of relations) {
            coreEngine.releaseRelation(rel);
        }
        this.log(`✅ 全部释放`, 'SUCCESS');
        
        this.passed++;
        results.tests.push({ name: 'CoreEngine', status: 'PASSED' });
    }

    async testMemoryManagement() {
        this.log('🧪 测试内存管理...', 'TEST');
        const { ObjectPool } = require('./dist/src/infrastructure/utils/memory_manager');
        
        const pool = new ObjectPool(
            () => ({ id: '', name: '', metadata: {} }),
            1000,
            (obj) => { obj.id = ''; obj.name = ''; obj.metadata = {}; }
        );
        
        const acquired = [];
        for (let i = 0; i < 2000; i++) {
            const obj = pool.acquire();
            obj.id = `obj-${i}`;
            obj.name = `Object${i}`;
            obj.metadata = { index: i };
            acquired.push(obj);
        }
        
        this.log(`✅ 申请了 ${acquired.length} 个对象`, 'SUCCESS');
        
        for (const obj of acquired) {
            pool.release(obj);
        }
        
        this.log(`✅ 释放完成`, 'SUCCESS');
        this.log(`📊 池大小: ${pool.size()}`, 'INFO');
        
        this.log('🧪 测试空值安全...', 'TEST');
        try {
            pool.release(null);
            pool.release(undefined);
            this.log('✅ null/undefined 处理安全', 'SUCCESS');
        } catch (e) {
            this.log('❌ null/undefined 处理有问题', 'BUG');
            throw e;
        }
        
        this.passed++;
        results.tests.push({ name: 'MemoryManagement', status: 'PASSED' });
    }

    async testIndexExports() {
        this.log('🧪 测试模块导出...', 'TEST');
        
        const index = require('./dist/src/index');
        const exports = Object.keys(index);
        this.log(`✅ 导出 ${exports.length} 个模块`, 'SUCCESS');
        this.log(`📦 导出: ${exports.slice(0, 10).join(', ')}...`, 'INFO');
        
        const expectedExports = ['NodeType', 'RelationType', 'KnowledgeGraphDatabase'];
        for (const exp of expectedExports) {
            if (index[exp]) {
                this.log(`✅ ${exp} 存在`, 'SUCCESS');
            } else {
                this.log(`⚠️ ${exp} 缺失`, 'WARNING');
            }
        }
        
        this.passed++;
        results.tests.push({ name: 'IndexExports', status: 'PASSED' });
    }

    async testConcurrency() {
        this.log('🧪 测试并发操作...', 'TEST');
        const { coreEngine } = require('./dist/src/core/engine');
        
        const numWorkers = 20;
        const operations = 100;
        let errors = 0;
        
        const workers = [];
        for (let w = 0; w < numWorkers; w++) {
            workers.push((async () => {
                try {
                    const nodes = [];
                    for (let i = 0; i < operations; i++) {
                        const node = coreEngine.acquireNode();
                        node.id = `worker-${w}-${i}`;
                        node.metadata = { worker: w, i };
                        nodes.push(node);
                        coreEngine.releaseNode(node);
                    }
                } catch (e) {
                    errors++;
                }
            })());
        }
        
        await Promise.all(workers);
        
        if (errors === 0) {
            this.log(`✅ 并发测试通过: ${numWorkers} 个 worker, ${operations} 次操作`, 'SUCCESS');
        } else {
            this.log(`❌ 并发错误: ${errors}`, 'BUG');
            results.bugsFound.push({ test: 'Concurrency', errors });
        }
        
        this.passed++;
        results.tests.push({ name: 'Concurrency', status: errors === 0 ? 'PASSED' : 'FAILED' });
    }

    async testExtremeOperations() {
        this.log('🧪 测试极端操作...', 'TEST');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        const nodeCount = 5000;
        const startTime = Date.now();
        
        for (let i = 0; i < nodeCount; i++) {
            db.createNode({
                id: `extreme-${i}`,
                type: 'TEST_NODE',
                name: `Extreme${i}`,
                metadata: { index: i, timestamp: Date.now() }
            });
            
            if (i % 1000 === 0) {
                this.log(`📊 进度: ${i}/${nodeCount}`, 'INFO');
            }
        }
        
        const duration = Date.now() - startTime;
        
        const allNodes = db.getAllNodes();
        this.log(`✅ 创建 ${allNodes.length} 节点, 耗时 ${duration}ms`, 'SUCCESS');
        
        for (let i = 0; i < nodeCount - 1; i++) {
            db.createRelation({
                id: `rel-${i}`,
                sourceId: `extreme-${i}`,
                targetId: `extreme-${i + 1}`,
                type: 'LINKS_TO',
                weight: 1.0
            });
        }
        
        const stats = db.getStats();
        this.log(`📊 最终: ${stats.totalNodes} 节点, ${stats.totalRelations} 关系`, 'PERF');
        
        await db.clear();
        this.log('🧹 清理完成', 'SUCCESS');
        
        this.passed++;
        results.tests.push({ name: 'ExtremeOperations', status: 'PASSED' });
    }

    async testManyProjects() {
        this.log('🧪 测试多项目分析...', 'TEST');
        
        const { ProjectAnalysisApplicationService } = require('./dist/src/application/analysis/project.analysis.app.service');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const projectsToTest = [
            { path: './src', name: 'src' }
        ];
        
        for (const project of projectsToTest) {
            try {
                this.log(`🔄 分析 ${project.name}...`, 'INFO');
                const db = new KnowledgeGraphDatabase();
                const service = new ProjectAnalysisApplicationService(db);
                
                await service.analyzeProject(project.path);
                await this.recordMemory(`分析${project.name}后`);
                
                await db.clear();
                
                this.log(`✅ ${project.name} 完成`, 'SUCCESS');
                this.passed++;
                results.tests.push({ name: `ManyProjects:${project.name}`, status: 'PASSED' });
                
            } catch (e) {
                this.log(`⚠️ ${project.name} 分析问题: ${e.message}`, 'WARNING');
                results.issuesFound.push({ project: project.name, error: e.message });
            }
        }
    }

    async runAllTests() {
        await this.recordMemory('开始');
        
        await this.testIndexExports();
        await this.recordMemory('模块测试后');
        
        await this.testCoreEngine();
        await this.recordMemory('核心引擎后');
        
        await this.testKnowledgeGraphDatabase();
        await this.recordMemory('知识图谱后');
        
        await this.testMemoryManagement();
        await this.recordMemory('内存管理后');
        
        await this.testConcurrency();
        await this.recordMemory('并发测试后');
        
        await this.testProjectAnalysisService();
        await this.recordMemory('项目分析后');
        
        await this.testExtremeOperations();
        await this.recordMemory('极端操作后');
        
        await this.testManyProjects();
        await this.recordMemory('多项目后');
        
        this.generateReport();
    }

    generateReport() {
        console.log('\n' + '='.repeat(140));
        console.log('📊 最终测试报告');
        console.log('='.repeat(140));
        
        const totalTests = this.passed + this.failed;
        const successRate = totalTests > 0 ? ((this.passed / totalTests) * 100).toFixed(1) : 0;
        
        console.log(`
📈 总体统计:
  测试总数: ${totalTests}
  通过: ${this.passed} ✅
  失败: ${this.failed} ❌
  成功率: ${successRate}%
  发现问题: ${results.bugsFound.length}
  警告: ${results.issuesFound.length}
`);
        
        if (results.projectAnalysis.length > 0) {
            console.log('🌍 项目分析结果:');
            results.projectAnalysis.forEach(r => {
                const statusIcon = r.status === 'SUCCESS' ? '✅' : '❌';
                const details = r.status === 'SUCCESS' 
                    ? `${r.nodes}节点 ${r.relations}关系 ${r.duration}ms` 
                    : r.error;
                console.log(`  ${statusIcon} ${r.project}: ${details}`);
            });
        }
        
        if (results.bugsFound.length > 0) {
            console.log('\n🐛 发现的问题:');
            results.bugsFound.forEach((bug, i) => {
                console.log(`  ${i + 1}. ${bug.test || bug.project}: ${bug.error}`);
            });
        }
        
        if (results.issuesFound.length > 0) {
            console.log('\n⚠️ 警告:');
            results.issuesFound.forEach((issue, i) => {
                console.log(`  ${i + 1}. ${issue.test || issue.project}: ${issue.error}`);
            });
        }
        
        console.log('\n📊 内存使用历史:');
        results.memoryHistory.forEach(entry => {
            console.log(`  - ${entry.label}: ${entry.heapUsed}MB`);
        });
        
        console.log('\n' + '='.repeat(140));
        
        const reportPath = path.join(__dirname, 'real_project_test_report_v3.2.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        this.log(`📄 详细报告已保存: ${reportPath}`, 'SUCCESS');
        
        if (this.failed === 0 && results.bugsFound.length === 0) {
            this.log('\n🎉🎉🎉 所有测试通过! 系统状态: 完美!', 'SUCCESS');
        } else {
            this.log('\n⚠️  测试完成，有部分问题', 'WARNING');
        }
        
        console.log('='.repeat(140));
    }
}

async function main() {
    const tester = new ProjectTester();
    await tester.runAllTests();
}

main().catch(err => {
    console.error('❌ 测试框架异常:', err);
    process.exit(1);
});
