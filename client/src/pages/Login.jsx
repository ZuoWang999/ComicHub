import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || '登录失败')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">登录 ComicHub</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="请输入密码"
          />
        </div>
        <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
          登录
        </button>
        <p className="text-center text-sm text-gray-500">
          还没有账号？ <Link to="/register" className="text-indigo-600 hover:underline">立即注册</Link>
        </p>
      </form>
    </div>
  )
}
