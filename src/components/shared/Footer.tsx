import { Github, Linkedin, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/30 border-t border-border py-12 mt-20">
      <div className="container flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/dmhernandez2525"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-all"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/daniel-hernandez-01a15a150/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-all"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="mailto:danher2525@gmail.com"
            className="p-2 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-all"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
        
        <div className="text-center text-muted-foreground">
          <p className="text-sm">© {currentYear} Daniel Hernandez. All rights reserved.</p>
        </div>

        {/* Easter Egg - barely visible */}
        <p className="text-[8px] text-muted-foreground/30 mt-8 select-none">
          You scrolled all the way down. Respect. 🫡
        </p>
      </div>
    </footer>
  )
}
