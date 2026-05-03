const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 20 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'editor'], default: 'user' },
  identity: { type: String, enum: ['reader', 'creator', 'both'], default: 'reader' },
  badges: [{ type: String }],
  bio: { type: String, maxlength: 200, default: '' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comic' }],
  follows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comic' }],
  readingHistory: [{
    comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic' },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    readAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
  }],
  stats: {
    totalRead: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    joinDays: { type: Number, default: 0 },
  },
  creatorProfile: {
    publishedWorks: { type: Number, default: 0 },
    totalUpdates: { type: Number, default: 0 },
    totalFans: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
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
