import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rookieAPI } from '../services/api'
import ProtectedRoute from '../components/ProtectedRoute'

function CreateRookieForm() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [tagsStr, setTagsStr] = useState('')
  const [pages, setPages] = useState([])
  const [previews, setPreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    setPages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return setError('请输入作品标题')
    if (pages.length === 0) return setError('请上传作品页面')
    setSubmitting(true)
    setError('')
    const formData = new FormData()
    formData.append('title', title)
    formData.append('author', author)
    formData.append('description', description)
    formData.append('contentTags', tagsStr)
    pages.forEach(p => formData.append('pages', p))
    try {
      const res = await rookieAPI.create(formData)
      navigate(`/rookie/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || '投稿失败')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-extrabold text-gray-900 mb-6">✍️ 投稿作品</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border border-gray-50">
          {error && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl">{error}</div>}
          <p className="text-xs text-gray-400 bg-indigo-50 rounded-xl p-3">
            💡 提示：投稿短篇或第一话，读者投票和评分。月度前三名有机会获得签约邀请。
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">作品标题 *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="给你的作品起个名字" className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">作者名</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="你的笔名" className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">简介</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="用几句话吸引读者..." className="w-full p-4 bg-gray-50 border-0 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">标签 (逗号分隔)</label>
            <input value={tagsStr} onChange={e => setTagsStr(e.target.value)} placeholder="热血, 奇幻, 新人" className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">作品页面 *</label>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100" />
          </div>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {previews.map((url, idx) => <img key={idx} src={url} alt="" className="w-full aspect-[3/4] object-cover rounded-lg" />)}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100">取消</button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg disabled:opacity-50">
              {submitting ? '提交中...' : '投稿'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CreateRookieWrapper() {
  return <ProtectedRoute><CreateRookieForm /></ProtectedRoute>
}
