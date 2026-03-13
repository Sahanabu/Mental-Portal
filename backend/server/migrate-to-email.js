require('dotenv').config();
const mongoose = require('mongoose');

async function migrateToEmailSchema() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Check if users collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length > 0) {
      console.log('📋 Found existing users collection');
      
      // Get count of existing users
      const userCount = await db.collection('users').countDocuments();
      console.log(`   Current users: ${userCount}`);
      
      if (userCount > 0) {
        console.log('\n⚠️  WARNING: This will delete all existing users!');
        console.log('   Dropping users collection in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Drop the collection
      await db.collection('users').drop();
      console.log('✅ Dropped old users collection\n');
    } else {
      console.log('ℹ️  No existing users collection found\n');
    }

    // Create new collection with email schema
    console.log('📝 Creating new users collection with email schema...');
    await db.createCollection('users');
    
    // Create unique index on email
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created unique index on email field\n');

    console.log('✨ Migration complete!');
    console.log('   New schema: email (unique), name, passwordHash, anonymous, createdAt\n');
    
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

console.log('🚀 Starting Email Schema Migration...\n');
migrateToEmailSchema();
