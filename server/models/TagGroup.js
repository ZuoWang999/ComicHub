const mongoose = require('mongoose')

const TagGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['demographic', 'genre', 'format', 'origin', 'status'], required: true },
  icon: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  description: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('TagGroup', TagGroupSchema)
