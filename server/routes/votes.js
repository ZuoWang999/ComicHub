const express = require('express')
const ChapterVote = require('../models/ChapterVote')
const Comic = require('../models/Comic')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.post('/', auth, async (req, res) => {
  try {
    const { chapterId, comicId, rating, expectMore, characterVote, comment } = req.body
    if (!rating) return res.status(400).json({ message: '请评分' })

    let vote = await ChapterVote.findOne({ user: req.user._id, chapter: chapterId })
    if (vote) {
      vote.rating = rating
      if (expectMore !== undefined) vote.expectMore = expectMore
      if (characterVote) vote.characterVote = characterVote
      if (comment !== undefined) vote.comment = comment
      await vote.save()
    } else {
      vote = await ChapterVote.create({
        user: req.user._id,
        chapter: chapterId,
        comic: comicId,
        rating,
        expectMore: expectMore !== undefined ? expectMore : true,
        characterVote: characterVote || '',
        comment: comment || '',
      })
      await Comic.findByIdAndUpdate(comicId, {
        $inc: { totalVotes: 1, weeklyVotes: 1, monthlyVotes: 1 },
      })
    }
    const comic = await Comic.findById(comicId)
    if (comic) {
      comic.calcHotScore()
      await comic.save()
    }
    res.json(vote)
  } catch (error) {
    res.status(500).json({ message: '投票失败' })
  }
})

router.get('/chapter/:chapterId', async (req, res) => {
  try {
    const stats = await ChapterVote.aggregate([
      { $match: { chapter: new (require('mongoose').Types.ObjectId)(req.params.chapterId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 }, expectCount: { $sum: { $cond: ['$expectMore', 1, 0] } } } },
    ])
    const votes = await ChapterVote.find({ chapter: req.params.chapterId })
      .sort({ createdAt: -1 }).limit(20).populate('user', 'username avatar')
    res.json({ stats: stats[0] || { avgRating: 0, count: 0, expectCount: 0 }, votes })
  } catch (error) {
    res.status(500).json({ message: '获取投票失败' })
  }
})

router.get('/comic/:comicId/stats', async (req, res) => {
  try {
    const stats = await ChapterVote.aggregate([
      { $match: { comic: new (require('mongoose').Types.ObjectId)(req.params.comicId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalVotes: { $sum: 1 }, totalExpect: { $sum: { $cond: ['$expectMore', 1, 0] } } } },
    ])
    res.json(stats[0] || { avgRating: 0, totalVotes: 0, totalExpect: 0 })
  } catch (error) {
    res.status(500).json({ message: '获取统计失败' })
  }
})

module.exports = router
