import type { ManagedProjectImage } from "@/types/admin-project"

export interface ImageProcessOptions {
  maxWidth: number
  maxHeight: number
  quality: number
  cropPercent: {
    x: number
    y: number
    width: number
    height: number
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(new Error("Failed to read image file"))
    reader.readAsDataURL(file)
  })
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to decode image file"))
    image.src = dataUrl
  })
}

export async function processProjectImage(file: File, options: ImageProcessOptions): Promise<ManagedProjectImage | null> {
  if (typeof document === "undefined") return null

  const dataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(dataUrl)
  const cropX = clamp(options.cropPercent.x, 0, 100)
  const cropY = clamp(options.cropPercent.y, 0, 100)
  const cropWidth = clamp(options.cropPercent.width, 1, 100)
  const cropHeight = clamp(options.cropPercent.height, 1, 100)

  const sourceX = (cropX / 100) * image.width
  const sourceY = (cropY / 100) * image.height
  const sourceWidth = (cropWidth / 100) * image.width
  const sourceHeight = (cropHeight / 100) * image.height

  const aspectRatio = sourceWidth / sourceHeight
  const targetWidth = Math.min(options.maxWidth, sourceWidth)
  const targetHeight = Math.min(options.maxHeight, targetWidth / aspectRatio)

  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(targetWidth))
  canvas.height = Math.max(1, Math.round(targetHeight))
  const context = canvas.getContext("2d")
  if (!context) return null

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
  const quality = clamp(options.quality, 0.2, 1)
  const outputDataUrl = canvas.toDataURL("image/jpeg", quality)
  const compressedSizeKb = Math.round((outputDataUrl.length * 0.75) / 1024)

  return {
    id: `img-${Date.now()}`,
    name: file.name,
    dataUrl: outputDataUrl,
    width: canvas.width,
    height: canvas.height,
    compressedSizeKb,
  }
}
