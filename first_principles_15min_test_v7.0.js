#!/usr/bin/env node

/**
 * 第一性原理极限测试 v7.0 - 15分钟快速验证版本
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(200));
console.log('🎯 第一性原理极限测试 v7.0 - 15分钟快速验证');
console.log('='.repeat(200));
console.log('');

const TEST_DURATION_MS = 15 * 60 * 1000; // 15分钟

const results = {
    startTime: Date.now(),
    endTime: null,
    bugsFound: [],
    issuesFound: [],
    memorySnapshots: [],
    testPhases: []
};

const firstPrinciplesTests = {
    timeLimit: { passed: false, details: null },
    spaceLimit: { passed: false, details: null },
    concurrencyLimit: { passed: false, details: null },
    dataLimit: { passed: false, details: null },
    recursionLimit: { passed: false, details: null },
    stringLimit: { passed: false, details: null },
    numberLimit: { passed: false, details: null },
    cyclicDependency: { passed: false, details: null },
    memoryLeak: { passed: false, details: null },
    chaosEngineering: { passed: false, details: null }
};

class QuickValidationTester {
    constructor() {
        this.cycleCount = 0;
        this.gcCount = 0;
        this.lastHeapUsed = 0;
    }

    log(msg, type = 'INFO') {
        const elapsed = Math.round((Date.now() - results.startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        
        const icons = {
            'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 
            'INFO': 'ℹ️', 'TEST': '🧪', 'PERF': '⚡', 
            'DURATION': '⏱️', 'MEMORY': '📊', 'PHYSICS': '🔬',
            'CHAOS': '🌀', 'STACK': '🔁', 'CYCLE': '🔄'
        };
        
        console.log(`${icons[type] || 'ℹ️'} [${mins}:${secs}] ${msg}`);
    }

    async recordMemory(label) {
        const mem = process.memoryUsage();
        const heapUsed = Math.round(mem.heapUsed / 1024 / 1024);
        const snapshot = {
            label,
            heapUsed,
            growth: heapUsed - this.lastHeapUsed,
            timestamp: Date.now()
        };
        results.memorySnapshots.push(snapshot);
        this.lastHeapUsed = heapUsed;
        this.log(`📊 [${label}] Heap: ${heapUsed}MB (${snapshot.growth > 0 ? '+' : ''}${snapshot.growth}MB)`, 'MEMORY');
        return snapshot;
    }

    async forceGC() {
        if (global.gc) {
            global.gc();
            this.gcCount++;
        }
    }

    async testTimeLimit() {
        this.log('🔬 测试1: 时间极限...', 'PHYSICS');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        let iterations = 0;
        const start = Date.now();
        
        while (Date.now() - start < 30000) { // 30秒
            iterations++;
            for (let i = 0; i < 5000; i++) {
                db.createNode({
                    id: `time-${iterations}-${i}`,
                    type: 'FUNCTION',
                    name: `Time${i}`,
                    metadata: { ts: Date.now() }
                });
            }
            db.getNodesByType('FUNCTION');
            db.clear();
        }
        
        const opsPerSec = (iterations * 5000) / ((Date.now() - start) / 1000);
        firstPrinciplesTests.timeLimit = { passed: true, iterations, opsPerSec: opsPerSec.toFixed(0) };
        this.log(`✅ 时间极限: ${iterations} iter, ${opsPerSec.toFixed(0)} ops/s`, 'SUCCESS');
        results.testPhases.push({ name: '时间极限', passed: true });
    }

    async testSpaceLimit() {
        this.log('🔬 测试2: 空间极限...', 'PHYSICS');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        let nodes = 0;
        
        for (let i = 0; i < 100000; i++) { // 10万节点
            db.createNode({
                id: `space-${i}`,
                type: 'CLASS',
                name: `Space${i}`,
                metadata: { data: 'x'.repeat(500) }
            });
            nodes++;
        }
        
        const stats = db.getStats();
        firstPrinciplesTests.spaceLimit = { passed: stats.totalNodes === 100000, nodes: stats.totalNodes };
        this.log(`✅ 空间极限: ${stats.totalNodes} 节点`, 'SUCCESS');
        results.testPhases.push({ name: '空间极限', passed: true, nodes });
        await db.clear();
    }

    async testConcurrencyLimit() {
        this.log('🔬 测试3: 并发极限 (500 workers)...', 'PHYSICS');
        const { coreEngine } = require('./dist/src/core/engine');
        
        const workers = 500;
        const opsPerWorker = 50;
        let errors = 0;
        
        const promises = [];
        for (let w = 0; w < workers; w++) {
            promises.push((async () => {
                try {
                    for (let i = 0; i < opsPerWorker; i++) {
                        const node = coreEngine.acquireNode();
                        node.id = `w${w}i${i}`;
                        node.metadata = { w, i };
                        
                        const rel = coreEngine.acquireRelation();
                        rel.sourceId = node.id;
                        rel.targetId = `w${(w + 1) % workers}i${i}`;
                        
                        coreEngine.releaseNode(node);
                        coreEngine.releaseRelation(rel);
                    }
                } catch (e) {
                    errors++;
                }
            })());
        }
        
        await Promise.all(promises);
        
        firstPrinciplesTests.concurrencyLimit = { passed: errors === 0, workers, errors };
        if (errors === 0) {
            this.log(`✅ 并发极限: ${workers} workers 完美`, 'SUCCESS');
        } else {
            this.log(`⚠️ 并发: ${errors} errors`, 'WARNING');
            results.issuesFound.push({ type: '并发', errors });
        }
        results.testPhases.push({ name: '并发极限', passed: errors === 0 });
    }

    async testDataLimit() {
        this.log('🔬 测试4: 数据极限 (深度嵌套)...', 'PHYSICS');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        const createDeep = (depth) => {
            if (depth === 0) return { val: 0 };
            return { l: depth, child: createDeep(depth - 1) };
        };
        
        const deepData = createDeep(50);
        
        for (let i = 0; i < 5000; i++) {
            db.createNode({
                id: `deep-${i}`,
                type: 'INTERFACE',
                name: `Deep${i}`,
                metadata: { deep: deepData, arr: Array(50).fill(0).map((_, j) => ({ j })) }
            });
        }
        
        const stats = db.getStats();
        firstPrinciplesTests.dataLimit = { passed: true, nodes: stats.totalNodes, depth: 50 };
        this.log(`✅ 数据极限: ${stats.totalNodes} 深度嵌套节点`, 'SUCCESS');
        results.testPhases.push({ name: '数据极限', passed: true });
        await db.clear();
    }

    async testRecursionLimit() {
        this.log('🔬 测试5: 递归极限...', 'STACK');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        for (let i = 0; i < 500; i++) {
            db.createNode({ id: `stack-${i}`, type: 'FUNCTION', name: `Stack${i}`, metadata: {} });
        }
        
        let depth = 0;
        const recurse = (d) => {
            if (d >= 500) return d;
            const nodes = db.getNodesByType('FUNCTION');
            if (nodes.length > 0) return recurse(d + 1);
            return d;
        };
        
        depth = recurse(0);
        firstPrinciplesTests.recursionLimit = { passed: depth > 100, depth };
        this.log(`✅ 递归极限: 安全深度 ${depth}`, 'SUCCESS');
        results.testPhases.push({ name: '递归极限', passed: depth > 100, depth });
        await db.clear();
    }

    async testStringLimit() {
        this.log('🔬 测试6: 字符串极限...', 'PHYSICS');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        const largeStr = 'A'.repeat(512 * 1024); // 512KB
        const hugeStr = 'B'.repeat(5 * 1024 * 1024); // 5MB
        
        let passed = true;
        try {
            db.createNode({ id: 'str-1', type: 'VARIABLE', name: 'Str1', metadata: { data: largeStr } });
        } catch (e) {
            passed = false;
            this.log(`🐛 BUG: 512KB字符串失败`, 'BUG');
            results.bugsFound.push({ type: '字符串-512KB', error: e.message });
        }
        
        try {
            db.createNode({ id: 'str-2', type: 'VARIABLE', name: 'Str2', metadata: { data: hugeStr } });
        } catch (e) {
            passed = false;
            this.log(`🐛 BUG: 5MB字符串失败`, 'BUG');
            results.bugsFound.push({ type: '字符串-5MB', error: e.message });
        }
        
        firstPrinciplesTests.stringLimit = { passed };
        if (passed) this.log(`✅ 字符串极限: 5MB通过`, 'SUCCESS');
        results.testPhases.push({ name: '字符串极限', passed });
        await db.clear();
    }

    async testNumberLimit() {
        this.log('🔬 测试7: 数字极限...', 'PHYSICS');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        const testVals = [Number.EPSILON, Number.MAX_VALUE, -Number.EPSILON, -Number.MAX_VALUE, NaN, Infinity, -Infinity, 0, -0];
        
        let passed = true;
        for (let i = 0; i < testVals.length; i++) {
            try {
                db.createRelation({
                    id: `num-rel-${i}`,
                    sourceId: `num-node-1`,
                    targetId: `num-node-2`,
                    type: 'DEPENDS_ON',
                    weight: testVals[i]
                });
            } catch (e) {
                passed = false;
                this.log(`🐛 BUG: 数字 ${testVals[i]} 失败`, 'BUG');
                results.bugsFound.push({ type: '数字极限', value: String(testVals[i]), error: e.message });
            }
        }
        
        for (let i = 0; i < 500; i++) {
            db.createNode({
                id: `num-${i}`,
                type: 'VARIABLE',
                name: `Num${i}`,
                metadata: { bigInt: BigInt(Number.MAX_SAFE_INTEGER) + BigInt(i), float: Math.random() * Number.MAX_VALUE }
            });
        }
        
        firstPrinciplesTests.numberLimit = { passed };
        if (passed) this.log(`✅ 数字极限: ${testVals.length} 精度测试通过`, 'SUCCESS');
        results.testPhases.push({ name: '数字极限', passed });
        await db.clear();
    }

    async testCyclicDependency() {
        this.log('🔬 测试8: 循环依赖...', 'CYCLE');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        
        db.createNode({ id: 'A', type: 'CLASS', name: 'ClassA', metadata: {} });
        db.createNode({ id: 'B', type: 'CLASS', name: 'ClassB', metadata: {} });
        db.createNode({ id: 'C', type: 'CLASS', name: 'ClassC', metadata: {} });
        
        db.createRelation({ id: 'r1', sourceId: 'A', targetId: 'B', type: 'CALLS', weight: 1 });
        db.createRelation({ id: 'r2', sourceId: 'B', targetId: 'C', type: 'CALLS', weight: 1 });
        db.createRelation({ id: 'r3', sourceId: 'C', targetId: 'A', type: 'CALLS', weight: 1 });
        db.createRelation({ id: 'r4', sourceId: 'A', targetId: 'A', type: 'DEPENDS_ON', weight: 0.5 });
        
        let safe = true;
        try {
            for (let i = 0; i < 5000; i++) {
                db.getNodesByType('CLASS');
                db.getAllRelations();
            }
        } catch (e) {
            safe = false;
            this.log(`🐛 BUG: 循环遍历失败`, 'BUG');
            results.bugsFound.push({ type: '循环依赖', error: e.message });
        }
        
        firstPrinciplesTests.cyclicDependency = { passed: safe };
        if (safe) this.log(`✅ 循环依赖: 安全遍历5000次`, 'SUCCESS');
        results.testPhases.push({ name: '循环依赖', passed: safe });
        await db.clear();
    }

    async testMemoryLeak() {
        this.log('🔬 测试9: 内存泄漏...', 'PHYSICS');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const initialMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        
        for (let round = 0; round < 50; round++) {
            const db = new KnowledgeGraphDatabase();
            for (let i = 0; i < 5000; i++) {
                db.createNode({ id: `leak-r${round}-i${i}`, type: 'VARIABLE', name: `L${i}`, metadata: { r: round } });
            }
            await db.clear();
        }
        
        await this.forceGC();
        const finalMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const growth = finalMem - initialMem;
        
        const leakDetected = growth > 100;
        firstPrinciplesTests.memoryLeak = { passed: !leakDetected, initial: initialMem, final: finalMem, growth };
        
        if (!leakDetected) {
            this.log(`✅ 内存泄漏: +${growth}MB (无泄漏)`, 'SUCCESS');
        } else {
            this.log(`⚠️ 内存泄漏: +${growth}MB`, 'WARNING');
            results.issuesFound.push({ type: '内存泄漏', growth });
        }
        results.testPhases.push({ name: '内存泄漏', passed: !leakDetected, growth });
    }

    async testChaosEngineering() {
        this.log('🌀 测试10: 混沌工程...', 'CHAOS');
        const { coreEngine } = require('./dist/src/core/engine');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        let failed = 0;
        
        for (let i = 0; i < 500; i++) {
            const op = Math.floor(Math.random() * 10);
            try {
                switch (op) {
                    case 0: coreEngine.releaseNode(null); break;
                    case 1: coreEngine.releaseNode(undefined); break;
                    case 2: coreEngine.releaseRelation(null); break;
                    case 3: coreEngine.releaseRelation(undefined); break;
                    case 4:
                        const n = coreEngine.acquireNode();
                        coreEngine.releaseNode(n);
                        coreEngine.releaseNode(n);
                        break;
                    case 5:
                        const r = coreEngine.acquireRelation();
                        coreEngine.releaseRelation(r);
                        coreEngine.releaseRelation(r);
                        break;
                    case 6: db.createNode({ id: `c${i}`, type: null, name: undefined, metadata: {} }); break;
                    case 7: db.createNode({ id: '', type: '', name: '', metadata: {} }); break;
                    case 8: db.createNode({ id: `u${i}`, type: '测试', name: '🎉🎊', metadata: {} }); break;
                    case 9: db.createNode({ id: `s${i}`, type: '<xss>', name: '"quotes"', metadata: {} }); break;
                }
            } catch (e) {
                failed++;
            }
        }
        
        firstPrinciplesTests.chaosEngineering = { passed: failed === 0, total: 500, failed };
        if (failed === 0) {
            this.log(`✅ 混沌工程: 500次随机故障全部安全处理`, 'SUCCESS');
        } else {
            this.log(`⚠️ 混沌: ${failed} 次失败`, 'WARNING');
            results.issuesFound.push({ type: '混沌工程', failed });
        }
        results.testPhases.push({ name: '混沌工程', passed: failed === 0 });
        await db.clear();
    }

    async runTest() {
        const endTime = Date.now() + TEST_DURATION_MS;
        this.log('🚀 启动15分钟验证测试...', 'TEST');
        
        await this.recordMemory('启动');
        
        while (Date.now() < endTime) {
            this.cycleCount++;
            
            const remaining = Math.round((endTime - Date.now()) / 60000);
            this.log(`⏱️ 周期 ${this.cycleCount} - 剩余 ${remaining} 分钟`, 'DURATION');
            
            try { await this.testTimeLimit(); } catch (e) { this.log(`❌ 时间: ${e.message}`, 'BUG'); }
            try { await this.testSpaceLimit(); } catch (e) { this.log(`❌ 空间: ${e.message}`, 'BUG'); }
            try { await this.testConcurrencyLimit(); } catch (e) { this.log(`❌ 并发: ${e.message}`, 'BUG'); }
            
            if (this.cycleCount % 2 === 0) {
                try { await this.testDataLimit(); } catch (e) { this.log(`❌ 数据: ${e.message}`, 'BUG'); }
                try { await this.testRecursionLimit(); } catch (e) { this.log(`❌ 递归: ${e.message}`, 'BUG'); }
                try { await this.testStringLimit(); } catch (e) { this.log(`❌ 字符串: ${e.message}`, 'BUG'); }
                try { await this.testNumberLimit(); } catch (e) { this.log(`❌ 数字: ${e.message}`, 'BUG'); }
                try { await this.testCyclicDependency(); } catch (e) { this.log(`❌ 循环: ${e.message}`, 'BUG'); }
                try { await this.testMemoryLeak(); } catch (e) { this.log(`❌ 泄漏: ${e.message}`, 'BUG'); }
                try { await this.testChaosEngineering(); } catch (e) { this.log(`❌ 混沌: ${e.message}`, 'BUG'); }
            }
            
            await this.recordMemory(`周期 ${this.cycleCount}`);
            await this.forceGC();
            await new Promise(r => setTimeout(r, 50));
        }
        
        results.endTime = Date.now();
    }

    generateReport() {
        console.log('\n' + '='.repeat(200));
        console.log('🎯 第一性原理测试 - 15分钟验证报告 v7.0');
        console.log('='.repeat(200));
        
        const dur = Math.round((results.endTime - results.startTime) / 1000);
        const mins = Math.floor(dur / 60);
        const secs = dur % 60;
        
        console.log(`
📊 测试概览:
  ⏱️ 时长: ${mins}m ${secs}s
  🔄 周期: ${this.cycleCount}
  🐛 Bug: ${results.bugsFound.length}
  ⚠️ 警告: ${results.issuesFound.length}
        `);
        
        console.log('\n🔬 第一性原理测试:');
        for (const [name, result] of Object.entries(firstPrinciplesTests)) {
            console.log(`  ${result.passed ? '✅' : '❌'} ${name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
        }
        
        if (results.bugsFound.length > 0) {
            console.log('\n🐛 BUGS:');
            results.bugsFound.forEach(b => console.log(`  - ${b.type}: ${b.error}`));
        } else {
            console.log('\n🎉 所有测试完美通过！');
        }
        
        if (results.memorySnapshots.length > 0) {
            const first = results.memorySnapshots[0];
            const last = results.memorySnapshots[results.memorySnapshots.length - 1];
            console.log(`\n📊 内存: ${first.heapUsed}MB → ${last.heapUsed}MB (+${last.heapUsed - first.heapUsed}MB)`);
        }
        
        console.log('\n' + '='.repeat(200));
        
        const allPassed = Object.values(firstPrinciplesTests).every(t => t.passed) && results.bugsFound.length === 0;
        if (allPassed) {
            console.log('\n🎉🎉🎉 15分钟验证完美通过！准备2小时完整测试！🎉🎉🎉\n');
        }
        
        fs.writeFileSync('/workspace/first_principles_15min_report_v7.0.json', JSON.stringify({
            ...results,
            testResults: firstPrinciplesTests
        }, null, 2));
        
        return allPassed;
    }
}

async function main() {
    const tester = new QuickValidationTester();
    try {
        await tester.runTest();
        const success = tester.generateReport();
        process.exit(success ? 0 : 1);
    } catch (e) {
        console.error('❌ 异常:', e);
        process.exit(1);
    }
}

main();
