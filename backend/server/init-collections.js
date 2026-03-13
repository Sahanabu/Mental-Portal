require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Assessment = require('./models/Assessment');
    const MoodLog = require('./models/MoodLog');
    const Conversation = require('./models/Conversation');

console.log('========================================');
console.log('MongoDB Collections Initialization');
console.log('========================================\n');

async function initializeCollections() {
  try {
    console.log('[1/4] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    const db = mongoose.connection.db;
    
    console.log('[2/4] Checking existing collections...');
    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map(col => col.name);
    console.log('Existing collections:', collectionNames.length > 0 ? collectionNames.join(', ') : 'None');
    console.log('');

    console.log('[3/4] Creating collections...\n');

    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('✅ Created: users collection');
      await User.createIndexes();
      console.log('   - Added unique index on username');
    } else {
      console.log('✓  users collection already exists');
    }

    if (!collectionNames.includes('assessments')) {
      await db.createCollection('assessments');
      console.log('✅ Created: assessments collection');
      await Assessment.createIndexes();
      console.log('   - Added index on userId');
      console.log('   - Added index on createdAt');
    } else {
      console.log('✓  assessments collection already exists');
    }

    if (!collectionNames.includes('moodlogs')) {
      await db.createCollection('moodlogs');
      console.log('✅ Created: moodlogs collection');
      await MoodLog.createIndexes();
      console.log('   - Added index on userId');
      console.log('   - Added index on createdAt');
    } else {
      console.log('✓  moodlogs collection already exists');
    }

    if (!collectionNames.includes('conversations')) {
      await db.createCollection('conversations');
      console.log('✅ Created: conversations collection');
      await Conversation.createIndexes();
      console.log('   - Added index on userId');
      console.log('   - Added index on createdAt');
    } else {
      console.log('✓  conversations collection already exists');
    }

    console.log('\n[4/4] Verifying collections...');
    const finalCollections = await db.listCollections().toArray();
    console.log('Total collections:', finalCollections.length);
    console.log('Collections:', finalCollections.map(col => col.name).join(', '));

    console.log('\n========================================');
    console.log('Collections Initialized Successfully!');
    console.log('========================================\n');

    console.log('Database Structure:');
    console.log('├── users');
    console.log('│   ├── username (unique)');
    console.log('│   ├── passwordHash');
    console.log('│   ├── anonymous');
    console.log('│   └── createdAt');
    console.log('├── assessments');
    console.log('│   ├── userId (indexed)');
    console.log('│   ├── answers');
    console.log('│   ├── score');
    console.log('│   ├── category');
    console.log('│   └── createdAt (indexed)');
    console.log('└── moodlogs');
    console.log('    ├── userId (indexed)');
    console.log('    ├── mood');
    console.log('    └── createdAt (indexed)');

    console.log('\n✅ Your MongoDB database is ready!');
    console.log('\nNext steps:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Start frontend: cd ../../../frontend && npm run dev');
    console.log('3. Open browser: http://localhost:3000\n');

  } catch (error) {
    console.error('\n❌ Error initializing collections:');
    console.error(error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your MONGO_URI in .env file');
    console.log('2. Ensure MongoDB Atlas is accessible');
    console.log('3. Verify your IP is whitelisted\n');
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

initializeCollections();
