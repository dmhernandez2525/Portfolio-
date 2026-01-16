import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Menu, X, Moon, Sun, User, FolderKanban, Briefcase, Mail, Wrench, Lightbulb, Brain, BookOpen, Share2, Gamepad2, ChevronDown, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/providers/ThemeProvider"
import { cn } from "@/lib/utils"

import { CreatureToggle } from "@/components/game/CreatureToggle"
import { useGamification } from "@/hooks/use-gamification"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

// Consolidated navigation structure with dropdowns
const navStructure = {
  about: {
    label: "About",
    items: [
      { name: "About Me", path: "/#about", icon: User },
      { name: "Philosophy", path: "/philosophy", icon: Brain },
      { name: "Blog", path: "/blog", icon: BookOpen },
    ]
  },
  work: {
    label: "Work",
    items: [
      { name: "Skills", path: "/#skills", icon: Wrench },
      { name: "Experience", path: "/#experience", icon: Briefcase },
      { name: "Inventions", path: "/inventions", icon: Lightbulb },
    ]
  }
}

// Direct links (no dropdown)
const directLinks = [
  { name: "Projects", path: "/#projects" },
  { name: "Games", path: "/games" },
  { name: "Social", path: "/social" },
  { name: "Contact", path: "/#contact" },
]

// All items for mobile menu
const allNavItems = [
  { name: "About", path: "/#about", icon: User },
  { name: "Skills", path: "/#skills", icon: Wrench },
  { name: "Experience", path: "/#experience", icon: Briefcase },
  { name: "Projects", path: "/#projects", icon: FolderKanban },
  { name: "Games", path: "/games", icon: Gamepad2 },
  { name: "Blog", path: "/blog", icon: BookOpen },
  { name: "Social", path: "/social", icon: Share2 },
  { name: "Philosophy", path: "/philosophy", icon: Brain },
  { name: "Inventions", path: "/inventions", icon: Lightbulb },
  { name: "Contact", path: "/#contact", icon: Mail },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [easterEggToast, setEasterEggToast] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const { creatureCount } = useGamification()
  const navigate = useNavigate()
  const location = useLocation()

  // Easter egg tracking
  const themeToggleCount = useRef(0)
  const themeToggleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (message: string) => {
    setEasterEggToast(message)
    setTimeout(() => setEasterEggToast(null), 4000)
  }

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
      if (location.pathname === "/") {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      } else {
        navigate("/")
        setTimeout(() => {
          const element = document.getElementById(id)
          if (element) {
            element.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)
      }
    } else {
      navigate(path)
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
            if (location.pathname === "/") {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          }}
        >
          DH
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* About Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                About <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {navStructure.about.items.map((item) => (
                <DropdownMenuItem
                  key={item.name}
                  onClick={() => scrollToSection(item.path)}
                  className="cursor-pointer gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Work Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                Work <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {navStructure.work.items.map((item) => (
                <DropdownMenuItem
                  key={item.name}
                  onClick={() => scrollToSection(item.path)}
                  className="cursor-pointer gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Direct Links */}
          {directLinks.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection(item.path)}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.name}
            </Button>
          ))}

          <div className="w-px h-6 bg-border mx-2" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Creature Toggle */}
          <CreatureToggle />

          {/* Site Health */}
          <SiteHealthBar />
        </nav>

        {/* Mobile Header Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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

    {/* Mobile Bottom Navigation Bar */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        <button
          onClick={() => scrollToSection("/#about")}
          className="flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">About</span>
        </button>
        <button
          onClick={() => scrollToSection("/#projects")}
          className="flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <FolderKanban className="h-5 w-5" />
          <span className="text-[10px] font-medium">Projects</span>
        </button>

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

        <button
          onClick={() => scrollToSection("/games")}
          className="flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Gamepad2 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Games</span>
        </button>
        <button
          onClick={() => scrollToSection("/#contact")}
          className="flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Mail className="h-5 w-5" />
          <span className="text-[10px] font-medium">Contact</span>
        </button>
      </div>
    </div>

    {/* Mobile Bottom Sheet Menu */}
    {mobileMenuOpen && (
      <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
        <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-200" />

        <div
          className="absolute bottom-20 left-0 right-0 bg-background border-t border-border rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />

          <nav className="grid grid-cols-2 gap-3">
            {allNavItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.path)}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors active:scale-95 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-base font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Resume Download */}
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              className="w-full gap-2"
              onClick={() => {
                setMobileMenuOpen(false)
                window.open('/resume.pdf', '_blank')
              }}
            >
              <Download className="h-4 w-4" />
              Download Resume
            </Button>
          </div>

          {/* Creature Controls on Mobile */}
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
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
