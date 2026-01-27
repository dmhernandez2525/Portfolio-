import { Outlet } from "react-router-dom"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { ChatbotCTA } from "@/components/voice-assistant"

export function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <Header />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
      {/* AI Assistant - persists across all pages */}
      <ChatbotCTA />
    </div>
  )
}
