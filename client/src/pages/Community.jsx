import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { forumAPI } from '../services/api'
import Loading from '../components/Loading'

export default function Community() {
  const [categories, setCategories] = useState([])
  const [hotTopics, setHotTopics] = useState([])
  const [latestTopics, setLatestTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hot')

  useEffect(() => {
    Promise.all([
      forumAPI.getCategories(),
      forumAPI.getHotTopics(),
      forumAPI.getTopics({ limit: 20, sort: '-lastReplyAt' }),
    ]).then(([catRes, hotRes, latestRes]) => {
      setCategories(catRes.data)
      setHotTopics(hotRes.data)
      setLatestTopics(latestRes.data.topics)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const topics = activeTab === 'hot' ? hotTopics : latestTopics

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Categories grid - 2 rows */}
        <div className="grid grid-cols-5 gap-2.5 mb-8">
          {categories.map((cat) => (
            <Link key={cat._id} to={`/community/category/${cat._id}`}
              className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border border-gray-50">
              <span className="text-2xl mb-1.5">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-800 text-center line-clamp-1">{cat.name}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{cat.topicCount}帖</span>
            </Link>
          ))}
        </div>

        {/* Tabs + Create */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-0.5">
            <button onClick={() => setActiveTab('hot')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeTab === 'hot' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              🔥 热门
            </button>
            <button onClick={() => setActiveTab('latest')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeTab === 'latest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              🕐 最新
            </button>
          </div>
          <Link to="/community/create" className="px-5 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full text-sm font-bold hover:shadow-lg transition shadow-md">
            + 发布帖子
          </Link>
        </div>

        {/* Topic list */}
        <div className="space-y-2">
          {topics.map((topic) => (
            <Link key={topic._id} to={`/community/topic/${topic._id}`} className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-50">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                  {topic.user?.username?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {topic.isPinned && <span className="px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded text-[10px] font-bold">置顶</span>}
                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2">{topic.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 mb-2 line-clamp-2">{topic.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span className="font-medium">{topic.user?.username}</span>
                    {topic.category && (
                      <span className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full text-[10px]">{topic.category.name || topic.category}</span>
                    )}
                    {topic.comic && (
                      <span className="truncate max-w-[120px]">📚 {topic.comic.title}</span>
                    )}
                    <span className="ml-auto">{new Date(topic.lastReplyAt).toLocaleDateString('zh-CN')}</span>
                    <span>👁 {topic.views}</span>
                    <span>💬 {topic.replyCount}</span>
                    <span>❤️ {topic.likes?.length || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {topics.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm">还没有帖子，快来发布第一个吧</p>
          </div>
        )}
      </div>
    </div>
  )
}
