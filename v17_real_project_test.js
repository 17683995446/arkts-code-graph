#!/usr/bin/env node

/**
 * 🎯🎯🎯 ArkTS Code Graph - 第17.0代 真实项目解析测试
 * 
 * 测试特点：
 * 1. 解析真实TypeScript/ArkTS项目
 * 2. 复杂语法结构测试
 * 3. 边界情况处理
 * 4. 每步详细日志
 */

console.log('='.repeat(200));
console.log('🎯🎯🎯 ArkTS Code Graph - 第17.0代 真实项目解析测试');
console.log('🎯🎯🎯 测试真实项目的解析能力');
console.log('='.repeat(200));
console.log('');

const fs = require('fs');
const path = require('path');

const results = {
    iteration: '17.0',
    startTime: Date.now(),
    filesParsed: 0,
    nodesCreated: 0,
    relationsCreated: 0,
    bugsFound: [],
    warningsFound: [],
    parsedFiles: [],
    errors: []
};

class RealProjectParser {
    constructor() {
        const KnowledgeGraphDatabase = require('./dist/src/graph/core/knowledge/knowledge.graph.database').KnowledgeGraphDatabase;
        this.db = new KnowledgeGraphDatabase();
        this.logCounter = 0;
    }

    log(msg, type = 'INFO') {
        this.logCounter++;
        const prefix = type === 'ERROR' ? '❌' : type === 'WARNING' ? '⚠️' : '✅';
        console.log(`   💻 [${this.logCounter}] ${prefix} ${msg}`);
    }

    parseFile(filePath) {
        this.log(`开始解析文件: ${filePath}`);
        
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const stats = fs.statSync(filePath);
            
            const nodeId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            this.db.addNode({
                id: nodeId,
                type: 'FILE',
                name: path.basename(filePath),
                filePath: filePath,
                metadata: {
                    size: stats.size,
                    lines: content.split('\n').length
                }
            });
            
            this.nodesCreated++;
            this.parseContent(content, nodeId, filePath);
            
            this.log(`文件解析成功: ${path.basename(filePath)} (${content.split('\n').length}行)`);
            this.parsedFiles.push({
                file: filePath,
                lines: content.split('\n').length,
                size: stats.size
            });
            
            results.filesParsed++;
            results.nodesCreated = this.nodesCreated;
            
            return nodeId;
            
        } catch (error) {
            this.log(`解析文件失败: ${filePath} - ${error.message}`, 'ERROR');
            results.errors.push({
                file: filePath,
                error: error.message
            });
            return null;
        }
    }

    parseContent(content, parentId, filePath) {
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.match(/^export\s+(class|function|const|interface|type|enum)/)) {
                this.parseExport(line, i + 1, parentId, filePath);
            } else if (line.match(/^(class|function|const|interface|type|enum)\s+\w+/)) {
                this.parseDeclaration(line, i + 1, parentId, filePath);
            } else if (line.match(/@Component|@Entry|@State|@Prop|@Link/)) {
                this.parseDecorator(line, i + 1, parentId, filePath);
            }
        }
    }

    parseExport(line, lineNum, parentId, filePath) {
        const match = line.match(/export\s+(class|function|const|interface|type|enum)\s+(\w+)/);
        if (match) {
            const type = this.mapType(match[1]);
            const name = match[2];
            
            const nodeId = `${name}-${lineNum}-${Date.now()}`;
            this.db.addNode({
                id: nodeId,
                type: type,
                name: name,
                filePath: filePath,
                line: lineNum,
                metadata: { exported: true }
            });
            
            this.db.addRelation({
                id: `rel-${nodeId}`,
                sourceId: parentId,
                targetId: nodeId,
                type: 'CONTAINS'
            });
            
            this.nodesCreated++;
            this.relationsCreated++;
        }
    }

    parseDeclaration(line, lineNum, parentId, filePath) {
        const match = line.match(/(class|function|const|interface|type|enum)\s+(\w+)/);
        if (match) {
            const type = this.mapType(match[1]);
            const name = match[2];
            
            const nodeId = `${name}-${lineNum}-${Date.now()}`;
            this.db.addNode({
                id: nodeId,
                type: type,
                name: name,
                filePath: filePath,
                line: lineNum,
                metadata: { exported: false }
            });
            
            this.db.addRelation({
                id: `rel-${nodeId}`,
                sourceId: parentId,
                targetId: nodeId,
                type: 'CONTAINS'
            });
            
            this.nodesCreated++;
            this.relationsCreated++;
        }
    }

    parseDecorator(line, lineNum, parentId, filePath) {
        const match = line.match(/@(\w+)/);
        if (match) {
            const decorator = match[1];
            
            const nextLine = lineNum < 1000 ? lineNum + 1 : lineNum;
            
            const nodeId = `decorator-${decorator}-${lineNum}-${Date.now()}`;
            this.db.addNode({
                id: nodeId,
                type: 'DECORATOR',
                name: `@${decorator}`,
                filePath: filePath,
                line: lineNum,
                metadata: { decorator }
            });
            
            this.db.addRelation({
                id: `rel-${nodeId}`,
                sourceId: parentId,
                targetId: nodeId,
                type: 'ANNOTATES'
            });
            
            this.nodesCreated++;
            this.relationsCreated++;
        }
    }

    mapType(tsType) {
        const typeMap = {
            'class': 'CLASS',
            'function': 'FUNCTION',
            'const': 'VARIABLE',
            'interface': 'INTERFACE',
            'type': 'TYPE',
            'enum': 'ENUM'
        };
        return typeMap[tsType] || 'UNKNOWN';
    }

    getStats() {
        return this.db.getStats();
    }

    testQuery() {
        this.log('测试查询功能...');
        
        const allNodes = this.db.getAllNodes();
        this.log(`总节点数: ${allNodes.length}`);
        
        const classes = this.db.getNodesByType('CLASS');
        this.log(`CLASS类型节点: ${classes.length}`);
        
        const functions = this.db.getNodesByType('FUNCTION');
        this.log(`FUNCTION类型节点: ${functions.length}`);
        
        const searchResults = this.db.searchNodes('Service');
        this.log(`搜索"Service"结果: ${searchResults.length}个`);
        
        return {
            totalNodes: allNodes.length,
            classes: classes.length,
            functions: functions.length,
            searchResults: searchResults.length
        };
    }
}

async function test1_parse_realistic_project() {
    console.log('\n🔧='.repeat(80));
    console.log('🎯 TEST 1: 解析真实项目结构');
    console.log('🔧='.repeat(80));

    const parser = new RealProjectParser();
    const projectRoot = '/workspace/realistic_project';

    console.log('   📂 解析 services/ 目录...');
    const services = [
        path.join(projectRoot, 'services/UserService.ts'),
        path.join(projectRoot, 'services/ProductService.ts')
    ];

    services.forEach(file => {
        parser.parseFile(file);
    });

    console.log('   📂 解析 types/ 目录...');
    const types = [
        path.join(projectRoot, 'types/user.ts'),
        path.join(projectRoot, 'types/product.ts')
    ];

    types.forEach(file => {
        parser.parseFile(file);
    });

    console.log('   📂 解析 utils/ 目录...');
    const utils = [
        path.join(projectRoot, 'utils/helpers.ts')
    ];

    utils.forEach(file => {
        parser.parseFile(file);
    });

    const stats = parser.getStats();
    console.log('   📊 解析统计:', JSON.stringify(stats, null, 2));

    results.parsedFiles = parser.parsedFiles;
    return stats;
}

async function test2_parse_edge_cases() {
    console.log('\n🔧='.repeat(80));
    console.log('🎯 TEST 2: 解析边界情况文件');
    console.log('🔧='.repeat(80));

    const parser = new RealProjectParser();
    const projectRoot = '/workspace/realistic_project/test_edge_cases';

    const edgeFiles = [
        'empty_file.ts',
        'comments_only.ts',
        'decorators.ts',
        'enums.ts',
        'generics_complex.ts',
        'namespaces.ts',
        'special_chars.ts'
    ];

    edgeFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
            parser.parseFile(filePath);
        } else {
            console.log(`   ⚠️ 文件不存在: ${filePath}`);
        }
    });

    const stats = parser.getStats();
    console.log('   📊 边界情况解析统计:', JSON.stringify(stats, null, 2));

    return stats;
}

async function test3_parse_large_files() {
    console.log('\n🔧='.repeat(80));
    console.log('🎯 TEST 3: 解析大型文件');
    console.log('🔧='.repeat(80));

    const parser = new RealProjectParser();
    const projectRoot = '/workspace/realistic_project/large_scale';

    const largeFiles = [
        'many_classes.ts',
        'large_file.ts'
    ];

    largeFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`   📄 文件大小: ${file} - ${Math.round(stats.size / 1024)}KB`);
            parser.parseFile(filePath);
        }
    });

    const parserStats = parser.getStats();
    console.log('   📊 大型文件解析统计:', JSON.stringify(parserStats, null, 2));

    return parserStats;
}

async function test4_parse_nested_structure() {
    console.log('\n🔧='.repeat(80));
    console.log('🎯 TEST 4: 解析嵌套目录结构');
    console.log('🔧='.repeat(80));

    const parser = new RealProjectParser();
    const projectRoot = '/workspace/realistic_project';

    const nestedFiles = [
        path.join(projectRoot, 'test_edge_cases/nested/level_a.ts'),
        path.join(projectRoot, 'test_edge_cases/nested/level_b.ts'),
        path.join(projectRoot, 'test_edge_cases/circular_nested.ts')
    ];

    nestedFiles.forEach(file => {
        if (fs.existsSync(file)) {
            parser.parseFile(file);
        }
    });

    console.log('   🔍 测试查询功能...');
    const queryResults = parser.testQuery();

    const stats = parser.getStats();
    console.log('   📊 嵌套结构解析统计:', JSON.stringify(stats, null, 2));

    return { stats, queryResults };
}

async function test5_error_handling() {
    console.log('\n🔧='.repeat(80));
    console.log('🎯 TEST 5: 错误处理测试');
    console.log('🔧='.repeat(80));

    const parser = new RealProjectParser();

    console.log('   🧪 测试1: 解析不存在的文件');
    parser.parseFile('/non/existent/file.ts');

    console.log('   🧪 测试2: 解析空文件');
    const emptyFilePath = path.join('/workspace/realistic_project/test_edge_cases/empty_file.ts');
    if (fs.existsSync(emptyFilePath)) {
        parser.parseFile(emptyFilePath);
    }

    console.log('   🧪 测试3: 特殊字符文件名');
    console.log(`   ⚠️ 特殊字符文件名测试需要手动处理`);

    console.log(`   📊 错误记录: ${results.errors.length}个`);
    if (results.errors.length > 0) {
        console.log('   📋 错误详情:');
        results.errors.forEach((err, i) => {
            console.log(`      ${i + 1}. ${err.file}: ${err.error}`);
        });
    }

    return results.errors.length === 0;
}

async function runAllTests() {
    console.log('\n🚀🚀🚀 开始第17.0代真实项目解析测试...\n');

    const startTime = Date.now();

    await test1_parse_realistic_project();
    await test2_parse_edge_cases();
    await test3_parse_large_files();
    await test4_parse_nested_structure();
    const errorTestPassed = await test5_error_handling();

    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000;

    results.endTime = endTime;
    results.duration = totalDuration;
    results.errorTestPassed = errorTestPassed;

    console.log('\n' + '='.repeat(100));
    console.log('🎉🎉🎉 第17.0代真实项目解析测试完成！');
    console.log('='.repeat(100));
    console.log(`📄 解析文件数: ${results.filesParsed}`);
    console.log(`📊 创建节点数: ${results.nodesCreated}`);
    console.log(`🔗 创建关系数: ${results.relationsCreated}`);
    console.log(`⏱️  总耗时: ${totalDuration.toFixed(1)}秒`);
    console.log(`❌ 错误数: ${results.errors.length}`);
    console.log(`🐛 发现Bug: ${results.bugsFound.length}`);
    console.log(`⚠️  警告: ${results.warningsFound.length}`);
    console.log('='.repeat(100));

    if (results.errors.length > 0) {
        console.log('\n❌❌❌ 错误详情:');
        results.errors.forEach((err, i) => {
            console.log(`   ${i + 1}. ${err.file}: ${err.error}`);
        });
    }

    if (results.parsedFiles.length > 0) {
        console.log('\n📋 成功解析的文件:');
        results.parsedFiles.forEach((file, i) => {
            console.log(`   ${i + 1}. ${file.file} (${file.lines}行, ${Math.round(file.size / 1024)}KB)`);
        });
    }

    const reportPath = path.join(__dirname, 'v17_real_project_test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 完整报告已保存: ${reportPath}`);

    console.log('\n🚀 未来5阶段迭代计划:');
    console.log('   📋 阶段18: 异常容错优化');
    console.log('   📋 阶段19: 持久化业务场景');
    console.log('   📋 阶段20: 72小时稳定性测试');
    console.log('   📋 阶段21: 高级功能集成');
    console.log('   📋 阶段22: 性能极限优化');

    return results;
}

runAllTests().catch(error => {
    console.error('\n❌❌❌ 测试失败:', error);
    console.error(error.stack);
    process.exit(1);
});
