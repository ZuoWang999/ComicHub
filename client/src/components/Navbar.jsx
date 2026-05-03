import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/', label: '首页' },
  { to: '/browse', label: '分类' },
  { to: '/browse?sort=-updatedAt', label: '更新' },
  { to: '/browse?sort=-hotScore', label: '排行' },
  { to: '/community', label: '社区' },
]

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
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-extrabold bg-gradient-to-r from-pink-500 to-indigo-600 bg-clip-text text-transparent">ComicHub</span>
            </Link>
            <div className="hidden lg:flex items-center space-x-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="px-3 py-1.5 text-sm text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索漫画..."
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link to={`/profile/${user._id}`} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{user.username}</span>
                </Link>
                {isAdmin && <Link to="/admin" className="text-xs text-gray-500 hover:text-pink-500 px-2 py-1">管理</Link>}
                <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500 px-2 py-1">退出</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-pink-500 px-3 py-1.5">登录</Link>
                <Link to="/register" className="text-sm bg-gradient-to-r from-pink-500 to-indigo-600 text-white px-4 py-1.5 rounded-full hover:shadow-md transition">
                  注册
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-3 border-t space-y-1">
            <form onSubmit={handleSearch} className="pt-3 pb-2">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索漫画..." className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm" />
            </form>
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="block py-2 text-sm text-gray-600" onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ))}
            {user ? (
              <>
                <Link to={`/profile/${user._id}`} className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>个人中心</Link>
                <button onClick={() => { logout(); setMenuOpen(false) }} className="block py-2 text-sm text-red-500">退出</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>登录</Link>
                <Link to="/register" className="block py-2 text-sm text-pink-500" onClick={() => setMenuOpen(false)}>注册</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
