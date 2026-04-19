require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../backend/models/Question');
const connectDB = require('../config/database');

const questions = [
  { text:'I enjoy exploring abstract ideas and philosophical concepts.', trait:'openness', isReversed:false, order:1, category:'Intellect' },
  { text:'I am drawn to art, music, or creative expression in my daily life.', trait:'openness', isReversed:false, order:2, category:'Aesthetics' },
  { text:'I prefer doing things the tried-and-true way rather than experimenting.', trait:'openness', isReversed:true, order:3, category:'Tradition' },
  { text:'I love learning about topics completely outside my area of expertise.', trait:'openness', isReversed:false, order:4, category:'Curiosity' },
  { text:'My imagination is vivid and I often get lost in daydreams.', trait:'openness', isReversed:false, order:5, category:'Fantasy' },
  { text:'I find it difficult to think outside conventional boundaries.', trait:'openness', isReversed:true, order:6, category:'Flexibility' },
  { text:'I always complete tasks thoroughly before moving on to the next one.', trait:'conscientiousness', isReversed:false, order:7, category:'Thoroughness' },
  { text:'I keep my belongings and workspace neatly organized.', trait:'conscientiousness', isReversed:false, order:8, category:'Order' },
  { text:'I often procrastinate on important tasks until the last minute.', trait:'conscientiousness', isReversed:true, order:9, category:'Discipline' },
  { text:'I carefully plan my activities and follow through on commitments.', trait:'conscientiousness', isReversed:false, order:10, category:'Planning' },
  { text:'I set high standards for myself and work hard to achieve them.', trait:'conscientiousness', isReversed:false, order:11, category:'Achievement' },
  { text:'I feel energized after spending time in large social gatherings.', trait:'extraversion', isReversed:false, order:12, category:'Sociability' },
  { text:'I often take the initiative to start conversations with strangers.', trait:'extraversion', isReversed:false, order:13, category:'Assertiveness' },
  { text:'I prefer quiet evenings at home over going out to parties.', trait:'extraversion', isReversed:true, order:14, category:'Activity' },
  { text:'I am lively, cheerful, and tend to talk a lot in groups.', trait:'extraversion', isReversed:false, order:15, category:'Positive Emotions' },
  { text:'I find it draining to be the center of attention in social situations.', trait:'extraversion', isReversed:true, order:16, category:'Dominance' },
  { text:'I genuinely care about the well-being of others around me.', trait:'agreeableness', isReversed:false, order:17, category:'Altruism' },
  { text:'I try to avoid conflicts and find ways to keep peace in relationships.', trait:'agreeableness', isReversed:false, order:18, category:'Compliance' },
  { text:"I sometimes doubt whether people's intentions are truly good.", trait:'agreeableness', isReversed:true, order:19, category:'Trust' },
  { text:'I am quick to forgive others even when they have hurt me.', trait:'agreeableness', isReversed:false, order:20, category:'Forgiveness' },
  { text:'I prioritize my own needs over being accommodating to others.', trait:'agreeableness', isReversed:true, order:21, category:'Modesty' },
  { text:'I frequently worry about things that might go wrong.', trait:'neuroticism', isReversed:false, order:22, category:'Anxiety' },
  { text:'My mood can shift quickly depending on what is happening around me.', trait:'neuroticism', isReversed:false, order:23, category:'Emotional Stability' },
  { text:'I remain calm and composed even under high-pressure situations.', trait:'neuroticism', isReversed:true, order:24, category:'Stress Resistance' },
  { text:'I often feel self-conscious or embarrassed in social situations.', trait:'neuroticism', isReversed:false, order:25, category:'Self-Consciousness' },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    await Question.deleteMany({});
    console.log('🗑️  Cleared existing questions');
    const inserted = await Question.insertMany(questions);
    console.log(`✅ Seeded ${inserted.length} questions successfully`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
