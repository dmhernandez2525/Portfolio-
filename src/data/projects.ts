export type ProjectCategory = "Web App" | "Hardware/IoT" | "Business" | "Open Source" | "Game"

export interface ProjectItem {
  id: string
  title: string
  tagline: string
  description: string
  category: ProjectCategory
  tech: string[]
  features?: string[]
  link?: string
  github?: string
  image?: string
  featured?: boolean
  easterEgg?: string
}

export const projectsData: ProjectItem[] = [
  {
    id: "blueprint-builder",
    title: "Blueprint Builder",
    tagline: "AI-Powered Project Management",
    description: "Built to solve the problem of lost context in project planning. Hierarchical work items with AI-assisted context gathering.",
    category: "Web App",
    tech: ["Next.js", "React", "Redux", "OpenAI API", "Strapi"],
    features: [
        "Hierarchical work items",
        "AI context gathering",
        "Historical tracking"
    ],
    featured: true
  },
  {
    id: "tailored-golf",
    title: "Tailored Golf Platform",
    tagline: "Club Management System",
    description: "Comprehensive management system for golf academies including booking, memberships, and payments.",
    category: "Web App",
    tech: ["React", "Node.js", "Strapi", "Stripe", "QuickBooks"],
    features: [
        "Booking system",
        "Membership management",
        "Payment processing"
    ],
    featured: true
  },
  {
    id: "falling-blocks",
    title: "Falling Blocks",
    tagline: "React Remake of Classic Game",
    description: "A modern rebuild of my first JavaScript game using React and Canvas.",
    category: "Game",
    tech: ["React", "Canvas API", "TypeScript"],
    featured: true,
    link: "/game",
    easterEgg: "I also build VR games, but those don't run in browsers... yet."
  },
  {
    id: "3d-printing",
    title: "3D Printing Portfolio",
    tagline: "Engineering & Design",
    description: "Functional prints and custom designs. Over a decade of experience turning ideas into physical objects.",
    category: "Hardware/IoT",
    tech: ["CAD", "3D Printing", "Fusion 360"],
    featured: false
  },
  {
    id: "modular-furniture",
    title: "Modular Furniture",
    tagline: "Automated Comfort",
    description: "Custom designed modular couch and motorized room hammock.",
    category: "Hardware/IoT",
    tech: ["CAD", "Automation", "Structural Engineering"],
    featured: false
  },
  {
    id: "learning-hall",
    title: "Learning Hall",
    tagline: "Task Management App",
    description: "Single-page Rails/React application for task management.",
    category: "Open Source",
    tech: ["Ruby on Rails", "React", "Redux", "AWS S3"],
    github: "https://github.com/dmhernandez2525/Learning-Hall"
  },
  {
    id: "save-a-stray",
    title: "Save a Stray",
    tagline: "Adoption Platform",
    description: "MERN stack application for animal rescue and adoption.",
    category: "Open Source",
    tech: ["MongoDB", "Express", "React", "Node.js", "GraphQL"],
    github: "https://github.com/hugginsc10/save-a-stray"
  }
]
