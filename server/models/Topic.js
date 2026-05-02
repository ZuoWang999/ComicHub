const mongoose = require('mongoose')

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumCategory', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', default: null },
  views: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastReplyAt: { type: Date, default: Date.now },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true })

TopicSchema.index({ category: 1, lastReplyAt: -1 })
TopicSchema.index({ lastReplyAt: -1 })

module.exports = mongoose.model('Topic', TopicSchema)
