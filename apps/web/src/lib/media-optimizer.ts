import type { MediaAsset } from "@/types/content-management"

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to decode image"))
    image.src = url
  })
}

export async function optimizeImageToWebp(file: File, maxWidth = 1600, quality = 0.82): Promise<MediaAsset | null> {
  if (typeof document === "undefined") return null

  const sourceDataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(sourceDataUrl)
  const ratio = image.width > maxWidth ? maxWidth / image.width : 1
  const width = Math.max(1, Math.round(image.width * ratio))
  const height = Math.max(1, Math.round(image.height * ratio))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) return null
  context.drawImage(image, 0, 0, width, height)

  const url = canvas.toDataURL("image/webp", Math.max(0.2, Math.min(1, quality)))
  const sizeKb = Math.round((url.length * 0.75) / 1024)

  return {
    id: `asset-${Date.now()}`,
    type: "image",
    name: file.name.replace(/\.[^/.]+$/, "") + ".webp",
    url,
    sizeKb,
    createdAt: new Date().toISOString(),
  }
}

export async function fileToMediaAsset(file: File): Promise<MediaAsset> {
  const url = await readFileAsDataUrl(file)
  const type = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "document"
  return {
    id: `asset-${Date.now()}`,
    type,
    name: file.name,
    url,
    sizeKb: Math.max(1, Math.round(file.size / 1024)),
    createdAt: new Date().toISOString(),
  }
}
