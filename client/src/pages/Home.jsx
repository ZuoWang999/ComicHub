import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { comicsAPI, forumAPI } from '../services/api'
import ComicCard from '../components/ComicCard'
import TopicCard from '../components/TopicCard'
import Loading from '../components/Loading'

export default function Home() {
  const [hotComics, setHotComics] = useState([])
  const [latestComics, setLatestComics] = useState([])
  const [hotTopics, setHotTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      comicsAPI.getHot(),
      comicsAPI.getLatest(),
      forumAPI.getHotTopics(),
    ]).then(([hotRes, latestRes, topicRes]) => {
      setHotComics(hotRes.data)
      setLatestComics(latestRes.data)
      setHotTopics(topicRes.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 mb-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">欢迎来到 ComicHub</h1>
        <p className="text-indigo-100 text-lg mb-6">阅读你喜爱的漫画，加入社区讨论</p>
        <Link to="/browse" className="inline-block bg-white text-indigo-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-50 transition">
          开始探索
        </Link>
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">🔥 热门漫画</h2>
          <Link to="/browse?sort=-views" className="text-sm text-indigo-600 hover:underline">查看更多</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {hotComics.map((comic) => (
            <ComicCard key={comic._id} comic={comic} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">🆕 最近更新</h2>
          <Link to="/browse?sort=-updatedAt" className="text-sm text-indigo-600 hover:underline">查看更多</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {latestComics.map((comic) => (
            <ComicCard key={comic._id} comic={comic} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">💬 社区热门</h2>
          <Link to="/community" className="text-sm text-indigo-600 hover:underline">进入社区</Link>
        </div>
        <div className="space-y-2">
          {hotTopics.map((topic) => (
            <TopicCard key={topic._id} topic={topic} />
          ))}
        </div>
      </section>
    </div>
  )
}
