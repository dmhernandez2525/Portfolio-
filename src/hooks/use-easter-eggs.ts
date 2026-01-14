import { useEffect, useState } from "react"

interface UseEasterEggsProps {
    onKonami: () => void
    onGandalf: () => void
    onDaniel: () => void
    onGhost: () => void
}

export function useEasterEggs({ onKonami, onGandalf, onDaniel, onGhost }: UseEasterEggsProps) {
    const [, setInputBuffer] = useState("")

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase()
            
            setInputBuffer(prev => {
                const newBuffer = (prev + key).slice(-20) // Keep last 20 chars

                // Konami Code (ArrowUp, etc maps to strings)
                // Actually browsers return "ArrowUp", "a", "b"
                // Let's use a separate tracker for konami or map keys?
                // Simplified Konami: uuddlrlrba
                
                // Words
                if (newBuffer.endsWith("gandalf")) {
                    onGandalf()
                    return ""
                }
                if (newBuffer.endsWith("daniel")) {
                    onDaniel()
                    return ""
                }
                if (newBuffer.endsWith("ghost")) {
                    onGhost()
                    return ""
                }
                
                return newBuffer
            })
        }
        
        // Konami specific listener for arrow keys
        let konamiIndex = 0;
        const konamiCode = [
            "ArrowUp", "ArrowUp", 
            "ArrowDown", "ArrowDown", 
            "ArrowLeft", "ArrowRight", 
            "ArrowLeft", "ArrowRight", 
            "b", "a"
        ]

        const handleKonami = (e: KeyboardEvent) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    onKonami()
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keydown", handleKonami)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("keydown", handleKonami)
        }
    }, [onKonami, onGandalf, onDaniel, onGhost])
}
