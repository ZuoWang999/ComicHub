const express = require('express')
const User = require('../models/User')
const Achievement = require('../models/Achievement')
const UserAchievement = require('../models/UserAchievement')
const ReadingStreak = require('../models/ReadingStreak')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('stats badges')
  const today = new Date().toISOString().split('T')[0]
  const streak = await ReadingStreak.findOne({ user: req.user._id, date: today })
  let streakCount = 0
  if (streak) {
    let check = today
    for (let i = 0; i < 365; i++) {
      const s = await ReadingStreak.findOne({ user: req.user._id, date: check })
      if (s) { streakCount++ } else break
      const d = new Date(check); d.setDate(d.getDate() - 1); check = d.toISOString().split('T')[0]
    }
  }
  const achievements = await UserAchievement.find({ user: req.user._id, completed: true }).populate('achievement')
  res.json({ stats: user.stats, badges: user.badges, streakCount, achievements })
})

router.post('/checkin', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  let streak = await ReadingStreak.findOne({ user: req.user._id, date: today })
  if (streak) return res.json({ message: '今日已打卡', streak })
  streak = await ReadingStreak.create({ user: req.user._id, date: today, chaptersRead: 0 })

  let streakCount = 1
  let check = today
  for (let i = 0; i < 365; i++) {
    const d = new Date(check); d.setDate(d.getDate() - 1); check = d.toISOString().split('T')[0]
    const s = await ReadingStreak.findOne({ user: req.user._id, date: check })
    if (s) streakCount++; else break
  }

  const points = Math.min(streakCount * 5, 50)
  req.user.stats.totalRead += 1
  await req.user.save()

  await checkAchievements(req.user._id, 'checkin', streakCount)

  res.json({ message: '打卡成功', points, streakCount })
})

router.post('/read/:chapterId', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  let streak = await ReadingStreak.findOne({ user: req.user._id, date: today })
  if (streak) {
    streak.chaptersRead += 1
  } else {
    streak = await ReadingStreak.create({ user: req.user._id, date: today, chaptersRead: 1 })
  }
  await streak.save()

  req.user.stats.totalRead += 1
  await req.user.save()

  await checkAchievements(req.user._id, 'chaptersRead', req.user.stats.totalRead)

  res.json({ points: 2, totalRead: req.user.stats.totalRead })
})

async function checkAchievements(userId, metric, value) {
  const achievements = await Achievement.find({ 'condition.metric': metric, 'condition.threshold': { $lte: value } })
  for (const a of achievements) {
    let ua = await UserAchievement.findOne({ user: userId, achievement: a._id })
    if (!ua) {
      ua = await UserAchievement.create({ user: userId, achievement: a._id, progress: value })
    }
    if (!ua.completed) {
      ua.progress = value
      if (value >= a.condition.threshold) {
        ua.completed = true
        ua.earnedAt = new Date()
        await User.findByIdAndUpdate(userId, { $addToSet: { badges: a.name }, $inc: { 'stats.totalRead': 0 } })
      }
      await ua.save()
    }
  }
}

module.exports = router
