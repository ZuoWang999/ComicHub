import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { chaptersAPI, comicsAPI } from '../../services/api'
import ProtectedRoute from '../../components/ProtectedRoute'
import Loading from '../../components/Loading'

function ChapterUploadPage() {
  const { comicId, chapterId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(chapterId)
  const [comic, setComic] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [number, setNumber] = useState('')
  const [pages, setPages] = useState([])
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    setLoading(true)
    const loadData = async () => {
      try {
        const comicRes = await comicsAPI.getById(comicId)
        setComic(comicRes.data)
        if (isEdit) {
          const chRes = await chaptersAPI.getById(chapterId)
          setTitle(chRes.data.chapter.title)
          setNumber(String(chRes.data.chapter.number))
          setPreviews(chRes.data.chapter.pages)
        }
      } catch (err) {
        setError('数据加载失败')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [comicId, chapterId, isEdit])

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    setPages(files)
    const urls = files.map(f => URL.createObjectURL(f))
    if (isEdit && previews.length > 0) {
      setPreviews(urls)
    } else {
      setPreviews(urls)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !number) return setError('请填写章节标题和编号')
    if (!isEdit && pages.length === 0) return setError('请上传章节图片')
    setSubmitting(true)
    setError('')
    const formData = new FormData()
    formData.append('comicId', comicId)
    formData.append('title', title)
    formData.append('number', number)
    pages.forEach((p) => formData.append('pages', p))

    try {
      if (isEdit) {
        await chaptersAPI.update(chapterId, formData)
      } else {
        await chaptersAPI.create(formData)
      }
      navigate(`/comic/${comicId}`)
    } catch (err) {
      setError(err.response?.data?.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading />
  if (!comic) return <div className="text-center py-20 text-gray-500">漫画不存在</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {isEdit ? '编辑章节' : '添加章节'}
      </h1>
      <p className="text-gray-500 mb-6">漫画: {comic.title}</p>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">章节标题 *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="例: 冒险的开始" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">章节编号 *</label>
            <input type="number" value={number} onChange={(e) => setNumber(e.target.value)} required min="1" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="1" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            章节图片 {!isEdit && '*'}
          </label>
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
        </div>
        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {previews.map((url, idx) => (
              <img key={idx} src={url} alt={`第${idx + 1}页`} className="w-full aspect-[3/4] object-cover rounded" />
            ))}
          </div>
        )}
        <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
          {submitting ? '提交中...' : isEdit ? '保存修改' : '创建章节'}
        </button>
      </form>
    </div>
  )
}

export default function ChapterUploadWrapper() {
  return (
    <ProtectedRoute adminOnly>
      <ChapterUploadPage />
    </ProtectedRoute>
  )
}
