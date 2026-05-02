import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { comicsAPI } from '../../services/api'
import ProtectedRoute from '../../components/ProtectedRoute'
import Loading from '../../components/Loading'

function ComicFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', author: '', description: '', categoriesStr: '', tagsStr: '', status: '连载中',
  })
  const [cover, setCover] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    comicsAPI.getById(id).then((res) => {
      const c = res.data
      setForm({
        title: c.title, author: c.author, description: c.description || '',
        categoriesStr: c.categories?.join(', ') || '', tagsStr: c.tags?.join(', ') || '', status: c.status,
      })
      if (c.cover) setCoverPreview(c.cover)
    }).catch(() => {
      setError('漫画不存在')
    }).finally(() => setLoading(false))
  }, [id, isEdit])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCover(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.author) return setError('请填写标题和作者')
    setSubmitting(true)
    setError('')
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('author', form.author)
    formData.append('description', form.description)
    formData.append('categories', form.categoriesStr)
    formData.append('tags', form.tagsStr)
    formData.append('status', form.status)
    if (cover) formData.append('cover', cover)

    try {
      if (isEdit) {
        await comicsAPI.update(id, formData)
      } else {
        await comicsAPI.create(formData)
      }
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{isEdit ? '编辑漫画' : '添加漫画'}</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题 *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">作者 *</label>
            <input name="author" value={form.author} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">简介</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full p-3 border rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">分类 (逗号分隔)</label>
            <input name="categoriesStr" value={form.categoriesStr} onChange={handleChange} placeholder="热血, 冒险, 奇幻" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标签 (逗号分隔)</label>
            <input name="tagsStr" value={form.tagsStr} onChange={handleChange} placeholder="少年漫, 战斗" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">状态</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <option value="连载中">连载中</option>
              <option value="已完结">已完结</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">封面图片</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
          </div>
        </div>
        {coverPreview && (
          <div className="w-32">
            <img src={coverPreview} alt="封面预览" className="rounded-lg shadow" />
          </div>
        )}
        <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
          {submitting ? '提交中...' : isEdit ? '保存修改' : '创建漫画'}
        </button>
      </form>
    </div>
  )
}

export default function ComicFormWrapper() {
  return (
    <ProtectedRoute adminOnly>
      <ComicFormPage />
    </ProtectedRoute>
  )
}
