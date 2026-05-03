require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const User = require('./models/User')
const Comic = require('./models/Comic')
const Chapter = require('./models/Chapter')
const Tag = require('./models/Tag')
const TagGroup = require('./models/TagGroup')
const ForumCategory = require('./models/ForumCategory')
const Topic = require('./models/Topic')
const ChapterVote = require('./models/ChapterVote')
const Achievement = require('./models/Achievement')
const RookieWork = require('./models/RookieWork')

const tagGroups = [
  { name: 'shonen', label: '少年漫', type: 'demographic', icon: '🔥', sortOrder: 1, description: '热血、战斗、友情、成长，面向少年读者' },
  { name: 'shojo', label: '少女漫', type: 'demographic', icon: '🌸', sortOrder: 2, description: '恋爱、校园、细腻情感，面向少女读者' },
  { name: 'seinen', label: '青年漫', type: 'demographic', icon: '📰', sortOrder: 3, description: '成熟主题、社会写实、心理深度，面向成年男性' },
  { name: 'josei', label: '女性漫', type: 'demographic', icon: '🌹', sortOrder: 4, description: '成熟女性视角，职场、家庭、情感' },
  { name: 'kids', label: '少儿漫', type: 'demographic', icon: '🧒', sortOrder: 5, description: '童趣、益智、简单快乐' },
]

const genreGroups = [
  { name: 'genre_action', label: '动作冒险', type: 'genre', icon: '⚔️', sortOrder: 1 },
  { name: 'genre_romance', label: '恋爱情感', type: 'genre', icon: '💕', sortOrder: 2 },
  { name: 'genre_comedy', label: '搞笑日常', type: 'genre', icon: '😂', sortOrder: 3 },
  { name: 'genre_mystery', label: '悬疑推理', type: 'genre', icon: '🔍', sortOrder: 4 },
  { name: 'genre_horror', label: '恐怖灵异', type: 'genre', icon: '👻', sortOrder: 5 },
  { name: 'genre_scifi', label: '科幻未来', type: 'genre', icon: '🚀', sortOrder: 6 },
  { name: 'genre_fantasy', label: '奇幻魔法', type: 'genre', icon: '🧙', sortOrder: 7 },
  { name: 'genre_xianxia', label: '玄幻修仙', type: 'genre', icon: '☯️', sortOrder: 8 },
  { name: 'genre_wuxia', label: '武侠江湖', type: 'genre', icon: '🏮', sortOrder: 9 },
  { name: 'genre_sports', label: '运动竞技', type: 'genre', icon: '⚽', sortOrder: 10 },
  { name: 'genre_food', label: '美食烹饪', type: 'genre', icon: '🍜', sortOrder: 11 },
  { name: 'genre_music', label: '音乐艺术', type: 'genre', icon: '🎵', sortOrder: 12 },
  { name: 'genre_historical', label: '历史古风', type: 'genre', icon: '📜', sortOrder: 13 },
  { name: 'genre_war', label: '战争军事', type: 'genre', icon: '🎖️', sortOrder: 14 },
  { name: 'genre_supernatural', label: '异能超能力', type: 'genre', icon: '⚡', sortOrder: 15 },
  { name: 'genre_apocalypse', label: '末日生存', type: 'genre', icon: '💀', sortOrder: 16 },
  { name: 'genre_healing', label: '治愈温馨', type: 'genre', icon: '🌿', sortOrder: 17 },
  { name: 'genre_school', label: '校园青春', type: 'genre', icon: '📘', sortOrder: 18 },
  { name: 'genre_workplace', label: '职场商战', type: 'genre', icon: '💼', sortOrder: 19 },
  { name: 'genre_isekai', label: '异世界', type: 'genre', icon: '🌍', sortOrder: 20 },
]

const formatGroups = [
  { name: 'format_page', label: '页漫', type: 'format', icon: '📖', sortOrder: 1, description: '传统翻页阅读' },
  { name: 'format_webtoon', label: '条漫', type: 'format', icon: '📱', sortOrder: 2, description: '竖向滚动阅读' },
  { name: 'format_color', label: '全彩', type: 'format', icon: '🎨', sortOrder: 3 },
  { name: 'format_bw', label: '黑白', type: 'format', icon: '🖤', sortOrder: 4 },
  { name: 'format_4koma', label: '四格', type: 'format', icon: '⬜', sortOrder: 5 },
]

const originGroups = [
  { name: 'origin_chinese', label: '国漫', type: 'origin', icon: '🇨🇳', sortOrder: 1 },
  { name: 'origin_japanese', label: '日漫', type: 'origin', icon: '🇯🇵', sortOrder: 2 },
  { name: 'origin_korean', label: '韩漫', type: 'origin', icon: '🇰🇷', sortOrder: 3 },
  { name: 'origin_western', label: '欧美漫', type: 'origin', icon: '🇺🇸', sortOrder: 4 },
]

const comicsData = [
  { title: '星辰变', author: '我吃西红柿', description: '少年秦羽天生无法修炼内功，为得到父亲重视毅然选择痛苦的外功修炼之路。从凡人到星辰变之主，穿梭三界的热血传奇。庞大的世界观、精湛的战斗描写，东方玄幻的不朽经典。', demographic: 'shonen', genres: ['玄幻修仙', '动作冒险', '奇幻魔法'], format: 'format_page', origin: 'origin_chinese', schedule: '周刊', tags: '修仙,逆袭,东方玄幻,战斗,少年漫' },
  { title: '斗破苍穹', author: '天蚕土豆', description: '萧炎，曾经的修炼奇才，十一岁遭遇变故实力骤降沦为废柴。纳戒中遇到灵魂导师药老，踏上逆天修炼之路。三十年河东三十年河西，莫欺少年穷！异火争霸、炼药成圣，一部承包无数人青春的经典。', demographic: 'shonen', genres: ['玄幻修仙', '动作冒险'], format: 'format_page', origin: 'origin_chinese', schedule: '周刊', tags: '战斗,励志,逆袭,异火,炼药', status: '已完结' },
  { title: '前任战争', author: '银魂次郎', description: '霸总、奶狗、绿茶、女强人...当所有人汇集在一间广告公司，24小时都是修罗场。反转不断的办公室爆笑喜剧，每一话都让人笑到头掉又莫名心酸。', demographic: 'josei', genres: ['恋爱情感', '搞笑日常', '职场商战'], format: 'format_webtoon', origin: 'origin_chinese', schedule: '周刊', tags: '都市,喜剧,霸总,职场,女性向' },
  { title: '暗黑之魂', author: '暗夜殇', description: '被黑暗笼罩的世界，人类最后的希望寄托在一群拥有特殊能力的少年"魂师"身上。克苏鲁式的恐怖氛围、硬核的战斗分镜，每一页都在挑战读者的心理承受力。与深渊怪物的生死搏斗，人类存亡的终极之战。', demographic: 'seinen', genres: ['恐怖灵异', '动作冒险', '末日生存'], format: 'format_page', origin: 'origin_chinese', schedule: '半月刊', tags: '黑暗,克苏鲁,异能,硬核,心理恐怖' },
  { title: '厨神之路', author: '饭桶大师', description: '热爱美食的少年踏上成为世界第一厨师的旅程。横跨中国八大菜系，远赴日本拉面店修行，深入法国米其林后厨。用料理温暖人心，用美食征服世界。每一话都画出了食物的灵魂。', demographic: 'shonen', genres: ['美食烹饪', '搞笑日常', '治愈温馨'], format: 'format_color', origin: 'origin_chinese', schedule: '月刊', tags: '美食,日常,旅行,温暖,全彩' },
  { title: '星空下的约定', author: '月下独酌', description: '两个少年在星空下许下的约定穿越了时空。一场跨越星际的冒险，一段跨越种族的友情。硬核科幻设定与人文思考的完美融合，被誉为"漫画版的星际穿越"。', demographic: 'seinen', genres: ['科幻未来', '动作冒险'], format: 'format_page', origin: 'origin_japanese', schedule: '周刊', tags: '星际,友情,硬核科幻,机甲,催泪', status: '已完结' },
  { title: '校园诡谈', author: '夜不语', description: '高中生林晓意外获得看见鬼魂的能力，从此校园生活不再平静。日本都市怪谈、中国民间传说、欧洲中世纪幽灵...每一话一个独立恐怖故事，却暗藏贯穿主线。画风阴郁，细思极恐。', demographic: 'shonen', genres: ['恐怖灵异', '悬疑推理', '校园青春'], format: 'format_bw', origin: 'origin_japanese', schedule: '周刊', tags: '灵异,推理,单元剧,校园,黑白' },
  { title: '破晓黎明', author: '晴空万里', description: '末日之后的人类聚落中，少女艾琳发现了一本记载旧世界科技的日记。她要带领族人在废土之上重建文明，对抗变种生物和人类中的野心家。宫崎骏式的画风+疯狂的麦克斯式废土美学。', demographic: 'shonen', genres: ['末日生存', '科幻未来', '动作冒险'], format: 'format_color', origin: 'origin_chinese', schedule: '周刊', tags: '末日,生存,少女主角,废土,全彩' },
  { title: '妖神记', author: '发飙的蜗牛', description: '重回少年时代的聂离，要改变一切。前世遗憾，今生的约定。在这个妖灵世界中，他要变得更强，守护他珍视的人。学院、战斗、友情、成长，新时代玄幻标杆。', demographic: 'shonen', genres: ['玄幻修仙', '校园青春', '动作冒险'], format: 'format_page', origin: 'origin_chinese', schedule: '周刊', tags: '重生,妖灵,学院,战斗,爽文改编' },
  { title: '倾城之恋', author: '水墨江南', description: '1937年上海，留洋归来的名门大小姐遇到潜伏在日军领事馆的地下党特工。枪炮玫瑰，乱世深情。美到窒息的民国画风，每一格都像老上海的月份牌。', demographic: 'josei', genres: ['恋爱情感', '历史古风', '悬疑推理'], format: 'format_color', origin: 'origin_chinese', schedule: '半月刊', tags: '民国,谍战,虐恋,历史,全彩' },
  { title: '次元战争', author: '幻影工作室', description: '全息游戏"新世界"公测当天，千万玩家被困游戏无法登出。死亡=真实死亡。为了生存，玩家必须合作通关。但人性的黑暗比最终BOSS更可怕。韩漫式紧凑节奏+日漫式群像刻画。', demographic: 'seinen', genres: ['科幻未来', '悬疑推理', '动作冒险'], format: 'format_webtoon', origin: 'origin_korean', schedule: '周刊', tags: '游戏,生存,群像剧,死亡游戏,烧脑' },
  { title: '浪客星', author: '星辰漫画家', description: '遥远星系边缘，一名被通缉的"星盗"游走于各个星球之间。星际赏金猎人、自由与正义、西部牛仔与太空歌剧的完美融合。每一话都是电影级的视觉享受。', demographic: 'seinen', genres: ['科幻未来', '动作冒险'], format: 'format_page', origin: 'origin_japanese', schedule: '月刊', tags: '星际,海盗,西部风,自由,电影感' },
  { title: '狐妖小红娘·外传', author: '小新工作室', description: '涂山狐妖一族的秘闻。在正篇之外那些被遗忘的故事。每一话讲述一个妖怪与人类的前世今生，有笑有泪，有情有义。单元剧模式，随时入坑。', demographic: 'shojo', genres: ['奇幻魔法', '恋爱情感', '治愈温馨'], format: 'format_color', origin: 'origin_chinese', schedule: '半月刊', tags: '妖狐,转世,单元剧,催泪,国漫之光' },
  { title: '机战王', author: '钢铁之心', description: '二十二世纪，巨型机甲成为战争主力。少年王磊意外成为最强机甲"龙神"的驾驶员。以一己之力终结这场持续了20年的战争。致敬高达，超越高达。', demographic: 'shonen', genres: ['科幻未来', '动作冒险', '战争军事'], format: 'format_page', origin: 'origin_chinese', schedule: '周刊', tags: '机甲,战争,热血,成长,少年' },
  { title: '大画家', author: '彩色铅笔', description: '一个对画画充满热情但毫无天赋的高中生，意外获得了一支神奇的画笔。画出来的东西都会变成现实！他用画笔改变现实，也改变了自己。宫崎骏遇到哆啦A梦的奇妙故事。', demographic: 'kids', genres: ['治愈温馨', '搞笑日常', '校园青春'], format: 'format_color', origin: 'origin_chinese', schedule: '不定期', tags: '绘画,超能力,温暖,童趣,全彩' },
  { title: '东京喰种·外典', author: '石田翠工作室', description: '在东京的暗影中，喰种与人类之间的战争从未停止。本作聚焦于正篇之外的独立故事线，描绘那些在黑暗中挣扎的灵魂。血腥美学与深刻人性探讨的完美结合。', demographic: 'seinen', genres: ['恐怖灵异', '动作冒险', '悬疑推理'], format: 'format_bw', origin: 'origin_japanese', schedule: '半月刊', tags: '黑暗,都市,人性,热血,黑白' },
  { title: '排球少年!!·新世代', author: 'JUMP编辑部', description: '乌野高中排球部的新一代队员们，继承了日向和影山的意志，在全国大赛的舞台上书写属于他们的篇章。热血、青春、友情，排球的魅力从未改变。', demographic: 'shonen', genres: ['运动竞技', '校园青春', '治愈温馨'], format: 'format_bw', origin: 'origin_japanese', schedule: '周刊', tags: '排球,热血,青春,友情,运动' },
  { title: '我打造了长生俱乐部', author: '码字机器猫', description: '一个普通上班族意外获得了长生不老的秘密。他建立了一个神秘的地下俱乐部，成员跨越千年历史。达芬奇、李白、特斯拉...历史上最聪明的人其实从未死去。都市异能与历史解谜的奇妙结合。', demographic: 'seinen', genres: ['异能超能力', '悬疑推理', '历史古风'], format: 'format_webtoon', origin: 'origin_chinese', schedule: '周刊', tags: '都市,异能,历史,智斗,烧脑' },
  { title: '恶役千金转生记', author: '轻小说工厂', description: '车祸醒来成了乙女游戏里的反派大小姐？按照剧情我注定要被处刑。但既然知道剧本，那就在被处刑前把整个王国搅个天翻地覆吧！王道恶役千金×爽文×少女漫画的完美融合。', demographic: 'shojo', genres: ['异世界', '恋爱情感', '搞笑日常'], format: 'format_webtoon', origin: 'origin_korean', schedule: '周刊', tags: '转生,恶役,乙女,逆袭,爽文' },
  { title: '山海经：百妖录', author: '国风漫画社', description: '一部以《山海经》为蓝本的全彩国风漫画。穷奇、饕餮、九尾狐、应龙...百妖千怪的故事，用现代漫画语言重新演绎中华神话。每一页都是壁纸级别的画作。', demographic: 'shonen', genres: ['奇幻魔法', '历史古风', '动作冒险'], format: 'format_color', origin: 'origin_chinese', schedule: '月刊', tags: '山海经,妖怪,国风,神话,全彩' },
]

const forumCategories = [
  { name: '少年JUMP', description: '热血战斗、友情成长', icon: '🔥', color: '#ef4444', sortOrder: 1 },
  { name: '少女花园', description: '恋爱、校园、唯美', icon: '🌸', color: '#ec4899', sortOrder: 2 },
  { name: '青年深度', description: '成熟主题、社会写实', icon: '📰', color: '#6366f1', sortOrder: 3 },
  { name: '漫画家茶馆', description: '创作交流、新人报道', icon: '🎨', color: '#d946ef', sortOrder: 4 },
  { name: '同人集市', description: '同人图、手绘、COS', icon: '✨', color: '#f59e0b', sortOrder: 5 },
  { name: '漫画情报站', description: '新番资讯、漫评推荐', icon: '📡', color: '#06b6d4', sortOrder: 6 },
  { name: '漫画茶馆', description: '闲聊、求助、漫友交友', icon: '🍵', color: '#78716c', sortOrder: 7 },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  await User.deleteMany({})
  await Comic.deleteMany({})
  await Chapter.deleteMany({})
  await Tag.deleteMany({})
  await TagGroup.deleteMany({})
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
    bio: 'ComicHub平台管理员',
  })
  const testUser = await User.create({
    username: '漫画爱好者', email: 'user@comichub.com', password: 'user123',
    role: 'user', identity: 'reader',
    badges: ['早期用户', '追更达人'],
    bio: '每天不看漫画睡不着',
  })
  console.log('Users created')

  const allGroups = [...tagGroups, ...genreGroups, ...formatGroups, ...originGroups]
  const createdGroups = {}
  for (const g of allGroups) {
    const group = await TagGroup.create(g)
    createdGroups[g.name] = group
  }
  console.log(`TagGroups: ${allGroups.length}`)

  const tagEntries = []
  for (const g of tagGroups) tagEntries.push({ name: g.label, type: 'demographic', icon: g.icon, color: '#6366f1', group: g.name })
  for (const g of genreGroups) tagEntries.push({ name: g.label, type: 'genre', icon: g.icon, color: '#ec4899', group: g.name })
  for (const g of formatGroups) tagEntries.push({ name: g.label, type: 'format', icon: g.icon, color: '#06b6d4', group: g.name })
  for (const g of originGroups) tagEntries.push({ name: g.label, type: 'origin', icon: g.icon, color: '#f59e0b', group: g.name })

  for (const t of tagEntries) {
    await Tag.create({ ...t, usageCount: Math.floor(Math.random() * 300) + 50 })
  }
  console.log(`Tags: ${tagEntries.length}`)

  const createdCats = []
  for (const cat of forumCategories) {
    createdCats.push(await ForumCategory.create(cat))
  }
  console.log(`Forum: ${createdCats.length}`)

  const colors = ['#6366f1', '#ef4444', '#ec4899', '#8b5cf6', '#6b7280', '#f59e0b', '#06b6d4', '#22c55e', '#3b82f6', '#f97316', '#92400e', '#d946ef', '#dc2626', '#10b981', '#eab308', '#0284c7', '#14b8a6', '#a855f7', '#fb923c', '#84cc16']
  const createdComics = []
  const coversDir = path.join(__dirname, 'uploads', 'covers')
  const chaptersDir = path.join(__dirname, 'uploads', 'chapters')
  if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true })
  if (!fs.existsSync(chaptersDir)) fs.mkdirSync(chaptersDir, { recursive: true })

  for (let i = 0; i < comicsData.length; i++) {
    const c = comicsData[i]
    const status = c.status || '连载中'
    const schedule = status === '已完结' ? '不定期' : c.schedule
    const demoGroup = createdGroups[c.demographic]
    const genreNames = c.genres.map(g => genreGroups.find(gg => gg.label === g)?.label || g)
    const formatGroup = createdGroups[c.format]
    const originGroup = createdGroups[c.origin]

    const demoTags = demoGroup ? [demoGroup.label] : []
    const allTags = demoTags.concat(genreNames).concat(formatGroup ? [formatGroup.label] : []).concat(originGroup ? [originGroup.label] : [])
    const manualTags = (c.tags || '').split(',').map(t => t.trim()).filter(Boolean)

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
  <rect width="300" height="400" fill="${colors[i % colors.length]}" rx="4"/>
  <text x="150" y="175" text-anchor="middle" font-size="24" fill="white" font-family="sans-serif" font-weight="bold">${c.title}</text>
  <text x="150" y="215" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.8)" font-family="sans-serif">${c.author}</text>
  <rect x="50" y="245" width="200" height="60" rx="10" fill="rgba(255,255,255,0.15)"/>
  <text x="150" y="282" text-anchor="middle" font-size="12" fill="white" font-family="sans-serif">${demoGroup?.label || ''} · ${status}</text>
</svg>`
    const coverFile = `cover_${i}.svg`
    fs.writeFileSync(path.join(coversDir, coverFile), svg)

    const comic = await Comic.create({
      title: c.title, author: c.author, description: c.description,
      categories: genreNames.slice(0, 2),
      contentTags: allTags,
      tags: manualTags,
      status, schedule,
      cover: `/uploads/covers/${coverFile}`,
      views: Math.floor(Math.random() * 80000) + 2000,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      ratingCount: Math.floor(Math.random() * 600) + 50,
      followers: Math.floor(Math.random() * 5000) + 100,
      totalVotes: Math.floor(Math.random() * 3000) + 100,
      weeklyVotes: Math.floor(Math.random() * 500) + 20,
      monthlyVotes: Math.floor(Math.random() * 1200) + 100,
      createdBy: admin._id, authorId: admin._id,
      isNewcomer: i >= comicsData.length - 6,
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
  <rect x="40" y="40" width="720" height="1120" fill="${colors[i % colors.length]}10" rx="8"/>
  <text x="400" y="250" text-anchor="middle" font-size="34" fill="${colors[i % colors.length]}" font-family="sans-serif" font-weight="bold">${c.title}</text>
  <text x="400" y="310" text-anchor="middle" font-size="20" fill="#555" font-family="sans-serif">第${j}话 · 第${k}页</text>
  <rect x="80" y="370" width="640" height="480" fill="${colors[i % colors.length]}08" rx="8"/>
  <text x="400" y="620" text-anchor="middle" font-size="18" fill="#aaa" font-family="sans-serif">[ 示例漫画画面内容 ]</text>
</svg>`
        fs.writeFileSync(path.join(chaptersDir, `ch_${i}_${j}_${k}.svg`), pageSvg)
        pages.push(`/uploads/chapters/ch_${i}_${j}_${k}.svg`)
      }
      await Chapter.create({ comic: comic._id, title: `第${j}话`, number: j, pages, views: Math.floor(Math.random() * 8000) + 200 })
    }
    console.log(`${i + 1}. ${comic.title}`)
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

  const topicSamples = [
    { title: '星辰变——秦羽到底有多强？', content: '从凡人修炼到掌控者，秦羽的战力等级到底是怎样的？整理了所有阶段的实力表现和战绩。', catIdx: 0, comicIdx: 0 },
    { title: '斗破苍穹经典台词排行', content: '三十年河东三十年河西，莫欺少年穷！还有哪些经典台词让你记忆深刻？', catIdx: 0, comicIdx: 1 },
    { title: '校园诡谈——最恐怖的单元评选', content: '第18话的女厕所怪谈、第25话的图书馆幽灵、第42话的午夜广播...你被哪一话吓到了？', catIdx: 0, comicIdx: 6 },
    { title: '厨神之路深夜放毒合集', content: '每次更新都是晚上10点，看完就必须去厨房。第7话那个红烧肉的油光，比照片还诱人！', catIdx: 6, comicIdx: 4 },
    { title: '山海经百妖录画风解析', content: '以中国水墨为底色融合现代漫画分镜，这种风格在中国漫画界独树一帜。详细分析绘画技法。', catIdx: 3, comicIdx: 19 },
    { title: '恶役千金转生记——为什么这么上头', content: '明知是套路但就是停不下来。分析恶役千金类型作品的成功公式。', catIdx: 1, comicIdx: 18 },
    { title: '新人推荐：暗黑之魂的恐怖美学', content: '不靠jump scare，靠氛围和心理压迫制造恐惧。这种恐怖手法比单纯的画面恐怖高级多了。', catIdx: 0, comicIdx: 3 },
    { title: '排球少年新世代——传承的意义', content: '新队员们在老队员的影子下打球，这个设定本身就很有意思。分析最新一话中"传承"主题的表达。', catIdx: 0, comicIdx: 16 },
    { title: '东京喰种外典——人性比喰种更可怕', content: '新篇章中的人类反派设定让人不寒而栗，因为太真实了。讨论CCG这个组织的道德困境。', catIdx: 2, comicIdx: 15 },
    { title: '长生俱乐部——历史谜团的漫画解法', content: '达芬奇的飞行器和特斯拉的电塔，这些历史上未解之谜在漫画中有了解释。历史爱好者的天堂！', catIdx: 2, comicIdx: 17 },
  ]
  for (const t of topicSamples) {
    await Topic.create({
      title: t.title, content: t.content,
      category: createdCats[t.catIdx]._id,
      user: testUser._id,
      comic: createdComics[t.comicIdx]._id,
      views: Math.floor(Math.random() * 3000) + 200,
      replyCount: Math.floor(Math.random() * 40) + 3,
      lastReplyAt: new Date(),
      likes: [admin._id, testUser._id],
    })
  }
  console.log('Topics created')

  await Tag.updateMany({}, [{ $set: { usageCount: { $floor: { $multiply: [{ $rand: {} }, 300] } } } }])

  console.log(`\n=== ComicHub v3.0 分类体系完成 ===`)
  console.log(`受众: ${tagGroups.length} | 题材: ${genreGroups.length} | 形式: ${formatGroups.length} | 来源: ${originGroups.length}`)
  console.log(`管理员: admin@comichub.com / admin123`)
  console.log(`漫画: ${createdComics.length}部`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
