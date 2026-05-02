require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User = require('./models/User')
const Comic = require('./models/Comic')
const Chapter = require('./models/Chapter')
const ForumCategory = require('./models/ForumCategory')
const Topic = require('./models/Topic')

const comics = [
  { title: '星辰变', author: '我吃西红柿', description: '一名少年，天生无法修炼内功。为了得到父亲重视，他毅然选择修炼痛苦艰难的外功。春去秋来，时光如梭，这个少年从对炼体一无所知，到成为星辰变的主人，穿梭于三界之间。', categories: ['奇幻', '热血', '动作'], tags: ['修仙', '少年漫'], status: '连载中' },
  { title: '斗破苍穹', author: '天蚕土豆', description: '萧炎，曾是家族百年一遇的修炼奇才，创造了萧家的修炼纪录。然而在他十一岁那年，却遭遇了人生最大的变故——实力骤降至斗之气三段，从天才沦为废柴。经历了嘲笑与冷落，他在纳戒中遇到了一个灵魂，从此踏上了一条逆天之路。', categories: ['玄幻', '热血', '冒险'], tags: ['战斗', '少年漫'], status: '已完结' },
  { title: '画江湖之杯莫停', author: '若森数字', description: '讲述了三个家族的恩怨情仇，主人公凭借自身努力，逐渐揭开重重迷雾的故事。', categories: ['动作', '悬疑', '热血'], tags: ['武侠', '国漫'], status: '连载中' },
  { title: '前任战争', author: '银魂次郎', description: '关于现代都市男女情感纠葛的爆笑喜剧，反转不断，笑中有泪。', categories: ['恋爱', '搞笑', '校园'], tags: ['都市', '喜剧'], status: '连载中' },
  { title: '暗黑之魂', author: '暗夜殇', description: '在这个被黑暗笼罩的世界，人类最后的希望寄托在一群拥有特殊能力的少年身上。他们被称为"魂师"，与来自深渊的怪物展开生死搏斗。', categories: ['奇幻', '悬疑', '动作'], tags: ['黑暗', '异能'], status: '连载中' },
  { title: '厨神之路', author: '饭桶大师', description: '一个对美食充满热爱的少年，踏上成为世界第一厨师的旅程。沿途收集各地食材，挑战各路厨艺高手，用料理温暖人心。', categories: ['治愈', '搞笑'], tags: ['美食', '日常'], status: '连载中' },
  { title: '星空下的约定', author: '月下独酌', description: '两个少年在星空下许下的约定，穿越了时间和空间。一场跨越星际的冒险，一段跨越种族的友情。', categories: ['科幻', '冒险'], tags: ['星际', '友情'], status: '已完结' },
  { title: '校园诡谈', author: '夜不语', description: '普通的高中生林晓，在一次意外中获得了看见鬼魂的能力。从此，他的校园生活变得不再平静。', categories: ['悬疑', '校园'], tags: ['灵异', '推理'], status: '连载中' },
]

const categories = [
  { name: '热血少年', description: '热血、战斗、成长类漫画', icon: '🔥', color: '#ef4444', comicCategory: '热血' },
  { name: '奇幻世界', description: '魔法、修仙、异世界题材', icon: '🧙', color: '#8b5cf6', comicCategory: '奇幻' },
  { name: '恋爱物语', description: '爱情、青春、甜蜜故事', icon: '💕', color: '#ec4899', comicCategory: '恋爱' },
  { name: '开心搞笑', description: '每日一笑，轻松一刻', icon: '😂', color: '#f59e0b', comicCategory: '搞笑' },
  { name: '悬疑推理', description: '烧脑迷宫，真相只有一个', icon: '🔍', color: '#6366f1', comicCategory: '悬疑' },
  { name: '科幻未来', description: '星辰大海，未来世界', icon: '🚀', color: '#06b6d4', comicCategory: '科幻' },
  { name: '青春校园', description: '教室里的青春故事', icon: '📘', color: '#22c55e', comicCategory: '校园' },
  { name: '精彩动作', description: '拳拳到肉，刀光剑影', icon: '⚔️', color: '#f97316', comicCategory: '动作' },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  const existing = await User.findOne({ email: 'admin@comichub.com' })
  let admin
  if (!existing) {
    admin = await User.create({
      username: '管理员',
      email: 'admin@comichub.com',
      password: 'admin123',
      role: 'admin',
      avatar: '',
    })
    console.log('Admin created:', admin.email)
  } else {
    admin = existing
    admin.role = 'admin'
    await admin.save()
    console.log('Admin updated:', admin.email)
  }

  await Comic.deleteMany({})
  await Chapter.deleteMany({})
  await ForumCategory.deleteMany({})
  await Topic.deleteMany({})
  console.log('Old data cleared')

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#06b6d4', '#22c55e', '#f97316']
  const createdComics = []
  const fs = require('fs')
  const path = require('path')

  for (let i = 0; i < comics.length; i++) {
    const c = comics[i]
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
  <rect width="300" height="400" fill="${colors[i]}"/>
  <text x="150" y="180" text-anchor="middle" font-size="28" fill="white" font-family="sans-serif" font-weight="bold">${c.title}</text>
  <text x="150" y="220" text-anchor="middle" font-size="16" fill="rgba(255,255,255,0.8)" font-family="sans-serif">${c.author}</text>
  <rect x="50" y="250" width="200" height="80" rx="10" fill="rgba(255,255,255,0.2)"/>
  <text x="150" y="295" text-anchor="middle" font-size="14" fill="white" font-family="sans-serif">${c.status}</text>
</svg>`
    const coverDir = path.join(__dirname, 'uploads', 'covers')
    if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true })
    const coverFile = `cover_${i}.svg`
    fs.writeFileSync(path.join(coverDir, coverFile), svg)

    const comic = await Comic.create({
      ...c,
      cover: `/uploads/covers/${coverFile}`,
      views: Math.floor(Math.random() * 50000) + 1000,
      rating: (Math.random() * 2 + 3).toFixed(1),
      ratingCount: Math.floor(Math.random() * 500) + 10,
      createdBy: admin._id,
    })
    createdComics.push(comic)

    const chCount = Math.floor(Math.random() * 5) + 3
    for (let j = 1; j <= chCount; j++) {
      const pages = []
      for (let k = 1; k <= 4; k++) {
        const pageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
  <rect width="800" height="1200" fill="white"/>
  <rect x="50" y="40" width="700" height="1120" fill="${colors[i]}22" rx="8"/>
  <text x="400" y="300" text-anchor="middle" font-size="32" fill="${colors[i]}" font-family="sans-serif" font-weight="bold">${comic.title}</text>
  <text x="400" y="360" text-anchor="middle" font-size="24" fill="#666" font-family="sans-serif">第${j}话 第${k}页</text>
  <rect x="100" y="420" width="600" height="400" fill="${colors[i]}11" rx="8"/>
  <text x="400" y="640" text-anchor="middle" font-size="20" fill="#999" font-family="sans-serif">[ 示例内容 - 漫画画面 ]</text>
</svg>`
        const chDir = path.join(__dirname, 'uploads', 'chapters')
        if (!fs.existsSync(chDir)) fs.mkdirSync(chDir, { recursive: true })
        const pageFile = `ch_${i}_${j}_${k}.svg`
        fs.writeFileSync(path.join(chDir, pageFile), pageSvg)
        pages.push(`/uploads/chapters/${pageFile}`)
      }
      await Chapter.create({
        comic: comic._id,
        title: `第${j}话`,
        number: j,
        pages,
        views: Math.floor(Math.random() * 10000) + 100,
      })
    }
    console.log(`Comic: ${comic.title} (${chCount} 话)`)
  }

  const createdCategories = []
  for (const cat of categories) {
    const c = await ForumCategory.create(cat)
    createdCategories.push(c)
    console.log('Category:', cat.name)
  }

  const sampleTopics = [
    { title: '星辰变最新话太精彩了！', content: '这反转真是让人意想不到，作者的功力越来越深了。大家觉得接下来会怎么发展？', categoryIdx: 1, comicIdx: 0 },
    { title: '斗破苍穹大结局感想', content: '追了这么多年终于完结了，虽然结局有遗憾，但还是一部神作！各位道友怎么看？', categoryIdx: 1, comicIdx: 1 },
    { title: '推荐类似星辰变的漫画', content: '刚刚入坑星辰变，太对胃口了！求推荐类似的修仙题材漫画。', categoryIdx: 1, comicIdx: 0 },
    { title: '校园诡谈吓死我了', content: '半夜看这个真顶不住，但又停不下来...有没有同感的？', categoryIdx: 4, comicIdx: 7 },
    { title: '厨神之路看得我好饿', content: '每话都在深夜更新的，每次看完都得去冰箱找吃的，这漫画有毒！', categoryIdx: 3, comicIdx: 5 },
    { title: '画江湖新人物分析', content: '新出场这个角色不简单，我怀疑他是最终BOSS的伪装。仔细看他第二话第三页的眼神，和主线剧情里提到的那个人太像了。', categoryIdx: 4, comicIdx: 2 },
    { title: '暗黑之魂的战斗分镜绝了', content: '最新一话的打斗场面分镜太燃了，这画师绝对是科班出身。逐帧分析一下各招式的设计思路...', categoryIdx: 0, comicIdx: 4 },
    { title: '星空下的约定催泪弹', content: '最后一话的告别场景看哭了，这不是一部简单的科幻漫，是关于约定和等待的故事。', categoryIdx: 5, comicIdx: 6 },
  ]

  for (const t of sampleTopics) {
    await Topic.create({
      title: t.title,
      content: t.content,
      category: createdCategories[t.categoryIdx]._id,
      user: admin._id,
      comic: createdComics[t.comicIdx]._id,
      views: Math.floor(Math.random() * 2000) + 100,
      replyCount: Math.floor(Math.random() * 30) + 1,
      lastReplyAt: new Date(),
      likes: [admin._id],
    })
  }
  console.log('Topics created:', sampleTopics.length)

  console.log('\n=== 示例数据创建完成 ===')
  console.log('管理员账号: admin@comichub.com')
  console.log('管理员密码: admin123')
  console.log(`漫画数量: ${createdComics.length}`)
  console.log(`社区版块: ${createdCategories.length}`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
