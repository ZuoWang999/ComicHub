import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { forumAPI, comicsAPI } from '../services/api'
import Loading from '../components/Loading'

export default function Profile() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [topics, setTopics] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const isOwner = currentUser?._id === userId

  useEffect(() => {
    Promise.all([
      forumAPI.getTopics({ limit: 30, sort: '-createdAt' }).catch(() => ({ data: { topics: [] } })),
      comicsAPI.getList({ limit: 50 }).catch(() => ({ data: { comics: [] } })),
    ]).then(([topicRes, comicRes]) => {
      const userTopics = topicRes.data.topics.filter(t => t.user?._id === userId)
      setTopics(userTopics)
      const favIds = JSON.parse(localStorage.getItem(`favs_${userId}`) || '[]')
      const favComics = comicRes.data.comics.filter(c => favIds.includes(c._id))
      setFavorites(favComics)
    }).catch(console.error).finally(() => setLoading(false))
  }, [userId])

  if (loading) return <Loading />

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            U
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">用户</h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {['早期用户'].map(b => (
                <span key={b} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">{b}</span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isOwner ? '这是我的个人主页' : '用户主页'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          {[
            { label: '阅读量', value: '520', sub: '话' },
            { label: '评论数', value: '88', sub: '条' },
            { label: '加入天数', value: '365', sub: '天' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">❤️ 收藏的漫画</h2>
          {favorites.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无收藏</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {favorites.map((comic) => (
                <Link key={comic._id} to={`/comic/${comic._id}`} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow transition">
                  <div className="w-10 h-14 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                    {comic.cover && <img src={comic.cover} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{comic.title}</p>
                    <p className="text-xs text-gray-500">{comic.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
            📝 发布的帖子
            {isOwner && <Link to="/community/create" className="text-sm text-indigo-600 font-normal hover:underline">发帖</Link>}
          </h2>
          {topics.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无帖子</p>
          ) : (
            <div className="space-y-2">
              {topics.map((topic) => (
                <Link key={topic._id} to={`/community/topic/${topic._id}`} className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow transition">
                  <p className="text-sm font-medium truncate">{topic.title}</p>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                    <span>💬 {topic.replyCount}</span>
                    <span>👁 {topic.views}</span>
                    <span>{new Date(topic.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
