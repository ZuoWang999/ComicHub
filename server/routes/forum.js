const express = require('express')
const ForumCategory = require('../models/ForumCategory')
const Topic = require('../models/Topic')
const Reply = require('../models/Reply')
const { auth, adminAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/categories', async (req, res) => {
  try {
    const categories = await ForumCategory.find().sort({ sortOrder: 1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: '获取版块失败' })
  }
})

router.post('/categories', adminAuth, async (req, res) => {
  try {
    const { name, description, icon, sortOrder, color, comicCategory } = req.body
    const category = await ForumCategory.create({ name, description, icon, sortOrder, color, comicCategory })
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: '创建版块失败' })
  }
})

router.get('/topics', async (req, res) => {
  try {
    const { category, page = 1, limit = 20, sort = '-lastReplyAt', comic } = req.query
    const query = {}
    if (category) query.category = category
    if (comic) query.comic = comic
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [topics, total] = await Promise.all([
      Topic.find(query).sort(sort).skip(skip).limit(parseInt(limit)).populate('user', 'username avatar').populate('category', 'name').populate('comic', 'title'),
      Topic.countDocuments(query),
    ])
    res.json({ topics, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    res.status(500).json({ message: '获取帖子列表失败' })
  }
})

router.get('/topics/hot', async (req, res) => {
  try {
    const topics = await Topic.find().sort({ replyCount: -1, lastReplyAt: -1 }).limit(10).populate('user', 'username avatar').populate('category', 'name').populate('comic', 'title')
    res.json(topics)
  } catch (error) {
    res.status(500).json({ message: '获取热门帖子失败' })
  }
})

router.get('/topics/:id', async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('user', 'username avatar').populate('category', 'name').populate('comic', 'title cover')
    if (!topic) return res.status(404).json({ message: '帖子不存在' })
    res.json(topic)
  } catch (error) {
    res.status(500).json({ message: '获取帖子失败' })
  }
})

router.post('/topics', auth, async (req, res) => {
  try {
    const { title, content, categoryId, comicId } = req.body
    if (!title || !content || !categoryId) {
      return res.status(400).json({ message: '请填写标题、内容和版块' })
    }
    const topic = await Topic.create({
      title, content,
      category: categoryId,
      user: req.user._id,
      comic: comicId || null,
    })
    await ForumCategory.findByIdAndUpdate(categoryId, { $inc: { topicCount: 1 } })
    const populated = await topic.populate(['user', 'category', 'comic'])
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: '发帖失败' })
  }
})

router.put('/topics/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
    if (!topic) return res.status(404).json({ message: '帖子不存在' })
    if (topic.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权编辑' })
    }
    const { title, content } = req.body
    if (title) topic.title = title
    if (content) topic.content = content
    await topic.save()
    res.json(topic)
  } catch (error) {
    res.status(500).json({ message: '编辑失败' })
  }
})

router.delete('/topics/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
    if (!topic) return res.status(404).json({ message: '帖子不存在' })
    if (topic.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除' })
    }
    await Reply.deleteMany({ topic: topic._id })
    await ForumCategory.findByIdAndUpdate(topic.category, { $inc: { topicCount: -1 } })
    await Topic.findByIdAndDelete(req.params.id)
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ message: '删除失败' })
  }
})

router.post('/topics/:id/like', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
    if (!topic) return res.status(404).json({ message: '帖子不存在' })
    const idx = topic.likes.indexOf(req.user._id)
    if (idx === -1) {
      topic.likes.push(req.user._id)
    } else {
      topic.likes.splice(idx, 1)
    }
    await topic.save()
    res.json({ likes: topic.likes.length, isLiked: idx === -1 })
  } catch (error) {
    res.status(500).json({ message: '操作失败' })
  }
})

router.get('/topics/:id/replies', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const [replies, total] = await Promise.all([
      Reply.find({ topic: req.params.id }).sort({ createdAt: 1 }).skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit)).populate('user', 'username avatar'),
      Reply.countDocuments({ topic: req.params.id }),
    ])
    res.json({ replies, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    res.status(500).json({ message: '获取回复失败' })
  }
})

router.post('/topics/:id/replies', auth, async (req, res) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ message: '请输入回复内容' })
    const topic = await Topic.findById(req.params.id)
    if (!topic) return res.status(404).json({ message: '帖子不存在' })
    const reply = await Reply.create({ topic: req.params.id, user: req.user._id, content })
    topic.replyCount += 1
    topic.lastReplyAt = new Date()
    await topic.save()
    const populated = await reply.populate('user', 'username avatar')
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: '回复失败' })
  }
})

router.delete('/replies/:id', auth, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id)
    if (!reply) return res.status(404).json({ message: '回复不存在' })
    if (reply.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除' })
    }
    await Reply.findByIdAndDelete(req.params.id)
    await Topic.findByIdAndUpdate(reply.topic, { $inc: { replyCount: -1 } })
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ message: '删除失败' })
  }
})

router.post('/replies/:id/like', auth, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id)
    if (!reply) return res.status(404).json({ message: '回复不存在' })
    const idx = reply.likes.indexOf(req.user._id)
    if (idx === -1) {
      reply.likes.push(req.user._id)
    } else {
      reply.likes.splice(idx, 1)
    }
    await reply.save()
    res.json({ likes: reply.likes.length, isLiked: idx === -1 })
  } catch (error) {
    res.status(500).json({ message: '操作失败' })
  }
})

module.exports = router
