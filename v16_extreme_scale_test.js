#!/usr/bin/env node

/**
 * 🎯🎯🎯 ArkTS Code Graph - 第16.0代 超大规模与高级图算法测试
 * 
 * 测试特点：
 * 1. 超大规模：10万节点 + 5万关系
 * 2. 高级图算法：路径查找、循环检测
 * 3. 内存稳定性测试
 * 4. 每步详细日志
 * 5. 发现更多潜在问题
 */

console.log('='.repeat(200));
console.log('🎯🎯🎯 ArkTS Code Graph - 第16.0代 超大规模与高级图算法测试');
console.log('🎯🎯🎯 发现更多潜在问题！');
console.log('='.repeat(200));
console.log('');

const fs = require('fs');
const path = require('path');

const results = {
    iteration: '16.0',
    startTime: Date.now(),
    endTime: null,
    bugsFound: [],
    warningsFound: [],
    metrics: {},
    memoryHistory: [],
    futurePlans: []
};

class DetailedLoggedDatabase {
    constructor() {
        const KnowledgeGraphDatabase = require('./dist/src/graph/core/knowledge/knowledge.graph.database').KnowledgeGraphDatabase;
        this.db = new KnowledgeGraphDatabase();
        this.logCounter = 0;
    }

    log(msg, type = 'INFO') {
        this.logCounter++;
        const prefix = type === 'ERROR' ? '❌' : type === 'WARNING' ? '⚠️' : '✅';
        console.log(`   💻 [LOG#${this.logCounter}] ${prefix} ${msg}`);
    }

    async recordMemory(label) {
        const mem = process.memoryUsage();
        const entry = {
            label,
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            rss: Math.round(mem.rss / 1024 / 1024),
            timestamp: Date.now()
        };
        results.memoryHistory.push(entry);
        console.log(`   📊 [MEMORY] ${label}: Heap=${entry.heapUsed}MB, RSS=${entry.rss}MB`);
        return entry;
    }
}

class Iteration16Tester {
    constructor() {
        this.dbWrapper = new DetailedLoggedDatabase();
    }

    async test1_extreme_scale_100k_nodes() {
        console.log('\n🔧='.repeat(80));
        console.log('🎯 TEST 1: 超大规模测试 - 100,000节点 + 50,000关系');
        console.log('🔧='.repeat(80));

        const db = this.dbWrapper.db;
        const startTime = Date.now();

        console.log('   🚀 步骤1：创建100,000个节点...');
        for (let i = 0; i < 100000; i++) {
            if (i % 10000 === 0) {
                console.log(`   ⏳ 进度: ${i}/100,000`);
                await this.dbWrapper.recordMemory(`创建${i}节点`);
            }
            db.addNode({
                id: `node-${i}`,
                type: ['CLASS', 'FUNCTION', 'VARIABLE', 'INTERFACE', 'TYPE'][i % 5],
                name: `Node${i}`,
                metadata: { index: i, data: Math.random() }
            });
        }
        console.log(`   ✅ 节点创建完成，耗时: ${Date.now() - startTime}ms`);

        console.log('   🔗 步骤2：创建50,000个关系...');
        const relStartTime = Date.now();
        for (let i = 0; i < 50000; i++) {
            if (i % 5000 === 0) {
                console.log(`   ⏳ 进度: ${i}/50,000`);
            }
            db.addRelation({
                id: `rel-${i}`,
                sourceId: `node-${i}`,
                targetId: `node-${(i + Math.floor(Math.random() * 1000)) % 100000}`,
                type: ['CALLS', 'DEPENDS_ON', 'REFERENCES', 'EXTENDS'][i % 4]
            });
        }
        console.log(`   ✅ 关系创建完成，耗时: ${Date.now() - relStartTime}ms`);

        const stats = db.getStats();
        console.log('   📊 最终统计:', JSON.stringify(stats, null, 2));

        const totalTime = Date.now() - startTime;
        console.log(`   ⏱️  总耗时: ${totalTime}ms`);
        console.log(`   🚀 平均节点创建: ${(totalTime / 100000).toFixed(3)}ms/节点`);

        results.metrics.extremeScale = {
            nodes: 100000,
            relations: 50000,
            duration: totalTime,
            stats
        };

        if (stats.totalNodes !== 100000) {
            console.log('   🚨 节点数量不匹配！');
            results.bugsFound.push({
                id: 'BUG-SCALE-001',
                severity: 'CRITICAL',
                description: '超大规模节点创建不完整',
                expected: 100000,
                actual: stats.totalNodes
            });
        }

        if (stats.totalRelations !== 50000) {
            console.log('   🚨 关系数量不匹配！');
            results.bugsFound.push({
                id: 'BUG-SCALE-002',
                severity: 'CRITICAL',
                description: '超大规模关系创建不完整',
                expected: 50000,
                actual: stats.totalRelations
            });
        }

        await this.dbWrapper.recordMemory('TEST1完成');
    }

    async test2_path_finding_algorithm() {
        console.log('\n🔧='.repeat(80));
        console.log('🎯 TEST 2: 高级图算法 - 路径查找测试');
        console.log('🔧='.repeat(80));

        const db = this.dbWrapper.db;

        console.log('   🏗️  创建测试图结构...');
        for (let i = 0; i < 20; i++) {
            db.addNode({ id: `path-node-${i}`, type: 'CLASS', name: `PathNode${i}` });
        }

        const pathEdges = [
            ['path-node-0', 'path-node-1'],
            ['path-node-1', 'path-node-2'],
            ['path-node-2', 'path-node-3'],
            ['path-node-3', 'path-node-4'],
            ['path-node-1', 'path-node-5'],
            ['path-node-5', 'path-node-6'],
            ['path-node-6', 'path-node-4'],
            ['path-node-0', 'path-node-7'],
            ['path-node-7', 'path-node-8'],
            ['path-node-8', 'path-node-9'],
        ];

        pathEdges.forEach(([src, tgt], i) => {
            db.addRelation({ id: `path-rel-${i}`, sourceId: src, targetId: tgt, type: 'CALLS' });
        });

        console.log('   🔍 测试路径查找: node-0 -> node-4');
        const path = db.findPath('path-node-0', 'path-node-4', 10);
        console.log(`   ✅ 找到路径: ${JSON.stringify(path)}`);

        console.log('   🔍 测试不存在路径: node-4 -> node-0');
        const noPath = db.findPath('path-node-4', 'path-node-0', 10);
        console.log(`   ✅ 不存在路径返回: ${JSON.stringify(noPath)}`);

        console.log('   🔍 测试最大深度限制: depth=2');
        const limitedPath = db.findPath('path-node-0', 'path-node-4', 2);
        console.log(`   ✅ 深度限制路径: ${JSON.stringify(limitedPath)}`);

        results.metrics.pathFinding = {
            foundPath: path,
            notFoundPath: noPath,
            limitedDepthPath: limitedPath
        };

        await this.dbWrapper.recordMemory('TEST2完成');
    }

    async test3_cycle_detection_algorithm() {
        console.log('\n🔧='.repeat(80));
        console.log('🎯 TEST 3: 高级图算法 - 循环依赖检测');
        console.log('🔧='.repeat(80));

        const db = this.dbWrapper.db;

        console.log('   🏗️  创建包含循环的图...');
        const cycleNodes = ['A', 'B', 'C', 'D', 'E'];
        cycleNodes.forEach(id => {
            db.addNode({ id: `cycle-${id}`, type: 'CLASS', name: `Class${id}` });
        });

        const cycleRels = [
            ['cycle-A', 'cycle-B'],
            ['cycle-B', 'cycle-C'],
            ['cycle-C', 'cycle-D'],
            ['cycle-D', 'cycle-E'],
            ['cycle-E', 'cycle-B'],
        ];

        cycleRels.forEach(([src, tgt], i) => {
            db.addRelation({ id: `cycle-rel-${i}`, sourceId: src, targetId: tgt, type: 'CALLS' });
        });

        console.log('   🔍 执行循环检测...');
        const cycles = db.findCycleDependencies();
        console.log(`   ✅ 检测到循环: ${cycles.length} 个`);
        if (cycles.length > 0) {
            console.log('   📊 循环详情:', JSON.stringify(cycles, null, 2));
        }

        results.metrics.cycleDetection = {
            cyclesFound: cycles.length,
            cycles: cycles
        };

        if (cycles.length === 0) {
            console.log('   🚨 警告：应该检测到循环但未检测到！');
            results.warningsFound.push({
                test: 'cycle_detection',
                message: 'findCycleDependencies 可能未正确检测循环'
            });
        }

        await this.dbWrapper.recordMemory('TEST3完成');
    }

    async test4_query_performance() {
        console.log('\n🔧='.repeat(80));
        console.log('🎯 TEST 4: 查询性能测试');
        console.log('🔧='.repeat(80));

        const db = this.dbWrapper.db;

        console.log('   🔍 测试节点查询性能 (1000次随机查询)...');
        const queryStart = Date.now();
        for (let i = 0; i < 1000; i++) {
            const idx = Math.floor(Math.random() * 100000);
            db.getNode(`node-${idx}`);
        }
        const queryDuration = Date.now() - queryStart;
        console.log(`   ✅ 查询1000次，耗时: ${queryDuration}ms`);
        console.log(`   🚀 平均查询速度: ${(queryDuration / 1000).toFixed(3)}ms/次`);

        console.log('   🔍 测试关系查询性能 (1000次出站关系查询)...');
        const relQueryStart = Date.now();
        for (let i = 0; i < 1000; i++) {
            const idx = Math.floor(Math.random() * 100000);
            db.getOutRelations(`node-${idx}`);
        }
        const relQueryDuration = Date.now() - relQueryStart;
        console.log(`   ✅ 关系查询1000次，耗时: ${relQueryDuration}ms`);
        console.log(`   🚀 平均关系查询速度: ${(relQueryDuration / 1000).toFixed(3)}ms/次`);

        console.log('   🔍 测试搜索性能...');
        const searchStart = Date.now();
        for (let i = 0; i < 100; i++) {
            db.searchNodes('Node');
        }
        const searchDuration = Date.now() - searchStart;
        console.log(`   ✅ 搜索100次，耗时: ${searchDuration}ms`);
        console.log(`   🚀 平均搜索速度: ${(searchDuration / 100).toFixed(3)}ms/次`);

        results.metrics.queryPerformance = {
            nodeQuery: { count: 1000, duration: queryDuration, perQuery: queryDuration / 1000 },
            relationQuery: { count: 1000, duration: relQueryDuration, perQuery: relQueryDuration / 1000 },
            search: { count: 100, duration: searchDuration, perSearch: searchDuration / 100 }
        };

        await this.dbWrapper.recordMemory('TEST4完成');
    }

    async test5_edge_cases_extreme() {
        console.log('\n🔧='.repeat(80));
        console.log('🎯 TEST 5: 极端边界条件测试');
        console.log('🔧='.repeat(80));

        const db = this.dbWrapper.db;

        console.log('   🧪 测试1: 查询不存在的节点');
        const notExist = db.getNode('non-existent-node-12345');
        console.log(`   ✅ 返回: ${notExist}`);

        console.log('   🧪 测试2: 删除不存在的节点');
        const deleteNotExist = db.deleteNode('non-existent-node-12345');
        console.log(`   ✅ 返回: ${deleteNotExist}`);

        console.log('   🧪 测试3: 超长ID (10,000字符)');
        const veryLongId = 'x'.repeat(10000);
        db.addNode({ id: veryLongId, type: 'CLASS', name: 'VeryLongId' });
        const retrieved = db.getNode(veryLongId);
        console.log(`   ✅ ${retrieved ? '成功存储和检索' : '失败'}`);

        console.log('   🧪 测试4: 特殊字符ID');
        const specialId = 'node-!@#$%^&*()_+-=[]{}|;:,.<>?/`~';
        db.addNode({ id: specialId, type: 'CLASS', name: 'SpecialChars' });
        const specialRetrieved = db.getNode(specialId);
        console.log(`   ✅ ${specialRetrieved ? '成功处理特殊字符' : '失败'}`);

        console.log('   🧪 测试5: 空字符串ID');
        db.addNode({ id: '', type: 'CLASS', name: 'EmptyId' });
        const emptyIdNode = db.getNode('');
        console.log(`   ✅ ${emptyIdNode ? '接受空字符串ID' : '拒绝空字符串ID'}`);

        console.log('   🧪 测试6: null/undefined 值');
        try {
            db.addNode(null);
            console.log('   ⚠️ addNode(null) 未抛出异常');
        } catch (e) {
            console.log('   ✅ addNode(null) 正确抛出异常');
        }

        console.log('   🧪 测试7: 循环引用路径查找');
        db.addNode({ id: 'loop-A', type: 'CLASS', name: 'LoopA' });
        db.addNode({ id: 'loop-B', type: 'CLASS', name: 'LoopB' });
        db.addRelation({ id: 'loop-rel-1', sourceId: 'loop-A', targetId: 'loop-B', type: 'CALLS' });
        db.addRelation({ id: 'loop-rel-2', sourceId: 'loop-B', targetId: 'loop-A', type: 'CALLS' });
        const loopPath = db.findPath('loop-A', 'loop-A', 10);
        console.log(`   ✅ 自循环路径查找: ${JSON.stringify(loopPath)}`);

        results.metrics.edgeCases = {
            nullHandling: 'tested',
            emptyIdHandling: emptyIdNode ? 'accepted' : 'rejected',
            specialChars: specialRetrieved ? 'supported' : 'unsupported',
            veryLongId: retrieved ? 'supported' : 'unsupported',
            loopPathFinding: loopPath
        };

        await this.dbWrapper.recordMemory('TEST5完成');
    }

    async test6_memory_stability() {
        console.log('\n🔧='.repeat(80));
        console.log('🎯 TEST 6: 内存稳定性测试');
        console.log('🔧='.repeat(80));

        console.log('   🔄 执行20轮创建-清理循环...');
        const startMem = await this.dbWrapper.recordMemory('测试开始');

        for (let round = 1; round <= 20; round++) {
            const db = this.dbWrapper.db;
            for (let i = 0; i < 1000; i++) {
                db.addNode({ id: `mem-test-${round}-${i}`, type: 'CLASS', name: `MemTest${i}` });
            }
            db.clear();

            if (round % 5 === 0) {
                await this.dbWrapper.recordMemory(`第${round}轮后`);
            }
        }

        const endMem = await this.dbWrapper.recordMemory('测试结束');
        const memGrowth = endMem.heapUsed - startMem.heapUsed;
        console.log(`   📊 内存增长: ${memGrowth}MB`);

        if (memGrowth > 50) {
            console.log('   🚨 警告：内存增长过大，可能存在内存泄漏！');
            results.warningsFound.push({
                test: 'memory_stability',
                message: `内存增长${memGrowth}MB，超过预期`
            });
        }

        results.metrics.memoryStability = {
            startMem,
            endMem,
            growth: memGrowth
        };
    }

    generateFuturePlans() {
        results.futurePlans = [
            {
                phase: 17,
                name: '真实项目解析与边界测试',
                description: '对真实的TypeScript/ArkTS项目进行完整解析，测试边界情况处理'
            },
            {
                phase: 18,
                name: '异常容错与性能优化',
                description: '完善异常处理机制，优化查询和搜索性能'
            },
            {
                phase: 19,
                name: '持久化与完整业务场景',
                description: '实现数据持久化功能，完善业务场景覆盖'
            },
            {
                phase: 20,
                name: '最终稳定性与72小时测试',
                description: '72小时持续运行测试，确保生产环境稳定性'
            },
            {
                phase: 21,
                name: '高级功能与集成测试',
                description: '插件系统、性能监控、完整集成测试'
            }
        ];

        console.log('\n🚀 未来5阶段迭代计划已生成！');
        console.log('   📋 阶段17: 真实项目解析');
        console.log('   📋 阶段18: 异常容错优化');
        console.log('   📋 阶段19: 持久化业务场景');
        console.log('   📋 阶段20: 72小时稳定性测试');
        console.log('   📋 阶段21: 高级功能集成');
    }

    async runAllTests() {
        console.log('\n🚀🚀🚀 开始第16.0代全面测试...\n');

        await this.dbWrapper.recordMemory('测试开始');

        await this.test1_extreme_scale_100k_nodes();
        await this.test2_path_finding_algorithm();
        await this.test3_cycle_detection_algorithm();
        await this.test4_query_performance();
        await this.test5_edge_cases_extreme();
        await this.test6_memory_stability();

        this.generateFuturePlans();

        results.endTime = Date.now();
        const totalDuration = (results.endTime - results.startTime) / 1000;

        console.log('\n' + '='.repeat(100));
        console.log('🎉🎉🎉 第16.0代超大规模测试完成！');
        console.log('='.repeat(100));
        console.log(`⏱️  总耗时: ${totalDuration.toFixed(1)}秒`);
        console.log(`🐛 发现Bug: ${results.bugsFound.length} 个`);
        console.log(`⚠️  警告: ${results.warningsFound.length} 个`);
        console.log('='.repeat(100));

        if (results.bugsFound.length > 0) {
            console.log('\n🐛🐛🐛 发现的Bug列表:');
            results.bugsFound.forEach((bug, i) => {
                console.log(`   ${i + 1}. [${bug.severity}] ${bug.id}: ${bug.description}`);
            });
        }

        if (results.warningsFound.length > 0) {
            console.log('\n⚠️⚠️⚠️ 警告列表:');
            results.warningsFound.forEach((warn, i) => {
                console.log(`   ${i + 1}. [${warn.test}] ${warn.message}`);
            });
        }

        const reportPath = path.join(__dirname, 'v16_extreme_scale_test_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        console.log(`\n📄 完整报告已保存: ${reportPath}`);

        return results;
    }
}

async function main() {
    try {
        const tester = new Iteration16Tester();
        await tester.runAllTests();
    } catch (error) {
        console.error('\n❌❌❌ 测试过程中发生错误:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
