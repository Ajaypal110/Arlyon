import 'dotenv/config';
import mongoose from 'mongoose';

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    
    // Find users with location that isn't a point or has no coordinates
    const invalidUsers = await User.find({
      $or: [
        { 'location.type': { $ne: 'Point' } },
        { 'location.coordinates': { $not: { $size: 2 } } },
        { 'location.coordinates': { $exists: false } }
      ]
    });
    
    console.log(`Found ${invalidUsers.length} users with potentially invalid location data`);
    
    if (invalidUsers.length > 0) {
      console.log('Fixing invalid location data...');
      for (const user of invalidUsers) {
        await User.findByIdAndUpdate(user._id, {
          location: {
            type: 'Point',
            coordinates: [0, 0],
            city: user.location?.city || '',
            country: user.location?.country || ''
          }
        });
      }
      console.log('Fix complete');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
