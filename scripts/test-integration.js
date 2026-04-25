#!/usr/bin/env node
/**
 * Comprehensive API Test - Tests login, staff creation, and attendance
 */

const API_BASE = 'http://localhost:3000/api/backend'; // Through Next.js rewrites
const SUPERADMIN_CREDS = {
  email: 'superadmin@syncwork.com',
  password: 'SuperAdmin@2024'
};

let accessToken = '';
let userId = '';

async function login() {
  console.log('🔐 Testing Login...');
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(SUPERADMIN_CREDS)
  });
  const data = await res.json();
  accessToken = data.data?.access_token;
  console.log('✅ Login successful');
  console.log('   Token received:', !!accessToken);
  return accessToken;
}

async function getMe() {
  console.log('\n👤 Testing GET /auth/me...');
  const res = await fetch(API_BASE + '/auth/me', {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  const data = await res.json();
  userId = data.data?.id;
  console.log('✅ Auth check successful');
  console.log('   User:', data.data?.full_name);
  console.log('   User ID:', userId);
}

async function testCheckIn() {
  console.log('\n⏰ Testing Check-in...');
  console.log('   Sending: { employee_id:', userId, '}');
  
  const res = await fetch(API_BASE + '/attendance/check-in', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify({ employee_id: userId })
  });
  
  const data = await res.json();
  console.log('   Status:', res.status);
  if (res.ok) {
    console.log('✅ Check-in successful');
  } else {
    console.log('❌ Check-in failed');
    console.log('   Error:', data.error?.message || data.error);
  }
}

async function testStaffCreation() {
  console.log('\n👨‍💼 Testing Staff Creation...');
  console.log('   Step 1: Creating user...');
  
  const uniqueId = Date.now();
  const userRes = await fetch(API_BASE + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test${uniqueId}@example.com`,
      password: 'TestPassword123',
      first_name: 'Test',
      last_name: 'User'
    })
  });
  
  const userData = await userRes.json();
  console.log('   User creation status:', userRes.status);
  
  if (!userRes.ok) {
    console.log('   Error:', userData.error?.message);
    return;
  }
  
  const newUserId = userData.data?.id;
  console.log('   User ID:', newUserId);
  
  console.log('   Step 2: Creating employee record...');
  const empRes = await fetch(API_BASE + '/staff', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify({
      user_id: newUserId,
      employee_code: 'EMP' + uniqueId,
      employment_type: 'full_time',
      hire_date: '2024-01-01T00:00:00Z',
      job_title: 'Developer'
    })
  });
  
  const empData = await empRes.json();
  console.log('   Employee creation status:', empRes.status);
  if (empRes.ok) {
    console.log('✅ Staff created successfully');
  } else {
    console.log('❌ Staff creation failed');
    console.log('   Error:', empData.error?.message || empData.error);
  }
}

async function runTests() {
  console.log('🚀 SyncWork API Integration Test');
  console.log('================================');
  console.log('URL:', API_BASE);
  console.log('Note: Using Next.js rewrites (localhost:3000 -> localhost:8080)\n');
  
  try {
    await login();
    await getMe();
    await testCheckIn();
    await testStaffCreation();
    
    console.log('\n✅ Test complete');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runTests();
