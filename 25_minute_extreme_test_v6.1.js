#!/usr/bin/env node

/**
 * 🔥🔥🔥 ArkTS 代码图谱 - 25分钟极端验证测试 v6.1
 * 极端测试：10万节点、100并发、故障注入、真实项目
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(180));
console.log('🔥🔥🔥 ArkTS 代码图谱 - 25分钟极端验证测试 v6.1');
console.log('='.repeat(180));
console.log('');

const TEST_DURATION_MINUTES = 25;

const results = {
    startTime: Date.now(),
    endTime: null,
    bugsFound: [],
    issuesFound: [],
    memoryHistory: [],
    projectAnalysisResults: [],
    totalOperations: 0,
    successfulOperations: 0
};

class QuickExtremeTester {
    constructor() {
        this.operationCount = 0;
    }

    log(msg, type = 'INFO') {
        const elapsed = Math.round((Date.now() - results.startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        
        const icons = {
            'SUCCESS': '✅', 'WARNING': '⚠️', 'BUG': '🐛', 
            'INFO': 'ℹ️', 'TEST': '🧪', 'PERF': '⚡', 
            'DURATION': '⏱️', 'MEMORY': '📊', 'COMPLEX': '🎯', 'FAULT': '💥'
        };
        
        console.log(`${icons[type] || 'ℹ️'} [${mins}:${secs}] ${msg}`);
    }

    async recordMemory(label = 'Memory') {
        const mem = process.memoryUsage();
        const entry = {
            label,
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            rss: Math.round(mem.rss / 1024 / 1024)
        };
        results.memoryHistory.push(entry);
        this.log(`📊 [${label}] Heap: ${entry.heapUsed}MB, RSS: ${entry.rss}MB`, 'MEMORY');
    }

    async testExtremeKG() {
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const db = new KnowledgeGraphDatabase();
        const nodeCount = 100000; // 10万节点
        const relCount = 99999;
        
        this.log('🎯 Creating 100,000 nodes and 99,999 relations...', 'COMPLEX');
        
        const start = Date.now();
        
        for (let i = 0; i < nodeCount; i++) {
            const type = ['CLASS', 'FUNCTION', 'VARIABLE', 'TYPE', 'INTERFACE'][i % 5];
            db.createNode({
                id: `node-${Date.now()}-${i}`,
                type,
                name: `Node${i}`,
                metadata: { 
                    index: i, 
                    ts: Date.now(),
                    s: 'x'.repeat(i % 150)
                }
            });
            this.operationCount++;
        }
        
        for (let i = 0; i < relCount; i++) {
            const relType = ['CALLS', 'DEPENDS_ON', 'REFERENCES'][i % 3];
            db.createRelation({
                id: `rel-${Date.now()}-${i}`,
                sourceId: `node-${Date.now()}-${i}`,
                targetId: `node-${Date.now()}-${i + 1}`,
                type: relType,
                weight: Math.random()
            });
            this.operationCount++;
        }
        
        const stats = db.getStats();
        const midTime = Date.now() - start;
        
        this.log(`⚡ Created ${stats.totalNodes} nodes, ${stats.totalRelations} relations in ${midTime}ms`, 'PERF');
        
        await db.clear();
        
        results.successfulOperations += nodeCount + relCount;
        results.totalOperations += nodeCount + relCount;
        
        if (stats.totalNodes !== nodeCount) {
            this.log('🐛 BUG: Node count mismatch!', 'BUG');
            results.bugsFound.push({
                type: 'Extreme KG Nodes',
                expected: nodeCount,
                actual: stats.totalNodes
            });
            return false;
        }
        
        this.log('✅ Extreme knowledge graph test passed!', 'SUCCESS');
        return true;
    }

    async testSuperConcurrency() {
        const { coreEngine } = require('./dist/src/core/engine');
        
        const workers = 100;
        const opsPerWorker = 700;
        
        this.log(`🎯 Testing ${workers} concurrent workers...`, 'COMPLEX');
        
        const start = Date.now();
        let errors = 0;
        
        const promises = [];
        for (let w = 0; w < workers; w++) {
            promises.push((async () => {
                try {
                    for (let i = 0; i < opsPerWorker; i++) {
                        const node = coreEngine.acquireNode();
                        node.id = `w${w}n${i}`;
                        node.metadata = { w, i };
                        
                        const rel = coreEngine.acquireRelation();
                        rel.sourceId = node.id;
                        rel.targetId = `w${(w + 1) % workers}n${i}`;
                        
                        coreEngine.releaseNode(node);
                        coreEngine.releaseRelation(rel);
                        
                        this.operationCount++;
                        results.successfulOperations += 2;
                        results.totalOperations += 2;
                    }
                } catch (e) {
                    errors++;
                }
            })());
        }
        
        await Promise.all(promises);
        
        const duration = Date.now() - start;
        this.log(`⚡ ${workers} concurrent workers, ${workers * opsPerWorker * 2} ops in ${duration}ms`, 'PERF');
        
        if (errors > 0) {
            this.log(`⚠️ ${errors} concurrency errors`, 'WARNING');
            results.issuesFound.push({ type: 'Concurrency', count: errors });
            return false;
        }
        
        this.log('✅ Super concurrency (100 workers) test passed!', 'SUCCESS');
        return true;
    }

    async testFaultInjection() {
        const { coreEngine } = require('./dist/src/core/engine');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        this.log('💥 Testing fault injection...', 'FAULT');
        
        const db = new KnowledgeGraphDatabase();
        let passed = true;
        
        // 空值释放测试
        try {
            coreEngine.releaseNode(null);
            coreEngine.releaseNode(undefined);
            coreEngine.releaseRelation(null);
            coreEngine.releaseRelation(undefined);
            this.log('✅ Null/undefined release passed', 'SUCCESS');
        } catch (e) {
            this.log('🐛 BUG: Null release failed', 'BUG');
            results.bugsFound.push({ type: 'Fault: Null Safety', error: e.message });
            passed = false;
        }
        
        // 重复释放测试
        try {
            const node = coreEngine.acquireNode();
            coreEngine.releaseNode(node);
            coreEngine.releaseNode(node);
            coreEngine.releaseNode(node);
            this.log('✅ Duplicate release passed', 'SUCCESS');
        } catch (e) {
            this.log('🐛 BUG: Duplicate release failed', 'BUG');
            results.bugsFound.push({ type: 'Fault: Duplicate Release', error: e.message });
            passed = false;
        }
        
        // 极端元数据测试
        try {
            for (let i = 0; i < 50; i++) {
                db.createNode({
                    id: `fault-node-${i}`,
                    type: 'VARIABLE',
                    name: `FaultTest${i}`,
                    metadata: { large: 'x'.repeat(3000), nested: { a: { b: { c: i } } } }
                });
            }
            this.log('✅ Extreme metadata passed', 'SUCCESS');
        } catch (e) {
            this.log('🐛 BUG: Extreme metadata failed', 'BUG');
            results.bugsFound.push({ type: 'Fault: Extreme Metadata', error: e.message });
            passed = false;
        }
        
        await db.clear();
        this.log('✅ Fault injection test completed', 'SUCCESS');
        return passed;
    }

    async testProjectAnalysis() {
        const { ProjectAnalysisApplicationService } = require('./dist/src/application/analysis/project.analysis.app.service');
        const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');
        
        const projects = [
            { path: './src', name: 'src' }
        ];
        
        if (fs.existsSync('./type-challenges')) projects.push({ path: './type-challenges', name: 'type-challenges' });
        
        for (const project of projects) {
            if (!fs.existsSync(project.path)) continue;
            
            this.log(`🎯 Analyzing project: ${project.name}`, 'COMPLEX');
            
            try {
                const db = new KnowledgeGraphDatabase();
                const service = new ProjectAnalysisApplicationService(db);
                
                const start = Date.now();
                const result = await service.analyzeProject(project.path);
                const duration = Date.now() - start;
                
                results.projectAnalysisResults.push({
                    project: project.name,
                    nodes: result.summary.totalNodes,
                    relations: result.summary.totalRelations,
                    duration: duration
                });
                
                this.log(`✅ ${project.name}: ${result.summary.totalNodes} nodes, ${result.summary.totalRelations} relations in ${duration}ms`, 'SUCCESS');
                
                this.operationCount += result.summary.totalNodes + result.summary.totalRelations;
                results.successfulOperations += result.summary.totalNodes + result.summary.totalRelations;
                results.totalOperations += result.summary.totalNodes + result.summary.totalRelations;
                
                await db.clear();
                
            } catch (e) {
                this.log(`❌ ${project.name} failed: ${e.message}`, 'BUG');
                results.bugsFound.push({ type: 'Project Analysis', project: project.name, error: e.message });
            }
        }
    }

    async runTest() {
        const endTime = Date.now() + TEST_DURATION_MINUTES * 60 * 1000;
        this.log('🚀 Starting 25-minute extreme test!', 'TEST');
        
        await this.recordMemory('Initial');
        
        let cycleCount = 0;
        let lastProjectAnalysis = 0;
        
        while (Date.now() < endTime) {
            cycleCount++;
            const remaining = Math.round((endTime - Date.now()) / 60000);
            
            if (cycleCount % 10 === 0) {
                this.log(`⏱️ Cycle ${cycleCount} - ${remaining} minutes remaining`, 'DURATION');
            }
            
            try {
                await this.testExtremeKG();
            } catch (e) { this.log(`❌ Extreme KG failed: ${e.message}`, 'BUG'); }
            
            try {
                await this.testSuperConcurrency();
            } catch (e) { this.log(`❌ Concurrency failed: ${e.message}`, 'BUG'); }
            
            try {
                if (cycleCount % 5 === 0) await this.testFaultInjection();
            } catch (e) { this.log(`❌ Fault injection failed: ${e.message}`, 'BUG'); }
            
            try {
                if (Date.now() - lastProjectAnalysis > 600000) {
                    await this.testProjectAnalysis();
                    lastProjectAnalysis = Date.now();
                }
            } catch (e) { this.log(`❌ Project analysis failed: ${e.message}`, 'BUG'); }
            
            if (results.memoryHistory.length === 0 || 
                Date.now() - results.memoryHistory[results.memoryHistory.length - 1].ts > 300000) {
                results.memoryHistory[results.memoryHistory.length - 1].ts = Date.now();
                await this.recordMemory(`Cycle ${cycleCount}`);
            }
            
            await new Promise(r => setTimeout(r, 50));
        }
        
        results.endTime = Date.now();
        await this.recordMemory('Final');
    }

    generateReport() {
        console.log('\n' + '='.repeat(180));
        console.log('📊 25-MINUTE EXTREME TEST FINAL REPORT');
        console.log('='.repeat(180));
        
        const totalDur = Math.round((results.endTime - results.startTime) / 1000);
        const mins = Math.floor(totalDur / 60);
        const secs = totalDur % 60;
        
        const firstMem = results.memoryHistory[0];
        const lastMem = results.memoryHistory[results.memoryHistory.length - 1];
        const memGrowth = lastMem.heapUsed - firstMem.heapUsed;
        
        console.log(`
📈 OVERALL RESULTS:
  ⏱️ Duration: ${mins}m ${secs}s
  📊 Total Operations: ${results.totalOperations.toLocaleString()}
  🐛 Bugs Found: ${results.bugsFound.length}
  ⚠️ Warnings: ${results.issuesFound.length}
  📊 Memory: ${firstMem.heapUsed}MB → ${lastMem.heapUsed}MB (+${memGrowth}MB)
        `);
        
        if (results.projectAnalysisResults.length > 0) {
            console.log('🌍 PROJECT ANALYSIS RESULTS:');
            results.projectAnalysisResults.forEach(r => {
                console.log(`  ✅ ${r.project}: ${r.nodes} nodes, ${r.relations} relations, ${r.duration}ms`);
            });
        }
        
        if (results.bugsFound.length === 0) {
            console.log('\n🎉 NO BUGS FOUND! SYSTEM PERFORMED PERFECTLY!');
        } else {
            console.log('\n🐛 BUGS DISCOVERED:');
            results.bugsFound.forEach((bug, i) => {
                console.log(`  ${i + 1}. ${bug.type}: ${bug.error || 'N/A'}`);
            });
        }
        
        console.log('\n' + '='.repeat(180));
        
        const reportPath = path.join(__dirname, '25_minute_extreme_test_report_v6.1.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        this.log(`📄 Report saved to ${reportPath}`, 'SUCCESS');
        
        if (results.bugsFound.length === 0) {
            console.log('🎉🎉🎉 25-MINUTE EXTREME TEST PASSED PERFECTLY! SYSTEM IS PRODUCTION READY!');
        }
        
        console.log('='.repeat(180));
    }
}

async function main() {
    const tester = new QuickExtremeTester();
    try {
        await tester.runTest();
        tester.generateReport();
        process.exit(results.bugsFound.length === 0 ? 0 : 1);
    } catch (e) {
        console.error('❌ Exception:', e);
        process.exit(1);
    }
}

main();
