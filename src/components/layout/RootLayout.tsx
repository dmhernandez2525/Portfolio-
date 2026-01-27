import { Outlet } from "react-router-dom"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { AIAssistant } from "@/components/voice-assistant"

export function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <Header />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
      {/* AI Assistant - TourPlayer and Dialog, persists across all pages */}
      <AIAssistant />
    </div>
  )
}
