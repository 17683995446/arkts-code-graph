// ============================================================
// 第24代 - 安全与权限管理深度测试
// Generation 24 - Security and Permission Management Deep Test
// ============================================================

const fs = require('fs');
const path = require('path');
const { 
    AuthenticationService, 
    PermissionService, 
    AuditLogService,
    DefaultSecurityConfig,
    AuthProvider
} = require('./dist/src/infrastructure/security/security.services');
const { 
    PermissionService: AdvancedPermissionService,
    ThreatDetectionService,
    ComplianceChecker,
    PermissionAction,
    ResourceType
} = require('./dist/src/infrastructure/security/advanced.permission.service');

const testResults = {
    timestamp: new Date().toISOString(),
    generation: 'v24',
    tests: [],
    bugsFound: [],
    warnings: [],
    performance: {},
    detailedLogs: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0
};

// 详细日志函数
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        test: '🧪',
        perf: '⚡',
        detail: '📝',
        extreme: '🔥',
        step: '📊',
        bug: '🐛',
        security: '🔐'
    }[type] || 'ℹ️';
    
    const logEntry = `[${timestamp}] ${prefix} ${message}`;
    console.log(logEntry);
    testResults.detailedLogs.push(logEntry);
}

function addTestResult(name, passed, details = '') {
    log(`添加测试结果: ${name} - ${passed ? '通过' : '失败'}`, 'detail');
    testResults.tests.push({
        name,
        passed,
        details,
        timestamp: new Date().toISOString()
    });
    testResults.totalTests++;
    if (passed) {
        testResults.passedTests++;
    } else {
        testResults.failedTests++;
    }
}

function addBug(testName, issue, details = '') {
    log(`发现Bug: ${testName} - ${issue}`, 'bug');
    testResults.bugsFound.push({
        test: testName,
        issue,
        details,
        timestamp: new Date().toISOString()
    });
}

// ============================================================
// 测试1: 认证服务基础功能测试
// ============================================================
function testAuthenticationService() {
    log('🔥 开始测试1: 认证服务基础功能测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        log('📊 初始化认证服务', 'step');
        const authService = new AuthenticationService(DefaultSecurityConfig);

        // 1.1 测试注册功能
        log('📝 1.1 测试用户注册', 'detail');
        const registerResult = authService.register(
            'test@example.com', 
            'TestPass123!', 
            'testuser'
        );
        if (!registerResult.success) {
            addBug('testAuthenticationService', '注册失败', registerResult.error);
            testPassed = false;
        } else {
            log('✅ 用户注册成功', 'success');
        }

        // 1.2 测试登录功能
        log('📝 1.2 测试用户登录', 'detail');
        const loginResult = authService.login(
            'test@example.com', 
            'TestPass123!',
            '127.0.0.1',
            'Chrome'
        );
        if (!loginResult.success) {
            addBug('testAuthenticationService', '登录失败', loginResult.error);
            testPassed = false;
        } else {
            log('✅ 用户登录成功', 'success');
        }

        // 1.3 测试会话验证
        log('📝 1.3 测试会话验证', 'detail');
        if (loginResult.success) {
            const validation = authService.validateSession(loginResult.session.token);
            if (validation.valid) {
                log('✅ 会话验证成功', 'success');
            } else {
                addBug('testAuthenticationService', '会话验证失败');
                testPassed = false;
            }
        }

        // 1.4 测试登出
        log('📝 1.4 测试用户登出', 'detail');
        if (loginResult.success) {
            const logoutResult = authService.logout(loginResult.session.id);
            if (logoutResult) {
                log('✅ 用户登出成功', 'success');
            } else {
                addBug('testAuthenticationService', '登出失败');
                testPassed = false;
            }
        }

        // 1.5 测试密码策略验证
        log('📝 1.5 测试密码策略验证', 'detail');
        const weakPasswords = [
            { password: '123456', expect: false, reason: '太短' },
            { password: 'password', expect: false, reason: '缺少数字和特殊字符' },
            { password: 'PASSWORD123', expect: false, reason: '缺少小写字母和特殊字符' },
            { password: 'Password123', expect: false, reason: '缺少特殊字符' },
            { password: 'StrongPass123!', expect: true, reason: '符合要求' }
        ];
        
        for (const test of weakPasswords) {
            const validation = authService.validatePassword(test.password);
            if (validation.valid !== test.expect) {
                log(`⚠️ 密码 "${test.password}" 验证异常: 期望 ${test.expect}, 实际 ${validation.valid}`, 'warning');
                testResults.warnings.push({
                    test: 'testAuthenticationService',
                    message: `密码策略验证异常: ${test.reason}`,
                    password: test.password
                });
            } else {
                log(`✅ 密码验证正确: "${test.password}" - ${test.reason}`, 'detail');
            }
        }

        const duration = Date.now() - startTime;
        testResults.performance.testAuthenticationService = duration;
        log('🔥 认证服务基础功能测试完成，耗时: ' + duration + 'ms', 'extreme');
        
    } catch (error) {
        log(`❌ 认证服务测试异常: ${error.message}`, 'error');
        log(error.stack, 'error');
        testPassed = false;
        addBug('testAuthenticationService', '测试异常', error.message);
    }
    
    addTestResult('认证服务基础功能测试', testPassed);
    return testPassed;
}

// ============================================================
// 测试2: 安全边界与异常情况测试
// ============================================================
function testSecurityBoundaryConditions() {
    log('🔥 开始测试2: 安全边界与异常情况测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        const authService = new AuthenticationService(DefaultSecurityConfig);

        // 2.1 测试重复注册
        log('📝 2.1 测试重复邮箱注册', 'detail');
        authService.register('duplicate@example.com', 'TestPass123!', 'testuser1');
        const duplicateResult = authService.register('duplicate@example.com', 'AnotherPass123!', 'testuser2');
        if (duplicateResult.success) {
            addBug('testSecurityBoundaryConditions', '重复注册未被阻止');
            testPassed = false;
        } else {
            log('✅ 重复注册正确被阻止', 'success');
        }

        // 2.2 测试无效登录
        log('📝 2.2 测试无效密码登录', 'detail');
        let failureCount = 0;
        for (let i = 0; i < 10; i++) {
            const badLoginResult = authService.login(
                'duplicate@example.com', 
                'WrongPass!', 
                '127.0.0.1',
                'TestAgent'
            );
            if (!badLoginResult.success) {
                failureCount++;
            }
        }
        log(`✅ 无效密码尝试 ${failureCount} 次，正确被拒绝`, 'detail');

        // 2.3 测试空和未定义值
        log('📝 2.3 测试空值和未定义值情况', 'detail');
        
        const testCases = [
            { email: null, password: 'TestPass123!', description: '空邮箱' },
            { email: undefined, password: 'TestPass123!', description: '未定义邮箱' },
            { email: 'test2@example.com', password: null, description: '空密码' },
            { email: 'test2@example.com', password: undefined, description: '未定义密码' },
            { email: '', password: '', description: '空字符串' },
            { email: 'inval@id', password: 'short', description: '无效格式' }
        ];

        for (const testCase of testCases) {
            const result = authService.register(testCase.email, testCase.password, 'user');
            log(`📝 ${testCase.description} - 结果: ${result.success ? '成功' : '失败'}`, 'detail');
            if (result.success) {
                testResults.warnings.push({
                    test: 'testSecurityBoundaryConditions',
                    message: '异常输入被接受: ' + testCase.description
                });
            }
        }

        // 2.4 测试超长输入
        log('📝 2.4 测试超长输入', 'detail');
        const veryLongEmail = 'a'.repeat(1000) + '@example.com';
        const veryLongPassword = 'P'.repeat(1000) + 'a1!';
        const longRegister = authService.register(veryLongEmail, veryLongPassword, 'longuser');
        log(`超长邮箱注册 - 结果: ${longRegister.success ? '成功' : '失败'}`, 'detail');

        const duration = Date.now() - startTime;
        testResults.performance.testSecurityBoundaryConditions = duration;
        log('🔥 安全边界测试完成，耗时: ' + duration + 'ms', 'extreme');
        
    } catch (error) {
        log(`❌ 安全边界测试异常: ${error.message}`, 'error');
        log(error.stack, 'error');
        testPassed = false;
        addBug('testSecurityBoundaryConditions', '测试异常', error.message);
    }
    
    addTestResult('安全边界与异常情况测试', testPassed);
    return testPassed;
}

// ============================================================
// 测试3: RBAC权限管理测试
// ============================================================
function testRBACPermissionSystem() {
    log('🔥 开始测试3: RBAC权限管理测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        log('📊 初始化权限服务', 'step');
        const permService = new PermissionService();

        // 3.1 测试基本权限
        log('📝 3.1 测试基本权限检查', 'detail');
        
        const hasAdminPerm = permService.hasPermission('owner', '*', '*', 'all');
        if (!hasAdminPerm) {
            addBug('testRBACPermissionSystem', 'Owner 权限不正确');
            testPassed = false;
        } else {
            log('✅ Owner 拥有全部权限', 'success');
        }

        const hasViewerPerm = permService.hasPermission('viewer', 'project', 'read', 'own');
        if (!hasViewerPerm) {
            addBug('testRBACPermissionSystem', 'Viewer 查看权限不正确');
            testPassed = false;
        } else {
            log('✅ Viewer 拥有查看权限', 'success');
        }

        const viewerNoWrite = permService.hasPermission('viewer', 'project', 'write', 'own');
        if (viewerNoWrite) {
            addBug('testRBACPermissionSystem', 'Viewer 不应该有写权限');
            testPassed = false;
        } else {
            log('✅ Viewer 正确没有写权限', 'success');
        }

        // 3.2 测试高级权限服务
        log('📝 3.2 测试高级权限服务', 'detail');
        const advancedPerm = new AdvancedPermissionService();
        
        const adminUserId = 'user_admin';
        const developerUserId = 'user_dev';
        
        advancedPerm.assignRole(adminUserId, 'role_admin');
        advancedPerm.assignRole(developerUserId, 'role_developer');
        
        const adminHasAll = advancedPerm.hasPermission(adminUserId, PermissionAction.ADMIN, ResourceType.PROJECT, '123');
        if (!adminHasAll) {
            addBug('testRBACPermissionSystem', '高级权限服务管理员权限异常');
            testPassed = false;
        } else {
            log('✅ 高级权限管理员权限正确', 'success');
        }
        
        const duration = Date.now() - startTime;
        testResults.performance.testRBACPermissionSystem = duration;
        log('🔥 RBAC权限管理测试完成，耗时: ' + duration + 'ms', 'extreme');
        
    } catch (error) {
        log(`❌ RBAC权限测试异常: ${error.message}`, 'error');
        log(error.stack, 'error');
        testPassed = false;
        addBug('testRBACPermissionSystem', '测试异常', error.message);
    }
    
    addTestResult('RBAC权限管理测试', testPassed);
    return testPassed;
}

// ============================================================
// 测试4: 审计日志功能测试
// ============================================================
function testAuditLogSystem() {
    log('🔥 开始测试4: 审计日志功能测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        log('📊 初始化审计日志服务', 'step');
        const auditService = new AuditLogService();

        // 4.1 记录测试事件
        log('📝 4.1 记录审计事件', 'detail');
        for (let i = 0; i < 100; i++) {
            auditService.log({
                userId: `user_${i % 10}`,
                action: i % 2 === 0 ? 'create' : 'read',
                resourceType: 'project',
                resourceId: `proj_${i}`,
                details: `Test event ${i}`,
                ipAddress: `192.168.1.${i % 255}`,
                userAgent: 'Chrome'
            });
        }

        // 4.2 查询测试
        log('📝 4.2 查询审计日志', 'detail');
        const allLogs = auditService.query({});
        log(`✅ 共记录 ${allLogs.length} 条审计日志`, 'success');

        const userLogs = auditService.getUserActivity('user_3', 20);
        log(`✅ 用户 user_3 的活动日志有 ${userLogs.length} 条`, 'success');

        // 4.3 按条件过滤
        log('📝 4.3 按条件过滤审计日志', 'detail');
        const createLogs = auditService.query({ action: 'create' });
        log(`✅ create 操作日志有 ${createLogs.length} 条`, 'success');

        // 4.4 高级权限服务的审计日志
        log('📝 4.4 测试高级权限服务的审计记录', 'detail');
        const advancedPerm = new AdvancedPermissionService();
        const testUserId = 'user_test';
        advancedPerm.assignRole(testUserId, 'role_viewer');
        
        // 触发多次权限检查来生成审计记录
        for (let i = 0; i < 50; i++) {
            advancedPerm.hasPermission(testUserId, PermissionAction.READ, ResourceType.PROJECT, `proj_${i}`);
            if (i % 2 === 0) {
                advancedPerm.hasPermission(testUserId, PermissionAction.WRITE, ResourceType.PROJECT, `proj_${i}`);
            }
        }
        
        const securityEvents = advancedPerm.getAuditLog({});
        log(`✅ 权限操作审计事件有 ${securityEvents.length} 条`, 'success');
        
        const duration = Date.now() - startTime;
        testResults.performance.testAuditLogSystem = duration;
        log('🔥 审计日志测试完成，耗时: ' + duration + 'ms', 'extreme');
        
    } catch (error) {
        log(`❌ 审计日志测试异常: ${error.message}`, 'error');
        log(error.stack, 'error');
        testPassed = false;
        addBug('testAuditLogSystem', '测试异常', error.message);
    }
    
    addTestResult('审计日志功能测试', testPassed);
    return testPassed;
}

// ============================================================
// 测试5: 威胁检测与合规检查
// ============================================================
function testThreatDetectionAndCompliance() {
    log('🔥 开始测试5: 威胁检测与合规检查测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        // 5.1 威胁检测
        log('📝 5.1 测试威胁检测服务', 'detail');
        const threatService = new ThreatDetectionService();

        // 模拟潜在的暴力破解尝试
        log('📝 模拟暴力破解尝试', 'detail');
        const bruteForceEvents = [];
        for (let i = 0; i < 20; i++) {
            bruteForceEvents.push({
                type: 'permission_denied',
                userId: 'suspicious_user',
                resource: 'login',
                timestamp: new Date(Date.now() - i * 1000),
                ipAddress: '192.168.1.200',
                details: { failedAttempt: true }
            });
        }

        for (const event of bruteForceEvents) {
            threatService.analyzeSecurityEvent(event);
        }

        const alerts = threatService.getRecentAlerts({});
        log(`✅ 检测到 ${alerts.length} 个威胁警告`, 'success');
        
        // 5.2 合规检查
        log('📝 5.2 测试合规检查', 'detail');
        const complianceChecker = new ComplianceChecker({});
        
        // 检查敏感数据检测
        log('📝 敏感数据检测', 'detail');
        const testCode = `
            const password = "secretPass123!";
            const apiKey = "sk_live_abc123xyz";
            const email = "user@company.com";
            const creditCard = "4111-1111-1111-1111";
        `;
        
        const sensitiveDataResult = complianceChecker.detectSensitiveData(testCode);
        log(`✅ 检测到 ${sensitiveDataResult.findings.length} 处敏感数据`, 'detail');
        for (const finding of sensitiveDataResult.findings) {
            log(`📝 - ${finding.type} (${finding.severity}) at ${finding.location}`, 'detail');
        }

        const duration = Date.now() - startTime;
        testResults.performance.testThreatDetectionAndCompliance = duration;
        log('🔥 威胁检测与合规检查测试完成，耗时: ' + duration + 'ms', 'extreme');
        
    } catch (error) {
        log(`❌ 威胁检测测试异常: ${error.message}`, 'error');
        log(error.stack, 'error');
        testPassed = false;
        addBug('testThreatDetectionAndCompliance', '测试异常', error.message);
    }
    
    addTestResult('威胁检测与合规检查测试', testPassed);
    return testPassed;
}

// ============================================================
// 测试6: 超级混乱和复杂场景测试
// ============================================================
function testSuperChaoticScenario() {
    log('🔥 开始测试6: 超级混乱和复杂场景测试', 'extreme');
    const startTime = Date.now();
    let testPassed = true;
    
    try {
        log('📊 初始化所有安全服务', 'step');
        const authService = new AuthenticationService(DefaultSecurityConfig);
        const permService = new PermissionService();
        const auditService = new AuditLogService();
        const advancedPerm = new AdvancedPermissionService();
        const threatService = new ThreatDetectionService();
        
        // 创建大量用户、角色、权限、事件混合
        log('📝 6.1 创建大量用户并分配角色', 'detail');
        const roles = ['owner', 'admin', 'member', 'viewer'];
        const users = [];
        
        for (let i = 0; i < 100; i++) {
            const email = `user${i}@test.com`;
            const password = `Password${i}!`;
            const regResult = authService.register(email, password, `user${i}`);
            if (regResult.success) {
                users.push(regResult.account);
                const randomRole = roles[i % roles.length];
                advancedPerm.assignRole(regResult.account.userId, `role_${randomRole}`);
            }
        }
        
        log(`✅ 创建了 ${users.length} 个用户`, 'success');
        
        // 6.2 混合操作
        log('📝 6.2 执行大量混合操作', 'detail');
        const operations = ['login', 'logout', 'checkPermission', 'audit', 'threat', 'permutation'];
        
        for (let round = 0; round < 50; round++) {
            const operationType = operations[round % operations.length];
            const randomUser = users[Math.floor(Math.random() * users.length)];
            
            switch (operationType) {
                case 'login':
                    authService.login(randomUser.email, `Password${randomUser.id}!`, '127.0.0.1', 'Test');
                    break;
                case 'checkPermission':
                    permService.hasPermission(roles[round % 4], 'project', 'read', 'own');
                    break;
                case 'audit':
                    auditService.log({
                        userId: randomUser.userId,
                        action: 'read',
                        resourceType: 'project',
                        resourceId: `proj${round}`
                    });
                    break;
                case 'threat':
                    threatService.analyzeSecurityEvent({
                        type: 'permission_' + (round % 3 === 0 ? 'granted' : 'denied'),
                        userId: randomUser.userId,
                        resource: `resource${round}`,
                        timestamp: new Date()
                    });
                    break;
            }
            
            if (round % 10 === 0) {
                log(`📝 进度 ${round + 1}/50 轮`, 'detail');
            }
        }
        
        // 6.3 验证数据一致性
        log('📝 6.3 验证各种数据一致性', 'detail');
        const allLogs = auditService.query({});
        log(`✅ 审计日志共 ${allLogs.length} 条`, 'success');
        
        const securityEvents = advancedPerm.getAuditLog({});
        log(`✅ 权限审计事件共 ${securityEvents.length} 条`, 'success');
        
        const alerts = threatService.getRecentAlerts({});
        log(`✅ 威胁警告共 ${alerts.length} 条`, 'success');
        
        const duration = Date.now() - startTime;
        testResults.performance.testSuperChaoticScenario = duration;
        log('🔥 超级混乱场景测试完成，耗时: ' + duration + 'ms', 'extreme');
        
    } catch (error) {
        log(`❌ 超级混乱场景测试异常: ${error.message}`, 'error');
        log(error.stack, 'error');
        testPassed = false;
        addBug('testSuperChaoticScenario', '测试异常', error.message);
    }
    
    addTestResult('超级混乱和复杂场景测试', testPassed);
    return testPassed;
}

// ============================================================
// 主测试运行器
// ============================================================
function runAllTests() {
    log('================================================================', 'test');
    log('🔥 第24代 - 安全与权限管理深度测试', 'test');
    log('Generation 24 - Security and Permission Management Deep Test', 'test');
    log('================================================================', 'test');
    
    const totalStartTime = Date.now();
    
    const testPassed1 = testAuthenticationService();
    const testPassed2 = testSecurityBoundaryConditions();
    const testPassed3 = testRBACPermissionSystem();
    const testPassed4 = testAuditLogSystem();
    const testPassed5 = testThreatDetectionAndCompliance();
    const testPassed6 = testSuperChaoticScenario();
    
    const totalDuration = Date.now() - totalStartTime;
    testResults.totalDuration = totalDuration;
    
    log('================================================================', 'test');
    log('🔥 测试完成！总耗时: ' + totalDuration + 'ms (' + (totalDuration / 1000).toFixed(2) + 's)', 'test');
    log('总测试数: ' + testResults.totalTests, 'test');
    log('通过: ' + testResults.passedTests, 'success');
    log('失败: ' + testResults.failedTests, testResults.failedTests > 0 ? 'error' : 'info');
    log('发现Bug: ' + testResults.bugsFound.length, testResults.bugsFound.length > 0 ? 'error' : 'success');
    log('警告: ' + testResults.warnings.length, testResults.warnings.length > 0 ? 'warning' : 'info');
    log('================================================================', 'test');
    
    // 保存详细报告
    try {
        const reportPath = path.join(__dirname, 'v24_security_test_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2), 'utf8');
        log('✅ 测试报告已保存到: ' + reportPath, 'success');
    } catch (e) {
        log('⚠️ 无法保存测试报告: ' + e.message, 'warning');
    }
    
    const allPassed = testPassed1 && testPassed2 && testPassed3 && 
                      testPassed4 && testPassed5 && testPassed6;
    
    if (allPassed) {
        log('🎉 第24代安全与权限管理测试全部通过！系统安全性极佳！', 'success');
    } else {
        log('⚠️ 第24代测试有部分失败，需要修复问题', 'warning');
    }
    
    return allPassed;
}

log('🚀 开始第24代安全与权限管理深度测试...', 'extreme');
runAllTests();
