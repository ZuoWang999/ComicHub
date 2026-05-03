import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fanartAPI, comicsAPI } from '../services/api'
import Loading from '../components/Loading'

export default function FanartZone() {
  const { comicId } = useParams()
  const { user } = useAuth()
  const [comic, setComic] = useState(null)
  const [fanarts, setFanarts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', tags: '' })
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      comicsAPI.getById(comicId),
      fanartAPI.getByComic(comicId),
    ]).then(([comicRes, fanartRes]) => {
      setComic(comicRes.data)
      setFanarts(fanartRes.data.fanarts)
    }).catch(console.error).finally(() => setLoading(false))
  }, [comicId])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (files.length === 0) return alert('请选择图片')
    setSubmitting(true)
    const formData = new FormData()
    formData.append('title', form.title || '无标题')
    formData.append('comicId', comicId)
    formData.append('description', form.description)
    formData.append('tags', form.tags)
    files.forEach(f => formData.append('images', f))
    try {
      const res = await fanartAPI.create(formData)
      setFanarts([res.data, ...fanarts])
      setUploadOpen(false)
      setForm({ title: '', description: '', tags: '' })
      setFiles([])
    } catch (err) { alert(err.response?.data?.message || '上传失败') }
    finally { setSubmitting(false) }
  }

  const handleLike = async (id) => {
    try {
      const res = await fanartAPI.like(id)
      setFanarts(fanarts.map(f => f._id === id ? { ...f, likeCount: res.data.likes, likes: [...f.likes] } : f))
    } catch (err) {}
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除？')) return
    try { await fanartAPI.delete(id); setFanarts(fanarts.filter(f => f._id !== id)) } catch (err) { alert('删除失败') }
  }

  const handleApprove = async (id) => {
    try { await fanartAPI.approve(id); setFanarts(fanarts.map(f => f._id === id ? { ...f, officialApproved: true, featured: true } : f)) } catch (err) { alert('操作失败') }
  }

  if (loading) return <Loading />
  if (!comic) return <div className="text-center py-20 text-gray-500">漫画不存在</div>

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link to={`/comic/${comicId}`} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">🎨 {comic.title} · 同人创作</h1>
              <p className="text-xs text-gray-400 mt-0.5">粉丝二次创作展示区</p>
            </div>
          </div>
          {user && (
            <button onClick={() => setUploadOpen(!uploadOpen)}
              className="px-5 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg">
              + 上传作品
            </button>
          )}
        </div>

        {uploadOpen && (
          <form onSubmit={handleUpload} className="bg-white rounded-2xl shadow-sm p-5 mb-6 space-y-3 border border-gray-50">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="作品标题" className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="创作说明（可选）" className="w-full p-3 bg-gray-50 border-0 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
            <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files))} className="w-full text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-pink-50 file:text-pink-600" />
            <button type="submit" disabled={submitting} className="px-5 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full text-sm font-bold disabled:opacity-50">
              {submitting ? '上传中...' : '发布'}
            </button>
          </form>
        )}

        {fanarts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🎨</div>
            <p className="text-sm">还没有同人作品，来做第一个创作者吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {fanarts.map((fa) => (
              <div key={fa._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-50">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img src={fa.images?.[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm text-gray-900 truncate">{fa.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{fa.author}</p>
                  <div className="flex items-center justify-between mt-2">
                    <button onClick={() => handleLike(fa._id)}
                      className="flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-pink-50 hover:text-pink-500 transition">
                      🤍 {fa.likeCount}
                    </button>
                    {fa.officialApproved && <span className="text-[10px] px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded-full font-bold">官方认可</span>}
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex space-x-2 mt-2">
                      {!fa.officialApproved && <button onClick={() => handleApprove(fa._id)} className="text-[10px] text-pink-500 hover:underline">认可</button>}
                      <button onClick={() => handleDelete(fa._id)} className="text-[10px] text-red-400 hover:underline">删除</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
