import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { comicsAPI, tagsAPI, forumAPI } from '../services/api'
import Loading from '../components/Loading'

const SECTIONS = ['hot', 'rankings', 'newcomer', 'latest', 'community']

function SectionTitle({ title, more }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center">
        <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-indigo-600 rounded-full mr-2.5"></span>
        {title}
      </h2>
      {more && <Link to={more} className="text-xs text-gray-400 hover:text-pink-500 flex items-center space-x-1">查看更多 <span>→</span></Link>}
    </div>
  )
}

function ScrollRow({ children }) {
  const ref = useRef(null)
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }
  return (
    <div className="relative group/row">
      <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-lg rounded-full items-center justify-center hidden group-hover/row:flex hover:bg-white transition">
        ‹
      </button>
      <div ref={ref} className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
        <div className="flex space-x-3 pr-8">
          {children}
        </div>
      </div>
      <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-lg rounded-full items-center justify-center hidden group-hover/row:flex hover:bg-white transition">
        ›
      </button>
    </div>
  )
}

export default function Home() {
  const [data, setData] = useState({ hot: [], rankings: [], newcomer: [], latest: [], topics: [], tags: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      comicsAPI.getHot(12),
      comicsAPI.getRankings('weekly', 10),
      comicsAPI.getList({ isNewcomer: true, limit: 10, sort: '-hotScore' }),
      comicsAPI.getLatest(),
      forumAPI.getHotTopics(),
      tagsAPI.getHot('content'),
    ]).then(([hot, rank, newcomer, latest, topics, tags]) => {
      setData({
        hot: hot.data,
        rankings: rank.data,
        newcomer: newcomer.data.comics,
        latest: latest.data,
        topics: topics.data.slice(0, 10),
        tags: tags.data?.slice(0, 12) || [],
      })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const heroComic = data.hot[0]
  const featuredComics = data.hot.slice(1, 5)

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-8">
      {/* Hero Banner */}
      {heroComic && (
        <Link to={`/comic/${heroComic._id}`} className="block relative h-[280px] sm:h-[360px] overflow-hidden group/banner">
          <img src={heroComic.cover} alt="" className="w-full h-full object-cover group-hover/banner:scale-105 transition duration-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent" />
          <div className="absolute bottom-12 left-8 sm:left-12 max-w-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-0.5 bg-pink-500/90 text-white text-xs font-bold rounded">🔥 热门</span>
              {heroComic.contentTags?.slice(0, 3).map((t) => (
                <span key={t} className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full backdrop-blur">{t}</span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">{heroComic.title}</h1>
            <p className="text-white/80 text-sm line-clamp-2 hidden sm:block">{heroComic.description}</p>
            <div className="flex items-center space-x-4 mt-3 text-white/70 text-sm">
              <span>{heroComic.author}</span>
              <span>🔥 {heroComic.hotScore}</span>
              <span>👥 {heroComic.followers} 追</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-12 flex space-x-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`w-2 h-1 rounded-full ${i === 0 ? 'bg-pink-500 w-5' : 'bg-white/30'}`} />
            ))}
          </div>
        </Link>
      )}

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        {/* Category Nav */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-50">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide pb-1">
            {['🔥 少年', '🌸 少女', '📰 青年', '🌹 女性', '🧒 少儿'].map((d, i) => (
              <Link key={d} to={`/browse?tag=${d.slice(2)}`}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition mx-0.5 ${i === 0 ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {d}
              </Link>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs text-gray-400 px-1">
            <Link to="/browse" className="hover:text-pink-500">国漫 →</Link>
            <Link to="/browse" className="hover:text-pink-500">日漫 →</Link>
            <Link to="/browse" className="hover:text-pink-500">韩漫 →</Link>
            <Link to="/browse" className="hover:text-pink-500">全彩 →</Link>
            <Link to="/browse" className="hover:text-pink-500">条漫 →</Link>
            <Link to="/rookie" className="hover:text-pink-500">新人 →</Link>
            <Link to="/browse" className="hover:text-pink-500">完结 →</Link>
          </div>
        </div>
        {/* Featured Row */}
        {featuredComics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {featuredComics.map((comic) => (
              <Link key={comic._id} to={`/comic/${comic._id}`} className="group">
                <div className="relative aspect-[2/1] rounded-xl overflow-hidden bg-gray-100 shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-1">
                  <img src={comic.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="text-sm font-bold text-white truncate">{comic.title}</h3>
                    <p className="text-xs text-white/70">{comic.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 排行榜 */}
        <SectionTitle title="📊 高能排行" more="/browse?sort=-hotScore" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
          {data.rankings.slice(0, 5).map((comic, idx) => (
            <Link key={comic._id} to={`/comic/${comic._id}`} className={`group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all ${idx === 0 ? 'lg:row-span-2 lg:col-span-2' : ''}`}>
              <div className={`relative ${idx === 0 ? 'aspect-[16/10]' : 'aspect-[3/2]'}`}>
                <img src={comic.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className={`absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-extrabold shadow-lg ${idx < 3 ? 'bg-gradient-to-br from-pink-500 to-rose-500' : 'bg-gray-600'}`}>
                  {idx + 1}
                </span>
              </div>
              <div className={`p-3 ${idx !== 0 ? '' : ''}`}>
                <h3 className="font-bold text-sm text-gray-900 truncate">{comic.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{comic.author}</p>
                <div className="flex items-center space-x-2 mt-1.5">
                  {comic.contentTags?.slice(0, 2).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded-full">{t}</span>
                  ))}
                </div>
                {idx === 0 && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{comic.description}</p>}
              </div>
            </Link>
          ))}
        </div>

        {/* 新人黑马 - 横向滚动 */}
        <SectionTitle title="🚀 新人黑马" more="/browse?isNewcomer=true" />
        <ScrollRow>
          {data.newcomer.map((comic) => (
            <Link key={comic._id} to={`/comic/${comic._id}`} className="flex-shrink-0 w-[140px] sm:w-[160px] group" style={{ scrollSnapAlign: 'start' }}>
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-lg transition-all group-hover:-translate-y-1">
                <img src={comic.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-bold text-gray-900 truncate">{comic.title}</h3>
                <p className="text-xs text-gray-400">{comic.author}</p>
                <span className="text-[10px] text-pink-500 font-medium">{comic.schedule}·{comic.hotScore}热度</span>
              </div>
            </Link>
          ))}
        </ScrollRow>

        <div className="mb-10" />

        {/* 热门标签 */}
        <SectionTitle title="🏷️ 热门标签" />
        <div className="flex flex-wrap gap-2 mb-10">
          {data.tags.map((tag) => (
            <Link key={tag._id} to={`/browse?tag=${tag.name}`}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 shadow-sm hover:shadow-md"
              style={{ backgroundColor: tag.color + '15', color: tag.color, border: `1px solid ${tag.color}30` }}>
              {tag.icon} {tag.name}
            </Link>
          ))}
        </div>

        {/* 最近更新 */}
        <SectionTitle title="🆕 最近更新" more="/browse?sort=-updatedAt" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
          {data.latest.map((comic) => (
            <Link key={comic._id} to={`/comic/${comic._id}`} className="group">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                <img src={comic.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
              </div>
              <div className="mt-1.5">
                <h3 className="text-xs font-bold text-gray-900 truncate">{comic.title}</h3>
                <p className="text-[10px] text-gray-400">{comic.author}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* 社区热帖 */}
        <SectionTitle title="💬 全网热议" more="/community" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {data.topics.map((topic) => (
            <Link key={topic._id} to={`/community/topic/${topic._id}`} className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-50">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {topic.user?.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 group-hover:text-pink-500 transition truncate">{topic.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {topic.user?.username} · {topic.replyCount || 0} 回复 · {topic.views || 0} 阅读
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
