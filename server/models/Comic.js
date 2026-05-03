const mongoose = require('mongoose')

const ComicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  cover: { type: String, default: '' },
  author: { type: String, required: true, trim: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  description: { type: String, default: '' },
  categories: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  contentTags: [{ type: String, trim: true }],
  status: { type: String, enum: ['连载中', '已完结', '休刊中'], default: '连载中' },
  schedule: { type: String, enum: ['周刊', '半月刊', '月刊', '不定期'], default: '不定期' },
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  weeklyVotes: { type: Number, default: 0 },
  monthlyVotes: { type: Number, default: 0 },
  hotScore: { type: Number, default: 0 },
  allowFanart: { type: Boolean, default: true },
  isNewcomer: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

ComicSchema.index({ title: 'text', author: 'text', description: 'text' })
ComicSchema.index({ categories: 1 })
ComicSchema.index({ status: 1 })
ComicSchema.index({ schedule: 1 })
ComicSchema.index({ views: -1 })
ComicSchema.index({ updatedAt: -1 })
ComicSchema.index({ hotScore: -1 })
ComicSchema.index({ weeklyVotes: -1 })
ComicSchema.index({ monthlyVotes: -1 })
ComicSchema.index({ followers: -1 })
ComicSchema.index({ isNewcomer: 1, hotScore: -1 })

ComicSchema.methods.calcHotScore = function () {
  const ageHours = (Date.now() - this.updatedAt) / 3600000
  const decay = Math.max(0.2, 1 - ageHours * 0.01)
  this.hotScore = Math.round(
    (this.weeklyVotes * 3 + this.monthlyVotes * 2 + this.views * 0.001 + this.followers * 0.5) * decay
  )
  return this.hotScore
}

module.exports = mongoose.model('Comic', ComicSchema)
