import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Philosophy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>
          <Link
            to="/#contact"
            className="text-primary hover:underline"
          >
            Let's Talk
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-20">
        <div className="container max-w-3xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              The Long Game
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Why I build what I build
            </p>
            <p className="text-lg text-muted-foreground/80 italic max-w-xl mx-auto">
              "Most people don't think past next quarter. I think in decades."
            </p>
          </motion.div>

          {/* Section 1: Systems Thinking */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              Everything is a System
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                I see the world as interconnected systems. A business is a system. A family is a system. A piece of software is a system. A civilization is a system.
              </p>
              <p>
                Once you understand how systems work—how they grow, how they fail, how they compound—you can optimize anything.
              </p>
              <p>
                This perspective shapes everything I build. I don't just solve the immediate problem; I think about how the solution fits into the larger system, how it will scale, and what second-order effects it might have.
              </p>
              <p>
                When I'm architecting software, I'm not just thinking about the feature request. I'm thinking about how this code will be maintained in 3 years, how it interacts with other systems, and whether we're building something that compounds in value or creates technical debt.
              </p>
              <p>
                The same thinking applies to life. Every decision I make, I try to consider the system it exists within.
              </p>
            </div>
          </motion.section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-16" />

          {/* Section 2: The Quality Triangle */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              The Quality Triangle
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>Every product or service exists within three constraints:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-foreground">Price</strong> (affordability)</li>
                <li><strong className="text-foreground">Speed/Convenience</strong> (how quickly you get it)</li>
                <li><strong className="text-foreground">Quality</strong> (how good it is)</li>
              </ul>
              <p>You can optimize for two, but never all three.</p>
              <p>
                Big businesses typically choose price and speed at the expense of quality. They make things "as good as people will tolerate."
              </p>
              <p>
                Small businesses often have passion and quality, but lack the software, automation, and economies of scale to compete on price and speed.
              </p>
              <p>
                My goal has always been to bridge that gap—to democratize the technological advantages that big businesses have, making them accessible to small businesses and individuals.
              </p>
              <p>
                This is why I build tools. This is why I automate. This is why I obsess over efficiency. Not for its own sake, but because efficiency is how you give quality to more people.
              </p>
            </div>

            {/* Visual Triangle */}
            <div className="mt-8 flex justify-center">
              <div className="relative w-64 h-56">
                <svg viewBox="0 0 200 180" className="w-full h-full">
                  <polygon
                    points="100,10 10,170 190,170"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary/50"
                  />
                  <text x="100" y="30" textAnchor="middle" className="fill-primary text-xs font-semibold">Quality</text>
                  <text x="25" y="165" textAnchor="middle" className="fill-primary text-xs font-semibold">Price</text>
                  <text x="175" y="165" textAnchor="middle" className="fill-primary text-xs font-semibold">Speed</text>
                </svg>
              </div>
            </div>
          </motion.section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-16" />

          {/* Section 3: Molecular Manufacturing */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              Molecular Manufacturing
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p className="text-foreground italic">Here's where it gets ambitious.</p>
              <p>
                Since high school, I've been fascinated by molecular manufacturing—the theoretical ability to build anything atom by atom.
              </p>
              <p>
                Imagine a machine where you input raw materials (carbon, elements, base matter) and a digital blueprint, and it constructs whatever you need: food, medicine, tools, shelter, electronics.
              </p>
              <p className="text-foreground font-semibold">Why does this matter?</p>
              <p>
                Because scarcity drives most human conflict. We compete because resources are limited. Wars are fought over land, oil, water. Inequality exists because some have abundance while others have nothing. Every economic system in history has been an attempt to manage scarcity.
              </p>
              <p className="text-foreground font-semibold">What if you could eliminate scarcity?</p>
              <p>
                If everyone could manufacture what they need from basic materials and energy, the fundamental assumptions of economics change. Competition for resources becomes irrelevant. Poverty becomes a solvable problem rather than an inevitable condition.
              </p>
              <p>Is this science fiction? Today, yes. In 50 years? Maybe not.</p>
              <p>The technical challenges are immense:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>How do you manipulate individual atoms with precision?</li>
                <li>How do you manage the heat generated at molecular scales?</li>
                <li>How do you create reliable "feedstock" of pure elements?</li>
                <li>How do you make it safe and accessible?</li>
                <li>How do you deploy it globally without creating new inequalities?</li>
              </ul>
              <p>
                I don't have answers to all of these. But I'm working toward them.
              </p>
              <p>
                Every business I've built, every system I've designed, every skill I've developed is a stepping stone. Software automation teaches me how to systematize complex creation. Building businesses generates resources for R&D. Understanding systems at every level—from code to companies to civilization—is preparation for the biggest system challenge of all.
              </p>
              <p>
                Will I see it completed in my lifetime? I don't know. But I'll spend my life moving us closer.
              </p>
            </div>
          </motion.section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-16" />

          {/* Section 4: Education */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              What Should Be Taught
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>Our education system focuses on memorization and regurgitation. It should teach:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>How to identify reputable sources and fact-check claims</li>
                <li>How to recognize bias and separate opinions from evidence</li>
                <li>How to synthesize information from multiple sources</li>
                <li>How to change your mind when presented with compelling new evidence</li>
                <li>How to solve problems creatively with limited resources</li>
                <li>How to think in systems and consider second-order effects</li>
                <li>How to collaborate with people who think differently than you</li>
              </ul>
              <p>
                The most successful people I've met aren't those who memorized the most facts—they're the ones who can adapt, learn continuously, and solve problems nobody has solved before.
              </p>
              <p>
                I didn't have access to great education growing up. We moved constantly, I missed months of school, I had undiagnosed learning disabilities. The system failed me in a lot of ways.
              </p>
              <p>
                But I learned the meta-skill: how to learn. How to figure things out. How to persist when everything is confusing.
              </p>
              <p>
                That's what I want to pass on—not facts, but frameworks. Not answers, but the ability to find answers.
              </p>
            </div>
          </motion.section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-16" />

          {/* Section 5: Why I Share This */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              Why I Share This
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                You might wonder why any of this is on a portfolio website. Fair question.
              </p>
              <p>
                I share this because I want to work with people who think about the long game. I want to be part of teams and organizations that are building something meaningful, not just shipping features.
              </p>
              <p>
                If this resonates with you, let's talk. If it seems grandiose or naive, that's okay too—we probably wouldn't be a good fit anyway.
              </p>
              <p className="text-foreground font-semibold">
                The best work happens when people share a vision.
              </p>
            </div>
          </motion.section>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/#contact">
                <MessageSquare className="mr-2 h-4 w-4" />
                Let's Talk
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
