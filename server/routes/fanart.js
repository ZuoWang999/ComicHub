const express = require('express')
const Fanart = require('../models/Fanart')
const { auth, adminAuth } = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

router.get('/comic/:comicId', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [fanarts, total] = await Promise.all([
      Fanart.find({ comic: req.params.comicId }).sort(sort).skip(skip).limit(parseInt(limit)).populate('userId', 'username avatar'),
      Fanart.countDocuments({ comic: req.params.comicId }),
    ])
    res.json({ fanarts, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    res.status(500).json({ message: '获取同人作品失败' })
  }
})

router.get('/featured', async (req, res) => {
  try {
    const fanarts = await Fanart.find({ featured: true }).sort({ likeCount: -1 }).limit(20).populate('userId', 'username avatar').populate('comic', 'title cover')
    res.json(fanarts)
  } catch (error) {
    res.status(500).json({ message: '获取精选同人失败' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const fanart = await Fanart.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('userId', 'username avatar').populate('comic', 'title cover')
    if (!fanart) return res.status(404).json({ message: '作品不存在' })
    res.json(fanart)
  } catch (error) {
    res.status(500).json({ message: '获取同人作品失败' })
  }
})

router.post('/', auth, upload.array('images', 20), async (req, res) => {
  try {
    const { title, comicId, description, tags } = req.body
    const images = req.files ? req.files.map(f => `/uploads/fanart/${f.filename}`) : []
    if (images.length === 0) return res.status(400).json({ message: '请上传图片' })
    const fanart = await Fanart.create({
      title, author: req.user.username,
      userId: req.user._id, comic: comicId,
      images, description,
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags,
    })
    res.status(201).json(fanart)
  } catch (error) {
    res.status(500).json({ message: '上传失败' })
  }
})

router.post('/:id/like', auth, async (req, res) => {
  try {
    const fanart = await Fanart.findById(req.params.id)
    if (!fanart) return res.status(404).json({ message: '作品不存在' })
    const idx = fanart.likes.indexOf(req.user._id)
    if (idx === -1) {
      fanart.likes.push(req.user._id); fanart.likeCount += 1
    } else {
      fanart.likes.splice(idx, 1); fanart.likeCount = Math.max(0, fanart.likeCount - 1)
    }
    await fanart.save()
    res.json({ likes: fanart.likeCount, isLiked: idx === -1 })
  } catch (error) {
    res.status(500).json({ message: '操作失败' })
  }
})

router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const fanart = await Fanart.findByIdAndUpdate(req.params.id, { officialApproved: true, featured: true }, { new: true })
    res.json(fanart)
  } catch (error) {
    res.status(500).json({ message: '操作失败' })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const fanart = await Fanart.findById(req.params.id)
    if (!fanart) return res.status(404).json({ message: '作品不存在' })
    if (fanart.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除' })
    }
    await Fanart.findByIdAndDelete(req.params.id)
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ message: '删除失败' })
  }
})

module.exports = router
