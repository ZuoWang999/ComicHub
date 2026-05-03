import { Link } from 'react-router-dom'

export default function ComicCard({ comic }) {
  return (
    <Link to={`/comic/${comic._id}`} className="block group">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
        {comic.cover ? (
          <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">📚</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {comic.isNewcomer && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded">NEW</span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${comic.status === '连载中' ? 'bg-green-500/90 text-white' : comic.status === '休刊中' ? 'bg-yellow-500/90 text-white' : 'bg-blue-500/90 text-white'}`}>
            {comic.status}
          </span>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">{comic.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{comic.author}</p>
        {comic.contentTags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {comic.contentTags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded-full font-medium">{tag}</span>
            ))}
            {comic.schedule && comic.status === '连载中' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">{comic.schedule}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export function ComicCardHorizontal({ comic }) {
  return (
    <Link to={`/comic/${comic._id}`} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition group min-w-0">
      <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
        {comic.cover ? (
          <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{comic.title}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{comic.author}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${comic.status === '连载中' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {comic.status}
          </span>
          <span className="text-[10px] text-gray-400">{comic.followers || 0} 追</span>
        </div>
      </div>
    </Link>
  )
}
