import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import { useMode, type PortfolioMode } from "@/context/mode-context"
import { usePageAnalytics } from "@/hooks/usePageAnalytics"
import { RootLayout } from "@/components/layout/RootLayout"
import { Gateway } from "@/pages/Gateway"
import { PageSkeleton } from "@/components/ui/PageSkeleton"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

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
import { GameExperienceLayout } from "@/components/game/shared/GameExperienceLayout"
import { EasterEggLogPanel } from "@/components/easter-eggs/EasterEggLogPanel"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import type { GameId } from "@/types/game-stats"

// Lazy-loaded page components
const BusinessCardPage = lazy(() => import("@/pages/BusinessCardPage").then((m) => ({ default: m.BusinessCardPage })))
const ResumePage = lazy(() => import("@/pages/ResumePage").then((m) => ({ default: m.ResumePage })))
const TechieLayout = lazy(() => import("@/components/techie/TechieLayout").then((m) => ({ default: m.TechieLayout })))
const RetroTerminalPage = lazy(() => import("@/pages/RetroTerminalPage").then((m) => ({ default: m.RetroTerminalPage })))
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })))
const CalendarPage = lazy(() => import("@/pages/CalendarPage").then((m) => ({ default: m.CalendarPage })))
const AIDevelopmentPage = lazy(() => import("@/pages/AIDevelopmentPage").then((m) => ({ default: m.AIDevelopmentPage })))
const Philosophy = lazy(() => import("@/pages/Philosophy").then((m) => ({ default: m.Philosophy })))
const Inventions = lazy(() => import("@/pages/Inventions").then((m) => ({ default: m.Inventions })))
const Blog = lazy(() => import("@/pages/Blog").then((m) => ({ default: m.Blog })))
const Social = lazy(() => import("@/pages/Social").then((m) => ({ default: m.Social })))
const Games = lazy(() => import("@/pages/Games").then((m) => ({ default: m.Games })))
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage").then((m) => ({ default: m.ProjectsPage })))
const ProjectDetailPage = lazy(() => import("@/pages/ProjectDetailPage").then((m) => ({ default: m.ProjectDetailPage })))
const Login = lazy(() => import("@/pages/Login").then((m) => ({ default: m.Login })))
const Admin = lazy(() => import("@/pages/Admin").then((m) => ({ default: m.Admin })))
const NotFound = lazy(() => import("@/pages/NotFound").then((m) => ({ default: m.NotFound })))

// Lazy-loaded game components
const FallingBlocksGame = lazy(() => import("@/components/game/FallingBlocksGame").then((m) => ({ default: m.FallingBlocksGame })))
const TetrisGame = lazy(() => import("@/components/game/TetrisGame").then((m) => ({ default: m.TetrisGame })))
const SnakeGame = lazy(() => import("@/components/game/SnakeGame").then((m) => ({ default: m.SnakeGame })))
const TanksGame = lazy(() => import("@/components/game/tanks").then((m) => ({ default: m.TanksGame })))
const CookieClickerGame = lazy(() => import("@/components/game/cookie-clicker").then((m) => ({ default: m.CookieClickerGame })))
const ChessGame = lazy(() => import("@/components/game/ChessGame").then((m) => ({ default: m.ChessGame })))
const AgarGame = lazy(() => import("@/components/game/agar").then((m) => ({ default: m.AgarGame })))
const MafiaWarsGame = lazy(() => import("@/components/game/mafia-wars").then((m) => ({ default: m.MafiaWarsGame })))
const PokemonGame = lazy(() => import("@/components/game/pokemon").then((m) => ({ default: m.PokemonGame })))
const ShoppingCartHeroGame = lazy(() => import("@/components/game/shopping-cart-hero").then((m) => ({ default: m.ShoppingCartHeroGame })))
const CocGame = lazy(() => import("@/components/game/coc-game").then((m) => ({ default: m.CocGame })))
const FireboyWatergirlGame = lazy(() => import("@/components/game/fireboy-watergirl").then((m) => ({ default: m.FireboyWatergirlGame })))

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

function LazyGame({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner label="Loading game..." size="lg" />}>{children}</Suspense>
}

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
        <Route path="/philosophy" element={<LazyPage><Philosophy /></LazyPage>} />
        <Route path="/inventions" element={<LazyPage><Inventions /></LazyPage>} />
        <Route path="/blog" element={<LazyPage><Blog /></LazyPage>} />
        <Route path="/social" element={<LazyPage><Social /></LazyPage>} />
        <Route path="/games" element={<LazyPage><Games /></LazyPage>} />
        <Route path="/projects" element={<LazyPage><ProjectsPage /></LazyPage>} />
        <Route path="/projects/:slug" element={<LazyPage><ProjectDetailPage /></LazyPage>} />
        <Route path="/ai-development" element={<LazyPage><AIDevelopmentPage /></LazyPage>} />
        <Route path="/game" element={<GameRouteWrapper gameId="game"><LazyGame><FallingBlocksGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/tetris" element={<GameRouteWrapper gameId="tetris"><LazyGame><TetrisGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/snake" element={<GameRouteWrapper gameId="snake"><LazyGame><SnakeGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/tanks" element={<GameRouteWrapper gameId="tanks"><LazyGame><TanksGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/cookie-clicker" element={<GameRouteWrapper gameId="cookie-clicker"><LazyGame><CookieClickerGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/chess" element={<GameRouteWrapper gameId="chess"><LazyGame><ChessGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/agar" element={<GameRouteWrapper gameId="agar"><LazyGame><AgarGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/mafia-wars" element={<GameRouteWrapper gameId="mafia-wars"><LazyGame><MafiaWarsGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/pokemon" element={<GameRouteWrapper gameId="pokemon"><LazyGame><PokemonGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/shopping-cart-hero" element={<GameRouteWrapper gameId="shopping-cart-hero"><LazyGame><ShoppingCartHeroGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/coc" element={<GameRouteWrapper gameId="game"><LazyGame><CocGame /></LazyGame></GameRouteWrapper>} />
        <Route path="/fireboy-watergirl" element={<GameRouteWrapper gameId="game"><LazyGame><FireboyWatergirlGame /></LazyGame></GameRouteWrapper>} />
        <Route path="*" element={<LazyPage><NotFound /></LazyPage>} />
      </Route>

      {/* Auth routes - outside RootLayout for clean login/admin experience */}
      <Route path="/login" element={<LazyPage><Login /></LazyPage>} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <LazyPage><Admin /></LazyPage>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

const MODE_COMPONENTS: Partial<Record<PortfolioMode, React.LazyExoticComponent<React.ComponentType>>> = {
  "business-card": BusinessCardPage,
  "resume": ResumePage,
  "techie": TechieLayout,
  "retro": RetroTerminalPage,
  "dashboard": DashboardPage,
  "calendar": CalendarPage,
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

  const LazyModeComponent = MODE_COMPONENTS[mode]
  if (LazyModeComponent) {
    return withEasterEggPanel(
      <Routes>
        <Route path="*" element={<Suspense fallback={<PageSkeleton />}><LazyModeComponent /></Suspense>} />
      </Routes>
    )
  }

  // Fallback for modes without pages yet
  return withEasterEggPanel(
    <Routes>
      <Route path="*" element={<Gateway />} />
    </Routes>
  )
}
