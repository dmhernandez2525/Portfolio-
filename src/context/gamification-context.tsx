import { createContext } from "react"

export interface GamificationContextType {
  creatureCount: number
  creaturesEnabled: boolean
  siteHealth: number
  incrementCount: (amount?: number) => void
  toggleCreatures: () => void
  damageSite: (amount: number) => void
  healSite: () => void
}

export const GamificationContext = createContext<GamificationContextType | undefined>(undefined)
