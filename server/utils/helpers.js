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
