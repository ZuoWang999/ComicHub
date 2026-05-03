const mongoose = require('mongoose')

const AchievementSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏅' },
  type: { type: String, enum: ['reading', 'social', 'creator', 'special'], default: 'reading' },
  condition: {
    metric: { type: String, required: true },
    threshold: { type: Number, required: true },
  },
  points: { type: Number, default: 0 },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
}, { timestamps: true })

module.exports = mongoose.model('Achievement', AchievementSchema)
