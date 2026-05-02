const express = require('express')
const Comment = require('../models/Comment')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.get('/comic/:comicId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const [comments, total] = await Promise.all([
      Comment.find({ comic: req.params.comicId, chapter: null })
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('user', 'username avatar'),
      Comment.countDocuments({ comic: req.params.comicId, chapter: null }),
    ])
    res.json({ comments, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    res.status(500).json({ message: '获取评论失败' })
  }
})

router.get('/chapter/:chapterId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const [comments, total] = await Promise.all([
      Comment.find({ chapter: req.params.chapterId })
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('user', 'username avatar'),
      Comment.countDocuments({ chapter: req.params.chapterId }),
    ])
    res.json({ comments, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    res.status(500).json({ message: '获取评论失败' })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const { comicId, chapterId, content } = req.body
    if (!content || !comicId) {
      return res.status(400).json({ message: '请填写评论内容' })
    }
    const comment = await Comment.create({
      comic: comicId,
      chapter: chapterId || null,
      user: req.user._id,
      content,
    })
    const populated = await comment.populate('user', 'username avatar')
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: '评论失败' })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ message: '评论不存在' })
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除' })
    }
    await Comment.findByIdAndDelete(req.params.id)
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ message: '删除失败' })
  }
})

module.exports = router
