
export interface SavedGameData {
  cookies: number
  totalCookies: number
  buildings: { id: string; owned: number }[]
  upgrades: string[]
  grandmaLevel: number
  heavenlyChips: number
}
