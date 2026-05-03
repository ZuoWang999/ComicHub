const express = require('express')
const Tag = require('../models/Tag')
const { adminAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { type, limit = 50 } = req.query
    const query = {}
    if (type) query.type = type
    const tags = await Tag.find(query).sort({ usageCount: -1 }).limit(parseInt(limit))
    res.json(tags)
  } catch (error) {
    res.status(500).json({ message: '获取标签失败' })
  }
})

router.get('/hot', async (req, res) => {
  try {
    const { type } = req.query
    const query = {}
    if (type) query.type = type
    const tags = await Tag.find(query).sort({ usageCount: -1 }).limit(30)
    res.json(tags)
  } catch (error) {
    res.status(500).json({ message: '获取热门标签失败' })
  }
})

router.post('/batch', adminAuth, async (req, res) => {
  try {
    const { tags } = req.body
    const results = []
    for (const tag of tags) {
      const existing = await Tag.findOneAndUpdate(
        { name: tag.name, type: tag.type },
        { $setOnInsert: tag, $inc: { usageCount: 0 } },
        { upsert: true, new: true }
      )
      results.push(existing)
    }
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: '创建标签失败' })
  }
})

router.post('/:tagName/use', async (req, res) => {
  try {
    const tag = await Tag.findOneAndUpdate(
      { name: req.params.tagName },
      { $inc: { usageCount: 1 } },
      { new: true, upsert: true }
    )
    res.json(tag)
  } catch (error) {
    res.status(500).json({ message: '更新标签失败' })
  }
})

module.exports = router
