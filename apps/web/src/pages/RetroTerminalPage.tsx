import { useState } from "react"
import { CRTFrame } from "@/components/retro/CRTFrame"
import { RetroTerminal } from "@/components/retro/RetroTerminal"
import { ModeSwitcher } from "@/components/shared/ModeSwitcher"

export function RetroTerminalPage() {
  const [colorScheme, setColorScheme] = useState<"green" | "amber">("green")

  return (
    <>
      <CRTFrame colorScheme={colorScheme}>
        <RetroTerminal colorScheme={colorScheme} onColorChange={setColorScheme} />
      </CRTFrame>
      <ModeSwitcher />
    </>
  )
}
