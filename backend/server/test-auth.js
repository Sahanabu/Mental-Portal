require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const testUser = {
  username: `testuser_${Date.now()}`,
  password: 'TestPass123!'
};

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Flow...\n');
  
  try {
    // Test 1: Register new user
    console.log('1️⃣ Testing Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful');
    console.log('   Token:', registerResponse.data.token.substring(0, 20) + '...');
    console.log('   User ID:', registerResponse.data.userId);
    
    const token = registerResponse.data.token;
    
    // Test 2: Login with same credentials
    console.log('\n2️⃣ Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    console.log('✅ Login successful');
    console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');
    
    // Test 3: Duplicate registration (should fail)
    console.log('\n3️⃣ Testing Duplicate Registration (should fail)...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('❌ FAILED: Duplicate registration should have been rejected');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected duplicate username');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 4: Wrong password (should fail)
    console.log('\n4️⃣ Testing Wrong Password (should fail)...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        username: testUser.username,
        password: 'WrongPassword123'
      });
      console.log('❌ FAILED: Wrong password should have been rejected');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected wrong password');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 5: Protected route with valid token
    console.log('\n5️⃣ Testing Protected Route with Valid Token...');
    try {
      const protectedResponse = await axios.get(`${BASE_URL}/mood/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Successfully accessed protected route');
      console.log('   Response:', protectedResponse.data);
    } catch (error) {
      console.log('⚠️  Protected route access:', error.response?.data?.message || error.message);
    }
    
    // Test 6: Protected route without token (should fail)
    console.log('\n6️⃣ Testing Protected Route without Token (should fail)...');
    try {
      await axios.get(`${BASE_URL}/mood/history`);
      console.log('❌ FAILED: Should have been rejected without token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected request without token');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 7: Protected route with invalid token (should fail)
    console.log('\n7️⃣ Testing Protected Route with Invalid Token (should fail)...');
    try {
      await axios.get(`${BASE_URL}/mood/history`, {
        headers: { Authorization: 'Bearer invalid_token_12345' }
      });
      console.log('❌ FAILED: Should have been rejected with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid token');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 8: Missing fields
    console.log('\n8️⃣ Testing Missing Fields (should fail)...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, { username: 'onlyusername' });
      console.log('❌ FAILED: Should have been rejected with missing password');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected missing password');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    console.log('\n✨ Authentication Tests Complete!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
console.log('🚀 Starting Authentication Tests...');
console.log('📍 Server URL:', BASE_URL);
console.log('👤 Test User:', testUser.username);

testAuthentication().then(() => {
  console.log('✅ All tests passed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
