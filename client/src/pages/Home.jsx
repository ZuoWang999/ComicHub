import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { comicsAPI, tagsAPI, forumAPI } from '../services/api'
import ComicCard from '../components/ComicCard'
import TopicCard from '../components/TopicCard'
import Loading from '../components/Loading'

const TAB_LIST = [
  { key: 'weekly', label: '本周热榜' },
  { key: 'monthly', label: '月度人气' },
  { key: 'newcomer', label: '新人黑马' },
]

export default function Home() {
  const [rankings, setRankings] = useState([])
  const [latestComics, setLatestComics] = useState([])
  const [hotTags, setHotTags] = useState([])
  const [hotTopics, setHotTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [rankTab, setRankTab] = useState('weekly')

  useEffect(() => {
    Promise.all([
      comicsAPI.getRankings('weekly'),
      comicsAPI.getLatest(),
      tagsAPI.getHot('content'),
      forumAPI.getHotTopics(),
    ]).then(([rankRes, latestRes, tagRes, topicRes]) => {
      setRankings(rankRes.data)
      setLatestComics(latestRes.data)
      setHotTags(tagRes.data.slice(0, 12))
      setHotTopics(topicRes.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const switchRank = async (type) => {
    setRankTab(type)
    try {
      const res = await comicsAPI.getRankings(type)
      setRankings(res.data)
    } catch (err) { console.error(err) }
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 md:p-10 mb-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">ComicHub</h1>
        <p className="text-white/80 text-lg mb-6">发现你喜欢的漫画，见证每一部神作的诞生</p>
        <div className="flex flex-wrap gap-2">
          <Link to="/browse" className="px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition">
            开始探索
          </Link>
          <Link to="/community" className="px-5 py-2.5 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition">
            进入社区
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">📊 排行榜</h2>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {TAB_LIST.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => switchRank(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${rankTab === tab.key ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {rankings.map((comic, idx) => (
              <Link key={comic._id} to={`/comic/${comic._id}`} className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b last:border-0">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${idx < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                  {idx + 1}
                </span>
                <div className="w-12 h-16 rounded overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                  {comic.cover && <img src={comic.cover} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{comic.title}</h3>
                  <p className="text-xs text-gray-500">{comic.author} · {comic.status}</p>
                  <div className="flex items-center space-x-2 mt-0.5 text-xs text-gray-400">
                    {comic.contentTags?.slice(0, 3).map(t => <span key={t} className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{t}</span>)}
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-bold text-red-500">{rankTab === 'weekly' ? `🔥 ${comic.weeklyVotes}` : rankTab === 'monthly' ? `📈 ${comic.monthlyVotes}` : `⭐ ${comic.hotScore}`}</div>
                  <div className="text-xs text-gray-400">{comic.followers} 追</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🏷️ 热门标签</h2>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {hotTags.map((tag) => (
              <Link
                key={tag._id}
                to={`/browse?tag=${tag.name}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-80 transition"
                style={{ backgroundColor: tag.color + '20', color: tag.color, border: `1px solid ${tag.color}40` }}
              >
                {tag.icon} {tag.name}
              </Link>
            ))}
          </div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">💬 社区热帖</h2>
          <div className="space-y-2">
            {hotTopics.slice(0, 5).map((topic) => (
              <TopicCard key={topic._id} topic={topic} />
            ))}
          </div>
          <Link to="/community" className="block text-center mt-3 text-sm text-indigo-600 hover:underline">
            查看更多讨论 →
          </Link>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">🆕 最近更新</h2>
          <Link to="/browse?sort=-updatedAt" className="text-sm text-indigo-600 hover:underline">查看更多</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {latestComics.map((comic) => (
            <ComicCard key={comic._id} comic={comic} />
          ))}
        </div>
      </section>
    </div>
  )
}
