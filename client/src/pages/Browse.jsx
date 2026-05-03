import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { comicsAPI, tagsAPI } from '../services/api'
import ComicCard from '../components/ComicCard'
import Pagination from '../components/Pagination'
import Loading from '../components/Loading'

const SORT_OPTIONS = [
  { key: '-hotScore', label: '热度' },
  { key: '-updatedAt', label: '最新' },
  { key: '-weeklyVotes', label: '本周' },
  { key: '-followers', label: '追更' },
  { key: '-views', label: '阅读' },
]

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [comics, setComics] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [hotTags, setHotTags] = useState([])
  const [viewMode, setViewMode] = useState('all')

  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''
  const tag = searchParams.get('tag') || ''
  const schedule = searchParams.get('schedule') || ''
  const sort = searchParams.get('sort') || '-hotScore'
  const isNewcomer = viewMode === 'newcomer'

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [comicRes, tagRes] = await Promise.all([
        comicsAPI.getList({ page, limit: 24, category, status, tag, schedule, sort, isNewcomer }),
        tagsAPI.getHot('content').catch(() => ({ data: [] })),
      ])
      setComics(comicRes.data.comics)
      setPagination(comicRes.data.pagination)
      setHotTags(tagRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, category, status, tag, schedule, sort, isNewcomer])

  useEffect(() => { fetchData() }, [fetchData])

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    if (key !== 'page') params.set('page', '1')
    setSearchParams(params)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {tag ? `标签: #${tag}` : category ? `${category}` : '发现漫画'}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => { setViewMode('all'); updateParam('sort', '-hotScore') }}
            className={`px-4 py-1.5 text-sm rounded-lg transition ${viewMode === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            全部
          </button>
          <button
            onClick={() => { setViewMode('newcomer'); updateParam('sort', '-hotScore') }}
            className={`px-4 py-1.5 text-sm rounded-lg transition ${viewMode === 'newcomer' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            🚀 新人
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-xs text-gray-500 mr-1">标签:</span>
        {tag && (
          <span className="px-3 py-1 text-xs rounded-full bg-indigo-600 text-white cursor-pointer" onClick={() => updateParam('tag', '')}>
            #{tag} ✕
          </span>
        )}
        {!tag && hotTags.slice(0, 10).map((t) => (
          <button
            key={t._id}
            onClick={() => updateParam('tag', t.name)}
            className="px-2.5 py-1 text-xs rounded-full hover:opacity-80 transition"
            style={{ backgroundColor: t.color + '15', color: t.color, border: `1px solid ${t.color}30` }}
          >
            {t.icon} {t.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 mr-1">状态:</span>
        {['', '连载中', '已完结'].map((s) => (
          <button key={s} onClick={() => updateParam('status', s)}
            className={`px-2.5 py-1 text-xs rounded-full ${(status || '') === s ? (s === '' ? 'bg-indigo-600 text-white' : s === '连载中' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white') : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {s || '全部'}
          </button>
        ))}
        <span className="text-xs text-gray-500 mx-1">|</span>
        <span className="text-xs text-gray-500 mr-1">更新频率:</span>
        {['', '周刊', '半月刊', '月刊'].map((s) => (
          <button key={s} onClick={() => updateParam('schedule', s)}
            className={`px-2.5 py-1 text-xs rounded-full ${(schedule || '') === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {s || '全部'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b">
        {SORT_OPTIONS.map((opt) => (
          <button key={opt.key} onClick={() => updateParam('sort', opt.key)}
            className={`px-3 py-1.5 text-xs rounded-full transition ${sort === opt.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : comics.length === 0 ? (
        <div className="text-center py-20 text-gray-500">没有找到漫画</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {comics.map((comic) => <ComicCard key={comic._id} comic={comic} />)}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => updateParam('page', String(p))} />
        </>
      )}
    </div>
  )
}
