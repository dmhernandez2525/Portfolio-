/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// Demo users for showcasing the admin dashboard
const DEMO_USERS = [
  {
    id: 'demo-admin',
    name: 'Admin Demo',
    email: 'admin@demo.com',
    role: 'admin' as const,
    avatar: '/avatars/admin.png',
  },
  {
    id: 'demo-viewer',
    name: 'Viewer Demo',
    email: 'viewer@demo.com',
    role: 'viewer' as const,
    avatar: '/avatars/viewer.png',
  },
]

export type UserRole = 'admin' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isDemoMode: boolean
  demoUsers: typeof DEMO_USERS
  login: (email: string, password: string) => Promise<boolean>
  loginAsDemo: (userId: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Check if demo mode is enabled via environment variable
const isDemoModeEnabled = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === 'true'
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const isDemoMode = isDemoModeEnabled()
  const [user, setUser] = useState<User | null>(() => {
    if (!isDemoMode) return null
    if (typeof window === 'undefined') return null
    try {
      const stored = sessionStorage.getItem('demo-user')
      if (!stored) return null
      return JSON.parse(stored) as User
    } catch {
      try { sessionStorage.removeItem('demo-user') } catch { /* storage unavailable */ }
      return null
    }
  })

  const login = useCallback(async (_email: string, _password: string): Promise<boolean> => {
    // Demo mode only; real auth not implemented for portfolio
    return false
  }, [isDemoMode])

  const loginAsDemo = useCallback((userId: string) => {
    if (!isDemoMode) {
      return
    }

    const demoUser = DEMO_USERS.find(u => u.id === userId)
    if (demoUser) {
      setUser(demoUser)
      try { sessionStorage.setItem('demo-user', JSON.stringify(demoUser)) } catch { /* storage unavailable */ }
    }
  }, [isDemoMode])

  const logout = useCallback(() => {
    setUser(null)
    try { sessionStorage.removeItem('demo-user') } catch { /* storage unavailable */ }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isDemoMode,
    demoUsers: DEMO_USERS,
    login,
    loginAsDemo,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
