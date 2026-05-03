import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { comicsAPI, chaptersAPI, commentsAPI, forumAPI, votesAPI, tagsAPI } from '../services/api'
import Loading from '../components/Loading'

export default function ComicDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [comic, setComic] = useState(null)
  const [chapters, setChapters] = useState([])
  const [comments, setComments] = useState([])
  const [topics, setTopics] = useState([])
  const [voteStats, setVoteStats] = useState(null)
  const [contentTags, setContentTags] = useState([])
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

      if (user) {
        setIsFollowing(user.follows?.includes(id) || false)
      }
    }).catch(console.error)
    .finally(() => setLoading(false))

    tagsAPI.getHot('content').then(res => {
      setContentTags(res.data || [])
    }).catch(() => {})
  }, [id, user])

  const toggleFollow = async () => {
    if (!user) return
    try {
      const res = await comicsAPI.follow(id)
      setIsFollowing(res.data.isFollowing)
      setComic(prev => ({ ...prev, followers: res.data.followers }))
    } catch (err) {
      alert('操作失败')
    }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return
    try {
      const res = await commentsAPI.create({ comicId: id, content: newComment })
      setComments([res.data, ...comments])
      setNewComment('')
    } catch (err) {
      alert(err.response?.data?.message || '评论失败')
    }
  }

  const deleteComment = async (commentId) => {
    try {
      await commentsAPI.delete(commentId)
      setComments(comments.filter(c => c._id !== commentId))
    } catch (err) { alert('删除失败') }
  }

  if (loading) return <Loading />
  if (!comic) return <div className="text-center py-20 text-gray-500">漫画不存在</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0 w-full md:w-64">
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 shadow-lg">
            {comic.cover ? (
              <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">📚</div>
            )}
          </div>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={toggleFollow}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${isFollowing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {isFollowing ? '❤️ 已追' : '+ 追更'}
            </button>
            {user?.role === 'admin' && (
              <Link to={`/admin/comic/${id}/edit`} className="flex-1 py-2 text-center bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                编辑
              </Link>
            )}
          </div>
          <div className="mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">追更人数</span><span className="font-bold text-gray-900 dark:text-white">{comic.followers}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">本周投票</span><span className="font-bold text-red-500">{comic.weeklyVotes}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">总阅读量</span><span className="font-bold text-gray-900 dark:text-white">{comic.views}</span></div>
            {voteStats && <div className="flex justify-between"><span className="text-gray-500">章节均分</span><span className="font-bold text-amber-500">⭐ {Number(voteStats.avgRating).toFixed(1)}</span></div>}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{comic.title}</h1>
          <p className="text-gray-500 mt-1">作者: {comic.author}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${comic.status === '连载中' ? 'bg-green-100 text-green-700' : comic.status === '休刊中' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
              {comic.status}
            </span>
            {comic.schedule && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">{comic.schedule}</span>}
            <span className="text-xs text-gray-500">{comic.views} 阅读 · ⭐ {Number(comic.rating).toFixed(1)}</span>
            {comic.isNewcomer && <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">🚀 新人</span>}
          </div>
          {comic.contentTags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {comic.contentTags.map((tag) => {
                const tgData = contentTags.find(t => t.name === tag)
                return (
                  <Link key={tag} to={`/browse?tag=${tag}`}
                    className="px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-80 transition"
                    style={{ backgroundColor: (tgData?.color || '#6366f1') + '15', color: tgData?.color || '#6366f1', border: `1px solid ${(tgData?.color || '#6366f1')}40` }}
                  >
                    {tgData?.icon} {tag}
                  </Link>
                )
              })}
            </div>
          )}
          <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{comic.description || '暂无简介'}</p>
        </div>
      </div>

      <div className="flex border-b mb-4 space-x-1">
        {[{ key: 'chapters', label: '📖 章节', count: chapters.length }, { key: 'comments', label: '💬 评论', count: comments.length }, { key: 'forum', label: '📢 讨论', count: topics.length }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === 'chapters' && (
        <div>
          {user?.role === 'admin' && (
            <Link to={`/admin/comic/${id}/chapter/new`} className="inline-block mb-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + 添加章节
            </Link>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {chapters.map((ch) => (
              <Link key={ch._id} to={`/comic/${id}/reader/${ch._id}`}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  第{ch.number}话 {ch.title}
                </span>
                <span className="text-xs text-gray-400 ml-2">{new Date(ch.createdAt).toLocaleDateString('zh-CN')}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tab === 'comments' && (
        <div>
          {user ? (
            <div className="mb-4">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="写下你的评论..." rows={2}
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
              <button onClick={handleComment} disabled={!newComment.trim()}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-indigo-700">
                发表评论
              </button>
            </div>
          ) : (
            <p className="text-gray-500 mb-4"><Link to="/login" className="text-indigo-600">登录</Link> 后参与评论</p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                    {c.user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{c.user?.username}</span>
                  <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                {(user?._id === c.user?._id || user?.role === 'admin') && (
                  <button onClick={() => deleteComment(c._id)} className="text-xs text-red-500 hover:underline">删除</button>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'forum' && (
        <div>
          <Link to={`/community/create?comicId=${id}`} className="inline-block mb-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            发起讨论
          </Link>
          {topics.map((topic) => (
            <Link key={topic._id} to={`/community/topic/${topic._id}`} className="block mb-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{topic.title}</span>
                  <span className="text-xs text-gray-400">💬 {topic.replyCount}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{topic.user?.username} · {new Date(topic.createdAt).toLocaleDateString('zh-CN')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
