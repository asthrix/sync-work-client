#!/usr/bin/env node
/**
 * API Endpoint Test Script
 * Tests all backend endpoints to verify connectivity and response format
 */

const API_BASE = 'http://localhost:8080/api/v1';
const SUPERADMIN_CREDS = {
  email: 'superadmin@syncwork.com',
  password: 'SuperAdmin@2024'
};

let accessToken = '';
let testResults = [];

async function makeRequest(method, endpoint, body = null, token = null) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers
    };

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

async function testAuth() {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  // Test login
  const loginResult = await makeRequest('POST', '/auth/login', SUPERADMIN_CREDS);
  logResult('Auth', 'POST /auth/login', loginResult);
  
  if (loginResult.ok && loginResult.data?.data?.access_token) {
    accessToken = loginResult.data.data.access_token;
  }
  
  if (!accessToken) {
    console.log('❌ Failed to get access token. Skipping authenticated tests.');
    return false;
  }
  
  // Test get me
  const meResult = await makeRequest('GET', '/auth/me', null, accessToken);
  logResult('Auth', 'GET /auth/me', meResult);
  
  return true;
}

async function testUsers() {
  console.log('\n👤 Testing User Management Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/users', name: 'GET /users' },
    { method: 'GET', path: '/roles', name: 'GET /roles' },
    { method: 'GET', path: '/permissions', name: 'GET /permissions' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Users', endpoint.name, result);
  }
}

async function testStaff() {
  console.log('\n👨‍💼 Testing Staff Management Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/staff', name: 'GET /staff' },
    { method: 'GET', path: '/departments', name: 'GET /departments' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Staff', endpoint.name, result);
  }
}

async function testAttendance() {
  console.log('\n⏰ Testing Attendance Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/attendance', name: 'GET /attendance' },
    { method: 'GET', path: '/attendance/my', name: 'GET /attendance/my' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Attendance', endpoint.name, result);
  }
}

async function testLeaves() {
  console.log('\n🍃 Testing Leave Management Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/leaves', name: 'GET /leaves' },
    { method: 'GET', path: '/leaves/types', name: 'GET /leaves/types' },
    { method: 'GET', path: '/leaves/balance', name: 'GET /leaves/balance' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Leaves', endpoint.name, result);
  }
}

async function testPerformance() {
  console.log('\n🎯 Testing Performance Review Endpoints...');
  
  const result = await makeRequest('GET', '/performance-reviews', null, accessToken);
  logResult('Performance', 'GET /performance-reviews', result);
}

async function testProjects() {
  console.log('\n📋 Testing Project Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/projects', name: 'GET /projects' },
    { method: 'GET', path: '/tasks', name: 'GET /tasks' },
    { method: 'GET', path: '/sprints', name: 'GET /sprints' },
    { method: 'GET', path: '/milestones', name: 'GET /milestones' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Projects', endpoint.name, result);
  }
}

async function testPipeline() {
  console.log('\n📈 Testing Pipeline Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/pipelines', name: 'GET /pipelines' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Pipeline', endpoint.name, result);
  }
}

async function testCommunication() {
  console.log('\n💬 Testing Communication Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/chat/rooms', name: 'GET /chat/rooms' },
    { method: 'GET', path: '/announcements', name: 'GET /announcements' },
    { method: 'GET', path: '/notifications', name: 'GET /notifications' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Communication', endpoint.name, result);
  }
}

async function testCulture() {
  console.log('\n🎉 Testing Culture Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/culture/events', name: 'GET /culture/events' },
    { method: 'GET', path: '/culture/trips', name: 'GET /culture/trips' },
    { method: 'GET', path: '/culture/polls', name: 'GET /culture/polls' },
    { method: 'GET', path: '/culture/recognitions', name: 'GET /culture/recognitions' },
    { method: 'GET', path: '/culture/leaderboard', name: 'GET /culture/leaderboard' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Culture', endpoint.name, result);
  }
}

async function testClients() {
  console.log('\n🏢 Testing Client/CRM Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/clients', name: 'GET /clients' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Clients', endpoint.name, result);
  }
}

async function testContracts() {
  console.log('\n📄 Testing Contract Endpoints...');
  
  const result = await makeRequest('GET', '/contracts', null, accessToken);
  logResult('Contracts', 'GET /contracts', result);
}

async function testTickets() {
  console.log('\n🎫 Testing Ticket Endpoints...');
  
  const result = await makeRequest('GET', '/tickets', null, accessToken);
  logResult('Tickets', 'GET /tickets', result);
}

async function testFinance() {
  console.log('\n💰 Testing Finance Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/expenses', name: 'GET /expenses' },
    { method: 'GET', path: '/budgets', name: 'GET /budgets' },
    { method: 'GET', path: '/payroll', name: 'GET /payroll' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Finance', endpoint.name, result);
  }
}

async function testSalaryStructures() {
  console.log('\n💵 Testing Salary Structure Endpoints...');
  
  const result = await makeRequest('GET', '/salary-structures', null, accessToken);
  logResult('Salary', 'GET /salary-structures', result);
}

async function testAudit() {
  console.log('\n🔒 Testing Audit Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/audit-logs', name: 'GET /audit-logs' },
    { method: 'GET', path: '/audit-logs/stats', name: 'GET /audit-logs/stats' },
    { method: 'GET', path: '/compliance/reports', name: 'GET /compliance/reports' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path, null, accessToken);
    logResult('Audit', endpoint.name, result);
  }
}

async function runTests() {
  console.log('🚀 SyncWork Backend API Test Suite');
  console.log(`📋 API Base URL: ${API_BASE}`);
  console.log('=' .repeat(60));
  
  const authSuccess = await testAuth();
  
  if (!authSuccess) {
    console.log('\n❌ Authentication failed. Cannot proceed with tests.');
    console.log('Make sure the backend is running on localhost:8080');
    process.exit(1);
  }
  
  await testUsers();
  await testStaff();
  await testAttendance();
  await testLeaves();
  await testPerformance();
  await testProjects();
  await testPipeline();
  await testCommunication();
  await testCulture();
  await testClients();
  await testContracts();
  await testTickets();
  await testFinance();
  await testSalaryStructures();
  await testAudit();
  
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

runTests().catch(console.error);
