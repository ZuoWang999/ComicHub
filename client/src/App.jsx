import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ComicDetail from './pages/ComicDetail'
import Reader from './pages/Reader'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Community from './pages/Community'
import ForumCategory from './pages/ForumCategory'
import TopicDetail from './pages/TopicDetail'
import CreateTopic from './pages/CreateTopic'
import Dashboard from './pages/Admin/Dashboard'
import ComicForm from './pages/Admin/ComicForm'
import ChapterUpload from './pages/Admin/ChapterUpload'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/comic/:id" element={<ComicDetail />} />
          <Route path="/comic/:comicId/reader/:chapterId" element={<Reader />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/category/:categoryId" element={<ForumCategory />} />
          <Route path="/community/topic/:topicId" element={<TopicDetail />} />
          <Route path="/community/create" element={<CreateTopic />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/comic/new" element={<ComicForm />} />
          <Route path="/admin/comic/:id/edit" element={<ComicForm />} />
          <Route path="/admin/comic/:comicId/chapter/new" element={<ChapterUpload />} />
          <Route path="/admin/comic/:comicId/chapter/:chapterId/edit" element={<ChapterUpload />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
