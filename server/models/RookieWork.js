const mongoose = require('mongoose')

const RookieWorkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' },
  cover: { type: String, default: '' },
  pages: [{ type: String }],
  categories: [{ type: String }],
  contentTags: [{ type: String }],
  status: { type: String, enum: ['pending', 'featured', 'rejected', 'signed'], default: 'pending' },
  votes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  hotScore: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  editorNotes: { type: String, default: '' },
  serialNumber: { type: Number },
}, { timestamps: true })

RookieWorkSchema.index({ status: 1, hotScore: -1 })
RookieWorkSchema.index({ authorId: 1 })
RookieWorkSchema.index({ createdAt: -1 })

RookieWorkSchema.methods.calcHotScore = function () {
  const ageHours = (Date.now() - this.createdAt) / 3600000
  const decay = Math.max(0.1, 1 - ageHours * 0.02)
  this.hotScore = Math.round((this.votes * 3 + this.rating * this.ratingCount * 2 + this.views * 0.01) * decay)
  return this.hotScore
}

module.exports = mongoose.model('RookieWork', RookieWorkSchema)
