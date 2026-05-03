import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { comicsAPI, tagsAPI } from '../services/api'
import ComicCard from '../components/ComicCard'
import Pagination from '../components/Pagination'
import Loading from '../components/Loading'

const SORT_OPTIONS = [
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
  const [hotTags, setHotTags] = useState([])

  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''
  const tag = searchParams.get('tag') || ''
  const schedule = searchParams.get('schedule') || ''
  const sort = searchParams.get('sort') || '-hotScore'
  const isNewcomer = searchParams.get('isNewcomer') || ''

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
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [page, category, status, tag, schedule, sort, isNewcomer])

  useEffect(() => { fetchData() }, [fetchData])

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value); else params.delete(key)
    if (key !== 'page') params.set('page', '1')
    setSearchParams(params)
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {tag ? `#${tag}` : isNewcomer ? '新人黑马' : category || '发现漫画'}
          </h1>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button onClick={() => { updateParam('isNewcomer', '') }} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${!isNewcomer ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>全部</button>
            <button onClick={() => { updateParam('isNewcomer', 'true') }} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${isNewcomer === 'true' ? 'bg-white dark:bg-gray-700 text-pink-500 shadow-sm' : 'text-gray-500'}`}>🚀 新人</button>
          </div>
        </div>

        {/* Tag Filter */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {tag && (
            <span className="px-3 py-1.5 text-xs rounded-full bg-pink-500 text-white cursor-pointer" onClick={() => updateParam('tag', '')}>#{tag} ✕</span>
          )}
          {!tag && hotTags.map((t) => (
            <button key={t._id} onClick={() => updateParam('tag', t.name)}
              className="px-3 py-1.5 text-xs rounded-full font-medium transition hover:scale-105"
              style={{ backgroundColor: t.color + '15', color: t.color, border: `1px solid ${t.color}30` }}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 pb-3 border-b text-xs">
          <span className="text-gray-400 mr-1">状态:</span>
          {['', '连载中', '已完结'].map((s) => (
            <button key={s} onClick={() => updateParam('status', s)} className={`px-2.5 py-1 rounded-full transition ${(status || '') === s ? (s === '' ? 'bg-gray-900 text-white' : s === '连载中' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white') : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s || '全部'}</button>
          ))}
          <span className="text-gray-300">|</span>
          <span className="text-gray-400 mr-1">更新:</span>
          {['', '周刊', '半月刊', '月刊'].map((s) => (
            <button key={s} onClick={() => updateParam('schedule', s)} className={`px-2.5 py-1 rounded-full transition ${(schedule || '') === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s || '全部'}</button>
          ))}
        </div>

        {/* Sort Bar */}
        <div className="flex items-center space-x-2 mb-5">
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.key} onClick={() => updateParam('sort', opt.key)} className={`px-4 py-1.5 text-sm rounded-full font-medium transition ${sort === opt.key ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}>{opt.label}</button>
          ))}
        </div>

        {loading ? <Loading /> : comics.length === 0 ? (
          <div className="text-center py-20 text-gray-400">没有找到漫画</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {comics.map((comic) => <ComicCard key={comic._id} comic={comic} />)}
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => updateParam('page', String(p))} />
          </>
        )}
      </div>
    </div>
  )
}
