const mongoose = require('mongoose')

const UserAchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', required: true },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  earnedAt: { type: Date },
}, { timestamps: true })

UserAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true })

module.exports = mongoose.model('UserAchievement', UserAchievementSchema)
