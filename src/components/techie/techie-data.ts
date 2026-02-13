export interface FileNode {
  name: string
  type: "file" | "folder"
  contentKey?: string
  children?: FileNode[]
  hidden?: boolean
}

export const fileTree: FileNode[] = [
  {
    name: "PORTFOLIO",
    type: "folder",
    children: [
      { name: "README.md", type: "file", contentKey: "readme" },
      { name: "ABOUT.md", type: "file", contentKey: "about" },
      { name: "SKILLS.txt", type: "file", contentKey: "skills" },
      { name: "EXPERIENCE.log", type: "file", contentKey: "experience" },
      {
        name: "PROJECTS",
        type: "folder",
        children: [
          { name: "index.md", type: "file", contentKey: "projects" },
        ],
      },
      {
        name: "GAMES",
        type: "folder",
        children: [
          { name: "snake.exe", type: "file", contentKey: "game-snake" },
          { name: "tetris.exe", type: "file", contentKey: "game-tetris" },
          { name: "chess.exe", type: "file", contentKey: "game-chess" },
          { name: "falling-blocks.exe", type: "file", contentKey: "game-falling-blocks" },
          { name: "cookie-clicker.exe", type: "file", contentKey: "game-cookie-clicker" },
          { name: "agar.exe", type: "file", contentKey: "game-agar" },
          { name: "mafia-wars.exe", type: "file", contentKey: "game-mafia-wars" },
          { name: "pokemon.exe", type: "file", contentKey: "game-pokemon" },
          { name: "clash-of-clans.exe", type: "file", contentKey: "game-coc" },
          { name: "shopping-cart-hero.exe", type: "file", contentKey: "game-shopping-cart-hero" },
        ],
      },
      { name: ".env", type: "file", contentKey: "hidden-env", hidden: true },
      { name: ".secret", type: "file", contentKey: "hidden-secret", hidden: true },
      { name: ".gitignore", type: "file", contentKey: "hidden-gitignore", hidden: true },
      { name: "BLOG.md", type: "file", contentKey: "blog" },
      { name: "CONTACT.sh", type: "file", contentKey: "contact" },
      {
        name: "EXTERNAL",
        type: "folder",
        children: [
          { name: "github.lnk", type: "file", contentKey: "link-github" },
          { name: "linkedin.lnk", type: "file", contentKey: "link-linkedin" },
        ],
      },
    ],
  },
]

export function getFileIcon(name: string): string {
  // Dotfiles get a lock icon
  if (name.startsWith(".")) return "\u{1F512}"

  const ext = name.split(".").pop()?.toLowerCase()
  const icons: Record<string, string> = {
    md: "\u{1F4C4}",
    txt: "\u{1F4DD}",
    log: "\u{1F4CB}",
    sh: "\u{1F4DF}",
    exe: "\u{1F3AE}",
    lnk: "\u{1F517}",
  }
  return icons[ext ?? ""] ?? "\u{1F4C4}"
}
