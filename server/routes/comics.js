const express = require('express')
const Comic = require('../models/Comic')
const User = require('../models/User')
const { auth, adminAuth } = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, tag, schedule, search, sort = '-updatedAt', isNewcomer } = req.query
    const query = {}
    if (category) query.categories = category
    if (status) query.status = status
    if (tag) query.$or = [{ tags: tag }, { contentTags: tag }]
    if (schedule) query.schedule = schedule
    if (isNewcomer === 'true') query.isNewcomer = true
    if (search) {
      query.$text = { $search: search }
    }
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [comics, total] = await Promise.all([
      Comic.find(query).sort(sort).skip(skip).limit(parseInt(limit)).populate('createdBy', 'username avatar identity'),
      Comic.countDocuments(query),
    ])
    res.json({
      comics,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    })
  } catch (error) {
    res.status(500).json({ message: '获取漫画列表失败', error: error.message })
  }
})

router.get('/categories', async (req, res) => {
  try {
    const cats = await Comic.distinct('categories')
    res.json(cats)
  } catch (error) {
    res.status(500).json({ message: '获取分类失败' })
  }
})

router.get('/hot', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15
    const comics = await Comic.find().sort({ hotScore: -1 }).limit(limit).populate('createdBy', 'username avatar')
    res.json(comics)
  } catch (error) {
    res.status(500).json({ message: '获取热门漫画失败' })
  }
})

router.get('/rankings', async (req, res) => {
  try {
    const type = req.query.type || 'weekly'
    const limit = parseInt(req.query.limit) || 10
    let sortField = '-hotScore'
    if (type === 'weekly') sortField = '-weeklyVotes'
    else if (type === 'monthly') sortField = '-monthlyVotes'
    else if (type === 'newcomer') sortField = '-hotScore'
    else if (type === 'popular') sortField = '-followers'

    const query = {}
    if (type === 'newcomer') query.isNewcomer = true

    const comics = await Comic.find(query).sort(sortField).limit(limit).populate('createdBy', 'username avatar')
    res.json(comics)
  } catch (error) {
    res.status(500).json({ message: '获取排行榜失败' })
  }
})

router.get('/schedule', async (req, res) => {
  try {
    const schedules = ['周刊', '半月刊', '月刊', '不定期']
    const result = {}
    for (const s of schedules) {
      result[s] = await Comic.find({ schedule: s, status: '连载中' }).sort({ hotScore: -1 }).limit(5).populate('createdBy', 'username')
    }
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: '获取排期失败' })
  }
})

router.get('/latest', async (req, res) => {
  try {
    const comics = await Comic.find().sort({ updatedAt: -1 }).limit(12).populate('createdBy', 'username avatar')
    res.json(comics)
  } catch (error) {
    res.status(500).json({ message: '获取最新漫画失败' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const comic = await Comic.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    ).populate('createdBy', 'username avatar identity badges creatorProfile')
    if (!comic) {
      return res.status(404).json({ message: '漫画不存在' })
    }
    comic.calcHotScore()
    await comic.save()
    res.json(comic)
  } catch (error) {
    res.status(500).json({ message: '获取漫画详情失败' })
  }
})

router.post('/follow/:id', auth, async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id)
    if (!comic) return res.status(404).json({ message: '漫画不存在' })
    const idx = req.user.follows.indexOf(comic._id)
    if (idx === -1) {
      req.user.follows.push(comic._id)
      comic.followers += 1
    } else {
      req.user.follows.splice(idx, 1)
      comic.followers = Math.max(0, comic.followers - 1)
    }
    await req.user.save()
    await comic.save()
    res.json({ isFollowing: idx === -1, followers: comic.followers })
  } catch (error) {
    res.status(500).json({ message: '操作失败' })
  }
})

router.post('/', adminAuth, upload.single('cover'), async (req, res) => {
  try {
    const { title, author, description, categories, tags, contentTags, status, schedule, isNewcomer } = req.body
    const cover = req.file ? `/uploads/covers/${req.file.filename}` : ''
    const parsedCategories = typeof categories === 'string' ? categories.split(',').map(c => c.trim()) : categories
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags
    const parsedContentTags = typeof contentTags === 'string' ? contentTags.split(',').map(t => t.trim()) : contentTags

    const comic = await Comic.create({
      title, author, description, cover,
      categories: parsedCategories || [],
      tags: parsedTags || [],
      contentTags: parsedContentTags || [],
      status: status || '连载中',
      schedule: schedule || '不定期',
      isNewcomer: isNewcomer === 'true',
      createdBy: req.user._id,
      authorId: req.user._id,
    })
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'creatorProfile.publishedWorks': 1 } })
    res.status(201).json(comic)
  } catch (error) {
    res.status(500).json({ message: '创建漫画失败', error: error.message })
  }
})

router.put('/:id', adminAuth, upload.single('cover'), async (req, res) => {
  try {
    const { title, author, description, categories, tags, contentTags, status, schedule, isNewcomer } = req.body
    const updateData = { title, author, description, status, schedule }
    if (categories) updateData.categories = typeof categories === 'string' ? categories.split(',').map(c => c.trim()) : categories
    if (tags) updateData.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags
    if (contentTags) updateData.contentTags = typeof contentTags === 'string' ? contentTags.split(',').map(t => t.trim()) : contentTags
    if (isNewcomer) updateData.isNewcomer = isNewcomer === 'true'
    if (req.file) updateData.cover = `/uploads/covers/${req.file.filename}`

    const comic = await Comic.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!comic) return res.status(404).json({ message: '漫画不存在' })
    res.json(comic)
  } catch (error) {
    res.status(500).json({ message: '更新漫画失败', error: error.message })
  }
})

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const comic = await Comic.findByIdAndDelete(req.params.id)
    if (!comic) return res.status(404).json({ message: '漫画不存在' })
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ message: '删除失败' })
  }
})

module.exports = router
