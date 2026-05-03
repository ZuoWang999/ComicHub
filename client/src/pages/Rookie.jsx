import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { rookieAPI } from '../services/api'
import Loading from '../components/Loading'

export default function Rookie() {
  const [works, setWorks] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      rookieAPI.getList({ limit: 20, sort: '-hotScore', status: 'featured' }),
      rookieAPI.getFeatured(),
    ]).then(([allRes, featRes]) => {
      setWorks(allRes.data.works)
      setFeatured(featRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-2xl font-extrabold mb-2">🚀 ComicHub 创作者孵化器</h1>
          <p className="text-white/80 text-sm mb-4">发现下一代漫画之星，你的每一票都可能改变一个创作者的命运</p>
          <Link to="/rookie/create" className="inline-block px-5 py-2.5 bg-white text-indigo-600 font-bold rounded-full hover:shadow-lg transition">我要投稿</Link>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center">
              <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-indigo-600 rounded-full mr-2.5"></span>
              ⭐ 编辑精选
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((work) => (
                <Link key={work._id} to={`/rookie/${work._id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                    <img src={work.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{work.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{work.author}</p>
                    <div className="flex items-center space-x-2 mt-1.5 text-xs text-gray-500">
                      <span>👍 {work.votes}</span>
                      <span>⭐ {Number(work.rating).toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All works */}
        <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center">
          <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-indigo-600 rounded-full mr-2.5"></span>
          📋 最新投稿
        </h2>
        <div className="space-y-3">
          {works.map((work) => (
            <Link key={work._id} to={`/rookie/${work._id}`} className="flex items-start space-x-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-50">
              <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={work.cover} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">{work.title}</h3>
                  {work.status === 'featured' && <span className="px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded text-[10px] font-bold">精选</span>}
                  {work.status === 'signed' && <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-[10px] font-bold">已签约</span>}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{work.author} · {work.pages?.length || 0}页</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{work.description}</p>
                {work.contentTags?.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {work.contentTags.map(t => <span key={t} className="px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded text-[10px]">{t}</span>)}
                  </div>
                )}
              </div>
              <div className="text-right text-xs text-gray-400 space-y-1 flex-shrink-0">
                <div>👍 {work.votes}</div>
                <div>⭐ {Number(work.rating).toFixed(1)}</div>
                <div>👁 {work.views}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
