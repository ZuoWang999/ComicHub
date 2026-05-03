import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
    Promise.all([forumAPI.getCategories(), comicsAPI.getList({ limit: 100 })]).then(([catRes, comicRes]) => {
      setCategories(catRes.data)
      setComics(comicRes.data.comics)
      if (catRes.data.length > 0) setCategoryId(catRes.data[0]._id)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) return setError('请输入标题')
    if (!content.trim()) return setError('请输入内容')
    try {
      const res = await forumAPI.createTopic({ title, content, categoryId, comicId: selectedComicId || undefined })
      navigate(`/community/topic/${res.data._id}`)
    } catch (err) { setError(err.response?.data?.message || '发帖失败') }
  }

  if (loading) return <Loading />

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-extrabold text-gray-900 mb-6">✍️ 发布帖子</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border border-gray-50">
          {error && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">版块</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button key={cat._id} type="button" onClick={() => setCategoryId(cat._id)}
                  className={`flex flex-col items-center p-2.5 rounded-xl text-xs transition border-2 ${categoryId === cat._id ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}>
                  <span className="text-lg mb-0.5">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">标题</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              maxLength={200} placeholder="一句话说清楚你想讨论什么..."
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-400" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">关联漫画 <span className="font-normal normal-case text-gray-400">(可选)</span></label>
            <select value={selectedComicId} onChange={(e) => setSelectedComicId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-700">
              <option value="">不关联</option>
              {comics.map((comic) => <option key={comic._id} value={comic._id}>{comic.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">内容</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              rows={8} placeholder="详细说说你的想法..."
              className="w-full p-4 bg-gray-50 border-0 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-400" />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition">取消</button>
            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition shadow-md">发布</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CreateTopicWrapper() {
  return <ProtectedRoute><CreateTopicForm /></ProtectedRoute>
}
