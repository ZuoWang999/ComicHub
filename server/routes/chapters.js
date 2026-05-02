const express = require('express')
const Chapter = require('../models/Chapter')
const Comic = require('../models/Comic')
const { auth, adminAuth } = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

router.get('/comic/:comicId', async (req, res) => {
  try {
    const chapters = await Chapter.find({ comic: req.params.comicId }).sort({ number: 1 }).select('-pages')
    res.json(chapters)
  } catch (error) {
    res.status(500).json({ message: '获取章节列表失败' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    ).populate('comic', 'title cover')
    if (!chapter) {
      return res.status(404).json({ message: '章节不存在' })
    }
    const prevChapter = await Chapter.findOne({ comic: chapter.comic._id, number: chapter.number - 1 }).select('_id title number')
    const nextChapter = await Chapter.findOne({ comic: chapter.comic._id, number: chapter.number + 1 }).select('_id title number')
    res.json({ chapter, prevChapter, nextChapter })
  } catch (error) {
    res.status(500).json({ message: '获取章节失败' })
  }
})

router.post('/', adminAuth, upload.array('pages', 100), async (req, res) => {
  try {
    const { comicId, title, number } = req.body
    const pages = req.files ? req.files.map(f => `/uploads/chapters/${f.filename}`) : []
    const chapter = await Chapter.create({ comic: comicId, title, number: parseInt(number), pages })
    await Comic.findByIdAndUpdate(comicId, { $inc: { views: 0 } }, { timestamps: true })
    res.status(201).json(chapter)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: '该章节号已存在' })
    }
    res.status(500).json({ message: '创建章节失败', error: error.message })
  }
})

router.put('/:id', adminAuth, upload.array('pages', 100), async (req, res) => {
  try {
    const { title, number } = req.body
    const updateData = {}
    if (title) updateData.title = title
    if (number) updateData.number = parseInt(number)
    if (req.files && req.files.length > 0) {
      updateData.pages = req.files.map(f => `/uploads/chapters/${f.filename}`)
    }
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!chapter) return res.status(404).json({ message: '章节不存在' })
    res.json(chapter)
  } catch (error) {
    res.status(500).json({ message: '更新章节失败' })
  }
})

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id)
    if (!chapter) return res.status(404).json({ message: '章节不存在' })
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ message: '删除失败' })
  }
})

router.put('/:id/read', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
    if (!chapter) return res.status(404).json({ message: '章节不存在' })
    const user = req.user
    const historyEntry = user.readingHistory.find(h => h.comic.toString() === chapter.comic.toString())
    if (historyEntry) {
      historyEntry.chapter = chapter._id
      historyEntry.readAt = new Date()
      historyEntry.progress = req.body.progress || 0
    } else {
      user.readingHistory.push({ comic: chapter.comic, chapter: chapter._id, progress: req.body.progress || 0 })
    }
    await user.save()
    res.json({ message: '阅读进度已保存' })
  } catch (error) {
    res.status(500).json({ message: '保存进度失败' })
  }
})

module.exports = router
