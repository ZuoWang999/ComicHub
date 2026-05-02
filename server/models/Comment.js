const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
  comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', required: true, index: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true })

module.exports = mongoose.model('Comment', CommentSchema)
