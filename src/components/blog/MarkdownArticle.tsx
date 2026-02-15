import { Children, isValidElement, useMemo, type ReactNode } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { slugifyHeading } from "@/lib/blog-utils"
import type { TocHeading } from "@/types/blog"

interface MarkdownArticleProps {
  content: string
  headings: TocHeading[]
}

function getTextContent(node: ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (!node) return ""

  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child)
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return getTextContent(child.props.children)
      }

      return ""
    })
    .join("")
}

function getHeadingId(headings: TocHeading[], index: number, fallbackText: string): string {
  const heading = headings[index]
  if (heading) return heading.id

  const fallbackId = slugifyHeading(fallbackText)
  return fallbackId || `heading-${index + 1}`
}

export function MarkdownArticle({ content, headings }: MarkdownArticleProps) {
  const markdownComponents = useMemo<Components>(() => {
    let headingIndex = 0

    const readHeadingId = (children: ReactNode): string => {
      const headingText = getTextContent(children)
      const id = getHeadingId(headings, headingIndex, headingText)
      headingIndex += 1
      return id
    }

    return {
      h1: ({ children, ...props }) => (
        <h1 id={readHeadingId(children)} {...props}>
          {children}
        </h1>
      ),
      h2: ({ children, ...props }) => (
        <h2 id={readHeadingId(children)} {...props}>
          {children}
        </h2>
      ),
      h3: ({ children, ...props }) => (
        <h3 id={readHeadingId(children)} {...props}>
          {children}
        </h3>
      ),
      h4: ({ children, ...props }) => (
        <h4 id={readHeadingId(children)} {...props}>
          {children}
        </h4>
      ),
      h5: ({ children, ...props }) => (
        <h5 id={readHeadingId(children)} {...props}>
          {children}
        </h5>
      ),
      h6: ({ children, ...props }) => (
        <h6 id={readHeadingId(children)} {...props}>
          {children}
        </h6>
      ),
      code: ({ className, children, ...props }) => {
        const languageMatch = /language-([\w-]+)/.exec(className ?? "")
        const code = String(children ?? "").replace(/\n$/, "")

        if (languageMatch?.[1]) {
          return (
            <SyntaxHighlighter
              language={languageMatch[1]}
              style={oneDark}
              PreTag="div"
              customStyle={{ borderRadius: "0.5rem", margin: "1rem 0" }}
            >
              {code}
            </SyntaxHighlighter>
          )
        }

        return (
          <code className={className} {...props}>
            {children}
          </code>
        )
      },
    }
  }, [headings])

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  )
}
