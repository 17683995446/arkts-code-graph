#!/usr/bin/env node

/**
 * 真实项目解析测试
 */

const { ProjectAnalysisApplicationService } = require('./dist/src/application/analysis/project.analysis.app.service');
const { KnowledgeGraphDatabase } = require('./dist/src/graph/core/knowledge/knowledge.graph.database');

console.log('='.repeat(100));
console.log('🧪 真实项目解析测试');
console.log('='.repeat(100));

async function test() {
    const db = new KnowledgeGraphDatabase();
    const service = new ProjectAnalysisApplicationService(db);
    
    console.log('\n📦 分析 ./src 项目...');
    
    try {
        const result = await service.analyzeProject('./src');
        console.log('✅ 分析完成!');
        console.log('');
        console.log('📊 结果:');
        console.log(`   📂 项目目录: ${result.projectPath}`);
        console.log(`   📄 解析文件: ${result.summary.filesAnalyzed}`);
        console.log(`   📦 节点: ${result.summary.totalNodes}`);
        console.log(`   🔗 关系: ${result.summary.totalRelations}`);
        console.log(`   ⏱️ 耗时: ${result.summary.analysisTimeMs}ms`);
    } catch (e) {
        console.error('❌ 失败:', e.message);
        console.error(e.stack);
    }
    
    console.log('');
    console.log('='.repeat(100));
    
    await db.clear();
}

test();
