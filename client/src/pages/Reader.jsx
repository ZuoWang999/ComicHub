import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chaptersAPI, votesAPI } from '../services/api'
import Loading from '../components/Loading'

export default function Reader() {
  const { comicId, chapterId } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('scroll')
  const [showVote, setShowVote] = useState(false)
  const [rating, setRating] = useState(0)
  const [voted, setVoted] = useState(false)

  useEffect(() => {
    chaptersAPI.getById(chapterId).then((res) => {
      setData(res.data)
    }).catch(console.error).finally(() => setLoading(false))
    if (user) {
      chaptersAPI.saveProgress(chapterId, { progress: 100 }).catch(() => {})
    }
  }, [chapterId, user])

  const submitVote = async () => {
    if (!rating || voted) return
    try {
      await votesAPI.submit({ chapterId, comicId, rating, expectMore: true })
      setVoted(true)
    } catch (err) {
      alert(err.response?.data?.message || '投票失败')
    }
  }

  useEffect(() => {
    const onScroll = () => {
      if (!data || !user || voted) return
      const scrolled = window.innerHeight + window.scrollY
      const total = document.body.offsetHeight
      if (scrolled > total * 0.8 && !showVote) setShowVote(true)
    }
    if (mode === 'scroll') {
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
  }, [showVote, voted, mode, data, user])

  if (loading) return <Loading />
  if (!data) return <div className="text-center py-20 text-gray-500">章节不存在</div>

  const { chapter, prevChapter, nextChapter } = data

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="sticky top-0 z-40 bg-gray-800/95 backdrop-blur text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={`/comic/${comicId}`} className="text-indigo-400 hover:text-indigo-300 text-sm">&larr; 返回</Link>
          <span className="text-sm font-medium truncate max-w-[200px]">{chapter.comic?.title}</span>
          <span className="text-xs text-gray-400">第{chapter.number}话</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setMode(mode === 'scroll' ? 'single' : 'scroll')}
            className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">
            {mode === 'scroll' ? '单页' : '滚动'}
          </button>
          <span className="text-xs text-gray-500">{chapter.pages.length}P</span>
        </div>
      </div>

      {prevChapter && (
        <Link to={`/comic/${comicId}/reader/${prevChapter._id}`}
          className="block text-center py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition text-sm">
          ⬆ 上一话: 第{prevChapter.number}话 {prevChapter.title}
        </Link>
      )}

      {mode === 'scroll' ? (
        <div className="max-w-2xl mx-auto">
          {chapter.pages.map((page, idx) => (
            <img key={idx} src={page} alt={`第${idx + 1}页`} className="w-full" loading="lazy" />
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <PageViewer pages={chapter.pages} onLastPage={() => { if (user && !voted && !showVote) setShowVote(true) }} />
        </div>
      )}

      {showVote && user && !voted && (
        <div className="max-w-md mx-auto my-6 px-4">
          <div className="bg-gray-800 rounded-xl p-5 text-white">
            <h3 className="text-center font-bold mb-1">本话精彩吗?</h3>
            <p className="text-center text-gray-400 text-xs mb-4">你的评分帮助创作者改进</p>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)}
                  className={`w-10 h-10 rounded-full text-lg transition ${rating >= s ? 'bg-amber-500 scale-110' : 'bg-gray-700 hover:bg-gray-600'}`}>
                  ⭐
                </button>
              ))}
            </div>
            <button onClick={submitVote} disabled={!rating}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700">
              提交评分
            </button>
          </div>
        </div>
      )}

      {voted && (
        <div className="max-w-md mx-auto my-6 px-4">
          <div className="bg-green-900/50 border border-green-700 rounded-xl p-4 text-center text-white text-sm">
            ✅ 评分成功！感谢你的反馈
          </div>
        </div>
      )}

      {nextChapter ? (
        <Link to={`/comic/${comicId}/reader/${nextChapter._id}`}
          className="block text-center py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition text-sm">
          ⬇ 下一话: 第{nextChapter.number}话 {nextChapter.title}
        </Link>
      ) : (
        <div className="text-center py-4 bg-gray-800 text-gray-500 text-sm">
          {chapter.comic?.status === '已完结' ? '📖 已完结' : '🎉 已是最新一章，请关注更新！'}
        </div>
      )}

      {chapter.comic?.status === '连载中' && !nextChapter && (
        <div className="text-center py-4">
          <Link to={`/comic/${comicId}`} className="text-indigo-400 hover:text-indigo-300 text-sm">
            ← 返回漫画详情 · 追更接收更新通知
          </Link>
        </div>
      )}

      <div className="h-16"></div>
    </div>
  )
}

function PageViewer({ pages, onLastPage }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrent((p) => {
          const next = Math.min(p + 1, pages.length - 1)
          if (next === pages.length - 1 && onLastPage) onLastPage()
          return next
        })
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrent((p) => Math.max(p - 1, 0))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pages.length])

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 text-gray-400 text-sm">
        <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
          className="disabled:opacity-30 hover:text-white">&larr; 上一页</button>
        <span>{current + 1} / {pages.length}</span>
        <button onClick={() => {
          const next = Math.min(pages.length - 1, current + 1)
          setCurrent(next)
          if (next === pages.length - 1 && onLastPage) onLastPage()
        }} disabled={current === pages.length - 1}
          className="disabled:opacity-30 hover:text-white">下一页 &rarr;</button>
      </div>
      <img src={pages[current]} alt={`第${current + 1}页`} className="w-full" />
    </div>
  )
}
