export type SkillCategory = "Frontend" | "Backend" | "Database" | "Cloud" | "Learning" | "Beyond Code"

export interface SkillItem {
  name: string
  category: SkillCategory
  icon?: string
  years?: number
  level: "Expert" | "Advanced" | "Intermediate" | "Learning"
  description?: string
}

export const skillsData: SkillItem[] = [
  // Frontend
  { name: "React", category: "Frontend", years: 6, level: "Expert", description: "Function components, Hooks, Custom hooks, Performance optimization" },
  { name: "Next.js", category: "Frontend", years: 4, level: "Expert", description: "SSR, ISR, App Router, API Routes" },
  { name: "TypeScript", category: "Frontend", years: 5, level: "Expert", description: "Strict typing, Generics, Utility types" },
  { name: "Tailwind CSS", category: "Frontend", years: 4, level: "Expert", description: "Custom config, Plugins, Responsive design" },
  { name: "Redux", category: "Frontend", years: 5, level: "Expert", description: "Redux Toolkit, RTK Query, Thunks" },
  { name: "Framer Motion", category: "Frontend", years: 3, level: "Advanced", description: "Complex animations, Gestures, Layout animations" },
  { name: "Three.js", category: "Frontend", years: 2, level: "Intermediate", description: "R3F, glTF loading, Shaders" },

  // Backend
  { name: "Node.js", category: "Backend", years: 6, level: "Expert", description: "Express, API design, Streams" },
  { name: "Python", category: "Backend", years: 3, level: "Advanced", description: "Django, FastAPI, Scripting" },
  { name: "Django", category: "Backend", years: 2, level: "Advanced", description: "DRF, ORM, Auth" },
  { name: "Ruby on Rails", category: "Backend", years: 2, level: "Intermediate", description: "MVC, ActiveRecord" },
  { name: "GraphQL", category: "Backend", years: 4, level: "Advanced", description: "Apollo, Schema design, Resolvers" },

  // Database
  { name: "PostgreSQL", category: "Database", years: 5, level: "Advanced", description: "Complex queries, Indexing, PL/pgSQL" },
  { name: "MongoDB", category: "Database", years: 5, level: "Expert", description: "Aggregation framework, Indexing" },
  { name: "DynamoDB", category: "Database", years: 3, level: "Intermediate", description: "Single-table design" },

  // Cloud
  { name: "AWS", category: "Cloud", years: 4, level: "Advanced", description: "Lambda, S3, SQS, SNS, CloudFront" },
  { name: "Docker", category: "Cloud", years: 5, level: "Advanced", description: "Multi-stage builds, Compose" },
  { name: "Kubernetes", category: "Cloud", years: 2, level: "Intermediate", description: "Deployments, Services, Helm" },

  // Currently Learning
  { name: "Go", category: "Learning", level: "Learning", description: "Concurrency, Goroutines, Channels" },
  { name: "Rust", category: "Learning", level: "Learning", description: "Memory safety, Borrow checker" },
  { name: "C++", category: "Learning", level: "Learning", description: "Embedded systems focus" },

  // Beyond Code - Maker Skills
  { name: "3D Printing", category: "Beyond Code", years: 10, level: "Expert", description: "FDM, Resin, Functional prints, Over a decade of experience" },
  { name: "Welding", category: "Beyond Code", years: 5, level: "Advanced", description: "MIG, TIG, Stick welding" },
  { name: "Soldering", category: "Beyond Code", years: 8, level: "Advanced", description: "Through-hole, SMD, PCB assembly" },
  { name: "VR Development", category: "Beyond Code", years: 4, level: "Intermediate", description: "Unity, Spatial computing, Game development" },
  { name: "CAD Design", category: "Beyond Code", years: 6, level: "Advanced", description: "Fusion 360, Functional design, Prototyping" }
]
