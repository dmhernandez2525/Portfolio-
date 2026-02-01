import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Shield, Eye, LogIn } from 'lucide-react'

export function Login() {
  const { isDemoMode, demoUsers, loginAsDemo, login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/admin')
    return null
  }

  const handleDemoLogin = (userId: string) => {
    loginAsDemo(userId)
    navigate('/admin')
  }

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate('/admin')
      } else {
        setError('Invalid credentials')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Demo mode: Show demo user selector
  if (isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Demo Mode Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Eye className="h-5 w-5" />
              <span className="font-semibold">Demo Mode</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Select a demo account to explore the admin dashboard. No real authentication required.
            </p>
          </div>

          {/* Demo User Cards */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">Choose a Demo Account</h2>

            {demoUsers.map((demoUser) => (
              <motion.button
                key={demoUser.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDemoLogin(demoUser.id)}
                className="w-full p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    demoUser.role === 'admin'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-500'
                      : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-500'
                  }`}>
                    {demoUser.role === 'admin' ? (
                      <Shield className="h-6 w-6" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {demoUser.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{demoUser.email}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                      demoUser.role === 'admin'
                        ? 'bg-cyan-500/10 text-cyan-500'
                        : 'bg-purple-500/10 text-purple-500'
                    }`}>
                      {demoUser.role === 'admin' ? 'Full Access' : 'Read Only'}
                    </span>
                  </div>
                  <LogIn className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Back to Portfolio Link */}
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              Back to Portfolio
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Real authentication form (when not in demo mode)
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>

          <form onSubmit={handleRealLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Back to Portfolio Link */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            Back to Portfolio
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
