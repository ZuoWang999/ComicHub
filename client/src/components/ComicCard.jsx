import { Link } from 'react-router-dom'

export default function ComicCard({ comic }) {
  return (
    <Link
      to={`/comic/${comic._id}`}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-200">
        {comic.cover ? (
          <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📚</div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{comic.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{comic.author}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${comic.status === '连载中' ? 'bg-green-100 text-green-700' : comic.status === '休刊中' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
            {comic.status}
          </span>
          <div className="flex items-center space-x-1 text-[10px] text-gray-400">
            <span>🔥 {comic.hotScore || 0}</span>
          </div>
        </div>
        {comic.contentTags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {comic.contentTags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{tag}</span>
            ))}
          </div>
        )}
        {comic.schedule && comic.status === '连载中' && (
          <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded mt-1 inline-block">{comic.schedule}</span>
        )}
      </div>
    </Link>
  )
}
