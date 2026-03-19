import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });
};

export const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const calculateCompatibility = (user1, user2) => {
  let score = 0;
  let breakdown = { interests: 0, lifestyle: 0, personality: 0, location: 0 };

  // Interest overlap
  if (user1.interests?.length && user2.interests?.length) {
    const common = user1.interests.filter(i => user2.interests.includes(i));
    breakdown.interests = Math.round((common.length / Math.max(user1.interests.length, user2.interests.length)) * 100);
  }

  // Lifestyle compatibility
  const lifestyleFields = ['drinking', 'smoking', 'workout', 'diet'];
  let lifestyleMatch = 0;
  let lifestyleCount = 0;
  lifestyleFields.forEach(f => {
    if (user1.lifestyle?.[f] && user2.lifestyle?.[f]) {
      lifestyleCount++;
      if (user1.lifestyle[f] === user2.lifestyle[f]) lifestyleMatch++;
    }
  });
  breakdown.lifestyle = lifestyleCount > 0 ? Math.round((lifestyleMatch / lifestyleCount) * 100) : 50;

  // Personality match (inverse distance)
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness'];
  let traitDiff = 0;
  traits.forEach(t => {
    traitDiff += Math.abs((user1.personalityTraits?.[t] || 50) - (user2.personalityTraits?.[t] || 50));
  });
  breakdown.personality = Math.max(0, 100 - Math.round(traitDiff / traits.length));

  // Location proximity bonus
  breakdown.location = 70; // placeholder

  score = Math.round(
    breakdown.interests * 0.35 +
    breakdown.lifestyle * 0.25 +
    breakdown.personality * 0.25 +
    breakdown.location * 0.15
  );

  return { score: Math.min(score, 99), breakdown };
};

export const generatePersonalityTraits = (user) => {
  const bio = (user.bio || '').toLowerCase();
  const interests = (user.interests || []).map(i => i.toLowerCase());
  
  // Base scores at 50
  let traits = {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50
  };

  // Heuristic keywords
  const mappings = {
    openness: ['travel', 'art', 'creative', 'photography', 'music', 'reading', 'nature', 'hiking', 'adventure', 'explore'],
    conscientiousness: ['ambition', 'fitness', 'goal', 'work', 'gym', 'workout', 'professional', 'study', 'reading'],
    extraversion: ['social', 'dancing', 'party', 'gaming', 'sports', 'comedy', 'outdoors', 'friends', 'meetup'],
    agreeableness: ['friendship', 'nature', 'meditation', 'yoga', 'kindness', 'volunteer', 'pets', 'dog', 'cat', 'socially'],
    neuroticism: ['deep', 'emotional', 'thinker', 'private', 'calm', 'quiet']
  };

  // Adjust scores based on interests
  interests.forEach(interest => {
    Object.keys(mappings).forEach(trait => {
      if (mappings[trait].includes(interest)) {
        traits[trait] += 5;
      }
    });
  });

  // Adjust scores based on bio keywords
  Object.keys(mappings).forEach(trait => {
    mappings[trait].forEach(keyword => {
      if (bio.includes(keyword)) {
        traits[trait] += 3;
      }
    });
  });

  // Add some randomness (+/- 10) to make it look "AI generated"
  Object.keys(traits).forEach(t => {
    traits[t] += Math.floor(Math.random() * 21) - 10;
    traits[t] = Math.max(20, Math.min(95, traits[t])); // Keep in 20-95 range
  });

  return traits;
};
