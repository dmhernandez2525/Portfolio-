import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { skillsData } from "@/data/skills"
import type { SkillItem, SkillCategory } from "@/data/skills"
import { cn } from "@/lib/utils"

const categories: SkillCategory[] = ["Frontend", "Backend", "Database", "Cloud", "Learning", "Beyond Code"]

function SkillCard({ skill, index }: { skill: SkillItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      className="relative"
    >
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Card className={cn(
              "flex flex-col items-center justify-center p-4 h-32 text-center cursor-default transition-all",
              "backdrop-blur-md bg-card/50 border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
              skill.level === "Learning" ? "border-dashed border-primary/50 bg-primary/5" : ""
            )}>
              <h4 className="font-bold text-lg mb-2">{skill.name}</h4>
              <Badge variant={skill.level === "Expert" ? "default" : "secondary"} className="text-xs">
                 {skill.level}
              </Badge>
              {skill.years && <span className="text-xs text-muted-foreground mt-2">{skill.years} years</span>}
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-center p-4">
            <p className="font-semibold mb-1">{skill.description}</p>
            {skill.category === "Learning" && <p className="text-xs text-muted-foreground italic mt-2">Currently in the lab with this one 🧪</p>}
            {skill.category === "Beyond Code" && <p className="text-xs text-muted-foreground italic mt-2">Building things isn't limited to software 🛠️</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  )
}

export function Skills() {
    const [activeCategory, setActiveCategory] = useState<SkillCategory | "All">("All")
    
    const filteredSkills = activeCategory === "All" 
        ? skillsData 
        : skillsData.filter(s => s.category === activeCategory)

  return (
    <section id="skills" className="py-20">
      <div className="container">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Technical Expertise</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          <p className="mt-4 text-muted-foreground">
            A comprehensive toolbelt built over years of solving complex problems.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button
                onClick={() => setActiveCategory("All")}
                className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                    activeCategory === "All" 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                )}
            >
                All
            </button>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                        activeCategory === cat 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                    )}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredSkills.map((skill, index) => (
            <SkillCard key={skill.name} skill={skill} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
