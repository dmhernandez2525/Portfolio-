import { strToU8, zipSync } from "fflate"
import type { ResumeSnapshot } from "@/types/resume"

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function createWordParagraph(text: string, options?: { bold?: boolean }): string {
  const escaped = escapeXml(text)

  if (options?.bold) {
    return `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`
  }

  return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`
}

function createResumeDocumentXml(snapshot: ResumeSnapshot): string {
  const paragraphs: string[] = []

  paragraphs.push(createWordParagraph(snapshot.profile.name, { bold: true }))
  paragraphs.push(createWordParagraph(snapshot.profile.title))
  paragraphs.push(createWordParagraph(`Email: ${snapshot.profile.email}`))
  paragraphs.push(createWordParagraph(`GitHub: ${snapshot.profile.githubUrl}`))
  paragraphs.push(createWordParagraph(`LinkedIn: ${snapshot.profile.linkedinUrl}`))
  paragraphs.push(createWordParagraph(""))

  paragraphs.push(createWordParagraph("SUMMARY", { bold: true }))
  paragraphs.push(createWordParagraph(snapshot.summary))
  paragraphs.push(createWordParagraph(""))

  paragraphs.push(createWordParagraph("SKILLS", { bold: true }))
  for (const group of snapshot.skillGroups) {
    const skillNames = group.skills.map((skill) => skill.name).join(", ")
    paragraphs.push(createWordParagraph(`${group.category}: ${skillNames}`))
  }
  paragraphs.push(createWordParagraph(""))

  paragraphs.push(createWordParagraph("EXPERIENCE", { bold: true }))
  for (const experience of snapshot.experiences) {
    paragraphs.push(createWordParagraph(`${experience.title} | ${experience.company} | ${experience.duration}`, { bold: true }))
    paragraphs.push(createWordParagraph(experience.description))
    for (const achievement of experience.achievements) {
      paragraphs.push(createWordParagraph(`- ${achievement}`))
    }
    paragraphs.push(createWordParagraph(""))
  }

  paragraphs.push(createWordParagraph("SELECTED PROJECTS", { bold: true }))
  for (const project of snapshot.projects) {
    paragraphs.push(createWordParagraph(`${project.title}: ${project.tagline}`, { bold: true }))
    paragraphs.push(createWordParagraph(project.description))
    paragraphs.push(createWordParagraph(`Tech: ${project.tech.slice(0, 8).join(", ")}`))
    paragraphs.push(createWordParagraph(""))
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
  <w:body>
    ${paragraphs.join("\n    ")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`
}

function buildDocxBytes(snapshot: ResumeSnapshot): Uint8Array {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(contentTypes),
    "_rels/.rels": strToU8(rels),
    "word/document.xml": strToU8(createResumeDocumentXml(snapshot)),
  }

  return zipSync(files, { level: 6 })
}

export function createResumeDocxBytes(snapshot: ResumeSnapshot): Uint8Array {
  return buildDocxBytes(snapshot)
}

function downloadBlob(filename: string, blob: Blob): void {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}

export function buildResumePlainText(snapshot: ResumeSnapshot): string {
  const lines: string[] = []

  lines.push(snapshot.profile.name)
  lines.push(snapshot.profile.title)
  lines.push(snapshot.profile.email)
  lines.push(snapshot.profile.githubUrl)
  lines.push(snapshot.profile.linkedinUrl)
  lines.push("")

  lines.push("SUMMARY")
  lines.push(snapshot.summary)
  lines.push("")

  lines.push("SKILLS")
  for (const group of snapshot.skillGroups) {
    lines.push(`${group.category}: ${group.skills.map((skill) => skill.name).join(", ")}`)
  }
  lines.push("")

  lines.push("EXPERIENCE")
  for (const experience of snapshot.experiences) {
    lines.push(`${experience.title} | ${experience.company} | ${experience.duration}`)
    lines.push(experience.description)
    for (const achievement of experience.achievements) {
      lines.push(`- ${achievement}`)
    }
    lines.push("")
  }

  lines.push("PROJECTS")
  for (const project of snapshot.projects) {
    lines.push(`${project.title}: ${project.tagline}`)
  }

  return lines.join("\n")
}

export function exportResumeAsText(snapshot: ResumeSnapshot, filename = "daniel-hernandez-resume.txt"): void {
  const text = buildResumePlainText(snapshot)
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
  downloadBlob(filename, blob)
}

export function exportResumeAsDocx(snapshot: ResumeSnapshot, filename = "daniel-hernandez-resume.docx"): void {
  downloadBlob(filename, createResumeDocxBlob(snapshot))
}

export function getResumePdfUrl(): string {
  return "/resume.pdf"
}

export function createResumeDocxBlob(snapshot: ResumeSnapshot): Blob {
  const bytes = createResumeDocxBytes(snapshot)
  const blobBytes = Uint8Array.from(bytes)
  return new Blob([blobBytes], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  })
}
