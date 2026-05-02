export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null

  const getPages = () => {
    const items = []
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - 2 && i <= page + 2)) {
        items.push(i)
      } else if (items[items.length - 1] !== '...') {
        items.push('...')
      }
    }
    return items
  }

  return (
    <div className="flex items-center justify-center space-x-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        上一页
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-500">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 rounded text-sm ${p === page ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="px-3 py-1.5 rounded text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        下一页
      </button>
    </div>
  )
}
