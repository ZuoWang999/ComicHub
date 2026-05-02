const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { auth } = require('../middleware/auth')

const router = express.Router()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ message: '请填写所有必填字段' })
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已被注册' })
    }
    const user = await User.create({ username, email, password })
    const token = generateToken(user._id)
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role },
    })
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: '请输入邮箱和密码' })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: '邮箱或密码错误' })
    }
    const token = generateToken(user._id)
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role },
    })
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message })
  }
})

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user })
})

router.put('/profile', auth, async (req, res) => {
  try {
    const { username, avatar } = req.body
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: req.user._id } })
      if (existing) return res.status(400).json({ message: '用户名已被使用' })
      req.user.username = username
    }
    if (avatar !== undefined) req.user.avatar = avatar
    await req.user.save()
    res.json({ user: req.user })
  } catch (error) {
    res.status(500).json({ message: '更新失败', error: error.message })
  }
})

module.exports = router
