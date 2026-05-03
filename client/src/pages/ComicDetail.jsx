import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { comicsAPI, chaptersAPI, commentsAPI, forumAPI, votesAPI } from '../services/api'
import Loading from '../components/Loading'

export default function ComicDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [comic, setComic] = useState(null)
  const [chapters, setChapters] = useState([])
  const [comments, setComments] = useState([])
  const [topics, setTopics] = useState([])
  const [voteStats, setVoteStats] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('chapters')
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      comicsAPI.getById(id),
      chaptersAPI.getByComic(id),
      commentsAPI.getByComic(id),
      forumAPI.getTopics({ comic: id, limit: 5 }),
      votesAPI.getComicStats(id).catch(() => ({ data: null })),
    ]).then(([comicRes, chRes, commentRes, topicRes, voteRes]) => {
      setComic(comicRes.data)
      setChapters(chRes.data)
      setComments(commentRes.data.comments)
      setTopics(topicRes.data.topics)
      setVoteStats(voteRes.data)
      if (user) setIsFollowing(user.follows?.includes(id) || false)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id, user])

  const toggleFollow = async () => {
    if (!user) return
    try {
      const res = await comicsAPI.follow(id)
      setIsFollowing(res.data.isFollowing)
      setComic(prev => ({ ...prev, followers: res.data.followers }))
    } catch (err) { alert('操作失败') }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return
    try {
      const res = await commentsAPI.create({ comicId: id, content: newComment })
      setComments([res.data, ...comments])
      setNewComment('')
    } catch (err) { alert(err.response?.data?.message || '评论失败') }
  }

  if (loading) return <Loading />
  if (!comic) return <div className="text-center py-20 text-gray-500">漫画不存在</div>

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-8">
      {/* Cover Background */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img src={comic.cover} alt="" className="w-full h-full object-cover blur-2xl opacity-30 scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Cover */}
          <div className="flex-shrink-0 mx-auto sm:mx-0 w-44">
            <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
              <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex space-x-2 mt-3">
              <button onClick={toggleFollow}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${isFollowing ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' : 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white hover:shadow-lg'}`}>
                {isFollowing ? '❤️ 追更中' : '+ 追更'}
              </button>
              {user?.role === 'admin' && (
                <Link to={`/admin/comic/${id}/edit`} className="px-3 py-2.5 bg-white text-gray-600 rounded-lg text-sm border hover:bg-gray-50">编辑</Link>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{comic.title}</h1>
            <p className="text-gray-500 mt-1">{comic.author}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${comic.status === '连载中' ? 'bg-green-100 text-green-700' : comic.status === '休刊中' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{comic.status}</span>
              {comic.schedule && <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{comic.schedule}</span>}
              {comic.isNewcomer && <span className="px-2.5 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">🚀 新人</span>}
            </div>
            <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
              <span>📖 {comic.views} 阅读</span>
              <span>👥 {comic.followers} 追更</span>
              <span>⭐ {Number(comic.rating).toFixed(1)}</span>
              {voteStats && <span>🗳 {voteStats.totalVotes} 票</span>}
            </div>
            {comic.contentTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {comic.contentTags.map((tag) => (
                  <Link key={tag} to={`/browse?tag=${tag}`} className="px-2.5 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium hover:bg-pink-100 transition">{tag}</Link>
                ))}
              </div>
            )}
            <p className="mt-4 text-gray-600 text-sm leading-relaxed line-clamp-4">{comic.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mt-8 space-x-6">
          {['chapters', 'comments', 'forum'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 text-sm font-bold transition-colors relative ${tab === t ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}>
              {t === 'chapters' ? `📖 章节 (${chapters.length})` : t === 'comments' ? `💬 评论 (${comments.length})` : `📢 讨论 (${topics.length})`}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-full" />}
            </button>
          ))}
        </div>

        <div className="py-4">
          {tab === 'chapters' && (
            <div>
              {user?.role === 'admin' && (
                <Link to={`/admin/comic/${id}/chapter/new`} className="inline-block mb-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-lg text-sm font-medium">
                  + 添加章节
                </Link>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {chapters.map((ch) => (
                  <Link key={ch._id} to={`/comic/${id}/reader/${ch._id}`}
                    className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-100">
                    <span className="text-sm font-medium text-gray-800 truncate">第{ch.number}话 {ch.title}</span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{new Date(ch.createdAt).toLocaleDateString('zh-CN')}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {tab === 'comments' && (
            <div>
              {user ? (
                <div className="mb-4 flex space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="写下你的评论..." rows={2}
                      className="w-full p-3 bg-white border rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
                    <button onClick={handleComment} disabled={!newComment.trim()}
                      className="mt-2 px-4 py-1.5 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full text-sm font-medium disabled:opacity-50">发表</button>
                  </div>
                </div>
              ) : <p className="text-gray-400 mb-4 text-sm"><Link to="/login" className="text-pink-500">登录</Link> 后参与评论</p>}
              {comments.map((c) => (
                <div key={c._id} className="bg-white rounded-xl p-4 shadow-sm mb-2">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 text-xs font-bold">{c.user?.username?.charAt(0)?.toUpperCase()}</div>
                    <span className="text-sm font-bold text-gray-700">{c.user?.username}</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-9">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'forum' && (
            <div>
              <Link to={`/community/create?comicId=${id}`} className="inline-block mb-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-lg text-sm font-medium">发起讨论</Link>
              {topics.map((topic) => (
                <Link key={topic._id} to={`/community/topic/${topic._id}`} className="block mb-2">
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {topic.user?.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-gray-800">{topic.title}</span>
                          <p className="text-xs text-gray-400">{topic.user?.username} · {topic.replyCount} 回复</p>
                        </div>
                      </div>
                    </div>
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
