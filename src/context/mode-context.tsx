/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type PortfolioMode = 'business-card' | 'resume' | 'creative' | 'techie'

const STORAGE_KEY = 'portfolio-mode'

interface ModeContextType {
  mode: PortfolioMode | null
  setMode: (mode: PortfolioMode) => void
  clearMode: () => void
}

const ModeContext = createContext<ModeContextType | null>(null)

function getStoredMode(): PortfolioMode | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'business-card' || stored === 'resume' || stored === 'creative' || stored === 'techie') {
    return stored
  }
  return null
}

interface ModeProviderProps {
  children: ReactNode
}

export function ModeProvider({ children }: ModeProviderProps) {
  const [mode, setModeState] = useState<PortfolioMode | null>(getStoredMode)

  const setMode = useCallback((newMode: PortfolioMode) => {
    setModeState(newMode)
    localStorage.setItem(STORAGE_KEY, newMode)
  }, [])

  const clearMode = useCallback(() => {
    setModeState(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <ModeContext.Provider value={{ mode, setMode, clearMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode(): ModeContextType {
  const context = useContext(ModeContext)
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}
