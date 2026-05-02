import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { forumAPI } from '../services/api'
import TopicCard from '../components/TopicCard'
import Loading from '../components/Loading'

export default function Community() {
  const [categories, setCategories] = useState([])
  const [hotTopics, setHotTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      forumAPI.getCategories(),
      forumAPI.getHotTopics(),
    ]).then(([catRes, topicRes]) => {
      setCategories(catRes.data)
      setHotTopics(topicRes.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📢 讨论社区</h1>
        <Link to="/community/create" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
          发布帖子
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/community/category/${cat._id}`}
            className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition text-center"
            style={{ borderTop: `3px solid ${cat.color || '#6366f1'}` }}
          >
            <span className="text-2xl mb-2">{cat.icon}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
            <span className="text-xs text-gray-500 mt-1">{cat.topicCount} 帖</span>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔥 热门讨论</h2>
        {hotTopics.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无帖子</p>
        ) : (
          <div className="space-y-2">
            {hotTopics.map((topic) => (
              <TopicCard key={topic._id} topic={topic} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
