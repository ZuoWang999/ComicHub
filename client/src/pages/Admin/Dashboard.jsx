import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { comicsAPI, forumAPI } from '../../services/api'
import ProtectedRoute from '../../components/ProtectedRoute'
import Loading from '../../components/Loading'

function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [comics, setComics] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('📚')
  const [newCatDesc, setNewCatDesc] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }
    Promise.all([
      comicsAPI.getList({ limit: 200 }),
      forumAPI.getCategories(),
    ]).then(([comicRes, catRes]) => {
      setComics(comicRes.data.comics)
      setCategories(catRes.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [user, navigate])

  const handleDeleteComic = async (id) => {
    if (!confirm('确定删除这部漫画吗？')) return
    try {
      await comicsAPI.delete(id)
      setComics(comics.filter(c => c._id !== id))
    } catch (err) {
      alert('删除失败')
    }
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    try {
      const res = await forumAPI.createCategory({
        name: newCatName,
        icon: newCatIcon,
        description: newCatDesc,
      })
      setCategories([...categories, res.data])
      setNewCatName('')
      setNewCatDesc('')
    } catch (err) {
      alert(err.response?.data?.message || '创建失败')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">管理后台</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">📚 漫画管理</h2>
            <Link to="/admin/comic/new" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              添加漫画
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">标题</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">作者</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">状态</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {comics.map((comic) => (
                  <tr key={comic._id}>
                    <td className="px-4 py-2.5">
                      <Link to={`/comic/${comic._id}`} className="text-indigo-600 hover:underline">{comic.title}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{comic.author}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${comic.status === '连载中' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {comic.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex space-x-2">
                        <Link to={`/admin/comic/${comic._id}/edit`} className="text-indigo-600 hover:underline text-xs">编辑</Link>
                        <Link to={`/admin/comic/${comic._id}/chapter/new`} className="text-green-600 hover:underline text-xs">+章节</Link>
                        <button onClick={() => handleDeleteComic(comic._id)} className="text-red-500 hover:underline text-xs">删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {comics.length === 0 && <p className="text-center py-6 text-gray-500">暂无漫画</p>}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📢 版块管理</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4">
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="版块名称"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <input
                type="text"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                placeholder="图标"
                className="w-20 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <input
              type="text"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="版块描述 (可选)"
              className="w-full px-3 py-2 border rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <button onClick={handleCreateCategory} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              创建版块
            </button>
          </div>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{cat.name}</span>
                    <p className="text-xs text-gray-500">{cat.topicCount} 帖</p>
                  </div>
                </div>
                <Link to={`/community/category/${cat._id}`} className="text-xs text-indigo-600 hover:underline">
                  查看
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardWrapper() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
