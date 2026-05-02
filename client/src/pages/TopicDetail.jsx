import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { forumAPI } from '../services/api'
import Loading from '../components/Loading'

export default function TopicDetail() {
  const { topicId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [topic, setTopic] = useState(null)
  const [replies, setReplies] = useState([])
  const [newReply, setNewReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      forumAPI.getTopic(topicId),
      forumAPI.getReplies(topicId),
    ]).then(([topicRes, replyRes]) => {
      setTopic(topicRes.data)
      setReplies(replyRes.data.replies)
      if (user) setLiked(topicRes.data.likes?.includes(user._id))
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [topicId, user])

  const handleLike = async () => {
    if (!user) return
    try {
      const res = await forumAPI.likeTopic(topicId)
      setLiked(res.data.isLiked)
      setTopic((prev) => ({ ...prev, likes: [...prev.likes, res.data.isLiked ? '' : ''].slice(0, -1) }))
      const updated = await forumAPI.getTopic(topicId)
      setTopic(updated.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleReply = async () => {
    if (!newReply.trim() || !user) return
    try {
      const res = await forumAPI.createReply(topicId, { content: newReply })
      setReplies([...replies, res.data])
      setNewReply('')
      const updated = await forumAPI.getTopic(topicId)
      setTopic(updated.data)
    } catch (err) {
      alert(err.response?.data?.message || '回复失败')
    }
  }

  const handleDeleteTopic = async () => {
    if (!confirm('确定删除这个帖子吗？')) return
    try {
      await forumAPI.deleteTopic(topicId)
      navigate('/community')
    } catch (err) {
      alert('删除失败')
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm('确定删除这条回复吗？')) return
    try {
      await forumAPI.deleteReply(replyId)
      setReplies(replies.filter(r => r._id !== replyId))
      const updated = await forumAPI.getTopic(topicId)
      setTopic(updated.data)
    } catch (err) {
      alert('删除失败')
    }
  }

  if (loading) return <Loading />
  if (!topic) return <div className="text-center py-20 text-gray-500">帖子不存在</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to={topic.category?._id ? `/community/category/${topic.category._id}` : '/community'} className="text-sm text-indigo-600 hover:underline">
        &larr; 返回{topic.category?._id ? topic.category.name : '社区'}
      </Link>

      <div className="mt-3 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{topic.title}</h1>
        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
            {topic.user?.username?.charAt(0).toUpperCase()}
          </div>
          <span>{topic.user?.username}</span>
          {topic.category && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs">{topic.category.name}</span>}
          <span>{new Date(topic.createdAt).toLocaleString('zh-CN')}</span>
          <span>👁 {topic.views}</span>
        </div>
        {topic.comic && (
          <Link to={`/comic/${topic.comic._id}`} className="inline-block mt-2 text-sm text-indigo-600 hover:underline">
            关联漫画: {topic.comic.title}
          </Link>
        )}
        <div className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {topic.content}
        </div>
        <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full transition ${liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{topic.likes?.length || 0}</span>
          </button>
          {(user?._id === topic.user?._id || user?.role === 'admin') && (
            <button onClick={handleDeleteTopic} className="text-sm text-red-500 hover:underline">删除</button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          回复 ({replies.length})
        </h2>

        {replies.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无回复</p>
        ) : (
          <div className="space-y-3 mb-6">
            {replies.map((reply) => (
              <div key={reply._id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                      {reply.user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{reply.user?.username}</span>
                    <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                  {(user?._id === reply.user?._id || user?.role === 'admin') && (
                    <button onClick={() => handleDeleteReply(reply._id)} className="text-xs text-red-500 hover:underline">删除</button>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {user ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="写下你的回复..."
              rows={3}
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
            />
            <button
              onClick={handleReply}
              disabled={!newReply.trim()}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-indigo-700"
            >
              回复
            </button>
          </div>
        ) : (
          <p className="text-gray-500"><Link to="/login" className="text-indigo-600">登录</Link> 后参与回复</p>
        )}
      </div>
    </div>
  )
}
