import { useMemo, useState } from "react"
import { Copy, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BlogShareButtonsProps {
  postId: string
  title: string
}

type CopyState = "idle" | "copied" | "failed"

function openSharePopup(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer")
}

async function copyToClipboard(value: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return true
  }

  const fallbackInput = document.createElement("textarea")
  fallbackInput.value = value
  fallbackInput.setAttribute("readonly", "true")
  fallbackInput.style.position = "absolute"
  fallbackInput.style.left = "-9999px"
  document.body.appendChild(fallbackInput)
  fallbackInput.select()
  const didCopy = document.execCommand("copy")
  document.body.removeChild(fallbackInput)
  return didCopy
}

export function BlogShareButtons({ postId, title }: BlogShareButtonsProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle")

  const postUrl = useMemo(() => {
    return `${window.location.origin}/blog?post=${encodeURIComponent(postId)}`
  }, [postId])

  const encodedUrl = encodeURIComponent(postUrl)
  const encodedTitle = encodeURIComponent(title)

  const handleCopy = async (): Promise<void> => {
    try {
      const didCopy = await copyToClipboard(postUrl)
      setCopyState(didCopy ? "copied" : "failed")
    } catch {
      setCopyState("failed")
    }
  }

  const handleShareX = (): void => {
    openSharePopup(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)
  }

  const handleShareLinkedIn = (): void => {
    openSharePopup(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
        <Copy className="h-3.5 w-3.5" />
        {copyState === "copied" ? "Copied" : "Copy link"}
      </Button>
      <Button variant="outline" size="sm" onClick={handleShareX} className="gap-1">
        <Twitter className="h-3.5 w-3.5" />
        Share on X
      </Button>
      <Button variant="outline" size="sm" onClick={handleShareLinkedIn} className="gap-1">
        <Linkedin className="h-3.5 w-3.5" />
        Share on LinkedIn
      </Button>
      {copyState === "failed" ? <span className="text-xs text-red-500">Copy failed</span> : null}
    </div>
  )
}
