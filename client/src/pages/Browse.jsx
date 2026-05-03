import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { comicsAPI, tagsAPI } from '../services/api'
import ComicCard from '../components/ComicCard'
import Pagination from '../components/Pagination'
import Loading from '../components/Loading'
import api from '../services/api'

const DEMOGRAPHIC = [
  { key: '', label: '全部', icon: '📚' },
  { key: '少年漫', label: '少年', icon: '🔥' },
  { key: '少女漫', label: '少女', icon: '🌸' },
  { key: '青年漫', label: '青年', icon: '📰' },
  { key: '女性漫', label: '女性', icon: '🌹' },
  { key: '少儿漫', label: '少儿', icon: '🧒' },
]

const GENRES = [
  { key: '玄幻修仙', label: '玄幻修仙', icon: '☯️' },
  { key: '动作冒险', label: '动作冒险', icon: '⚔️' },
  { key: '科幻未来', label: '科幻未来', icon: '🚀' },
  { key: '奇幻魔法', label: '奇幻魔法', icon: '🧙' },
  { key: '恋爱情感', label: '恋爱情感', icon: '💕' },
  { key: '搞笑日常', label: '搞笑日常', icon: '😂' },
  { key: '悬疑推理', label: '悬疑推理', icon: '🔍' },
  { key: '恐怖灵异', label: '恐怖灵异', icon: '👻' },
  { key: '运动竞技', label: '运动竞技', icon: '⚽' },
  { key: '校园青春', label: '校园青春', icon: '📘' },
  { key: '历史古风', label: '历史古风', icon: '📜' },
  { key: '职场商战', label: '职场商战', icon: '💼' },
  { key: '美食烹饪', label: '美食烹饪', icon: '🍜' },
  { key: '治愈温馨', label: '治愈温馨', icon: '🌿' },
  { key: '末日生存', label: '末日生存', icon: '💀' },
  { key: '异世界', label: '异世界', icon: '🌍' },
  { key: '异能超能力', label: '异能超能力', icon: '⚡' },
  { key: '战争军事', label: '战争军事', icon: '🎖️' },
  { key: '音乐艺术', label: '音乐艺术', icon: '🎵' },
  { key: '武侠江湖', label: '武侠江湖', icon: '🏮' },
]

const FORMATS = [
  { key: '', label: '全部', icon: '📖' },
  { key: '页漫', label: '页漫', icon: '📖' },
  { key: '条漫', label: '条漫', icon: '📱' },
  { key: '全彩', label: '全彩', icon: '🎨' },
  { key: '黑白', label: '黑白', icon: '🖤' },
  { key: '四格', label: '四格', icon: '⬜' },
]

const ORIGINS = [
  { key: '', label: '全部', icon: '🌏' },
  { key: '国漫', label: '国漫', icon: '🇨🇳' },
  { key: '日漫', label: '日漫', icon: '🇯🇵' },
  { key: '韩漫', label: '韩漫', icon: '🇰🇷' },
  { key: '欧美漫', label: '欧美', icon: '🇺🇸' },
]

const SORT_OPTS = [
  { key: '-hotScore', label: '综合' },
  { key: '-weeklyVotes', label: '本周' },
  { key: '-updatedAt', label: '最新' },
  { key: '-followers', label: '追更' },
]

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [comics, setComics] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [activeDemo, setActiveDemo] = useState('')
  const [activeFormat, setActiveFormat] = useState('')
  const [activeOrigin, setActiveOrigin] = useState('')
  const [activeGenre, setActiveGenre] = useState('')
  const [activeSort, setActiveSort] = useState('-hotScore')

  const page = parseInt(searchParams.get('page') || '1')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 24, sort: activeSort }
      if (activeDemo) params.tag = activeDemo
      if (activeGenre) params.tag = activeGenre
      if (activeFormat) params.tag = activeFormat
      if (activeOrigin) params.tag = activeOrigin

      const res = await api.get('/comics', { params })
      setComics(res.data.comics)
      setPagination(res.data.pagination)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [page, activeDemo, activeGenre, activeFormat, activeOrigin, activeSort])

  useEffect(() => { fetchData() }, [fetchData])

  const updatePage = (p) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    setSearchParams(params)
  }

  const activeTag = activeGenre || activeDemo || activeFormat || activeOrigin

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <h1 className="text-xl font-extrabold text-gray-900 mb-3">
            {activeTag ? `正在浏览: ${activeTag}` : '发现漫画'}
          </h1>
          {activeTag && (
            <button onClick={() => { setActiveDemo(''); setActiveGenre(''); setActiveFormat(''); setActiveOrigin('') }}
              className="px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-sm font-medium hover:bg-pink-200">
              ✕ 清除筛选
            </button>
          )}
        </div>

        {/* ======== 受众 ======== */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-3 border border-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">受众</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMOGRAPHIC.map((d) => (
              <button key={d.key} onClick={() => setActiveDemo(activeDemo === d.label ? '' : d.label)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center space-x-1.5 ${activeDemo === d.label ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <span>{d.icon}</span><span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ======== 题材 ======== */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-3 border border-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">题材</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((g) => (
              <button key={g.key} onClick={() => setActiveGenre(activeGenre === g.label ? '' : g.label)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center space-x-1 ${activeGenre === g.label ? 'bg-pink-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-600'}`}>
                <span>{g.icon}</span><span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ======== 形式 + 来源 ======== */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">形式</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FORMATS.map((f) => (
                <button key={f.key} onClick={() => setActiveFormat(activeFormat === f.label ? '' : f.label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${activeFormat === f.label ? 'bg-cyan-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-cyan-50 hover:text-cyan-600'}`}>
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">来源</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ORIGINS.map((o) => (
                <button key={o.key} onClick={() => setActiveOrigin(activeOrigin === o.label ? '' : o.label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${activeOrigin === o.label ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'}`}>
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sort + Status */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {SORT_OPTS.map((s) => (
            <button key={s.key} onClick={() => setActiveSort(s.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${activeSort === s.key ? 'bg-gray-900 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}>
              {s.label}
            </button>
          ))}
          <div className="h-5 w-px bg-gray-200 mx-1" />
          {['连载中', '已完结'].map((s) => (
            <button key={s} onClick={() => setActiveDemo(s)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${activeDemo === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? <Loading /> : comics.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-sm">没有找到符合条件的漫画</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">共 {pagination.total} 部</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {comics.map((comic) => <ComicCard key={comic._id} comic={comic} />)}
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={updatePage} />
          </>
        )}
      </div>
    </div>
  )
}
