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
  const favIds = JSON.parse(localStorage.getItem(`favs_${userId}`) || '[]')

  useEffect(() => {
    const load = async () => {
      try {
        const topicRes = await forumAPI.getTopics({ limit: 20, sort: '-createdAt' })
        const userTopics = topicRes.data.topics.filter(t => t.user?._id === userId)
        setTopics(userTopics)

        if (favIds.length > 0) {
          const comicRes = await comicsAPI.getList({ limit: 100 })
          const favComics = comicRes.data.comics.filter(c => favIds.includes(c._id))
          if (favComics.length < favIds.length) {
            const details = await Promise.all(
              favIds.map(id => comicsAPI.getById(id).catch(() => null))
            )
            details.forEach(r => {
              if (r && !favComics.find(f => f._id === r.data._id)) {
                favComics.push(r.data)
              }
            })
          }
          setFavorites(favComics)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  if (loading) return <Loading />

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
            U
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">用户</h1>
            <p className="text-sm text-gray-500">
              {isOwner ? '这是我的个人主页' : '用户主页'}
            </p>
          </div>
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
                <Link
                  key={comic._id}
                  to={`/comic/${comic._id}`}
                  className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow transition"
                >
                  <div className="w-12 h-16 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                    {comic.cover && <img src={comic.cover} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{comic.title}</p>
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
            {isOwner && (
              <Link to="/community/create" className="text-sm text-indigo-600 font-normal hover:underline">
                发帖
              </Link>
            )}
          </h2>
          {topics.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无帖子</p>
          ) : (
            <div className="space-y-2">
              {topics.map((topic) => (
                <Link
                  key={topic._id}
                  to={`/community/topic/${topic._id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow transition"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{topic.title}</p>
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
