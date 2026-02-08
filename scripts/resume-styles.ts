import { StyleSheet } from "@react-pdf/renderer"

const colors = {
  text: "#1a1a2e",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  link: "#2563eb",
} as const

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    color: colors.text,
  },

  // Header
  headerName: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  headerLinks: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  headerLink: {
    fontSize: 9,
    color: colors.link,
    textDecoration: "none",
  },

  // Sections
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },

  // Summary
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
  },

  // Skills
  skillRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillCategory: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginRight: 4,
    minWidth: 75,
  },
  skillList: {
    fontSize: 10,
    color: colors.textMuted,
    flex: 1,
  },

  // Experience
  experienceEntry: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  experienceTitle: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  experienceCompany: {
    fontSize: 10,
    color: colors.textMuted,
  },
  experienceDuration: {
    fontSize: 9,
    color: colors.textMuted,
  },
  experienceDescription: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 3,
  },
  achievementRow: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletPoint: {
    width: 10,
    fontSize: 9,
  },
  achievementText: {
    fontSize: 9,
    flex: 1,
  },

  // Projects
  projectEntry: {
    flexDirection: "row",
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginRight: 4,
  },
  projectDash: {
    fontSize: 10,
    color: colors.textMuted,
    marginRight: 4,
  },
  projectTagline: {
    fontSize: 10,
    color: colors.textMuted,
    flex: 1,
  },

  // QR Codes
  qrSection: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 24,
    marginTop: 8,
  },
  qrItem: {
    alignItems: "center",
  },
  qrImage: {
    width: 60,
    height: 60,
  },
  qrLabel: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
})
