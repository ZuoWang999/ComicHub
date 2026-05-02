const express = require('express')
const Comic = require('../models/Comic')
const { auth, adminAuth } = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, tag, search, sort = '-updatedAt' } = req.query
    const query = {}
    if (category) query.categories = category
    if (status) query.status = status
    if (tag) query.tags = tag
    if (search) {
      query.$text = { $search: search }
    }
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [comics, total] = await Promise.all([
      Comic.find(query).sort(sort).skip(skip).limit(parseInt(limit)).populate('createdBy', 'username'),
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
    const categories = await Comic.distinct('categories')
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: '获取分类失败' })
  }
})

router.get('/hot', async (req, res) => {
  try {
    const comics = await Comic.find().sort({ views: -1 }).limit(10).populate('createdBy', 'username')
    res.json(comics)
  } catch (error) {
    res.status(500).json({ message: '获取热门漫画失败' })
  }
})

router.get('/latest', async (req, res) => {
  try {
    const comics = await Comic.find().sort({ updatedAt: -1 }).limit(10).populate('createdBy', 'username')
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
    ).populate('createdBy', 'username')
    if (!comic) {
      return res.status(404).json({ message: '漫画不存在' })
    }
    res.json(comic)
  } catch (error) {
    res.status(500).json({ message: '获取漫画详情失败' })
  }
})

router.post('/', adminAuth, upload.single('cover'), async (req, res) => {
  try {
    const { title, author, description, categories, tags, status } = req.body
    const cover = req.file ? `/uploads/covers/${req.file.filename}` : ''
    const parsedCategories = typeof categories === 'string' ? categories.split(',').map(c => c.trim()) : categories
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags

    const comic = await Comic.create({
      title, author, description, cover,
      categories: parsedCategories || [],
      tags: parsedTags || [],
      status, createdBy: req.user._id,
    })
    res.status(201).json(comic)
  } catch (error) {
    res.status(500).json({ message: '创建漫画失败', error: error.message })
  }
})

router.put('/:id', adminAuth, upload.single('cover'), async (req, res) => {
  try {
    const { title, author, description, categories, tags, status } = req.body
    const updateData = { title, author, description, status }
    if (categories) updateData.categories = typeof categories === 'string' ? categories.split(',').map(c => c.trim()) : categories
    if (tags) updateData.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags
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
