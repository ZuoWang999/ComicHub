const mongoose = require('mongoose')

const ComicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  cover: { type: String, default: '' },
  author: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  categories: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  status: { type: String, enum: ['连载中', '已完结'], default: '连载中' },
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

ComicSchema.index({ title: 'text', author: 'text', description: 'text' })
ComicSchema.index({ categories: 1 })
ComicSchema.index({ status: 1 })
ComicSchema.index({ views: -1 })
ComicSchema.index({ updatedAt: -1 })

module.exports = mongoose.model('Comic', ComicSchema)
