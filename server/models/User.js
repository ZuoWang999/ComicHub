const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 20 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comic' }],
  readingHistory: [{
    comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic' },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    readAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
  }],
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)
