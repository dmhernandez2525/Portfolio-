import { fileURLToPath } from "node:url"
import path from "node:path"
import QRCode from "qrcode"
import { renderToFile } from "@react-pdf/renderer"
import { ResumeDocument, QR_LINKS } from "./resume-document"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, "..")
const OUTPUT_PATH = path.join(PROJECT_ROOT, "public", "resume.pdf")

async function generateQRCodes(): Promise<Map<string, string>> {
  const entries = await Promise.all(
    QR_LINKS.map(async ({ url }) => {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#1a1a2e", light: "#ffffff" },
      })
      return [url, dataUrl] as const
    }),
  )
  return new Map(entries)
}

async function main() {
  console.log("Generating QR codes...")
  const qrDataUrls = await generateQRCodes()
  console.log(`Generated ${qrDataUrls.size} QR codes`)

  console.log("Rendering PDF...")
  await renderToFile(<ResumeDocument qrDataUrls={qrDataUrls} />, OUTPUT_PATH)
  console.log(`Resume PDF saved to ${OUTPUT_PATH}`)
}

main().catch((error: unknown) => {
  console.error("Failed to generate resume:", error)
  process.exit(1)
})
