import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { forumAPI, comicsAPI } from '../services/api'
import Loading from '../components/Loading'
import ProtectedRoute from '../components/ProtectedRoute'

function CreateTopicForm() {
  const [categories, setCategories] = useState([])
  const [comics, setComics] = useState([])
  const [searchParams] = useSearchParams()
  const comicId = searchParams.get('comicId') || ''
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedComicId, setSelectedComicId] = useState(comicId)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      forumAPI.getCategories(),
      comicsAPI.getList({ limit: 100 }),
    ]).then(([catRes, comicRes]) => {
      setCategories(catRes.data)
      setComics(comicRes.data.comics)
      if (catRes.data.length > 0) setCategoryId(catRes.data[0]._id)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await forumAPI.createTopic({
        title, content, categoryId,
        comicId: selectedComicId || undefined,
      })
      navigate(`/community/topic/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || '发帖失败')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">发布帖子</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">版块</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="输入帖子标题"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">关联漫画 (可选)</label>
          <select
            value={selectedComicId}
            onChange={(e) => setSelectedComicId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">不关联</option>
            {comics.map((comic) => (
              <option key={comic._id} value={comic._id}>{comic.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="写下你想说的..."
          />
        </div>
        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
          发布
        </button>
      </form>
    </div>
  )
}

export default function CreateTopicWrapper() {
  return (
    <ProtectedRoute>
      <CreateTopicForm />
    </ProtectedRoute>
  )
}
