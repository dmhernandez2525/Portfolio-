import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { experienceData } from "@/data/experience"
import type { ExperienceItem } from "@/data/experience"

function ExperienceCard({ item, index }: { item: ExperienceItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="border-border/50 hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm">
        <CardHeader 
            className="cursor-pointer select-none"
            onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 rounded-full bg-primary/10 text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{item.company}</h3>
                <p className="text-lg font-medium text-foreground/80">{item.title}</p>
                <div className="flex flex-wrap gap-2 mt-2 md:hidden">
                    <span className="text-sm text-muted-foreground">{item.duration}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex flex-col items-end gap-2">
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{item.duration}</span>
                {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
             <div className="md:hidden self-end">
                {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0 pl-16 pr-6 pb-6 space-y-4">
                <p className="text-muted-foreground mb-4">{item.description}</p>
                
                <div>
                    <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Key Achievements</h4>
                    <ul className="list-disc space-y-2 pl-4 text-foreground/90">
                        {item.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                        ))}
                    </ul>
                </div>

                <div className="pt-4 flex flex-wrap gap-2">
                    {item.tech.map((tech) => (
                        <Badge key={tech} variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-default">
                            {tech}
                        </Badge>
                    ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Preview state (when closed) */}
        {!isOpen && (
            <div className="px-6 pb-6 pt-0 ml-16 hidden md:block">
                 <p className="text-muted-foreground line-clamp-1">{item.description}</p>
                 <div className="flex flex-wrap gap-2 mt-3 opacity-60">
                    {item.tech.slice(0, 4).map((tech) => (
                        <span key={tech} className="text-xs border border-border rounded-full px-2 py-0.5">{tech}</span>
                    ))}
                    {item.tech.length > 4 && <span className="text-xs text-muted-foreground">+{item.tech.length - 4} more</span>}
                 </div>
            </div>
        )}
      </Card>
    </motion.div>
  )
}

export function Experience() {
  return (
    <section id="experience" className="py-20 bg-muted/20">
      <div className="container">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Professional Experience</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            A track record of high-impact engineering leadership and execution across enterprise, startup, and defense sectors.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {experienceData.map((item, index) => (
            <ExperienceCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
