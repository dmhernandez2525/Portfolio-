export interface ExperienceItem {
  id: string
  company: string
  title: string
  duration: string
  description: string
  tech: string[]
  achievements: string[]
  logo?: string
  isCollapsed?: boolean
}

export const experienceData: ExperienceItem[] = [
  {
    id: "braingu",
    company: "BrainGu",
    title: "Senior Software Engineer",
    duration: "June 2024 - January 2026",
    description: "Department of Defense software development for Space Force, Air Force, and Navy applications.",
    tech: ["React", "Next.js", "Django", "Python", "Cesium", "TypeScript", "Docker"],
    achievements: [
      "Developed 5 DoD applications including secure pipeline platform and 3D asset tracking",
      "Integrated Ask Sage government-secure AI API and helped develop local secure CLI coding agent",
      "Built geolocation applications for real-time asset management using Cesium",
      "Worked with Platform One (P1) and IL5 deployment environments",
      "Authored comprehensive documentation for all services and features"
    ]
  },
  {
    id: "tailored-tech",
    company: "Tailored Technologies",
    title: "Principal Full-Stack Engineer & Co-Founder",
    duration: "November 2021 - June 2024",
    description: "Founded and led engineering for custom software consultancy.",
    tech: ["React", "Node.js", "Strapi", "PostgreSQL", "Stripe", "Next.js"],
    achievements: [
      "Architected Peak Golf Academy Platform: comprehensive club management system",
      "Created extensive internal component library and dev tools (Form builder, Flow builder)",
      "Managed multiple client projects while leading team of developers",
      "Built complex integrations with QuickBooks, Stripe, SendGrid"
    ]
  },
  {
    id: "mesirow",
    company: "Mesirow Financial",
    title: "Senior Full-Stack Engineer",
    duration: "February 2023 - November 2023",
    description: "Wealth Management portal modernization.",
    tech: ["React", "C#", ".NET", "SQL Server"],
    achievements: [
      "Modernized legacy wealth management portal",
      "Achieved 30% performance improvement through refactoring",
      "Mentored junior developers on React best practices"
    ]
  },
  {
    id: "first-american",
    company: "First American",
    title: "Senior Software Engineer",
    duration: "March 2022 - February 2023",
    description: "Enterprise microservices architecture.",
    tech: ["React", "GraphQL", "AWS Lambda", "SQS", "SNS"],
    achievements: [
      "Implemented enterprise microservices using AWS serverless stack",
      "Built highly reusable front-end components with custom hooks",
      "Led architectural design for document processing features"
    ]
  },
  {
    id: "charter",
    company: "Charter Communications",
    title: "Full-Stack Engineer",
    duration: "February 2020 - March 2022",
    description: "Internal tools and POC applications.",
    tech: ["React", "TypeGraphQL", "Next.js", "DynamoDB", "Keycloak"],
    achievements: [
      "Built internal tool for non-developers to access production data safely",
      "Led development of two major products, delivering under budget and ahead of schedule",
      "Built POC generating production-grade code from user interactions"
    ]
  },
  {
    id: "earlier-roles",
    company: "Earlier Roles",
    title: "Various Positions",
    duration: "Prior to 2020",
    description: "Freelance, teaching, and tech repair ventures.",
    tech: ["React", "Node.js", "MongoDB", "HTML/CSS", "JavaScript", "Python"],
    achievements: [
      "Tek Mate - Technical support and computer repair services",
      "Brainy Developer - Freelance web development for small businesses",
      "Lake Land College - Teaching Assistant, tutored HTML/CSS/JS/Python"
    ],
    isCollapsed: true
  }
]
