import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { rookieAPI } from '../services/api'
import Loading from '../components/Loading'

export default function RookieDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [work, setWork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isVoted, setIsVoted] = useState(false)
  const [userRating, setUserRating] = useState(0)

  useEffect(() => {
    rookieAPI.getById(id).then(res => {
      setWork(res.data)
      if (user && res.data.voters?.includes(user._id)) setIsVoted(true)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id, user])

  const handleVote = async () => {
    if (!user) return
    try {
      const res = await rookieAPI.vote(id)
      setIsVoted(res.data.isVoted)
      setWork(prev => ({ ...prev, votes: res.data.votes }))
    } catch (err) { alert('投票失败') }
  }

  const handleRate = async () => {
    if (!userRating || !user) return
    try {
      const res = await rookieAPI.rate(id, { rating: userRating })
      setWork(prev => ({ ...prev, rating: res.data.rating, ratingCount: res.data.ratingCount }))
      setUserRating(0)
    } catch (err) { alert('评分失败') }
  }

  if (loading) return <Loading />
  if (!work) return <div className="text-center py-20 text-gray-500">作品不存在</div>

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/rookie" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span>返回创作者孵化器</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-50">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{work.title}</h1>
          <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {work.author?.charAt(0)?.toUpperCase()}
            </div>
            <span className="font-medium">{work.author}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${work.status === 'featured' ? 'bg-pink-100 text-pink-600' : work.status === 'signed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
              {work.status === 'featured' ? '⭐ 精选' : work.status === 'signed' ? '✅ 已签约' : '🕐 待审核'}
            </span>
          </div>
          {work.description && <p className="text-gray-600 text-sm mb-4 leading-relaxed">{work.description}</p>}

          <div className="flex items-center space-x-4 mb-6">
            <button onClick={handleVote}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-bold transition ${isVoted ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {isVoted ? '❤️ 已投票' : '🤍 投票'} <span className="text-xs">({work.votes})</span>
            </button>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setUserRating(s)}
                  className={`w-8 h-8 rounded-full text-sm transition ${userRating >= s ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>⭐</button>
              ))}
            </div>
            {userRating > 0 && <button onClick={handleRate} className="text-xs text-pink-600 font-bold hover:underline">确认评分</button>}
          </div>

          {work.contentTags?.length > 0 && (
            <div className="flex gap-1.5 mb-4">
              {work.contentTags.map(t => <span key={t} className="px-2.5 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium">{t}</span>)}
            </div>
          )}

          {work.editorNotes && (
            <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700">
              <span className="font-bold">编辑点评：</span>{work.editorNotes}
            </div>
          )}
        </div>

        {/* Pages viewer */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden">
          <div className="text-center py-2 text-white/50 text-xs">{work.pages?.length || 0} 页</div>
          {work.pages?.map((page, idx) => (
            <img key={idx} src={page} alt={`第${idx + 1}页`} className="w-full" loading="lazy" />
          ))}
        </div>
      </div>
    </div>
  )
}
