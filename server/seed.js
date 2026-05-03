require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const User = require('./models/User')
const Comic = require('./models/Comic')
const Chapter = require('./models/Chapter')
const Tag = require('./models/Tag')
const ForumCategory = require('./models/ForumCategory')
const Topic = require('./models/Topic')
const ChapterVote = require('./models/ChapterVote')
const Achievement = require('./models/Achievement')
const RookieWork = require('./models/RookieWork')

const comicsData = [
  { title: '星辰变', author: '我吃西红柿', description: '一名少年，天生无法修炼内功。为得到父亲重视，他毅然选择修炼痛苦艰难的外功。从炼体到星辰变之主，穿梭三界的热血传奇。', categories: ['奇幻', '热血', '动作'], contentTags: ['修仙', '少年漫', '逆袭', '东方玄幻'], schedule: '周刊', isNewcomer: false },
  { title: '斗破苍穹', author: '天蚕土豆', description: '萧炎曾是家族修炼奇才，十一岁那年遭遇变故实力骤降，从天才沦为废柴。在纳戒中遇到灵魂导师，踏上逆天修炼之路。三十年河东三十年河西，莫欺少年穷！', categories: ['玄幻', '热血', '冒险'], contentTags: ['战斗', '励志', '逆袭', '异火'], schedule: '已完结', isNewcomer: false },
  { title: '画江湖之杯莫停', author: '若森数字', description: '三大隐世家族的恩怨情仇，主人公凭借自身努力，逐渐揭开重重迷雾。江湖恩仇，儿女情长，尽在杯中酒。', categories: ['动作', '悬疑', '热血'], contentTags: ['武侠', '国漫', '江湖', '权谋'], schedule: '半月刊', isNewcomer: false },
  { title: '前任战争', author: '银魂次郎', description: '现代都市男女情感纠葛的爆笑喜剧。霸总、奶狗、绿茶、女强人...当所有人汇集一间公司，每天都是修罗场。', categories: ['恋爱', '搞笑', '校园'], contentTags: ['都市', '喜剧', '霸总', '职场'], schedule: '周刊', isNewcomer: false },
  { title: '暗黑之魂', author: '暗夜殇', description: '被黑暗笼罩的世界，人类最后的希望寄托在一群拥有特殊能力的少年"魂师"身上。与深渊怪物的生死搏斗，人类存亡的终极之战。', categories: ['奇幻', '悬疑', '动作'], contentTags: ['黑暗', '异能', '克苏鲁', '末日'], schedule: '半月刊', isNewcomer: true },
  { title: '厨神之路', author: '饭桶大师', description: '热爱美食的少年踏上成为世界第一厨师的旅程。收集各地神秘食材，挑战各路厨艺高手，用料理温暖人心。食神，不只是会做菜。', categories: ['治愈', '搞笑'], contentTags: ['美食', '日常', '励志', '旅行'], schedule: '月刊', isNewcomer: true },
  { title: '星空下的约定', author: '月下独酌', description: '两个少年在星空下许下的约定穿越时空。一场跨越星际的冒险，一段跨越种族的友情。科学幻想与人文思考的完美融合。', categories: ['科幻', '冒险'], contentTags: ['星际', '友情', '硬核科幻', '机甲'], schedule: '已完结', isNewcomer: false },
  { title: '校园诡谈', author: '夜不语', description: '普通高中生林晓在一次意外中获得了看见鬼魂的能力。从此他的校园生活变得不再平静。日本的都市怪谈、中国的民间传说、西方的中世纪幽灵...校园暗角，秘密丛生。', categories: ['悬疑', '校园'], contentTags: ['灵异', '推理', '恐怖', '单元剧'], schedule: '周刊', isNewcomer: false },
  { title: '破晓黎明', author: '晴空万里', description: '末日之后的人类聚落中，少女艾琳发现了一本记载着旧世界科技的日记。她要带领族人在废土之上重建文明，对抗变种生物和人类中的野心家。', categories: ['科幻', '冒险', '热血'], contentTags: ['末日', '生存', '少女主角', '废土'], schedule: '周刊', isNewcomer: true },
  { title: '妖神记', author: '发飙的蜗牛·漫画版', description: '这是一个妖灵的世界。重生回到少时的聂离，决心改变一切。前世的遗憾，今生的约定。他要变得更强，守护他珍视的人。', categories: ['奇幻', '热血', '冒险'], contentTags: ['重生', '妖灵', '学院', '战斗'], schedule: '周刊', isNewcomer: false },
  { title: '倾城之恋', author: '水墨江南', description: '民国年间，留洋归来的大小姐遇到潜伏在日本领事馆的地下党特工。在国难当头的年代，他们的爱情注定坎坷。', categories: ['恋爱', '悬疑'], contentTags: ['民国', '谍战', '虐恋', '历史'], schedule: '半月刊', isNewcomer: true },
  { title: '次元战争', author: '幻影工作室', description: '全息游戏"新世界"公测当天，千万玩家被困在游戏中无法登出。死亡即真实死亡。为了生存，玩家们必须合作通关。但人性的黑暗，比游戏BOSS更可怕。', categories: ['科幻', '悬疑', '动作'], contentTags: ['游戏', '生存', '群像剧', '死亡游戏'], schedule: '周刊', isNewcomer: false },
  { title: '浪客星', author: '星辰漫画家', description: '在遥远的星系边缘，一名被称为"星盗"的神秘男子游走于各个星球之间。星际赏金猎人的故事，自由与正义的选择。', categories: ['科幻', '冒险'], contentTags: ['星际', '海盗', '西部风', '自由'], schedule: '月刊', isNewcomer: true },
  { title: '狐妖小红娘·外传', author: '小新·同人工作室', description: '涂山狐妖一族的秘闻。在正篇之外，那些被遗忘的故事。每一话讲一个妖怪与人类的前世今生，有笑有泪，有情有义。', categories: ['奇幻', '恋爱', '治愈'], contentTags: ['妖狐', '转世', '单元剧', '催泪'], schedule: '半月刊', isNewcomer: false },
  { title: '机战王', author: '钢铁之心', description: '二十二世纪，巨型机甲成为战争主力。少年王磊意外成为最强机甲"龙神"的驾驶员。他以一己之力，要终结这场持续了20年的战争。', categories: ['科幻', '热血', '动作'], contentTags: ['机甲', '战争', '热血', '成长'], schedule: '周刊', isNewcomer: true },
  { title: '大画家', author: '彩色铅笔', description: '一个对画画充满热情但毫无天赋的高中生，在一次意外中获得了一支神奇的画笔。他用画笔改变现实，也改变了自己。', categories: ['治愈', '搞笑', '校园'], contentTags: ['绘画', '日常', '成长', '超能力'], schedule: '不定期', isNewcomer: true },
]

const tagsData = [
  { name: '修仙', type: 'content', color: '#6366f1', icon: '🧘' },
  { name: '热血', type: 'content', color: '#ef4444', icon: '🔥' },
  { name: '逆袭', type: 'content', color: '#f59e0b', icon: '⚡' },
  { name: '战斗', type: 'content', color: '#dc2626', icon: '⚔️' },
  { name: '美食', type: 'content', color: '#f59e0b', icon: '🍜' },
  { name: '恋爱', type: 'content', color: '#ec4899', icon: '💕' },
  { name: '搞笑', type: 'content', color: '#fbbf24', icon: '😂' },
  { name: '悬疑', type: 'content', color: '#8b5cf6', icon: '🔍' },
  { name: '科幻', type: 'content', color: '#06b6d4', icon: '🚀' },
  { name: '国漫', type: 'content', color: '#ef4444', icon: '🇨🇳' },
  { name: '灵异', type: 'content', color: '#7c3aed', icon: '👻' },
  { name: '末日', type: 'content', color: '#6b7280', icon: '💀' },
  { name: '机甲', type: 'content', color: '#3b82f6', icon: '🤖' },
  { name: '民国', type: 'content', color: '#92400e', icon: '🏮' },
  { name: '星际', type: 'content', color: '#0284c7', icon: '🌌' },
  { name: '剧情分析', type: 'community', color: '#6366f1', icon: '📖' },
  { name: '角色解读', type: 'community', color: '#ec4899', icon: '🎭' },
  { name: '同人创作', type: 'community', color: '#f59e0b', icon: '🎨' },
  { name: 'CP讨论', type: 'community', color: '#ec4899', icon: '💑' },
  { name: '每周必追', type: 'community', color: '#ef4444', icon: '🔥' },
  { name: '一口气读完', type: 'community', color: '#22c55e', icon: '📚' },
  { name: '神作画', type: 'community', color: '#8b5cf6', icon: '✨' },
  { name: '催更', type: 'community', color: '#f97316', icon: '⏰' },
  { name: '剧透警告', type: 'community', color: '#ef4444', icon: '⚠️' },
]

const forumCategories = [
  { name: '热血少年', description: '热血、战斗、成长类漫画讨论', icon: '🔥', color: '#ef4444', comicCategory: '热血', sortOrder: 1 },
  { name: '奇幻世界', description: '魔法、修仙、异世界题材交流', icon: '🧙', color: '#8b5cf6', comicCategory: '奇幻', sortOrder: 2 },
  { name: '恋爱花园', description: '爱情、青春、甜蜜故事分享', icon: '💕', color: '#ec4899', comicCategory: '恋爱', sortOrder: 3 },
  { name: '搞笑日常', description: '每日一笑，轻松一刻', icon: '😂', color: '#f59e0b', comicCategory: '搞笑', sortOrder: 4 },
  { name: '悬疑推理', description: '烧脑迷宫，真相只有一个', icon: '🔍', color: '#6366f1', comicCategory: '悬疑', sortOrder: 5 },
  { name: '星际科幻', description: '星辰大海，未来世界', icon: '🚀', color: '#06b6d4', comicCategory: '科幻', sortOrder: 6 },
  { name: '青春校园', description: '教室里的青春故事', icon: '📘', color: '#22c55e', comicCategory: '校园', sortOrder: 7 },
  { name: '动作格斗', description: '拳拳到肉，刀光剑影', icon: '⚔️', color: '#f97316', comicCategory: '动作', sortOrder: 8 },
  { name: '同人创作', description: '二次创作、同人图、手绘分享', icon: '🎨', color: '#d946ef', sortOrder: 9 },
  { name: '漫画茶馆', description: '闲聊、求助、漫友交友', icon: '🍵', color: '#78716c', sortOrder: 10 },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  await User.deleteMany({})
  await Comic.deleteMany({})
  await Chapter.deleteMany({})
  await Tag.deleteMany({})
  await ForumCategory.deleteMany({})
  await Topic.deleteMany({})
  await ChapterVote.deleteMany({})
  await Achievement.deleteMany({})
  await RookieWork.deleteMany({})
  console.log('Old data cleared')

  const admin = await User.create({
    username: '管理员', email: 'admin@comichub.com', password: 'admin123',
    role: 'admin', identity: 'both',
    badges: ['创始成员', '管理员', '漫画达人'],
    bio: 'ComicHub平台管理员，也是个漫画爱好者',
  })
  console.log('Admin created:', admin.email)

  const testUser = await User.create({
    username: '漫画爱好者', email: 'user@comichub.com', password: 'user123',
    role: 'user', identity: 'reader',
    badges: ['早期用户', '追更达人'],
    bio: '每天不看漫画睡不着',
    stats: { totalRead: 520, totalComments: 88, totalLikes: 256, joinDays: 365 },
  })
  console.log('Test user created:', testUser.email)

  for (const t of tagsData) {
    await Tag.create({ ...t, usageCount: Math.floor(Math.random() * 500) + 50 })
  }
  console.log('Tags created:', tagsData.length)

  const createdCategories = []
  for (const cat of forumCategories) {
    const c = await ForumCategory.create(cat)
    createdCategories.push(c)
  }
  await Achievement.create([
    { name: '初露锋芒', description: '连续打卡7天', icon: '🔥', type: 'reading', condition: { metric: 'checkin', threshold: 7 }, points: 50, rarity: 'common' },
    { name: '阅读之星', description: '累计阅读100话', icon: '📖', type: 'reading', condition: { metric: 'chaptersRead', threshold: 100 }, points: 100, rarity: 'common' },
    { name: '追更狂魔', description: '累计阅读500话', icon: '⚡', type: 'reading', condition: { metric: 'chaptersRead', threshold: 500 }, points: 300, rarity: 'rare' },
    { name: '评论家', description: '发表50条评论', icon: '💬', type: 'social', condition: { metric: 'comments', threshold: 50 }, points: 100, rarity: 'common' },
    { name: '坚持不懈', description: '连续打卡30天', icon: '💪', type: 'reading', condition: { metric: 'checkin', threshold: 30 }, points: 200, rarity: 'rare' },
    { name: '伯乐之眼', description: '为10部新人作品投票', icon: '👁', type: 'social', condition: { metric: 'rookieVotes', threshold: 10 }, points: 150, rarity: 'rare' },
    { name: '百科书', description: '累计阅读1000话', icon: '📚', type: 'reading', condition: { metric: 'chaptersRead', threshold: 1000 }, points: 500, rarity: 'epic' },
    { name: '传奇读者', description: '累计阅读5000话', icon: '👑', type: 'reading', condition: { metric: 'chaptersRead', threshold: 5000 }, points: 1000, rarity: 'legendary' },
  ])
  console.log('Achievements seeded')

  const colors = ['#6366f1', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280', '#f59e0b', '#06b6d4', '#7c3aed', '#3b82f6', '#22c55e', '#92400e', '#0284c7', '#d946ef', '#f97316', '#dc2626', '#10b981']
  const createdComics = []

  for (let i = 0; i < comicsData.length; i++) {
    const c = comicsData[i]
    const status = c.schedule === '已完结' ? '已完结' : '连载中'
    const actualSchedule = c.schedule === '已完结' ? '不定期' : c.schedule

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
  <rect width="300" height="400" fill="${colors[i]}" rx="4"/>
  <text x="150" y="180" text-anchor="middle" font-size="26" fill="white" font-family="sans-serif" font-weight="bold">${c.title}</text>
  <text x="150" y="220" text-anchor="middle" font-size="14" fill="rgba(255,255,255,0.8)" font-family="sans-serif">${c.author}</text>
  <rect x="50" y="250" width="200" height="80" rx="10" fill="rgba(255,255,255,0.15)"/>
  <text x="150" y="295" text-anchor="middle" font-size="13" fill="white" font-family="sans-serif">${status}</text>
</svg>`
    const coverDir = path.join(__dirname, 'uploads', 'covers')
    if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true })
    const coverFile = `cover_${i}.svg`
    fs.writeFileSync(path.join(coverDir, coverFile), svg)

    const comic = await Comic.create({
      title: c.title, author: c.author, description: c.description,
      categories: c.categories, contentTags: c.contentTags,
      tags: c.contentTags.slice(0, 3),
      status, schedule: actualSchedule,
      isNewcomer: c.isNewcomer,
      cover: `/uploads/covers/${coverFile}`,
      views: Math.floor(Math.random() * 80000) + 2000,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      ratingCount: Math.floor(Math.random() * 600) + 50,
      followers: Math.floor(Math.random() * 5000) + 100,
      totalVotes: Math.floor(Math.random() * 3000) + 100,
      weeklyVotes: Math.floor(Math.random() * 500) + 20,
      monthlyVotes: Math.floor(Math.random() * 1200) + 100,
      createdBy: admin._id, authorId: admin._id,
    })
    comic.calcHotScore()
    await comic.save()
    createdComics.push(comic)

    const chCount = Math.floor(Math.random() * 8) + 4
    for (let j = 1; j <= chCount; j++) {
      const pages = []
      for (let k = 1; k <= 4; k++) {
        const pageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
  <rect width="800" height="1200" fill="white"/>
  <rect x="40" y="40" width="720" height="1120" fill="${colors[i]}15" rx="8"/>
  <text x="400" y="200" text-anchor="middle" font-size="36" fill="${colors[i]}" font-family="sans-serif" font-weight="bold">${c.title}</text>
  <text x="400" y="260" text-anchor="middle" font-size="22" fill="#555" font-family="sans-serif">第${j}话 · 第${k}页</text>
  <rect x="80" y="320" width="640" height="500" fill="${colors[i]}08" rx="8"/>
  <text x="400" y="580" text-anchor="middle" font-size="18" fill="#aaa" font-family="sans-serif">[ 漫画内容画面 ]</text>
  <text x="400" y="880" text-anchor="middle" font-size="16" fill="#ccc" font-family="sans-serif">${c.description.slice(0, 40)}...</text>
</svg>`
        const chDir = path.join(__dirname, 'uploads', 'chapters')
        if (!fs.existsSync(chDir)) fs.mkdirSync(chDir, { recursive: true })
        const pageFile = `ch_${i}_${j}_${k}.svg`
        fs.writeFileSync(path.join(chDir, pageFile), pageSvg)
        pages.push(`/uploads/chapters/${pageFile}`)
      }
      await Chapter.create({
        comic: comic._id, title: `第${j}话`,
        number: j, pages,
        views: Math.floor(Math.random() * 8000) + 200,
      })
    }
    console.log(`${i + 1}. ${comic.title} (${chCount}话)`)
  }

  const topicSamples = [
    { title: '星辰变最新话神转折！', content: '这周更新的剧情反转太猛了，完全没想到！秦羽居然会做出这个选择，果然主角不会按套路走。大家觉得接下来他会去哪个世界？', catIdx: 1, comicIdx: 0 },
    { title: '斗破苍穹经典台词盘点', content: '三十河东三十河西，莫欺少年穷！这句话激励了多少读者。大家还记哪些萧炎的经典台词？', catIdx: 1, comicIdx: 1 },
    { title: '校园诡谈——最吓人的一篇分析', content: '第18话的那个女厕所怪谈，我晚上看完直接失眠了...画师画的那些鬼影太细节了，越细看越恐怖。', catIdx: 4, comicIdx: 7 },
    { title: '厨神之路深夜放毒合集', content: '每次更新都是晚上10点，看完就得去厨房。第7话那个红烧肉的画法，油光都画出来了，比照片还诱人！', catIdx: 3, comicIdx: 5 },
    { title: '次元战争——现实主义外衣下的社会寓言', content: '表面是游戏生存题材，但仔细看每个人物的选择，本质上是在探讨极端环境下的人性。作者埋了很多伏笔，我整理一下目前发现的。', catIdx: 5, comicIdx: 11 },
    { title: '妖神记——聂离的人设太带感了', content: '重生流一般套路就是囤积资源虐菜报仇，但聂离这个角色的魅力在于他明明知道前世的结局却依然选择去爱去保护。', catIdx: 1, comicIdx: 9 },
    { title: '新人推荐：破晓黎明的画面太震撼了', content: '这位新人画师的废土场景画得太有感觉了，每一页都像壁纸。虽然剧情还在铺陈，但光看画面就值了。', catIdx: 5, comicIdx: 8 },
    { title: '倾城之恋——民国风的极致浪漫', content: '旗袍、油纸伞、黄包车、老上海法租界...这种民国画风太稀缺了。希望作者能把这种风格坚持下去，国漫需要更多这样的作品！', catIdx: 2, comicIdx: 10 },
    { title: '机战王最新话动作分镜解析', content: '这周的机甲对战分镜绝了，第4页那个从下往上的仰视视角特别有电影感。逐帧分析一下这套连环动作的设计思路。', catIdx: 7, comicIdx: 14 },
    { title: '大画家的笔——艺术与超能力的完美结合', content: '把绘画和超能力结合的设定太有趣了。画出来的东西变成真的，这种能力如果放在现实里...大家想画什么？', catIdx: 6, comicIdx: 15 },
  ]

  for (const t of topicSamples) {
    await Topic.create({
      title: t.title, content: t.content,
      category: createdCategories[t.catIdx]._id,
      user: testUser._id,
      comic: createdComics[t.comicIdx]._id,
      views: Math.floor(Math.random() * 3000) + 200,
      replyCount: Math.floor(Math.random() * 40) + 3,
      lastReplyAt: new Date(),
      likes: [admin._id, testUser._id],
    })
  }
  console.log('Topics created:', topicSamples.length)

  console.log('\n=== ComicHub v2.0 数据初始化完成 ===')
  console.log(`管理员: admin@comichub.com / admin123`)
  console.log(`普通用户: user@comichub.com / user123`)
  console.log(`漫画: ${createdComics.length}部`)
  console.log(`标签: ${tagsData.length}个`)
  console.log(`版块: ${createdCategories.length}个`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
