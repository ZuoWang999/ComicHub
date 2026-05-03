const mongoose = require('mongoose')

const TagSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['content', 'community', 'character', 'demographic', 'genre', 'format', 'origin'], default: 'content' },
  icon: { type: String, default: '' },
  usageCount: { type: Number, default: 0 },
  color: { type: String, default: '#6366f1' },
  relatedTags: [{ type: String }],
}, { timestamps: true })

TagSchema.index({ name: 1, type: 1 }, { unique: true })
TagSchema.index({ usageCount: -1 })
TagSchema.index({ type: 1 })

module.exports = mongoose.model('Tag', TagSchema)
