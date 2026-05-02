import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />

  return children
}
