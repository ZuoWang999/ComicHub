import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { comicsAPI } from '../services/api'
import ComicCard from '../components/ComicCard'
import Pagination from '../components/Pagination'
import Loading from '../components/Loading'

const DEFAULT_CATEGORIES = ['热血', '恋爱', '搞笑', '悬疑', '奇幻', '科幻', '校园', '动作', '冒险', '治愈']

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [comics, setComics] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])

  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || '-updatedAt'

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [comicRes, catRes] = await Promise.all([
        comicsAPI.getList({ page, limit: 24, category, status, search, sort }),
        comicsAPI.getCategories().catch(() => ({ data: DEFAULT_CATEGORIES })),
      ])
      setComics(comicRes.data.comics)
      setPagination(comicRes.data.pagination)
      setCategories(catRes.data?.length ? catRes.data : DEFAULT_CATEGORIES)
    } catch (err) {
      setCategories(DEFAULT_CATEGORIES)
    } finally {
      setLoading(false)
    }
  }, [page, category, status, search, sort])

  useEffect(() => { fetchData() }, [fetchData])

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.set('page', '1')
    setSearchParams(params)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">分类:</span>
          <button
            onClick={() => updateParam('category', '')}
            className={`px-3 py-1 text-sm rounded-full ${!category ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              className={`px-3 py-1 text-sm rounded-full ${category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">状态:</span>
          <button
            onClick={() => updateParam('status', '')}
            className={`px-3 py-1 text-sm rounded-full ${!status ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            全部
          </button>
          <button
            onClick={() => updateParam('status', '连载中')}
            className={`px-3 py-1 text-sm rounded-full ${status === '连载中' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            连载中
          </button>
          <button
            onClick={() => updateParam('status', '已完结')}
            className={`px-3 py-1 text-sm rounded-full ${status === '已完结' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            已完结
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">排序:</span>
          <button
            onClick={() => updateParam('sort', '-updatedAt')}
            className={`px-3 py-1 text-sm rounded-full ${sort === '-updatedAt' || !sort ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            最新
          </button>
          <button
            onClick={() => updateParam('sort', '-views')}
            className={`px-3 py-1 text-sm rounded-full ${sort === '-views' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            最热
          </button>
        </div>
        {search && (
          <p className="text-sm text-gray-500">搜索: &quot;{search}&quot; 共 {pagination.total} 个结果</p>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : comics.length === 0 ? (
        <div className="text-center py-20 text-gray-500">没有找到漫画</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {comics.map((comic) => (
              <ComicCard key={comic._id} comic={comic} />
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => updateParam('page', String(p))} />
        </>
      )}
    </div>
  )
}
