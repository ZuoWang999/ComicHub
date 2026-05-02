import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { forumAPI } from '../services/api'
import TopicCard from '../components/TopicCard'
import Pagination from '../components/Pagination'
import Loading from '../components/Loading'

export default function ForumCategory() {
  const { categoryId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [topics, setTopics] = useState([])
  const [category, setCategory] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)

  const page = parseInt(searchParams.get('page') || '1')

  const fetchTopics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await forumAPI.getTopics({ category: categoryId, page, limit: 20, sort: '-isPinned -lastReplyAt' })
      setTopics(res.data.topics)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [categoryId, page])

  useEffect(() => {
    forumAPI.getCategories().then((res) => {
      const cat = res.data.find(c => c._id === categoryId)
      setCategory(cat)
    }).catch(() => {})
    fetchTopics()
  }, [categoryId, fetchTopics])

  const updatePage = (p) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    setSearchParams(params)
  }

  if (loading && !category) return <Loading />

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/community" className="text-sm text-indigo-600 hover:underline">&larr; 返回社区</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {category?.icon} {category?.name || '版块'}
          </h1>
          {category?.description && <p className="text-sm text-gray-500 mt-1">{category.description}</p>}
        </div>
        <Link to="/community/create" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
          发布帖子
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : topics.length === 0 ? (
        <p className="text-gray-500 text-center py-20">该版块暂无帖子</p>
      ) : (
        <>
          <div className="space-y-2">
            {topics.map((topic) => (
              <TopicCard key={topic._id} topic={topic} />
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={updatePage} />
        </>
      )}
    </div>
  )
}
