export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
        <span>&copy; 2026 ComicHub. 发现你喜欢的漫画</span>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <span>关于 ComicHub</span>
          <span>用户协议</span>
          <span>隐私政策</span>
          <span>帮助中心</span>
        </div>
      </div>
    </footer>
  )
}
