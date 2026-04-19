const TRAITS = ['openness','conscientiousness','extraversion','agreeableness','neuroticism'];

const calculateRawScores = (answers) => {
  const traitData = {};
  TRAITS.forEach((t) => { traitData[t] = { total: 0, count: 0 }; });
  answers.forEach(({ trait, value, isReversed }) => {
    if (!traitData[trait]) return;
    const adjustedValue = isReversed ? 6 - value : value;
    traitData[trait].total += adjustedValue;
    traitData[trait].count += 1;
  });
  return traitData;
};

const normalizeScores = (traitData) => {
  const scores = {};
  TRAITS.forEach((trait) => {
    const { total, count } = traitData[trait];
    if (count === 0) { scores[trait] = 0; return; }
    const average = total / count;
    scores[trait] = Math.round(((average - 1) / 4) * 100);
  });
  return scores;
};

const getPersonalityType = (scores) => {
  const types = [
    { name:'🔮 The Visionary',     condition: (s) => s.openness >= 70 && s.extraversion >= 60 },
    { name:'🛡️ The Guardian',      condition: (s) => s.conscientiousness >= 70 && s.agreeableness >= 65 },
    { name:'🤝 The Diplomat',      condition: (s) => s.agreeableness >= 70 && s.extraversion >= 60 },
    { name:'🏛️ The Architect',     condition: (s) => s.conscientiousness >= 70 && s.openness >= 65 },
    { name:'🧭 The Explorer',      condition: (s) => s.openness >= 75 && s.conscientiousness < 55 },
    { name:'⚡ The Commander',     condition: (s) => s.extraversion >= 75 && s.conscientiousness >= 65 },
    { name:'💖 The Empath',        condition: (s) => s.agreeableness >= 75 && s.neuroticism >= 55 },
    { name:'🔬 The Analyst',       condition: (s) => s.conscientiousness >= 75 && s.extraversion < 45 },
    { name:'🌿 The Mediator',      condition: (s) => s.agreeableness >= 65 && s.neuroticism < 45 },
    { name:'🎭 The Maverick',      condition: (s) => s.openness >= 70 && s.agreeableness < 45 },
  ];
  for (const type of types) { if (type.condition(scores)) return type.name; }
  return '✨ The Individual';
};

const getDominantTraits = (scores) => Object.entries(scores).filter(([,score]) => score >= 60).sort(([,a],[,b]) => b - a).slice(0,3).map(([trait]) => trait);

const generateSummary = (scores) => {
  const parts = [];
  if (scores.openness >= 70) parts.push('You are highly creative and intellectually curious, always seeking new experiences and ideas.');
  else if (scores.openness >= 45) parts.push('You balance creativity with practicality, open to new ideas while staying grounded.');
  else parts.push('You prefer familiar routines and proven methods over unpredictable novelty.');
  if (scores.conscientiousness >= 70) parts.push('Your strong sense of discipline makes you exceptionally reliable.');
  else if (scores.conscientiousness >= 45) parts.push('You manage responsibilities well while maintaining flexibility.');
  else parts.push('You tend to be spontaneous and may find rigid structure limiting.');
  if (scores.extraversion >= 70) parts.push('You thrive in social settings and draw energy from being around others.');
  else if (scores.extraversion >= 45) parts.push('You are comfortable in both social and solitary environments.');
  else parts.push('You recharge through solitude and prefer deep one-on-one connections.');
  if (scores.agreeableness >= 70) parts.push('Your warmth and empathy make you a natural collaborator and trusted friend.');
  else if (scores.agreeableness >= 45) parts.push('You balance cooperation with healthy assertiveness.');
  else parts.push('You prioritize objective analysis over emotional influence.');
  if (scores.neuroticism >= 70) parts.push('You experience emotions deeply and benefit from stress-management practices.');
  else if (scores.neuroticism >= 45) parts.push('You have moderate emotional sensitivity.');
  else parts.push('You are emotionally resilient and maintain calm under pressure.');
  return parts.join(' ');
};

const generateSuggestions = (scores) => {
  const suggestions = [];
  if (scores.openness >= 70) { suggestions.push('Consider careers in design, research, writing, or entrepreneurship where creativity thrives.'); suggestions.push('Challenge yourself with art, travel, or learning new languages to fuel your curiosity.'); }
  else if (scores.openness < 45) suggestions.push('Try incorporating small new experiences weekly to expand your comfort zone.');
  if (scores.conscientiousness >= 70) { suggestions.push('Your organizational skills excel in project management, finance, medicine, or law.'); suggestions.push('Remember to schedule downtime — high performers risk burnout without rest.'); }
  else if (scores.conscientiousness < 45) suggestions.push('Experiment with time-blocking or habit stacking to build productive routines.');
  if (scores.extraversion >= 70) suggestions.push('Leadership, sales, teaching, or public relations roles will energize you.');
  else if (scores.extraversion < 45) { suggestions.push('Deep-focus roles like programming, writing, or research suit your nature.'); suggestions.push('Set clear social boundaries to protect your energy levels.'); }
  if (scores.agreeableness >= 70) { suggestions.push('Counseling, healthcare, or social work channels your natural empathy.'); suggestions.push('Practice setting boundaries — your giving nature deserves protection.'); }
  if (scores.neuroticism >= 70) { suggestions.push('Mindfulness, regular exercise, and journaling are proven tools for emotional regulation.'); suggestions.push('Consider working with a therapist to build resilience strategies.'); }
  return suggestions.slice(0, 4);
};

const processPersonalityResults = (answers) => {
  const traitData = calculateRawScores(answers);
  const scores = normalizeScores(traitData);
  const personalityType = getPersonalityType(scores);
  const dominantTraits = getDominantTraits(scores);
  const summary = generateSummary(scores);
  const suggestions = generateSuggestions(scores);
  return { scores, personalityType, dominantTraits, summary, suggestions };
};

module.exports = { processPersonalityResults, TRAITS };
