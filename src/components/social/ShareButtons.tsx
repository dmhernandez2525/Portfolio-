import { useState } from "react"
import { Copy, Check, Share2 } from "lucide-react"
import { copyToClipboard, getShareUrl, openShareWindow, type SharePlatform } from "@/lib/social/share-links"

interface ShareButtonsProps {
  title: string
  url: string
  text?: string
}

const PLATFORMS: Array<{ id: SharePlatform; label: string }> = [
  { id: "twitter", label: "X / Twitter" },
  { id: "linkedin", label: "LinkedIn" },
]

export function ShareButtons({ title, url, text }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = (platform: SharePlatform) => {
    const shareUrl = getShareUrl(platform, { title, url, text })
    openShareWindow(shareUrl)
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(url)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Share options">
      <Share2 className="w-4 h-4 text-muted-foreground" aria-hidden />
      {PLATFORMS.map((platform) => (
        <button
          key={platform.id}
          type="button"
          onClick={() => handleShare(platform.id)}
          className="px-3 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={`Share on ${platform.label}`}
        >
          {platform.label}
        </button>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className="px-3 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center gap-1"
        aria-label="Copy link"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}
