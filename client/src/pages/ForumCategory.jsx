import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { forumAPI } from '../services/api'
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
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [categoryId, page])

  useEffect(() => {
    forumAPI.getCategories().then((res) => {
      setCategory(res.data.find(c => c._id === categoryId))
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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link to="/community" className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">{category?.icon} {category?.name || '版块'}</h1>
              {category?.description && <p className="text-xs text-gray-400 mt-0.5">{category.description}</p>}
            </div>
          </div>
          <Link to="/community/create" className="px-5 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition">
            + 发帖
          </Link>
        </div>

        {loading ? <Loading /> : topics.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">该版块暂无帖子</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {topics.map((topic) => (
                <Link key={topic._id} to={`/community/topic/${topic._id}`} className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                      {topic.user?.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {topic.isPinned && <span className="px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded text-[10px] font-bold">置顶</span>}
                        <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2">{topic.title}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 mb-2 line-clamp-2">{topic.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span className="font-medium">{topic.user?.username}</span>
                        <span className="ml-auto">{new Date(topic.lastReplyAt).toLocaleDateString('zh-CN')}</span>
                        <span>👁 {topic.views}</span>
                        <span>💬 {topic.replyCount}</span>
                        <span>❤️ {topic.likes?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={updatePage} />
          </>
        )}
      </div>
    </div>
  )
}
