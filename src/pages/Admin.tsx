import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  LogOut,
  User,
  Shield,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
  Image,
  Code2,
} from 'lucide-react'

const adminFeatures = [
  {
    icon: FileText,
    title: 'Blog Posts',
    description: 'Manage and publish blog articles',
    adminOnly: false,
  },
  {
    icon: Code2,
    title: 'Projects',
    description: 'Update portfolio projects',
    adminOnly: false,
  },
  {
    icon: Image,
    title: 'Media Library',
    description: 'Upload and manage images',
    adminOnly: false,
  },
  {
    icon: MessageSquare,
    title: 'Messages',
    description: 'View contact form submissions',
    adminOnly: false,
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'View site traffic and engagement',
    adminOnly: true,
  },
  {
    icon: Settings,
    title: 'Settings',
    description: 'Configure site settings',
    adminOnly: true,
  },
]

export function Admin() {
  const { user, logout, isDemoMode } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-500 rounded-full">
                Demo Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                isAdmin
                  ? 'bg-cyan-500/10 text-cyan-500'
                  : 'bg-purple-500/10 text-purple-500'
              }`}>
                {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            {isDemoMode
              ? 'This is a demo of the admin dashboard. Explore the features below.'
              : 'Manage your portfolio content and settings.'}
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminFeatures.map((feature, index) => {
            const isDisabled = feature.adminOnly && !isAdmin
            const Icon = feature.icon

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  disabled={isDisabled}
                  className={`w-full p-6 text-left rounded-lg border transition-all ${
                    isDisabled
                      ? 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      isDisabled
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{feature.title}</h3>
                        {feature.adminOnly && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            Admin Only
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                      {isDisabled && (
                        <p className="text-xs text-amber-500 mt-2">
                          Requires admin access
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Demo Mode Info */}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg"
          >
            <h3 className="font-semibold mb-2">About Demo Mode</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You're viewing a demonstration of the admin dashboard. In a production environment,
              this would connect to a real backend with actual content management capabilities.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1 bg-background rounded-full border">
                No data is saved
              </span>
              <span className="text-xs px-3 py-1 bg-background rounded-full border">
                Safe to explore
              </span>
              <span className="text-xs px-3 py-1 bg-background rounded-full border">
                Role-based access demo
              </span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
