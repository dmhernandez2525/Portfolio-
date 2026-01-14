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
import { Philosophy } from "@/pages/Philosophy"
import { Inventions } from "@/pages/Inventions"
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
      </Route>
      <Route path="/philosophy" element={<Philosophy />} />
      <Route path="/inventions" element={<Inventions />} />
      <Route path="/game" element={<FallingBlocksGame />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
