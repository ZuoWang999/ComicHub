const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = file.fieldname === 'cover' ? 'covers' : 'chapters'
    const dir = path.join(uploadDir, subDir)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('仅支持 JPEG/PNG/WebP/GIF 格式'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
})

module.exports = upload
