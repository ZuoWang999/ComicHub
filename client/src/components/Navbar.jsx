import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/browse?search=${encodeURIComponent(search)}`)
      setSearch('')
    }
  }

  return (
    <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-xl font-bold tracking-tight">ComicHub</Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-indigo-200 transition">首页</Link>
            <Link to="/browse" className="hover:text-indigo-200 transition">浏览</Link>
            <Link to="/community" className="hover:text-indigo-200 transition">社区</Link>
            {isAdmin && <Link to="/admin" className="hover:text-indigo-200 transition">管理</Link>}
          </div>

          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xs mx-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索漫画..."
              className="w-full px-3 py-1.5 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </form>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to={`/profile/${user._id}`} className="flex items-center space-x-2 hover:text-indigo-200 transition">
                  <div className="w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center text-xs font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{user.username}</span>
                </Link>
                <button onClick={logout} className="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded-lg transition">
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-sm hover:text-indigo-200 transition">登录</Link>
                <Link to="/register" className="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded-lg transition">
                  注册
                </Link>
              </div>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-3 space-y-2">
            <form onSubmit={handleSearch} className="mb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索漫画..."
                className="w-full px-3 py-1.5 rounded-lg text-gray-900 text-sm"
              />
            </form>
            <Link to="/" className="block py-1" onClick={() => setMenuOpen(false)}>首页</Link>
            <Link to="/browse" className="block py-1" onClick={() => setMenuOpen(false)}>浏览</Link>
            <Link to="/community" className="block py-1" onClick={() => setMenuOpen(false)}>社区</Link>
            {isAdmin && <Link to="/admin" className="block py-1" onClick={() => setMenuOpen(false)}>管理</Link>}
            {user ? (
              <>
                <Link to={`/profile/${user._id}`} className="block py-1" onClick={() => setMenuOpen(false)}>个人中心</Link>
                <button onClick={() => { logout(); setMenuOpen(false) }} className="block py-1">退出</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-1" onClick={() => setMenuOpen(false)}>登录</Link>
                <Link to="/register" className="block py-1" onClick={() => setMenuOpen(false)}>注册</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
