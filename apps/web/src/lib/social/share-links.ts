export type SharePlatform = "twitter" | "linkedin" | "copy"

interface ShareConfig {
  title: string
  url: string
  text?: string
}

export function getShareUrl(platform: SharePlatform, config: ShareConfig): string {
  const encodedUrl = encodeURIComponent(config.url)
  const encodedTitle = encodeURIComponent(config.title)
  const encodedText = encodeURIComponent(config.text ?? config.title)

  const urls: Record<SharePlatform, string> = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}`,
    copy: config.url,
  }

  return urls[platform]
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function openShareWindow(url: string): void {
  window.open(url, "_blank", "width=600,height=400,noopener,noreferrer")
}
