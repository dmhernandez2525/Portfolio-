/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface BossContextType {
    isBossEnraged: boolean
    setBossEnraged: (enraged: boolean) => void
}

const BossContext = createContext<BossContextType | null>(null)

export function BossProvider({ children }: { children: ReactNode }) {
    const [isBossEnraged, setIsBossEnraged] = useState(false)

    const setBossEnraged = useCallback((enraged: boolean) => {
        setIsBossEnraged(enraged)
    }, [])

    return (
        <BossContext.Provider value={{ isBossEnraged, setBossEnraged }}>
            {children}
        </BossContext.Provider>
    )
}

export function useBoss() {
    const context = useContext(BossContext)
    if (!context) {
        // Return a default if not wrapped - makes it optional
        return { isBossEnraged: false, setBossEnraged: () => {} }
    }
    return context
}
