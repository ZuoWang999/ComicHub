const express = require('express')
const RookieWork = require('../models/RookieWork')
const User = require('../models/User')
const { auth, adminAuth } = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, sort = '-hotScore' } = req.query
    const query = {}
    if (status) query.status = status
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [works, total] = await Promise.all([
      RookieWork.find(query).sort(sort).skip(skip).limit(parseInt(limit)).populate('authorId', 'username avatar'),
      RookieWork.countDocuments(query),
    ])
    res.json({ works, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    res.status(500).json({ message: '获取投稿列表失败' })
  }
})

router.get('/featured', async (req, res) => {
  try {
    const works = await RookieWork.find({ status: 'featured' }).sort({ hotScore: -1 }).limit(12).populate('authorId', 'username avatar')
    res.json(works)
  } catch (error) {
    res.status(500).json({ message: '获取推荐作品失败' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const work = await RookieWork.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('authorId', 'username avatar badges identity')
    if (!work) return res.status(404).json({ message: '作品不存在' })
    work.calcHotScore()
    await work.save()
    res.json(work)
  } catch (error) {
    res.status(500).json({ message: '获取作品失败' })
  }
})

router.post('/', auth, upload.array('pages', 100), async (req, res) => {
  try {
    const { title, author, description, categories, contentTags } = req.body
    const pages = req.files ? req.files.map(f => `/uploads/rookie/${f.filename}`) : []

    const work = await RookieWork.create({
      title, author: author || req.user.username, description,
      categories: typeof categories === 'string' ? categories.split(',').map(c => c.trim()) : categories,
      contentTags: typeof contentTags === 'string' ? contentTags.split(',').map(t => t.trim()) : contentTags,
      pages, authorId: req.user._id,
    })
    const cover = pages.length > 0 ? pages[0] : ''
    if (cover) { work.cover = cover; await work.save() }
    res.status(201).json(work)
  } catch (error) {
    res.status(500).json({ message: '投稿失败' })
  }
})

router.post('/:id/vote', auth, async (req, res) => {
  try {
    const work = await RookieWork.findById(req.params.id)
    if (!work) return res.status(404).json({ message: '作品不存在' })
    const idx = work.voters.indexOf(req.user._id)
    if (idx === -1) {
      work.voters.push(req.user._id)
      work.votes += 1
    } else {
      work.voters.splice(idx, 1)
      work.votes = Math.max(0, work.votes - 1)
    }
    work.calcHotScore()
    await work.save()
    res.json({ votes: work.votes, isVoted: idx === -1 })
  } catch (error) {
    res.status(500).json({ message: '投票失败' })
  }
})

router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body
    if (!rating) return res.status(400).json({ message: '请评分' })
    const work = await RookieWork.findById(req.params.id)
    if (!work) return res.status(404).json({ message: '作品不存在' })
    work.rating = (work.rating * work.ratingCount + parseInt(rating)) / (work.ratingCount + 1)
    work.ratingCount += 1
    work.calcHotScore()
    await work.save()
    res.json({ rating: work.rating, ratingCount: work.ratingCount })
  } catch (error) {
    res.status(500).json({ message: '评分失败' })
  }
})

router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, editorNotes } = req.body
    const work = await RookieWork.findByIdAndUpdate(req.params.id, { status, editorNotes }, { new: true })
    if (status === 'signed') {
      await User.findByIdAndUpdate(work.authorId, { identity: 'creator' })
    }
    res.json(work)
  } catch (error) {
    res.status(500).json({ message: '更新状态失败' })
  }
})

module.exports = router
