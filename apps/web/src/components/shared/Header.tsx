import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Moon, Sun, User, Briefcase, Wrench, Lightbulb, Brain, BookOpen, ChevronDown, Bot, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/providers/ThemeProvider"
import { cn } from "@/lib/utils"

import { CreatureToggle } from "@/components/game/CreatureToggle"
import { ProfileButton } from "@/components/profile/ProfileButton"
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
      { name: "Tech Audit", path: "/tech-audit", icon: Search },
    ]
  },
  work: {
    label: "Work",
    items: [
      { name: "Skills", path: "/#skills", icon: Wrench },
      { name: "Experience", path: "/#experience", icon: Briefcase },
      { name: "Inventions", path: "/inventions", icon: Lightbulb },
      { name: "AI Development", path: "/ai-development", icon: Bot },
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


export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [easterEggToast, setEasterEggToast] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
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

          {/* Profile */}
          <ProfileButton />

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
    </>
  )
}
