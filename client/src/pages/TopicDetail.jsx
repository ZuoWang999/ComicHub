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
    }).catch(console.error).finally(() => setLoading(false))
  }, [topicId, user])

  const handleLike = async () => {
    if (!user) return
    try {
      const res = await forumAPI.likeTopic(topicId)
      setLiked(res.data.isLiked)
      const updated = await forumAPI.getTopic(topicId)
      setTopic(updated.data)
    } catch (err) { console.error(err) }
  }

  const handleReply = async () => {
    if (!newReply.trim() || !user) return
    try {
      const res = await forumAPI.createReply(topicId, { content: newReply })
      setReplies([...replies, res.data])
      setNewReply('')
      const updated = await forumAPI.getTopic(topicId)
      setTopic(updated.data)
    } catch (err) { alert(err.response?.data?.message || '回复失败') }
  }

  const handleDeleteTopic = async () => {
    if (!confirm('确定删除这个帖子吗？')) return
    try { await forumAPI.deleteTopic(topicId); navigate('/community') } catch (err) { alert('删除失败') }
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm('确定删除？')) return
    try {
      await forumAPI.deleteReply(replyId)
      setReplies(replies.filter(r => r._id !== replyId))
      setTopic(prev => ({ ...prev, replyCount: prev.replyCount - 1 }))
    } catch (err) { alert('删除失败') }
  }

  if (loading) return <Loading />
  if (!topic) return <div className="text-center py-20 text-gray-500">帖子不存在</div>

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to={topic.category?._id ? `/community/category/${topic.category._id}` : '/community'} className="inline-flex items-center space-x-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span>{topic.category?.name || '社区'}</span>
        </Link>

        {/* Topic Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-3 border border-gray-50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {topic.user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900">{topic.user?.username}</span>
                {topic.category && (
                  <span className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full text-[10px] font-medium">{topic.category.name}</span>
                )}
              </div>
              <span className="text-xs text-gray-400">{new Date(topic.createdAt).toLocaleString('zh-CN')}</span>
            </div>
            {(user?._id === topic.user?._id || user?.role === 'admin') && (
              <button onClick={handleDeleteTopic} className="ml-auto text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition">删除</button>
            )}
          </div>

          <h1 className="text-xl font-extrabold text-gray-900 mb-3">{topic.title}</h1>
          {topic.comic && (
            <Link to={`/comic/${topic.comic._id}`} className="inline-flex items-center space-x-2 mb-3 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-100 transition">
              <span>📚</span>
              <span>{topic.comic.title}</span>
            </Link>
          )}
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{topic.content}</div>

          {/* Actions bar */}
          <div className="flex items-center space-x-3 mt-5 pt-4 border-t border-gray-100">
            <button onClick={handleLike}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition ${liked ? 'bg-pink-50 text-pink-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{topic.likes?.length || 0}</span>
            </button>
            <span className="text-xs text-gray-400">👁 {topic.views} 阅读</span>
            <span className="text-xs text-gray-400">💬 {topic.replyCount} 回复</span>
          </div>
        </div>

        {/* Replies */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-500 mb-3 ml-1">回复 ({replies.length})</h3>
          {replies.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm shadow-sm">暂无回复，来说点什么吧</div>
          ) : (
            <div className="space-y-2">
              {replies.map((reply) => (
                <div key={reply._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {reply.user?.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-800">{reply.user?.username}</span>
                    <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleString('zh-CN')}</span>
                    {(user?._id === reply.user?._id || user?.role === 'admin') && (
                      <button onClick={() => handleDeleteReply(reply._id)} className="ml-auto text-[10px] text-red-400 hover:text-red-600 px-2 py-0.5 rounded hover:bg-red-50">删除</button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 ml-10 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply input */}
        {user ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className="flex space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea value={newReply} onChange={(e) => setNewReply(e.target.value)} placeholder="写下你的回复..."
                  rows={2} className="w-full p-3 bg-gray-50 border-0 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-400" />
                <div className="flex justify-end mt-2">
                  <button onClick={handleReply} disabled={!newReply.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full text-sm font-bold disabled:opacity-40 hover:shadow-lg transition">
                    回复
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <p className="text-sm text-gray-400"><Link to="/login" className="text-pink-500 font-bold">登录</Link> 后参与回复</p>
          </div>
        )}
      </div>
    </div>
  )
}
