import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6, select: false },
  googleId: { type: String, sparse: true },
  
  // Profile
  name: { type: String, required: true, trim: true },
  username: { type: String, unique: true, sparse: true, trim: true },
  avatar: { type: String, default: '' },
  photos: [{ url: String, publicId: String }],
  bio: { type: String, maxlength: 500, default: '' },
  dateOfBirth: { type: Date },
  age: { type: Number },
  views: { type: Number, default: 0 },
  gender: { type: String, enum: ['male', 'female', 'non-binary', 'other'] },
  genderPreference: { type: String, enum: ['male', 'female', 'everyone'], default: 'everyone' },
  
  // Location
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    city: String,
    country: String,
  },
  
  // Interests & Lifestyle
  interests: [{ type: String }],
  lifestyle: {
    drinking: { type: String, enum: ['never', 'socially', 'regularly', ''] },
    smoking: { type: String, enum: ['never', 'socially', 'regularly', ''] },
    workout: { type: String, enum: ['never', 'sometimes', 'often', 'daily', ''] },
    diet: { type: String, enum: ['omnivore', 'vegetarian', 'vegan', 'other', ''] },
    pets: { type: String, enum: ['dog', 'cat', 'both', 'none', 'other', ''] },
  },
  
  // Preferences
  lookingFor: { type: String, enum: ['relationship', 'casual', 'friendship', 'marriage', ''] },
  ageRange: { min: { type: Number, default: 18 }, max: { type: Number, default: 50 } },
  maxDistance: { type: Number, default: 50 },
  
  // Verification & Trust
  isEmailVerified: { type: Boolean, default: false },
  isPhotoVerified: { type: Boolean, default: false },
  verificationPhoto: String,
  trustScore: { type: Number, default: 50, min: 0, max: 100 },
  profileCompletion: { type: Number, default: 0 },
  
  // Personality (AI)
  personalityTraits: {
    openness: { type: Number, default: 50 },
    conscientiousness: { type: Number, default: 50 },
    extraversion: { type: Number, default: 50 },
    agreeableness: { type: Number, default: 50 },
    neuroticism: { type: Number, default: 50 },
  },
  
  // Mood
  currentMood: { type: String, default: '' },
  
  // Premium
  isPremium: { type: Boolean, default: false },
  premiumExpiry: Date,
  boostActive: { type: Boolean, default: false },
  boostExpiry: Date,
  
  // Limits
  dailyLikes: { type: Number, default: 0 },
  dailySuperLikes: { type: Number, default: 0 },
  lastLikeReset: { type: Date, default: Date.now },
  
  // Account
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isOnboarded: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  
  // Tokens
  refreshToken: { type: String, select: false },
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
userSchema.index({ gender: 1, age: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.calculateProfileCompletion = function() {
  let score = 0;
  const fields = ['name', 'bio', 'dateOfBirth', 'gender', 'genderPreference', 'lookingFor'];
  fields.forEach(f => { if (this[f]) score += 10; });
  if (this.avatar) score += 10;
  if (this.photos?.length > 0) score += 10;
  if (this.interests?.length > 0) score += 10;
  if (this.location?.city) score += 10;
  this.profileCompletion = Math.min(score, 100);
  return this.profileCompletion;
};

export default mongoose.model('User', userSchema);
