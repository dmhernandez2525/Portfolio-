import { Routes, Route } from "react-router-dom"
import { RootLayout } from "@/components/layout/RootLayout"

import { Hero } from "@/components/sections/Hero"
import { About } from "@/components/sections/About"
import { Experience } from "@/components/sections/Experience"
import { Skills } from "@/components/sections/Skills"
import { Projects } from "@/components/sections/Projects"
import { Contact } from "@/components/sections/Contact"
import { GlobeSection } from "@/components/sections/GlobeSection"

import { FallingBlocksGame } from "@/components/game/FallingBlocksGame"
import { TetrisGame } from "@/components/game/TetrisGame"
import { SnakeGame } from "@/components/game/SnakeGame"
import { TanksGame } from "@/components/game/TanksGame"
import { CookieClickerGame } from "@/components/game/CookieClickerGame"
import { ChessGame } from "@/components/game/ChessGame"
import { AgarGame } from "@/components/game/AgarGame"
import { Philosophy } from "@/pages/Philosophy"
import { Inventions } from "@/pages/Inventions"
import { Blog } from "@/pages/Blog"
import { Social } from "@/pages/Social"
import { Games } from "@/pages/Games"
import { NotFound } from "@/pages/NotFound"

const Home = () => (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <GlobeSection />
      <Contact />
    </div>
)

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/philosophy" element={<Philosophy />} />
        <Route path="/inventions" element={<Inventions />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/social" element={<Social />} />
        <Route path="/games" element={<Games />} />
        <Route path="/game" element={<FallingBlocksGame />} />
        <Route path="/tetris" element={<TetrisGame />} />
        <Route path="/snake" element={<SnakeGame />} />
        <Route path="/tanks" element={<TanksGame />} />
        <Route path="/cookie-clicker" element={<CookieClickerGame />} />
        <Route path="/chess" element={<ChessGame />} />
        <Route path="/agar" element={<AgarGame />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
