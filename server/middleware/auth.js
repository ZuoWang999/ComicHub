const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: '请先登录' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: '用户不存在' })
    }
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: '认证失败，请重新登录' })
  }
}

const adminAuth = async (req, res, next) => {
  await auth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' })
    }
    next()
  })
}

module.exports = { auth, adminAuth }
