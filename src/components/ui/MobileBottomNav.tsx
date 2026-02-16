import { useNavigate, useLocation } from "react-router-dom"
import { Home, Gamepad2, Briefcase, BookOpen, Mail } from "lucide-react"
import { useMobileDetect } from "@/hooks/use-mobile-detect"

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
  { path: "/projects", label: "Projects", icon: <Briefcase className="w-5 h-5" /> },
  { path: "/games", label: "Games", icon: <Gamepad2 className="w-5 h-5" /> },
  { path: "/blog", label: "Blog", icon: <BookOpen className="w-5 h-5" /> },
  { path: "/#contact", label: "Contact", icon: <Mail className="w-5 h-5" /> },
]

export function MobileBottomNav() {
  const { isMobile } = useMobileDetect()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isMobile) return null

  const handleNav = (path: string) => {
    if (path.startsWith("/#")) {
      navigate("/")
      setTimeout(() => {
        const el = document.getElementById(path.slice(2))
        el?.scrollIntoView({ behavior: "smooth" })
      }, 100)
      return
    }
    navigate(path)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full min-w-[44px] min-h-[44px] text-[10px] transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
