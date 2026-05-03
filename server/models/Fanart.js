const mongoose = require('mongoose')

const FanartSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', required: true, index: true },
  images: [{ type: String }],
  description: { type: String, default: '' },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  officialApproved: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
}, { timestamps: true })

FanartSchema.index({ comic: 1, createdAt: -1 })
FanartSchema.index({ likeCount: -1 })
FanartSchema.index({ featured: -1 })

module.exports = mongoose.model('Fanart', FanartSchema)
