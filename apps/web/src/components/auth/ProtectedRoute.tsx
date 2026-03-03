import { Navigate } from 'react-router-dom'
import { useAuth, type UserRole } from '@/context/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
