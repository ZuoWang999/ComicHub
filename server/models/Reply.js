const mongoose = require('mongoose')

const ReplySchema = new mongoose.Schema({
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 5000 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

module.exports = mongoose.model('Reply', ReplySchema)
