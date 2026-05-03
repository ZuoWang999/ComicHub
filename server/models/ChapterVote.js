const mongoose = require('mongoose')

const ChapterVoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  expectMore: { type: Boolean, default: true },
  characterVote: { type: String, default: '' },
  comment: { type: String, maxlength: 500, default: '' },
}, { timestamps: true })

ChapterVoteSchema.index({ user: 1, chapter: 1 }, { unique: true })
ChapterVoteSchema.index({ comic: 1, createdAt: -1 })

module.exports = mongoose.model('ChapterVote', ChapterVoteSchema)
