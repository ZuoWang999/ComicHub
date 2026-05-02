import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chaptersAPI } from '../services/api'
import Loading from '../components/Loading'

export default function Reader() {
  const { comicId, chapterId } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('scroll')

  useEffect(() => {
    chaptersAPI.getById(chapterId).then((res) => {
      setData(res.data)
    }).catch(console.error)
    .finally(() => setLoading(false))

    if (user) {
      chaptersAPI.saveProgress(chapterId, { progress: 100 }).catch(() => {})
    }
  }, [chapterId, user])

  if (loading) return <Loading />
  if (!data) return <div className="text-center py-20 text-gray-500">章节不存在</div>

  const { chapter, prevChapter, nextChapter } = data

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="sticky top-0 z-40 bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={`/comic/${comicId}`} className="text-indigo-400 hover:text-indigo-300 text-sm">&larr; 返回</Link>
          <span className="text-sm font-medium">{chapter.comic?.title} - {chapter.title}</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMode(mode === 'scroll' ? 'single' : 'scroll')}
            className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
          >
            {mode === 'scroll' ? '单页模式' : '滚动模式'}
          </button>
        </div>
      </div>

      {prevChapter && (
        <Link
          to={`/comic/${comicId}/reader/${prevChapter._id}`}
          className="block text-center py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition text-sm"
        >
          ⬆ 上一话: 第{prevChapter.number}话 {prevChapter.title}
        </Link>
      )}

      {mode === 'scroll' ? (
        <div className="max-w-2xl mx-auto">
          {chapter.pages.map((page, idx) => (
            <img
              key={idx}
              src={page}
              alt={`第 ${idx + 1} 页`}
              className="w-full"
              loading="lazy"
            />
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <PageViewer pages={chapter.pages} />
        </div>
      )}

      {nextChapter ? (
        <Link
          to={`/comic/${comicId}/reader/${nextChapter._id}`}
          className="block text-center py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition text-sm"
        >
          ⬇ 下一话: 第{nextChapter.number}话 {nextChapter.title}
        </Link>
      ) : (
        <p className="text-center py-3 bg-gray-800 text-gray-500 text-sm">已经是最新一章了</p>
      )}

      <div className="text-center py-4">
        <Link to={`/comic/${comicId}`} className="text-indigo-400 hover:text-indigo-300 text-sm">返回漫画详情</Link>
      </div>
    </div>
  )
}

function PageViewer({ pages }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrent((p) => Math.min(p + 1, pages.length - 1))
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
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="disabled:opacity-30 hover:text-white"
        >
          &larr; 上一页
        </button>
        <span>{current + 1} / {pages.length}</span>
        <button
          onClick={() => setCurrent(Math.min(pages.length - 1, current + 1))}
          disabled={current === pages.length - 1}
          className="disabled:opacity-30 hover:text-white"
        >
          下一页 &rarr;
        </button>
      </div>
      <img src={pages[current]} alt={`第 ${current + 1} 页`} className="w-full" />
      <div className="flex justify-center mt-4 pb-4">
        <button
          onClick={() => setCurrent(0)}
          className="text-sm text-gray-400 hover:text-white border border-gray-600 px-3 py-1 rounded"
        >
          回到首页
        </button>
      </div>
    </div>
  )
}
