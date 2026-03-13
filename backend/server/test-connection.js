require('dotenv').config();
const mongoose = require('mongoose');

console.log('========================================');
console.log('Mental Wellness Portal - Connection Test');
console.log('========================================\n');

// Test 1: Environment Variables
console.log('[1/3] Checking Environment Variables...');
const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:', missingVars.join(', '));
  console.log('Please check your .env file\n');
} else {
  console.log('✅ All required environment variables found\n');
}

// Test 2: MongoDB Connection
console.log('[2/3] Testing MongoDB Connection...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    
    // Test 3: Gemini API Key
    console.log('\n[3/3] Checking Gemini API Key...');
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      console.log('✅ Gemini API Key configured');
    } else {
      console.log('⚠️  Gemini API Key not configured (AI chat will use fallback responses)');
    }
    
    console.log('\n========================================');
    console.log('Connection Test Complete!');
    console.log('========================================');
    console.log('\nYou can now start the servers:');
    console.log('  Backend:  cd backend/services/server && npm run dev');
    console.log('  Frontend: npm run dev');
    console.log('  Or use:   start-all.bat\n');
    
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ MongoDB Connection Failed!');
    console.log('   Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('  1. Check your MONGO_URI in .env file');
    console.log('  2. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('  3. Verify username and password are correct');
    console.log('  4. Check if cluster name is correct\n');
    
    process.exit(1);
  });
