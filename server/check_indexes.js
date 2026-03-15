import 'dotenv/config';
import mongoose from 'mongoose';

async function checkIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const indexes = await User.collection.getIndexes();
    console.log('Current Indexes:', JSON.stringify(indexes, null, 2));
    
    // Check if 2dsphere index on location exists
    const has2dsphere = Object.values(indexes).some(idx => idx.location === '2dsphere');
    console.log('Has 2dsphere index on location:', has2dsphere);
    
    if (!has2dsphere) {
      console.log('Creating 2dsphere index...');
      await User.collection.createIndex({ location: '2dsphere' });
      console.log('Index created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkIndexes();
