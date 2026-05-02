import { Link } from 'react-router-dom'

export default function ComicCard({ comic }) {
  return (
    <Link
      to={`/comic/${comic._id}`}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-200">
        {comic.cover ? (
          <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📚</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{comic.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{comic.author}</p>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${comic.status === '连载中' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {comic.status}
          </span>
          <span className="text-xs text-gray-400">{comic.views} 阅读</span>
        </div>
        {comic.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {comic.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{cat}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
