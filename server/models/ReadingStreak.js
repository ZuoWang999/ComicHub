const mongoose = require('mongoose')

const ReadingStreakSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  chaptersRead: { type: Number, default: 0 },
}, { timestamps: true })

ReadingStreakSchema.index({ user: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('ReadingStreak', ReadingStreakSchema)
