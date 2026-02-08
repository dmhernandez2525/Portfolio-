import { useEffect, useState } from "react"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { GamificationProvider } from "@/components/providers/GamificationProvider"
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider"
import { BossProvider } from "@/context/boss-context"
import { AuthProvider } from "@/context/auth-context"
import { ProfileProvider } from "@/context/profile-context"
import { ModeProvider, useMode } from "@/context/mode-context"
import { CreatureLayer } from "@/components/game/CreatureLayer"
import { CustomCursor } from "@/components/ui/CustomCursor"
import { ScrollToTop } from "@/components/shared/ScrollToTop"
import { ModeSwitcher } from "@/components/shared/ModeSwitcher"
import { AppRoutes } from "./AppRoutes"
import { AnimatePresence, motion } from "framer-motion"

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
      <ScrollToTop />
      {mode === 'creative' ? <CreativeExtras /> : <NonCreativeShell />}
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
  )
}

export default App
