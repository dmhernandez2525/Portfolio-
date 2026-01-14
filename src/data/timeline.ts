export interface TimelineItem {
  id: string
  era: string
  title: string
  description: string
  details?: string[]
  icon?: string
}

export const timelineData: TimelineItem[] = [
  {
    id: "early-biz",
    era: "Early Ventures",
    title: "First Businesses",
    description: "Lawn care, snow removal, door-to-door sales operations",
    details: [
      "Learned operations, logistics, customer management",
      "Scaled to hiring help and tracking systems",
      "Made thousands per season reinvesting in equipment"
    ],
    icon: "sprout"
  },
  {
    id: "real-estate",
    era: "Real Estate",
    title: "Property Investment",
    description: "Self-taught real estate investing and property management",
    details: [
      "Bought first properties before having a driver's license",
      "Managed rental properties with no formal training",
      "Applied systems thinking to real-world operations"
    ],
    icon: "home"
  },
  {
    id: "phones",
    era: "Tech Repair",
    title: "Phones For Fast Cash",
    description: "4-year phone and laptop repair business",
    details: [
      "500+ device repairs (smartphones, laptops, tablets)",
      "Built relationships with major carriers",
      "Buy/repair/resell arbitrage model"
    ],
    icon: "smartphone"
  },
  {
    id: "paintball",
    era: "Recreation",
    title: "Flying Colors Paintball",
    description: "Acquired and operated paintball business",
    details: [
      "Business acquisition and transition",
      "Operations and customer management",
      "Event coordination and marketing"
    ],
    icon: "target"
  },
  {
    id: "teaching",
    era: "Education",
    title: "Teaching Assistant",
    description: "Lake Land College, tutored HTML/CSS/JS/Python",
    details: [
      "Tutored HTML5, CSS3, JavaScript, Python",
      "Implemented AWS-based course delivery systems",
      "First formal tech role"
    ],
    icon: "graduation-cap"
  },
  {
    id: "freelance",
    era: "Freelance",
    title: "Brainy Developer",
    description: "Web development for small businesses",
    details: [
      "React, Node, MongoDB, Express stack",
      "Direct client relationships",
      "eCommerce and custom web applications"
    ],
    icon: "code"
  },
  {
    id: "bootcamp",
    era: "Intensive Training",
    title: "App Academy",
    description: "<3% acceptance rate, 60-80 hour weeks",
    details: [
      "<3% acceptance rate",
      "60-80 hour weeks of intensive training",
      "Failed first interview, passed on retry through persistence"
    ],
    icon: "rocket"
  },
  {
    id: "enterprise",
    era: "Enterprise",
    title: "Charter → First American → Mesirow",
    description: "Internal tools, microservices, wealth management",
    details: [
      "Internal tools and POC development",
      "Microservices architecture",
      "Wealth management platforms"
    ],
    icon: "briefcase"
  },
  {
    id: "founder",
    era: "Entrepreneurship",
    title: "Tailored Technologies",
    description: "Co-founded consultancy, led engineering teams",
    details: [
      "Principal Full-Stack Engineer & Co-Founder",
      "Built golf club management platforms",
      "Led development teams and client relationships"
    ],
    icon: "users"
  },
  {
    id: "defense",
    era: "Defense",
    title: "BrainGu",
    description: "DoD applications for Space Force, Air Force, Navy",
    details: [
      "5 DoD applications across multiple branches",
      "Space Force, Air Force, Navy projects",
      "Secure pipeline development, 3D asset tracking"
    ],
    icon: "shield"
  }
]
