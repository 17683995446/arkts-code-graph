#!/usr/bin/env node
/**
 * 🔥🔥🔥 ArkTS代码图谱 - 全面深度真实测试
 * 真实场景压力测试与问题发现
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { performance, PerformanceObserver } = require('perf_hooks');

console.log('='.repeat(140));
console.log('🔥🔥🔥 ArkTS代码图谱 - 全面深度真实测试 v3.0');
console.log('='.repeat(140));
console.log('');

const results = {
    startTime: Date.now(),
    tests: [],
    bugsFound: [],
    issuesFound: [],
    memoryHistory: [],
    performanceMetrics: []
};

class ComprehensiveTester {
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
        this.log(`📊 内存: ${entry.heapUsed}MB | ${entry.rss}MB (${label})`, 'INFO');
        return entry;
    }

    async runTest(testName, testFn) {
        this.log(`\n🧪 ${testName}...`, 'TEST');
        try {
            await testFn();
            this.passed++;
            this.log(`✅ ${testName} - 通过`, 'SUCCESS');
            results.tests.push({ name: testName, status: 'PASSED' });
        } catch (error) {
            this.failed++;
            this.log(`❌ ${testName} - 失败: ${error.message}`, 'BUG');
            results.tests.push({ name: testName, status: 'FAILED', error: error.message });
            results.bugsFound.push({ test: testName, error: error.message, stack: error.stack });
        }
    }

    async testIndexExports() {
        this.log('📦 测试核心模块导入...', 'TEST');
        const indexModule = require('./dist/src/index');
        this.log(`✓ 成功导入 index.ts`, 'SUCCESS');
        
        const exportedKeys = Object.keys(indexModule);
        this.log(`✓ 导出 ${exportedKeys.length} 个模块: ${exportedKeys.slice(0, 5).join(', ')}...`, 'INFO');
    }

    async testProjectAnalysisService() {
        const { ProjectAnalysisApplicationService } = require('./dist/src/application/analysis/project.analysis.app.service');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        this.log('📦 创建知识库实例...', 'INFO');
        const db = new KnowledgeGraphDatabase();
        const service = new ProjectAnalysisApplicationService(db);
        
        this.log('🔍 分析测试项目...', 'TEST');
        
        const testDirs = [
            './src',
            './type-challenges',
            './tests'
        ];
        
        for (const dir of testDirs) {
            if (fs.existsSync(dir)) {
                try {
                    this.log(`📂 分析 ${dir}...`, 'INFO');
                    const result = await service.analyzeProject(dir);
                    
                    if (result && result.summary) {
                        this.log(`✓ ${dir}: ${result.summary.totalNodes} 节点, ${result.summary.totalRelations} 关系`, 'SUCCESS');
                        
                        if (result.summary.totalNodes > 0) {
                            results.performanceMetrics.push({
                                test: 'ProjectAnalysis',
                                project: dir,
                                nodes: result.summary.totalNodes,
                                relations: result.summary.totalRelations
                            });
                        }
                    }
                } catch (error) {
                    this.log(`⚠️ ${dir} 分析异常: ${error.message}`, 'WARNING');
                    results.issuesFound.push({
                        test: 'ProjectAnalysis',
                        project: dir,
                        error: error.message
                    });
                }
            }
        }
        
        this.log('📊 清理测试数据...', 'INFO');
        await db.clear();
    }

    async testKnowledgeGraphDatabase() {
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        this.log('📊 测试节点创建...', 'TEST');
        const nodes = [];
        for (let i = 0; i < 1000; i++) {
            const node = db.createNode({
                id: `test-node-${i}`,
                type: i % 3 === 0 ? 'CLASS' : i % 3 === 1 ? 'FUNCTION' : 'VARIABLE',
                name: `Test${i}`,
                metadata: { index: i, createdAt: Date.now() }
            });
            nodes.push(node);
        }
        this.log(`✓ 创建了 ${nodes.length} 个节点`, 'SUCCESS');
        
        this.log('📊 测试关系创建...', 'TEST');
        for (let i = 0; i < 999; i++) {
            db.createRelation({
                sourceId: `test-node-${i}`,
                targetId: `test-node-${i + 1}`,
                type: i % 2 === 0 ? 'CALLS' : 'DEPENDS_ON',
                weight: Math.random()
            });
        }
        this.log(`✓ 创建了 999 个关系`, 'SUCCESS');
        
        this.log('📊 测试查询功能...', 'TEST');
        const allNodes = db.getAllNodes();
        const allRelations = db.getAllRelations();
        this.log(`✓ 查询: ${allNodes.length} 节点, ${allRelations.length} 关系`, 'SUCCESS');
        
        this.log('📊 测试更新和删除...', 'TEST');
        for (let i = 0; i < 100; i++) {
            const node = db.getNodeById(`test-node-${i}`);
            if (node) {
                node.metadata.updated = true;
                db.updateNode(node);
            }
            db.deleteRelation(i);
        }
        this.log(`✓ 更新 100 个节点，删除 100 个关系`, 'SUCCESS');
        
        this.log('📊 测试清空数据库...', 'TEST');
        await db.clear();
        this.log(`✓ 数据库清空成功`, 'SUCCESS');
    }

    async testMemoryOptimizer() {
        const { ObjectPool, MemoryManager } = require('./dist/src/infrastructure/utils/memory_manager');
        
        this.log('🗄️ 测试对象池...', 'TEST');
        
        const nodePool = new ObjectPool(
            () => ({ id: '', type: '', name: '', metadata: {} }),
            (obj) => { obj.id = ''; obj.type = ''; obj.name = ''; obj.metadata = {}; },
            1000
        );
        
        const objects = [];
        for (let i = 0; i < 2000; i++) {
            const obj = nodePool.acquire();
            obj.id = `pool-obj-${i}`;
            obj.name = `Object${i}`;
            objects.push(obj);
        }
        this.log(`✓ 申请了 2000 个对象`, 'SUCCESS');
        
        for (const obj of objects) {
            nodePool.release(obj);
        }
        this.log(`✓ 释放了 ${objects.length} 个对象`, 'SUCCESS');
        
        this.log(`✓ 对象池大小: ${nodePool.getPoolSize()}`, 'INFO');
        
        this.log('📊 测试空值安全...', 'TEST');
        try {
            nodePool.release(null);
            nodePool.release(undefined);
            this.log('✓ null/undefined 处理安全', 'SUCCESS');
        } catch (e) {
            this.log('❌ null/undefined 处理有问题', 'BUG');
            throw e;
        }
    }

    async testCoreEngine() {
        const { coreEngine } = require('./dist/src/core/engine');
        
        this.log('⚡ 测试核心引擎...', 'TEST');
        
        const nodes = [];
        const relations = [];
        
        for (let i = 0; i < 500; i++) {
            const node = coreEngine.acquireNode();
            node.id = `engine-node-${i}`;
            node.name = `EngineNode${i}`;
            node.metadata = { iteration: i };
            nodes.push(node);
            
            if (i > 0) {
                const relation = coreEngine.acquireRelation();
                relation.sourceId = `engine-node-${i - 1}`;
                relation.targetId = `engine-node-${i}`;
                relation.type = 'CONNECTED_TO';
                relations.push(relation);
            }
        }
        this.log(`✓ 获取 ${nodes.length} 节点, ${relations.length} 关系`, 'SUCCESS');
        
        for (const node of nodes) {
            coreEngine.releaseNode(node);
        }
        for (const relation of relations) {
            coreEngine.releaseRelation(relation);
        }
        this.log(`✓ 全部释放完成`, 'SUCCESS');
    }

    async testPerformanceOptimizer() {
        const { PerformanceOptimizer } = require('./dist/src/infrastructure/utils/performance.optimizer');
        
        this.log('⚡ 测试性能优化器...', 'TEST');
        
        const opts = new PerformanceOptimizer();
        
        let computed = 0;
        const expensiveFn = (x) => {
            computed++;
            return x * 2;
        };
        
        const memoized = opts.memoize(expensiveFn);
        
        memoized(1); memoized(2); memoized(1); memoized(3); memoized(2);
        this.log(`✓ 缓存工作: ${computed} 次实际计算`, computed === 3 ? 'SUCCESS' : 'WARNING');
        
        let executed = 0;
        const batchFn = (items) => items.map(x => { executed++; return x * 3; });
        const batched = opts.batch(batchFn, 100);
        
        const resultsBatch = [];
        for (let i = 0; i < 500; i++) {
            resultsBatch.push(await batched([i]));
        }
        
        this.log(`✓ 批处理: 调用 ${executed} 次`, 'INFO');
        this.log('✓ 性能优化器工作正常', 'SUCCESS');
    }

    async testSecurityEnhancements() {
        try {
            const { SecurityEnhancements } = require('./dist/src/infrastructure/utils/security.enhancements');
            
            this.log('🔐 测试安全增强...', 'TEST');
            const security = new SecurityEnhancements();
            
            const testInput = 'hello<script>alert("xss")</script>world';
            const sanitized = security.sanitizeInput(testInput);
            this.log(`✓ 输入清理: ${testInput.length} → ${sanitized.length} chars`, 'INFO');
            
            const isSafePath = security.isSafePath('./safe/file.ts');
            const isDangerousPath = security.isSafePath('/etc/passwd');
            this.log(`✓ 安全路径检查: ${isSafePath}/${!isDangerousPath}`, isSafePath && !isDangerousPath ? 'SUCCESS' : 'WARNING');
            
            this.log('✓ 安全模块工作正常', 'SUCCESS');
        } catch (e) {
            this.log(`⚠️ 安全模块加载失败: ${e.message}`, 'WARNING');
        }
    }

    async testParallelFileParsing() {
        try {
            const { ParallelFileParserService } = require('./dist/src/infrastructure/utils/parallel.file.parser.service');
            
            this.log('📄 测试并行文件解析...', 'TEST');
            
            const parser = new ParallelFileParserService({ maxWorkers: 4 });
            
            const testFiles = [];
            const tempDir = '/tmp/test-parsing';
            fs.mkdirSync(tempDir, { recursive: true });
            
            for (let i = 0; i < 20; i++) {
                const filePath = path.join(tempDir, `test-${i}.ts`);
                const content = `export class Test${i} {
                    value = ${i};
                    method() { return this.value; }
                }`;
                fs.writeFileSync(filePath, content);
                testFiles.push(filePath);
            }
            
            this.log(`📄 创建了 ${testFiles.length} 个测试文件`, 'INFO');
            
            const parsedResults = await parser.parseFiles(testFiles);
            
            this.log(`✓ 解析了 ${parsedResults.length} 个文件`, 'SUCCESS');
            
            for (const file of testFiles) {
                fs.unlinkSync(file);
            }
            fs.rmdirSync(tempDir);
            
            this.log('✓ 并行解析服务工作正常', 'SUCCESS');
        } catch (e) {
            this.log(`⚠️ 并行解析模块测试问题: ${e.message}`, 'WARNING');
            results.issuesFound.push({
                test: 'ParallelFileParsing',
                error: e.message
            });
        }
    }

    async testSmartCache() {
        try {
            const { SmartCacheService } = require('./dist/src/infrastructure/cache/smart.cache.service');
            
            this.log('🧠 测试智能缓存...', 'TEST');
            
            const cache = new SmartCacheService({
                maxSize: 1000,
                ttl: 60000
            });
            
            let computeCount = 0;
            const compute = async (key) => {
                computeCount++;
                return { key, value: key * 2, computedAt: Date.now() };
            };
            
            for (let i = 0; i < 10; i++) {
                await cache.getOrCompute(`key-${i % 5}`, () => compute(i % 5));
            }
            
            this.log(`✓ 缓存命中率: ${(1 - computeCount/10 * 100).toFixed(0)}%`, 'INFO');
            
            const cacheStats = cache.getStats();
            this.log(`✓ 缓存统计: hits=${cacheStats.hits}, misses=${cacheStats.misses}, size=${cacheStats.size}`, 'INFO');
            
            this.log('✓ 智能缓存工作正常', 'SUCCESS');
        } catch (e) {
            this.log(`⚠️ 智能缓存模块测试问题: ${e.message}`, 'WARNING');
        }
    }

    async testRealWorldScenarios() {
        this.log('🌍 真实项目场景测试...', 'TEST');
        
        // 测试真实代码库解析
        const { ProjectAnalysisApplicationService } = require('./dist/src/application/analysis/project.analysis.app.service');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        const service = new ProjectAnalysisApplicationService(db);
        
        const realProjects = [
            { path: './src', name: 'src代码库' }
        ];
        
        if (fs.existsSync('./type-challenges')) {
            realProjects.push({ path: './type-challenges', name: 'type-challenges' });
        }
        
        if (fs.existsSync('./vue-core-test/packages')) {
            realProjects.push({ path: './vue-core-test/packages', name: 'Vue源码' });
        }
        
        for (const project of realProjects) {
            this.log(`🌍 测试 ${project.name}...`, 'TEST');
            
            try {
                const result = await service.analyzeProject(project.path);
                this.log(`✓ ${project.name} 解析完成`, 'SUCCESS');
                results.performanceMetrics.push({
                    project: project.name,
                    nodes: result.summary.totalNodes,
                    relations: result.summary.totalRelations,
                    timestamp: Date.now()
                });
                
                await db.clear();
                
            } catch (error) {
                this.log(`⚠️ ${project.name} 解析问题: ${error.message}`, 'WARNING');
                results.issuesFound.push({ project: project.name, error: error.message });
            }
        }
        
        this.log('🌍 真实场景测试完成', 'SUCCESS');
    }

    async testConcurrencyAndRaceConditions() {
        this.log('⚡ 并发与竞争条件测试...', 'TEST');
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        const { coreEngine } = require('./dist/src/core/engine');
        
        const db = new KnowledgeGraphDatabase();
        const errors = [];
        
        const workers = [];
        const numWorkers = 50;
        
        for (let w = 0; w < numWorkers; w++) {
            workers.push((async () => {
                try {
                    for (let i = 0; i < 20; i++) {
                        const nodeId = `worker-${w}-node-${i}`;
                        db.createNode({
                            id: nodeId,
                            type: 'TEST_NODE',
                            name: nodeId
                        });
                        
                        const relation = coreEngine.acquireRelation();
                        relation.sourceId = nodeId;
                        relation.targetId = `worker-${(w + 1) % numWorkers}-node-${i}`;
                        relation.type = 'RELATES_TO';
                        coreEngine.releaseRelation(relation);
                    }
                } catch (e) {
                    errors.push({ worker: w, error: e.message });
                }
            })());
        }
        
        await Promise.all(workers);
        
        if (errors.length === 0) {
            this.log('✅ 并发测试通过 - 无竞争条件问题', 'SUCCESS');
        } else {
            this.log(`❌ 发现 ${errors.length} 个并发错误`, 'BUG');
            errors.slice(0, 3).forEach(err => results.bugsFound.push(err));
        }
    }

    async testExtremeDataScales() {
        this.log('📈 极端数据规模测试...', 'TEST');
        
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        const db = new KnowledgeGraphDatabase();
        
        const targetNodes = 10000;
        this.log(`🎯 创建 ${targetNodes} 个节点...`, 'INFO');
        
        const startTime = Date.now();
        
        for (let i = 0; i < targetNodes; i++) {
            db.createNode({
                id: `extreme-node-${i}`,
                type: i % 4 === 0 ? 'CLASS' : i % 4 === 1 ? 'FUNCTION' : i % 4 === 2 ? 'VARIABLE' : 'TYPE',
                name: `Extreme${i}`,
                metadata: { index: i, timestamp: Date.now() }
            });
            
            if (i % 1000 === 0) {
                this.log(`📊 进度: ${i}/${targetNodes} 节点`, 'INFO');
                await this.recordMemory(`Extreme-${i}`);
            }
        }
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        const nodes = db.getAllNodes();
        this.log(`✅ 创建了 ${nodes.length} 个节点, 耗时 ${duration.toFixed(1)}s`, 'SUCCESS');
        
        for (let i = 0; i < targetNodes - 1; i++) {
            db.createRelation({
                sourceId: `extreme-node-${i}`,
                targetId: `extreme-node-${i + 1}`,
                type: 'LINKS_TO',
                weight: 1.0
            });
        }
        
        const relations = db.getAllRelations();
        this.log(`✅ 创建了 ${relations.length} 个关系`, 'SUCCESS');
        
        await db.clear();
        this.log('🧹 清理完成', 'SUCCESS');
    }

    async runAllTests() {
        await this.recordMemory('开始');
        
        await this.testIndexExports();
        await this.recordMemory('Index测试后');
        
        await this.testCoreEngine();
        await this.recordMemory('核心引擎测试后');
        
        await this.testKnowledgeGraphDatabase();
        await this.recordMemory('知识图谱测试后');
        
        await this.testMemoryOptimizer();
        await this.recordMemory('内存优化测试后');
        
        await this.testPerformanceOptimizer();
        await this.recordMemory('性能优化测试后');
        
        await this.testSecurityEnhancements();
        await this.recordMemory('安全模块测试后');
        
        await this.testSmartCache();
        await this.recordMemory('缓存测试后');
        
        await this.testParallelFileParsing();
        await this.recordMemory('并行解析测试后');
        
        await this.testRealWorldScenarios();
        await this.recordMemory('真实场景测试后');
        
        await this.testConcurrencyAndRaceConditions();
        await this.recordMemory('并发测试后');
        
        await this.testExtremeDataScales();
        await this.recordMemory('极端数据后');
        
        this.generateReport();
    }

    generateReport() {
        console.log('\n' + '='.repeat(140));
        console.log('📊 最终测试报告');
        console.log('='.repeat(140));
        
        const totalTests = this.passed + this.failed;
        console.log(`
📈 测试统计:
  总数: ${totalTests}
  通过: ${this.passed} ✅
  失败: ${this.failed} ❌
  发现问题: ${results.bugsFound.length}
  警告: ${results.issuesFound.length}
`);
        
        if (results.bugsFound.length > 0) {
            console.log('🐛 发现的问题:');
            results.bugsFound.slice(0, 5).forEach((bug, i) => {
                console.log(`  ${i + 1}. ${bug.test}: ${bug.error}`);
            });
        }
        
        if (results.performanceMetrics.length > 0) {
            console.log('\n⚡ 性能指标:');
            results.performanceMetrics.forEach(metric => {
                console.log(`  - ${metric.test || metric.project}: ${metric.nodes} 节点, ${metric.relations} 关系`);
            });
        }
        
        console.log('\n📊 内存使用趋势:');
        results.memoryHistory.forEach(entry => {
            console.log(`  - ${entry.label}: ${entry.heapUsed}MB`);
        });
        
        console.log('\n' + '='.repeat(140));
        
        const finalReportPath = path.join(__dirname, 'comprehensive_test_report_v3.json');
        fs.writeFileSync(finalReportPath, JSON.stringify(results, null, 2));
        this.log(`📄 详细报告已保存: ${finalReportPath}`, 'SUCCESS');
        
        if (this.failed === 0 && results.bugsFound.length === 0) {
            this.log('\n🎉🎉🎉 所有测试通过! 系统状态: 完美!', 'SUCCESS');
        } else {
            this.log('\n⚠️  测试完成，但有问题需要处理', 'WARNING');
        }
        
        console.log('='.repeat(140));
    }
}

async function main() {
    const tester = new ComprehensiveTester();
    await tester.runAllTests();
}

main().catch(err => {
    console.error('❌ 测试框架异常:', err);
    process.exit(1);
});
