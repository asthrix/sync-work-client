#!/usr/bin/env node
/**
 * Test all API endpoints through Next.js rewrites
 * This simulates browser requests through localhost:3000/api/backend/*
 */

const NEXTJS_URL = 'http://localhost:3000/api/backend';
const SUPERADMIN_CREDS = {
  email: 'superadmin@syncwork.com',
  password: 'SuperAdmin@2024'
};

let accessToken = '';
let testResults = [];

async function makeRequest(method, endpoint, body = null) {
  try {
    const url = `${NEXTJS_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000'
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const options = { method, headers };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

function logResult(category, endpoint, result) {
  const status = result.ok ? '✅' : '❌';
  const statusCode = result.status || 'ERR';
  console.log(`${status} [${statusCode}] ${category} - ${endpoint}`);
  
  testResults.push({
    category,
    endpoint,
    status: result.status,
    ok: result.ok,
    error: result.error
  });
}

async function testLogin() {
  console.log('\n🔐 Testing Authentication...');
  
  const result = await makeRequest('POST', '/auth/login', SUPERADMIN_CREDS);
  logResult('Auth', 'POST /auth/login', result);
  
  if (result.ok && result.data?.data?.access_token) {
    accessToken = result.data.data.access_token;
    console.log('   Token obtained successfully');
  }
  
  return result.ok;
}

async function runAllTests() {
  console.log('🚀 Testing All Endpoints Through Next.js Rewrites');
  console.log(`📋 URL: ${NEXTJS_URL}`);
  console.log('=' .repeat(60));
  
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Login failed. Cannot proceed.');
    process.exit(1);
  }
  
  // Auth
  console.log('\n👤 Auth...');
  logResult('Auth', 'GET /auth/me', await makeRequest('GET', '/auth/me'));
  
  // Users
  console.log('\n👥 Users...');
  logResult('Users', 'GET /users', await makeRequest('GET', '/users'));
  logResult('Users', 'GET /roles', await makeRequest('GET', '/roles'));
  logResult('Users', 'GET /permissions', await makeRequest('GET', '/permissions'));
  
  // Staff
  console.log('\n👨‍💼 Staff...');
  logResult('Staff', 'GET /staff', await makeRequest('GET', '/staff'));
  logResult('Staff', 'GET /departments', await makeRequest('GET', '/departments'));
  
  // Attendance
  console.log('\n⏰ Attendance...');
  logResult('Attendance', 'GET /attendance/my', await makeRequest('GET', '/attendance/my'));
  logResult('Attendance', 'POST /attendance/check-in', await makeRequest('POST', '/attendance/check-in'));
  
  // Leaves
  console.log('\n🍃 Leaves...');
  logResult('Leaves', 'GET /leaves/types', await makeRequest('GET', '/leaves/types'));
  logResult('Leaves', 'GET /leaves/balance', await makeRequest('GET', '/leaves/balance'));
  
  // Performance
  console.log('\n🎯 Performance...');
  logResult('Performance', 'GET /performance-reviews', await makeRequest('GET', '/performance-reviews'));
  
  // Projects
  console.log('\n📋 Projects...');
  logResult('Projects', 'GET /projects', await makeRequest('GET', '/projects'));
  
  // Pipeline
  console.log('\n📈 Pipeline...');
  logResult('Pipeline', 'GET /pipelines', await makeRequest('GET', '/pipelines'));
  
  // Communication
  console.log('\n💬 Communication...');
  logResult('Communication', 'GET /chat/rooms', await makeRequest('GET', '/chat/rooms'));
  logResult('Communication', 'GET /announcements', await makeRequest('GET', '/announcements'));
  logResult('Communication', 'GET /notifications', await makeRequest('GET', '/notifications'));
  
  // Culture
  console.log('\n🎉 Culture...');
  logResult('Culture', 'GET /culture/events', await makeRequest('GET', '/culture/events'));
  logResult('Culture', 'GET /culture/trips', await makeRequest('GET', '/culture/trips'));
  logResult('Culture', 'GET /culture/polls', await makeRequest('GET', '/culture/polls'));
  logResult('Culture', 'GET /culture/recognitions', await makeRequest('GET', '/culture/recognitions'));
  logResult('Culture', 'GET /culture/leaderboard', await makeRequest('GET', '/culture/leaderboard'));
  
  // Clients
  console.log('\n🏢 Clients...');
  logResult('Clients', 'GET /clients', await makeRequest('GET', '/clients'));
  
  // Contracts
  console.log('\n📄 Contracts...');
  logResult('Contracts', 'GET /contracts', await makeRequest('GET', '/contracts'));
  
  // Tickets
  console.log('\n🎫 Tickets...');
  logResult('Tickets', 'GET /tickets', await makeRequest('GET', '/tickets'));
  
  // Finance
  console.log('\n💰 Finance...');
  logResult('Finance', 'GET /expenses', await makeRequest('GET', '/expenses'));
  logResult('Finance', 'GET /budgets', await makeRequest('GET', '/budgets'));
  logResult('Finance', 'GET /payroll', await makeRequest('GET', '/payroll'));
  
  // Salary Structures
  console.log('\n💵 Salary...');
  logResult('Salary', 'GET /salary-structures', await makeRequest('GET', '/salary-structures'));
  
  // Audit
  console.log('\n🔒 Audit...');
  logResult('Audit', 'GET /audit-logs', await makeRequest('GET', '/audit-logs'));
  logResult('Audit', 'GET /audit-logs/stats', await makeRequest('GET', '/audit-logs/stats'));
  logResult('Audit', 'GET /compliance/reports', await makeRequest('GET', '/compliance/reports'));
  
  // Summary
  const total = testResults.length;
  const passed = testResults.filter(r => r.ok).length;
  const failed = total - passed;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log(`   Total: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Endpoints:');
    testResults.filter(r => !r.ok).forEach(r => {
      console.log(`   - ${r.category}: ${r.endpoint} (Status: ${r.status})`);
    });
  }
  
  console.log('');
}

runAllTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
