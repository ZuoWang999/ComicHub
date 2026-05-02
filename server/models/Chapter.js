const mongoose = require('mongoose')

const ChapterSchema = new mongoose.Schema({
  comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', required: true, index: true },
  title: { type: String, required: true, trim: true },
  number: { type: Number, required: true },
  pages: [{ type: String }],
  views: { type: Number, default: 0 },
}, { timestamps: true })

ChapterSchema.index({ comic: 1, number: 1 }, { unique: true })

module.exports = mongoose.model('Chapter', ChapterSchema)
