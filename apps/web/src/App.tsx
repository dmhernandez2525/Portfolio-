import { useEffect, useState, Component, type ReactNode, type ErrorInfo } from "react"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { GamificationProvider } from "@/components/providers/GamificationProvider"
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider"
import { BossProvider } from "@/context/boss-context"
import { AuthProvider } from "@/context/auth-context"
import { ProfileProvider } from "@/context/profile-context"
import { ModeProvider, useMode } from "@/context/mode-context"
import { CreatureLayer } from "@/components/game/CreatureLayer"
import { SkipNav } from "@/components/ui/SkipNav"
import { HeadTags } from "@/components/seo/HeadTags"
import { CustomCursor } from "@/components/ui/CustomCursor"
import { ScrollToTop } from "@/components/shared/ScrollToTop"
import { ModeSwitcher } from "@/components/shared/ModeSwitcher"
import { AppRoutes } from "./AppRoutes"
import { AnimatePresence, motion } from "framer-motion"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#e5e5e5",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            padding: "2rem",
          }}
        >
          <div style={{ maxWidth: "480px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                opacity: 0.6,
              }}
            >
              :/
            </div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                marginBottom: "0.75rem",
                color: "#f5f5f5",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "#a3a3a3",
                marginBottom: "2rem",
              }}
            >
              An unexpected error occurred while loading this page. This has been logged and will be looked into.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.75rem 2rem",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#fff",
                backgroundColor: "#2563eb",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Console easter egg
const logConsoleEasterEgg = () => {
  console.log(
    "%c👋 Hey there, fellow developer!",
    "font-size: 20px; font-weight: bold; color: #00D4FF;"
  )
  console.log(
    "%cSince you're poking around in here, you might appreciate knowing:",
    "font-size: 14px; color: #fff;"
  )
  console.log("%c• I can weld (stick, MIG, and TIG)", "font-size: 12px; color: #00D4FF;")
  console.log("%c• I can solder (through-hole and SMD)", "font-size: 12px; color: #0099FF;")
  console.log("%c• I've been building things my whole life", "font-size: 12px; color: #7B2DFF;")
  console.log("%c• I build VR games for fun", "font-size: 12px; color: #FF00E5;")
  console.log("%c• This site was built with React, TypeScript, and way too much coffee", "font-size: 12px; color: #00D4FF;")
  console.log(
    "%c\nLooking for the source? Check my GitHub. Or just ask!",
    "font-size: 14px; color: #fff;"
  )
  console.log(
    "%c\nP.S. - There are 16 easter eggs hidden on this site. How many can you find? 🥚",
    "font-size: 12px; color: #7B2DFF; font-style: italic;"
  )
}

function CreativeExtras() {
  return (
    <>
      <SmoothScrollProvider>
        <CustomCursor />
        <CreatureLayer />
        <AppRoutes />
      </SmoothScrollProvider>
    </>
  )
}

function NonCreativeShell() {
  return <AppRoutes />
}

function AppShell() {
  const { mode } = useMode()
  const [rightClickToast, setRightClickToast] = useState(false)

  useEffect(() => {
    logConsoleEasterEgg()

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    window.scrollTo(0, 0)

    const handleContextMenu = () => {
      setRightClickToast(true)
      setTimeout(() => setRightClickToast(false), 2000)
    }

    document.addEventListener("contextmenu", handleContextMenu)
    return () => document.removeEventListener("contextmenu", handleContextMenu)
  }, [])

  return (
    <>
      <SkipNav />
      <HeadTags />
      <ScrollToTop />
      <div id="main-content">
      {mode === 'creative' ? <CreativeExtras /> : <NonCreativeShell />}
      </div>
      {mode && <ModeSwitcher />}

      {/* Right-click easter egg toast */}
      <AnimatePresence>
        {rightClickToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-background/95 backdrop-blur-md px-6 py-3 rounded-lg border border-primary/50 shadow-lg pointer-events-none"
          >
            <p className="text-sm text-foreground">Inspecting my work? I respect that.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <GamificationProvider>
          <BossProvider>
            <AuthProvider>
              <ProfileProvider>
                <BrowserRouter>
                  <ModeProvider>
                    <AppShell />
                  </ModeProvider>
                </BrowserRouter>
              </ProfileProvider>
            </AuthProvider>
          </BossProvider>
        </GamificationProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  )
}

export default App
