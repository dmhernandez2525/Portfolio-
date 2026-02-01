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
  const [user, setUser] = useState<User | null>(null)
  const isDemoMode = isDemoModeEnabled()

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // In demo mode, we don't use real authentication
    if (isDemoMode) {
      console.warn('Demo mode enabled - use demo login instead')
      return false
    }

    // TODO: Implement real authentication
    // This would integrate with your auth provider (Firebase, Auth0, etc.)
    console.log('Real auth login attempt:', email, password)
    return false
  }, [isDemoMode])

  const loginAsDemo = useCallback((userId: string) => {
    if (!isDemoMode) {
      console.warn('Demo login only available in demo mode')
      return
    }

    const demoUser = DEMO_USERS.find(u => u.id === userId)
    if (demoUser) {
      setUser(demoUser)
      // Store in session for persistence during page refresh
      sessionStorage.setItem('demo-user', JSON.stringify(demoUser))
    }
  }, [isDemoMode])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem('demo-user')
  }, [])

  // Restore demo user from session on mount
  useState(() => {
    if (isDemoMode) {
      const stored = sessionStorage.getItem('demo-user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as User
          setUser(parsed)
        } catch {
          sessionStorage.removeItem('demo-user')
        }
      }
    }
  })

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
