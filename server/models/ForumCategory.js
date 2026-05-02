const mongoose = require('mongoose')

const ForumCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '📚' },
  sortOrder: { type: Number, default: 0 },
  topicCount: { type: Number, default: 0 },
  color: { type: String, default: '#6366f1' },
  comicCategory: { type: String, trim: true },
}, { timestamps: true })

module.exports = mongoose.model('ForumCategory', ForumCategorySchema)
