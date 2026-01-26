// Training data and context about Daniel for the AI assistant

export const danielContext = {
  name: "Daniel Hernandez",
  title: "Full-Stack Software Engineer",
  location: "Based in the United States",

  summary: `Daniel Hernandez is a passionate full-stack software engineer with expertise in
building scalable web applications, AI/ML platforms, and developer tools. He specializes in
React, TypeScript, Node.js, Python, and cloud technologies. Daniel has built over 30+ projects
ranging from AI-powered platforms to games and open-source tools.`,

  skills: {
    frontend: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Framer Motion"],
    backend: ["Node.js", "Python", "Express", "FastAPI", "GraphQL"],
    databases: ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
    ai_ml: ["OpenAI", "Anthropic Claude", "Google Gemini", "LangChain", "RAG"],
    cloud: ["AWS", "Render", "Vercel", "Docker", "Kubernetes"],
    tools: ["Git", "GitHub Actions", "Turborepo", "Vite", "Webpack"]
  },

  flagshipProjects: [
    {
      name: "Jarvis Voice Assistant",
      description: "Advanced AI voice assistant with wake word detection, natural language processing, and home automation integration. Features PersonaPlex for <500ms response times.",
      tech: ["Python", "Whisper", "Ollama", "Swift"]
    },
    {
      name: "SpecTree",
      description: "AI-powered OpenAPI specification generator that converts natural language requirements into production-ready API specifications.",
      tech: ["React", "TypeScript", "Node.js", "Claude AI"]
    },
    {
      name: "CodeReview AI",
      description: "Automated code review tool that uses Claude AI to analyze pull requests and provide actionable feedback.",
      tech: ["TypeScript", "GitHub API", "Claude AI"]
    },
    {
      name: "RapidBooth",
      description: "AI-powered photo booth platform for events with real-time face detection and style transfer.",
      tech: ["Next.js", "Python", "TensorFlow", "WebRTC"]
    }
  ],

  interests: [
    "Building AI-powered developer tools",
    "Voice interfaces and conversational AI",
    "Open source software development",
    "Game development",
    "Teaching and mentoring"
  ],

  contact: {
    email: "Available via the contact form on this website",
    github: "github.com/dmhernandez2525",
    linkedin: "Available on LinkedIn"
  },

  funFacts: [
    "Has built games including Tanks (with multiplayer), Agar.io clone, and more",
    "Created a haunted portfolio with a shakeable ghost character",
    "Passionate about creating developer tools that improve productivity",
    "Enjoys building voice-first interfaces"
  ]
};

export function generateSystemPrompt(): string {
  return `You are an AI assistant on Daniel Hernandez's portfolio website. Your job is to answer questions about Daniel in a friendly, professional manner.

Here's what you know about Daniel:

**Name:** ${danielContext.name}
**Title:** ${danielContext.title}
**Location:** ${danielContext.location}

**Summary:** ${danielContext.summary}

**Technical Skills:**
- Frontend: ${danielContext.skills.frontend.join(", ")}
- Backend: ${danielContext.skills.backend.join(", ")}
- Databases: ${danielContext.skills.databases.join(", ")}
- AI/ML: ${danielContext.skills.ai_ml.join(", ")}
- Cloud: ${danielContext.skills.cloud.join(", ")}
- Tools: ${danielContext.skills.tools.join(", ")}

**Flagship Projects:**
${danielContext.flagshipProjects.map(p => `- ${p.name}: ${p.description} (Built with: ${p.tech.join(", ")})`).join("\n")}

**Interests:** ${danielContext.interests.join(", ")}

**Fun Facts:** ${danielContext.funFacts.join(". ")}

**Guidelines:**
- Be friendly and conversational
- If asked about something you don't know, suggest they use the contact form
- Keep responses concise but informative (2-4 sentences for simple questions)
- Highlight relevant projects when appropriate
- If asked about availability for work, suggest they reach out via the contact form`;
}

// Fallback responses for when AI API is not available
export const fallbackResponses: Record<string, string> = {
  "skills": `Daniel is a full-stack engineer skilled in React, TypeScript, Node.js, Python, and various AI/ML technologies. He's particularly experienced with cloud platforms like AWS and Render, and has expertise in building AI-powered applications.`,

  "projects": `Daniel has built 30+ projects including Jarvis Voice Assistant (AI voice control), SpecTree (API spec generator), CodeReview AI (automated code reviews), and RapidBooth (AI photo booth). Check out the Projects section above to see them all!`,

  "experience": `Daniel is an experienced full-stack software engineer who specializes in building scalable web applications and AI-powered tools. He has extensive experience with modern web technologies and cloud infrastructure.`,

  "contact": `You can reach Daniel through the contact form on this website. He's always interested in hearing about interesting projects and opportunities!`,

  "location": `Daniel is based in the United States.`,

  "default": `I'd be happy to tell you more about Daniel! He's a full-stack software engineer who builds AI-powered applications, developer tools, and web platforms. Feel free to ask about his skills, projects, or experience!`
};

export function getFallbackResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("skill") || q.includes("technology") || q.includes("tech stack") || q.includes("know")) {
    return fallbackResponses.skills;
  }
  if (q.includes("project") || q.includes("built") || q.includes("portfolio") || q.includes("work")) {
    return fallbackResponses.projects;
  }
  if (q.includes("experience") || q.includes("background") || q.includes("career")) {
    return fallbackResponses.experience;
  }
  if (q.includes("contact") || q.includes("reach") || q.includes("hire") || q.includes("email")) {
    return fallbackResponses.contact;
  }
  if (q.includes("where") || q.includes("location") || q.includes("based") || q.includes("live")) {
    return fallbackResponses.location;
  }

  return fallbackResponses.default;
}
