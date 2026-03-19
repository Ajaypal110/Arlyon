import 'dotenv/config';
import mongoose from 'mongoose';

async function rigorousAudit() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Using a schema-less approach to see exactly what's in the DB
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    
    const users = await User.find({});
    console.log(`Auditing ${users.length} users...`);
    
    users.forEach(u => {
      const isPremiumValue = u.get('isPremium');
      const type = typeof isPremiumValue;
      console.log(`User: ${u.get('email')} | isPremium: ${JSON.stringify(isPremiumValue)} | Type: ${type}`);
      
      if (type !== 'boolean' && isPremiumValue !== undefined) {
        console.warn(`!!! WARNING: Non-boolean value detected for ${u.get('email')}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

rigorousAudit();
