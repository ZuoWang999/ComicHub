import { Link } from 'react-router-dom'

export default function TopicCard({ topic }) {
  const formatDate = (d) => {
    const date = new Date(d)
    const now = new Date()
    const diff = now - date
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <Link to={`/community/topic/${topic._id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition flex items-start space-x-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
          {topic.user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            {topic.isPinned && <span className="text-red-500 text-xs">[置顶]</span>}
            <h3 className="font-medium text-gray-900 dark:text-white truncate">{topic.title}</h3>
          </div>
          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
            <span>{topic.user?.username}</span>
            {topic.category && (
              <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{topic.category.name || topic.category}</span>
            )}
            {topic.comic && <span className="text-gray-400">关联: {topic.comic.title}</span>}
            <span>{formatDate(topic.lastReplyAt)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs text-gray-400 flex-shrink-0">
          <span title="浏览">👁 {topic.views}</span>
          <span title="回复">💬 {topic.replyCount}</span>
          <span title="点赞">❤️ {topic.likes?.length || 0}</span>
        </div>
      </div>
    </Link>
  )
}
