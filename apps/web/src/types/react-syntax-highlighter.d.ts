declare module "react-syntax-highlighter" {
  import type { ComponentType, CSSProperties, ReactNode } from "react"

  export interface SyntaxHighlighterProps {
    language?: string
    style?: Record<string, CSSProperties>
    children?: ReactNode
    customStyle?: CSSProperties
    PreTag?: ComponentType<{ children?: ReactNode }> | keyof JSX.IntrinsicElements
  }

  export const Prism: ComponentType<SyntaxHighlighterProps>
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  import type { CSSProperties } from "react"

  export const oneDark: Record<string, CSSProperties>
}
