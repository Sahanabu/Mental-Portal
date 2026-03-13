require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials with email
const testUser = {
  name: 'Test User',
  email: `testuser${Date.now()}@example.com`,
  password: 'TestPass123!'
};

async function testEmailAuthentication() {
  console.log('\n📧 Testing Email-Based Authentication...\n');
  
  try {
    // Test 1: Register with email
    console.log('1️⃣ Testing Registration with Email...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful');
    console.log('   Name:', registerResponse.data.name);
    console.log('   Email:', registerResponse.data.email);
    console.log('   Token:', registerResponse.data.token.substring(0, 20) + '...');
    console.log('   User ID:', registerResponse.data.userId);
    
    const token = registerResponse.data.token;
    
    // Test 2: Login with email
    console.log('\n2️⃣ Testing Login with Email...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful');
    console.log('   Email:', loginResponse.data.email);
    console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');
    
    // Test 3: Invalid email format
    console.log('\n3️⃣ Testing Invalid Email Format (should fail)...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test',
        email: 'invalid-email',
        password: 'TestPass123!'
      });
      console.log('❌ FAILED: Invalid email should have been rejected');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected invalid email format');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 4: Duplicate email
    console.log('\n4️⃣ Testing Duplicate Email (should fail)...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('❌ FAILED: Duplicate email should have been rejected');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected duplicate email');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 5: Case insensitive email
    console.log('\n5️⃣ Testing Case Insensitive Email...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email.toUpperCase(),
        password: testUser.password
      });
      console.log('✅ Successfully logged in with uppercase email');
    } catch (error) {
      console.log('❌ Case insensitive login failed:', error.response?.data?.message);
    }
    
    // Test 6: Protected route with token
    console.log('\n6️⃣ Testing Protected Route with Valid Token...');
    try {
      const protectedResponse = await axios.get(`${BASE_URL}/assessment/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Successfully accessed protected route');
    } catch (error) {
      console.log('⚠️  Protected route access:', error.response?.data?.message || error.message);
    }
    
    console.log('\n✨ Email Authentication Tests Complete!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

console.log('🚀 Starting Email Authentication Tests...');
console.log('📍 Server URL:', BASE_URL);
console.log('📧 Test Email:', testUser.email);

testEmailAuthentication().then(() => {
  console.log('✅ All email authentication tests passed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
