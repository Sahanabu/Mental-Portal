require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testFrontendFlow() {
  console.log('🧪 Testing Frontend Registration Flow...\n');
  
  const testData = {
    name: 'John Doe',
    email: `john${Date.now()}@example.com`,
    password: 'SecurePass123'
  };
  
  try {
    console.log('📤 Sending registration request...');
    console.log('   Data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/auth/register`, testData);
    
    console.log('\n✅ Registration successful!');
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    
    // Test login
    console.log('\n📤 Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testData.email,
      password: testData.password
    });
    
    console.log('✅ Login successful!');
    console.log('   Token:', loginResponse.data.token.substring(0, 30) + '...');
    
    console.log('\n✨ Frontend flow test complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    process.exit(1);
  }
}

testFrontendFlow();
