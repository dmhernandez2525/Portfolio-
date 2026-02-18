import { Routes, Route } from "react-router-dom"
import { useMode, type PortfolioMode } from "@/context/mode-context"
import { usePageAnalytics } from "@/hooks/usePageAnalytics"
import { RootLayout } from "@/components/layout/RootLayout"
import { Gateway } from "@/pages/Gateway"
import { BusinessCardPage } from "@/pages/BusinessCardPage"
import { ResumePage } from "@/pages/ResumePage"
import { TechieLayout } from "@/components/techie/TechieLayout"
import { RetroTerminalPage } from "@/pages/RetroTerminalPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { CalendarPage } from "@/pages/CalendarPage"

import { Hero } from "@/components/sections/Hero"
import { About } from "@/components/sections/About"
import { Experience } from "@/components/sections/Experience"
import { Skills } from "@/components/sections/Skills"
import { Projects } from "@/components/sections/Projects"
import { Testimonials } from "@/components/sections/Testimonials"
import { Contact } from "@/components/sections/Contact"
import { GlobeSection } from "@/components/sections/GlobeSection"
import { AskAboutMe, AICTABanner } from "@/components/voice-assistant"
import { AIExperience } from "@/components/sections/AIExperience"
import { AIDevelopmentPage } from "@/pages/AIDevelopmentPage"
import { GameExperienceLayout } from "@/components/game/shared/GameExperienceLayout"
import { EasterEggLogPanel } from "@/components/easter-eggs/EasterEggLogPanel"

import { FallingBlocksGame } from "@/components/game/FallingBlocksGame"
import { TetrisGame } from "@/components/game/TetrisGame"
import { SnakeGame } from "@/components/game/SnakeGame"
import { TanksGame } from "@/components/game/tanks"
import { CookieClickerGame } from "@/components/game/cookie-clicker"
import { ChessGame } from "@/components/game/ChessGame"
import { AgarGame } from "@/components/game/agar"
import { MafiaWarsGame } from "@/components/game/mafia-wars"
import { PokemonGame } from "@/components/game/pokemon"
import { ShoppingCartHeroGame } from "@/components/game/shopping-cart-hero"
import { CocGame } from "@/components/game/coc-game"
import { FireboyWatergirlGame } from "@/components/game/fireboy-watergirl"
import { Philosophy } from "@/pages/Philosophy"
import { Inventions } from "@/pages/Inventions"
import { Blog } from "@/pages/Blog"
import { Social } from "@/pages/Social"
import { Games } from "@/pages/Games"
import { ProjectsPage } from "@/pages/ProjectsPage"
import { ProjectDetailPage } from "@/pages/ProjectDetailPage"
import { NotFound } from "@/pages/NotFound"
import { Login } from "@/pages/Login"
import { Admin } from "@/pages/Admin"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import type { GameId } from "@/types/game-stats"

const Home = () => (
    <div className="min-h-screen">
      <Hero />
      <AICTABanner />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Testimonials />
      <AIExperience />
      <GlobeSection />
      <AskAboutMe />
      <Contact />
    </div>
)

function GameRouteWrapper({ gameId, children }: { gameId: GameId; children: React.ReactNode }) {
  return <GameExperienceLayout gameId={gameId}>{children}</GameExperienceLayout>
}

function CreativeRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/philosophy" element={<Philosophy />} />
        <Route path="/inventions" element={<Inventions />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/social" element={<Social />} />
        <Route path="/games" element={<Games />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/ai-development" element={<AIDevelopmentPage />} />
        <Route path="/game" element={<GameRouteWrapper gameId="game"><FallingBlocksGame /></GameRouteWrapper>} />
        <Route path="/tetris" element={<GameRouteWrapper gameId="tetris"><TetrisGame /></GameRouteWrapper>} />
        <Route path="/snake" element={<GameRouteWrapper gameId="snake"><SnakeGame /></GameRouteWrapper>} />
        <Route path="/tanks" element={<GameRouteWrapper gameId="tanks"><TanksGame /></GameRouteWrapper>} />
        <Route path="/cookie-clicker" element={<GameRouteWrapper gameId="cookie-clicker"><CookieClickerGame /></GameRouteWrapper>} />
        <Route path="/chess" element={<GameRouteWrapper gameId="chess"><ChessGame /></GameRouteWrapper>} />
        <Route path="/agar" element={<GameRouteWrapper gameId="agar"><AgarGame /></GameRouteWrapper>} />
        <Route path="/mafia-wars" element={<GameRouteWrapper gameId="mafia-wars"><MafiaWarsGame /></GameRouteWrapper>} />
        <Route path="/pokemon" element={<GameRouteWrapper gameId="pokemon"><PokemonGame /></GameRouteWrapper>} />
        <Route path="/shopping-cart-hero" element={<GameRouteWrapper gameId="shopping-cart-hero"><ShoppingCartHeroGame /></GameRouteWrapper>} />
        <Route path="/coc" element={<GameRouteWrapper gameId="game"><CocGame /></GameRouteWrapper>} />
        <Route path="/fireboy-watergirl" element={<GameRouteWrapper gameId="game"><FireboyWatergirlGame /></GameRouteWrapper>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth routes - outside RootLayout for clean login/admin experience */}
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

const MODE_PAGES: Partial<Record<PortfolioMode, React.ReactElement>> = {
  "business-card": <BusinessCardPage />,
  "resume": <ResumePage />,
  "techie": <TechieLayout />,
  "retro": <RetroTerminalPage />,
  "dashboard": <DashboardPage />,
  "calendar": <CalendarPage />,
}

export function AppRoutes() {
  usePageAnalytics()
  const { mode } = useMode()

  const withEasterEggPanel = (content: React.ReactElement) => (
    <>
      {content}
      <EasterEggLogPanel />
    </>
  )

  if (!mode) {
    return withEasterEggPanel(
      <Routes>
        <Route path="*" element={<Gateway />} />
      </Routes>
    )
  }

  // Creative mode has nested sub-routes
  if (mode === "creative") {
    return withEasterEggPanel(<CreativeRoutes />)
  }

  const page = MODE_PAGES[mode]
  if (page) {
    return withEasterEggPanel(
      <Routes>
        <Route path="*" element={page} />
      </Routes>
    )
  }

  // Fallback for modes without pages yet (e.g., dashboard)
  return withEasterEggPanel(
    <Routes>
      <Route path="*" element={<Gateway />} />
    </Routes>
  )
}
