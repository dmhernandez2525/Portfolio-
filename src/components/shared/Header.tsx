import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Menu, X, Moon, Sun, User, FolderKanban, Briefcase, Mail, Wrench, Lightbulb, Brain } from "lucide-react"
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
    <>
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

        {/* Mobile Header Controls - Theme only, nav is at bottom */}
        <div className="flex items-center gap-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>

      {/* Easter Egg Toast */}
      {easterEggToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-background/95 backdrop-blur-md px-6 py-3 rounded-lg border border-primary/50 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-foreground">{easterEggToast}</p>
        </div>
      )}
    </header>

    {/* Mobile Bottom Navigation Bar - OUTSIDE header for proper fixed positioning */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Quick nav items */}
        <a
          href="/#about"
          onClick={(e) => { e.preventDefault(); scrollToSection("/#about") }}
          className="flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">About</span>
        </a>
        <a
          href="/#projects"
          onClick={(e) => { e.preventDefault(); scrollToSection("/#projects") }}
          className="flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <FolderKanban className="h-5 w-5" />
          <span className="text-[10px] font-medium">Projects</span>
        </a>
        
        {/* Center Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            "flex items-center justify-center w-14 h-14 -mt-6 rounded-full border-4 border-background shadow-lg transition-all",
            mobileMenuOpen 
              ? "bg-primary text-primary-foreground" 
              : "bg-gradient-to-br from-primary to-blue-600 text-white"
          )}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        <a
          href="/#experience"
          onClick={(e) => { e.preventDefault(); scrollToSection("/#experience") }}
          className="flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Briefcase className="h-5 w-5" />
          <span className="text-[10px] font-medium">Work</span>
        </a>
        <a
          href="/#contact"
          onClick={(e) => { e.preventDefault(); scrollToSection("/#contact") }}
          className="flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Mail className="h-5 w-5" />
          <span className="text-[10px] font-medium">Contact</span>
        </a>
      </div>
    </div>

    {/* Mobile Bottom Sheet Menu */}
    {mobileMenuOpen && (
      <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-200" />
        
        {/* Bottom Sheet */}
        <div 
          className="absolute bottom-20 left-0 right-0 bg-background border-t border-border rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
          
          <nav className="grid grid-cols-2 gap-3">
            {navItems.map((item) => {
              const IconComponent = {
                "About": User,
                "Skills": Wrench,
                "Experience": Briefcase,
                "Projects": FolderKanban,
                "Philosophy": Brain,
                "Inventions": Lightbulb,
                "Contact": Mail,
              }[item.name] || User
              
              return (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(item.path)
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors active:scale-95"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-base font-medium">{item.name}</span>
                </a>
              )
            })}
          </nav>
          
          {/* Creature Controls on Mobile */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SiteHealthBar />
              <CreatureToggle />
            </div>
            <div className="flex items-center gap-2 text-sm font-mono px-3 py-1 rounded-full bg-secondary/50 border border-border">
              <span className="text-neon-pink">✨</span>
              <span className="font-bold">{creatureCount}</span>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

