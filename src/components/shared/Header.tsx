import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Menu, X, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/providers/ThemeProvider"
import { cn } from "@/lib/utils"
import { GameHub } from "@/components/game/GameHub"
import { CreatureToggle } from "@/components/game/CreatureToggle"
import { useGamification } from "@/hooks/use-gamification"

const SiteHealthBar = () => {
    const { siteHealth } = useGamification()
    if (siteHealth >= 100) return null
    return (
        <div className="flex items-center gap-2">
            <div className="text-[10px] font-bold text-red-500 animate-pulse">SITE INTEGRITY</div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden border border-red-200">
                <div 
                    className="h-full bg-red-600 transition-all duration-300 ease-out"
                    style={{ width: `${siteHealth}%` }}
                />
            </div>
        </div>
    )
}

const navItems = [
  { name: "About", path: "/#about" },
  { name: "Skills", path: "/#skills" },
  { name: "Experience", path: "/#experience" },
  { name: "Projects", path: "/#projects" },
  { name: "Philosophy", path: "/philosophy" },
  { name: "Inventions", path: "/inventions" },
  { name: "Contact", path: "/#contact" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [easterEggToast, setEasterEggToast] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const { creatureCount } = useGamification()

  // Easter egg tracking
  const themeToggleCount = useRef(0)
  const themeToggleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (message: string) => {
    setEasterEggToast(message)
    setTimeout(() => setEasterEggToast(null), 4000)
  }

  // Theme toggle easter egg - rapid switching
  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
    themeToggleCount.current++

    if (themeToggleTimer.current) {
      clearTimeout(themeToggleTimer.current)
    }

    if (themeToggleCount.current >= 5) {
      showToast("Can't decide? I get it. I rebuilt this toggle 4 times.")
      themeToggleCount.current = 0
    }

    themeToggleTimer.current = setTimeout(() => {
      themeToggleCount.current = 0
    }, 2000)
  }

  // Logo triple-click easter egg
  const handleLogoClick = () => {
    logoClickCount.current++

    if (logoClickTimer.current) {
      clearTimeout(logoClickTimer.current)
    }

    if (logoClickCount.current >= 3) {
      showToast("Fun fact: I was a landlord before I could legally drive.")
      logoClickCount.current = 0
    }

    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0
    }, 500)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (path: string) => {
    setMobileMenuOpen(false)
    if (path.startsWith("/#")) {
      const id = path.substring(2)
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      // Navigate to external page
      window.location.href = path
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border py-3 shadow-sm"
          : "bg-transparent py-5"
      )}
    >
      <div className="container flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-cyan-300"
          onClick={(e) => {
            handleLogoClick()
            if (window.location.pathname === "/") {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          }}
        >
          DH
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
           {/* Gamification Counter */}
           <div className="flex items-center gap-2 text-sm font-mono mr-4 px-3 py-1 rounded-full bg-secondary/50 border border-border">
              <span className="text-neon-pink">✨</span>
              <span className="font-bold">{creatureCount}</span>
           </div>

          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(item.path)
              }}
              className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground"
            >
              {item.name}
            </a>
          ))}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <GameHub />
            {/* Theme & Game Controls */}
            <div className="flex items-center gap-2">
                 {/* Creature Loading/Toggle */}
                 <div className="hidden md:flex items-center gap-4">
                     {/* Site Health (Only visible if < 100) */}
                     <SiteHealthBar />
                     <CreatureToggle />
                 </div>
            </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 shadow-lg animate-in slide-in-from-top-5">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(item.path)
                }}
                className="text-lg font-medium py-2 border-b border-border/50"
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Easter Egg Toast */}
      {easterEggToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-background/95 backdrop-blur-md px-6 py-3 rounded-lg border border-primary/50 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-foreground">{easterEggToast}</p>
        </div>
      )}
    </header>
  )
}
