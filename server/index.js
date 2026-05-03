require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')

const authRoutes = require('./routes/auth')
const comicsRoutes = require('./routes/comics')
const chaptersRoutes = require('./routes/chapters')
const commentsRoutes = require('./routes/comments')
const forumRoutes = require('./routes/forum')
const tagsRoutes = require('./routes/tags')
const votesRoutes = require('./routes/votes')
const rookieRoutes = require('./routes/rookie')
const fanartRoutes = require('./routes/fanart')
const pointsRoutes = require('./routes/points')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/comics', comicsRoutes)
app.use('/api/chapters', chaptersRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/forum', forumRoutes)
app.use('/api/tags', tagsRoutes)
app.use('/api/votes', votesRoutes)
app.use('/api/rookie', rookieRoutes)
app.use('/api/fanart', fanartRoutes)
app.use('/api/points', pointsRoutes)

const clientDist = path.join(__dirname, '..', 'client', 'dist')
app.use(express.static(clientDist, { setHeaders: (res) => { res.set('Cache-Control', 'no-cache, no-store, must-revalidate') } }))
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'))
  }
})

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
