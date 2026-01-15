import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, MessageSquare, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ContactModal } from "@/components/shared/ContactModal"

type InventionCategory = "All" | "Hardware" | "Software" | "Automation" | "Concepts"
type InventionStatus = "Built" | "Designed" | "Concept" | "Hobby"

interface Invention {
  id: string
  title: string
  tagline: string
  shortDescription: string
  category: InventionCategory
  status: InventionStatus
  fullContent: React.ReactNode
}

const statusColors: Record<InventionStatus, string> = {
  Built: "bg-green-500/20 text-green-400 border-green-500/30",
  Designed: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Concept: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Hobby: "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

const inventions: Invention[] = [
  {
    id: "modular-couch",
    title: "Modular Kid-Proof Couch",
    tagline: "Built like construction equipment. Disguised with soft goods.",
    shortDescription: "A couch system designed to actually survive a family. Bolt-together modularity, machine-washable everything, gravity-based reclining.",
    category: "Hardware",
    status: "Designed",
    fullContent: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">The Problem:</h4>
          <p className="text-muted-foreground">Standard furniture doesn't survive kids. Cushions stain permanently, frames crack, and you're stuck with whatever configuration you bought.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">The Solution:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>2x4 Douglas Fir framing for structural integrity</li>
            <li>3/4" OSB sheathing (wipeable surface)</li>
            <li>3-4" high-density foam seat cushions, 2" back cushions</li>
            <li>Heavy canvas drop cloth covers - fully removable, machine washable</li>
            <li>Bolt-together modularity - reconfigure anytime</li>
            <li>Gravity-based reclining mechanism (hinges + kickstand + notch system)</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Three Modes:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li><strong>Upright</strong> - Standard seating</li>
            <li><strong>Recline</strong> - Lay back up to 45°</li>
            <li><strong>Flat/Bed</strong> - Converts to sleeping surface</li>
          </ul>
        </div>
        <p className="text-sm text-primary">Estimated materials cost: $300-400 for a full sectional vs $2,000+ for furniture that won't last.</p>
      </div>
    ),
  },
  {
    id: "room-hammock",
    title: "Motorized Room Hammock",
    tagline: "Your entire living room becomes comfortable.",
    shortDescription: "A 20ft x 35ft hammock suspended by four motorized corner winches. Raise it to the ceiling when not in use. Lower it for movie night.",
    category: "Automation",
    status: "Concept",
    fullContent: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">Core System:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Heavy-duty marine-grade canvas (dark gray)</li>
            <li>Four independent motorized winches (300-500 lb capacity each)</li>
            <li>Ceiling-mounted or freestanding posts (renter-friendly option)</li>
            <li>Quilted cushioned surface: 2" memory foam + 2" support foam</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Smart Features:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Phone app control</li>
            <li>Voice control integration</li>
            <li>Save up to 10 preset positions</li>
            <li>Timer functions (auto-raise after movie)</li>
            <li>Safety limits (won't lower below set height)</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Operational Modes:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li><strong>Movie Mode:</strong> Angled toward TV, optimal viewing</li>
            <li><strong>Sleep Mode:</strong> Flat configuration, full body support</li>
            <li><strong>Storage Mode:</strong> Raised to ceiling, room fully usable</li>
          </ul>
        </div>
        <p className="text-sm text-primary">Estimated Cost: $2,200 - $3,700 depending on motor quality</p>
      </div>
    ),
  },
  {
    id: "self-lacing-shoes",
    title: "Self-Lacing Shoes",
    tagline: "Back to the Future, but real and practical.",
    shortDescription: "Shoes that automatically tighten when you step in. Pull a tab to release. No bending over, no tying.",
    category: "Concepts",
    status: "Concept",
    fullContent: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">How It Works:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Pressure sensors in insole detect foot insertion</li>
            <li>Small servo motors with gear reduction drive lacing mechanism</li>
            <li>Rechargeable battery (USB-C, lasts weeks per charge)</li>
            <li>Manual override pull tab for quick release</li>
            <li>Adjustable tension presets via small dial on heel</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Use Cases:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Elderly with mobility limitations</li>
            <li>People with disabilities affecting hand dexterity</li>
            <li>Athletes wanting consistent, perfect fit</li>
            <li>Anyone who hates tying shoes (everyone?)</li>
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">Target: Mass-market price point, not $700 Nike Adapts</p>
      </div>
    ),
  },
  {
    id: "filament-splicer",
    title: "Filament Splicing System",
    tagline: "Lights-out manufacturing for 3D print farms.",
    shortDescription: "Automated system that takes multiple filament spools, cuts precise lengths, splices them together, and respools into custom multi-color filament.",
    category: "Automation",
    status: "Concept",
    fullContent: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">The Problem:</h4>
          <p className="text-muted-foreground">Multi-color 3D printing requires manual filament swaps or expensive multi-material systems. Print farms can't run unattended.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">The Solution:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Automated cutting mechanism with precision length control</li>
            <li>Heat-based splicing with tension control</li>
            <li>Automatic cataloging of segment sequence</li>
            <li>10% extra material per splice for purge towers</li>
            <li>Respooling with consistent tension</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Advanced Features:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>RFID/NFC chips crimped between segments for tracking</li>
            <li>Climate-controlled filament vault (humidity control)</li>
            <li>Integration with slicer software for automatic splice planning</li>
            <li>Quality control: splice strength testing</li>
          </ul>
        </div>
        <p className="text-sm text-primary">The Vision: A 3D print farm that runs 24/7 with minimal human intervention.</p>
      </div>
    ),
  },
  {
    id: "flashlight-projector",
    title: "Flashlight Stencil Projector",
    tagline: "Bedtime stories with shadow puppets, upgraded.",
    shortDescription: "A 3D-printed attachment for any handheld flashlight. Interchangeable stencil slides project silhouettes on the wall.",
    category: "Hardware",
    status: "Designed",
    fullContent: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">How It Works:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Snap-on attachment fits standard D-cell flashlights</li>
            <li>Slide slot accepts interchangeable stencil cards</li>
            <li>Adjustable focus ring for different throw distances</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Stencil Sets:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Safari Animals</li>
            <li>Fairy Tale Characters</li>
            <li>Space & Rockets</li>
            <li>Dinosaurs</li>
            <li>Alphabet & Numbers (educational)</li>
            <li>Custom designs (upload your own SVG)</li>
          </ul>
        </div>
        <p className="text-sm text-primary">Low-tech, high-engagement. Encourages imaginative play and storytelling. No batteries required beyond the flashlight.</p>
      </div>
    ),
  },
  {
    id: "blueprint-builder",
    title: "Blueprint Builder",
    tagline: "AI-powered project management that remembers context.",
    shortDescription: "Hierarchical work item management with AI-assisted context gathering. Estimates track against actuals. Templates make repetition fast.",
    category: "Software",
    status: "Built",
    fullContent: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">The Problem:</h4>
          <p className="text-muted-foreground">Project planning loses context. Requirements discussed in meetings get lost. Estimates are based on vibes rather than historical data.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Work Item Hierarchy:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Apps (top level container)</li>
            <li>Epics (major initiatives)</li>
            <li>Features (specific functionality)</li>
            <li>User Stories (user-focused requirements)</li>
            <li>Tasks (implementation steps)</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">AI Integration:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Contextual Q&A to gather comprehensive requirements</li>
            <li>Generates detailed work items from conversations</li>
            <li>Suggests missing dependencies</li>
            <li>Learns from historical estimate accuracy</li>
          </ul>
        </div>
        <p className="text-sm text-primary">Tech Stack: Next.js, React, Redux, OpenAI API, Strapi</p>
      </div>
    ),
  },
  {
    id: "agape",
    title: "Agape",
    tagline: "Technology that brings people closer, not further apart.",
    shortDescription: "An AI assistant designed to help partners communicate better. Facilitates expression, encourages depth, models empathy.",
    category: "Software",
    status: "Concept",
    fullContent: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">Core Philosophy:</h4>
          <p className="text-muted-foreground">Not a replacement for human connection—a tool to enhance it.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">The Facets:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li><strong>Facilitating Expression:</strong> Helps people who struggle to articulate feelings</li>
            <li><strong>Encouraging Depth:</strong> Probing questions that foster introspection</li>
            <li><strong>Supporting Empathy:</strong> Models empathetic responses</li>
            <li><strong>Promoting Positivity:</strong> Emphasizes shared joys and gratitude</li>
            <li><strong>Adapting to Individuals:</strong> Learns each partner's style</li>
            <li><strong>Adding Playfulness:</strong> Gentle humor to ease tension</li>
          </ul>
        </div>
        <p className="text-sm text-primary">Most relationship problems are communication problems. If we can help people communicate even 10% better, we can save relationships.</p>
      </div>
    ),
  },
  {
    id: "vr-games",
    title: "VR Game Development",
    tagline: "Building worlds you can step into.",
    shortDescription: "I've been building VR games and experiences since college. It's not my profession, but it's one of my favorite ways to learn and create.",
    category: "Software",
    status: "Hobby",
    fullContent: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">What I've Built:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Multiple VR prototypes and game concepts</li>
            <li>Experiments with spatial computing</li>
            <li>Physics-based interaction systems</li>
            <li>Multiplayer VR environments</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Why VR:</h4>
          <p className="text-muted-foreground">There's something uniquely satisfying about building something you can literally step inside. The feedback loop is immediate—if the scale is wrong, you feel it. If the interaction is clunky, your hands tell you.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Skills Applied:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Unity/C# development</li>
            <li>3D modeling and asset creation</li>
            <li>Spatial audio design</li>
            <li>Performance optimization (VR has strict requirements)</li>
          </ul>
        </div>
        <p className="text-sm text-primary">Not actively developing games right now, but always tinkering with new VR/AR technologies.</p>
      </div>
    ),
  },
  {
    id: "combinatorial",
    title: "Combinatorial Innovations",
    tagline: "Combining existing technologies in ways nobody has.",
    shortDescription: "A collection of product concepts that merge existing technologies to solve problems neither could address alone.",
    category: "Concepts",
    status: "Concept",
    fullContent: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <h5 className="font-semibold text-foreground text-sm">Smart Garden Mirror</h5>
            <p className="text-xs text-muted-foreground">Mirror + living plants + air quality sensor + grow lights</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <h5 className="font-semibold text-foreground text-sm">Solar Umbrella Charger</h5>
            <p className="text-xs text-muted-foreground">Beach umbrella + solar panels + cooling mist + USB charging</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <h5 className="font-semibold text-foreground text-sm">Exercise Desk VR</h5>
            <p className="text-xs text-muted-foreground">Standing desk + treadmill + VR headset mount</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <h5 className="font-semibold text-foreground text-sm">Bike Helmet Safety Suite</h5>
            <p className="text-xs text-muted-foreground">Helmet + rearview camera + HUD + bone conduction speakers</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <h5 className="font-semibold text-foreground text-sm">Smart Cutting Board</h5>
            <p className="text-xs text-muted-foreground">Cutting board + scale + recipe display + ingredient recognition</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <h5 className="font-semibold text-foreground text-sm">Sleep Pod</h5>
            <p className="text-xs text-muted-foreground">Bed enclosure + noise cancellation + aromatherapy + climate control</p>
          </div>
        </div>
        <p className="text-sm text-primary">Innovation often comes from combining existing things in new ways. These are exercises in seeing connections others miss.</p>
      </div>
    ),
  },
]

const categories: InventionCategory[] = ["All", "Hardware", "Software", "Automation", "Concepts"]

export function Inventions() {
  const [activeCategory, setActiveCategory] = useState<InventionCategory>("All")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredInventions = activeCategory === "All"
    ? inventions
    : inventions.filter(inv => inv.category === activeCategory)

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-20">
        <div className="container max-w-6xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Beyond Code
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              The stuff I build when no one's paying me to build something else.
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              Ideas I've had. Some built. Some in progress. Some waiting for the right weekend.
              <br /><br />
              Whether it's furniture that survives kids, automation systems, or conceptual products that don't exist yet — here's a collection from my notebooks.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map(category => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="transition-all"
              >
                {category}
              </Button>
            ))}
          </motion.div>

          {/* Inventions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredInventions.map((invention, index) => (
                <motion.div
                  key={invention.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors ${
                    expandedId === invention.id ? "md:col-span-2 lg:col-span-3" : ""
                  }`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className={`${statusColors[invention.status]} mb-2`}>
                          {invention.status}
                        </Badge>
                        <h3 className="text-xl font-bold text-foreground">{invention.title}</h3>
                        <p className="text-sm text-primary italic">{invention.tagline}</p>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-muted-foreground mb-4">{invention.shortDescription}</p>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedId === invention.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-border pt-4 mt-4"
                        >
                          {invention.fullContent}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Expand/Collapse Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === invention.id ? null : invention.id)}
                      className="mt-4 w-full"
                    >
                      {expandedId === invention.id ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Read More
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Photo Showcase - Real Builds */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h3 className="text-2xl font-bold text-center mb-2 text-primary">From the Workshop</h3>
            <p className="text-center text-muted-foreground mb-8">Proof that I actually build things</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Alarm Clock Print */}
              <div className="group relative rounded-xl overflow-hidden bg-card/50 border border-border hover:border-primary/50 transition-colors">
                <img 
                  src="/photos/print-alarm-clock.png" 
                  alt="3D printed alarm clock prototype" 
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-primary text-xs font-semibold mb-1">3D PRINTED PROTOTYPE</p>
                    <p className="text-white font-medium mb-1">Alarm Clock Design</p>
                    <p className="text-white/70 text-sm">
                      "50% scale test print. If it fails small, it fails cheap."
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Business Card Holder */}
              <div className="group relative rounded-xl overflow-hidden bg-card/50 border border-border hover:border-primary/50 transition-colors">
                <img 
                  src="/photos/print-business-card.png" 
                  alt="3D printed laptop business card holder" 
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-primary text-xs font-semibold mb-1">BRAINY DEVELOPER ERA</p>
                    <p className="text-white font-medium mb-1">Laptop Business Card Holder</p>
                    <p className="text-white/70 text-sm">
                      "16-hour print. Because why buy what you can build?"
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Print Farm Enclosure */}
              <div className="group relative rounded-xl overflow-hidden bg-card/50 border border-border hover:border-primary/50 transition-colors">
                <img 
                  src="/photos/print-farm.png" 
                  alt="Temperature controlled 3D print farm" 
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-primary text-xs font-semibold mb-1">DIY PRINT FARM</p>
                    <p className="text-white font-medium mb-1">Temperature Controlled Enclosure</p>
                    <p className="text-white/70 text-sm">
                      "Two Ender 3s, stacked. Temperature controlled for consistent prints."
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Lithophane */}
              <div className="group relative rounded-xl overflow-hidden bg-card/50 border border-border hover:border-primary/50 transition-colors">
                <img 
                  src="/photos/lithophane.png" 
                  alt="3D printed lithophane" 
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-primary text-xs font-semibold mb-1">LITHOPHANE</p>
                    <p className="text-white font-medium mb-1">Backlit Photo Print</p>
                    <p className="text-white/70 text-sm">
                      "Photos become 3D. Light reveals the image."
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Row 2: Repair & Electronics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Bionic Finger */}
              <div className="group relative rounded-xl overflow-hidden bg-card/50 border border-border hover:border-primary/50 transition-colors">
                <img 
                  src="/photos/bionic-finger.png" 
                  alt="3D printing bionic finger parts" 
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-primary text-xs font-semibold mb-1">BIONIC FINGER</p>
                    <p className="text-white font-medium mb-1">24-Hour Print</p>
                    <p className="text-white/70 text-sm">
                      "Redesigning prosthetic parts. 9 hours in on a 24-hour print."
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Phone Repair */}
              <div className="group relative rounded-xl overflow-hidden bg-card/50 border border-border hover:border-primary/50 transition-colors">
                <img 
                  src="/photos/phone-repair.png" 
                  alt="iPhone water damage repair" 
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-primary text-xs font-semibold mb-1">PHONE REPAIR ERA</p>
                    <p className="text-white font-medium mb-1">Water Damage Recovery</p>
                    <p className="text-white/70 text-sm">
                      "Side hustle: fixing iPhones. Bowl of isopropyl and patience."
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Workbench */}
              <div className="group relative rounded-xl overflow-hidden bg-card/50 border border-border hover:border-primary/50 transition-colors">
                <img 
                  src="/photos/workbench.png" 
                  alt="Electronics workbench for Kickstarter project" 
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-primary text-xs font-semibold mb-1">1AM INSPIRATION</p>
                    <p className="text-white font-medium mb-1">Kickstarter Project</p>
                    <p className="text-white/70 text-sm">
                      "When inspiration hits at 1am, you don't ignore it."
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Robotic Hand */}
              <div className="group relative rounded-xl overflow-hidden bg-card/50 border border-border hover:border-primary/50 transition-colors">
                <img 
                  src="/photos/robotic-hand.png" 
                  alt="3D printed robotic prosthetic hand" 
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-primary text-xs font-semibold mb-1">PROSTHETICS</p>
                    <p className="text-white font-medium mb-1">Robotic Hand</p>
                    <p className="text-white/70 text-sm">
                      "Robotic arm, here we come. Full prosthetic prototype."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-lg text-muted-foreground mb-6">
              Have an idea you want to discuss? I love talking about this stuff.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Portfolio
                </Link>
              </Button>
              <ContactModal>
                <Button size="lg">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Let's Talk
                </Button>
              </ContactModal>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
