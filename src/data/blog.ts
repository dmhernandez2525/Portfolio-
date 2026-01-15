export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  category: "Engineering" | "Philosophy" | "Projects" | "Life"
  readTime: number
  featured?: boolean
}

export const blogPosts: BlogPost[] = [
  {
    id: "building-without-degree",
    title: "Building a Tech Career Without a Degree",
    excerpt: "How I went from GED to Principal Engineer, and what I learned along the way.",
    content: `When I started my journey into tech, I had no degree, no connections, and a family to support. What I did have was an obsessive drive to learn and a willingness to work harder than anyone else in the room.

The path wasn't traditional. I started by building websites for local businesses, charging whatever they could afford. I learned PHP by building things, not by taking courses. I failed constantly, but each failure taught me something.

The turning point came when I realized that most companies don't really care about degrees—they care about results. Once I had a portfolio of shipped products and happy clients, doors started opening.

Here's what I learned:

**1. Build in Public**
Don't wait until you're "ready." Start building things now. Your first projects will be terrible, and that's fine. Each one makes you better.

**2. Focus on Problems, Not Tech**
Technologies change constantly. Problem-solving skills are forever. Learn to identify what people actually need, not just what's trendy.

**3. Document Everything**
Every project you complete is evidence. Screenshots, metrics, testimonials—collect them all. When you don't have a degree, your portfolio is your credential.

**4. Network Through Value**
Don't ask people for jobs. Ask how you can help them. Provide value first. The opportunities follow.

**5. Never Stop Learning**
The moment you think you've "made it" is when you start falling behind. Stay hungry, stay curious.

The tech industry has more self-taught engineers than you might think. Your background isn't a limitation—it's a unique perspective that can make you valuable.`,
    date: "2024-12-15",
    category: "Engineering",
    readTime: 5,
    featured: true
  },
  {
    id: "systems-thinking-real-world",
    title: "Systems Thinking in the Real World",
    excerpt: "How understanding interconnected systems changed how I approach every problem.",
    content: `Everything is connected. Once you internalize this, you start seeing the world differently.

A few years ago, I was debugging a production issue that seemed simple—API responses were slow. The obvious fix was to optimize the query. But when I zoomed out and looked at the whole system, I discovered something interesting.

The slow API wasn't the problem. It was a symptom. The real issue was that our caching layer was misconfigured, causing redundant database calls across multiple services. Fixing the cache didn't just solve the slow API—it reduced our infrastructure costs by 40%.

This is systems thinking in action. Instead of treating symptoms, you find root causes. Instead of local optimizations, you make changes that improve the whole.

**How to Think in Systems**

1. **Map the connections.** Before solving anything, understand how the parts relate.

2. **Look for feedback loops.** Systems often have cycles that amplify or dampen behaviors.

3. **Consider second-order effects.** Every change you make will cause other changes.

4. **Find the leverage points.** Small changes in the right places can have massive effects.

This applies everywhere—software architecture, business strategy, even personal relationships. The principles are universal.`,
    date: "2024-11-28",
    category: "Philosophy",
    readTime: 4
  },
  {
    id: "why-i-build-tools",
    title: "Why I Build Tools Instead of Products",
    excerpt: "The long-term value of enabling others to create.",
    content: `When I was younger, I wanted to build the next big app. The thing everyone uses. The product that makes billions.

Now I understand something different: tools are more valuable than products.

Products serve users. Tools enable creators. A product might have thousands of users. A tool might enable thousands of products.

Think about it this way: Photoshop is a tool. Instagram is a product built with tools like Photoshop. Which has had more impact on the world?

When you build a tool, you're not just solving one problem. You're enabling an infinite number of solutions that you never could have imagined.

This is why I've shifted my focus. Instead of building the finished thing, I want to build the things that help others build.

**The Compound Effect**

Every tool you build can be:
- Used by others
- Combined with other tools
- Improved upon
- Applied to problems you never considered

Products have a ceiling. Tools compound forever.`,
    date: "2024-11-10",
    category: "Philosophy",
    readTime: 3
  },
  {
    id: "vr-game-development",
    title: "Building VR Games as a Solo Developer",
    excerpt: "Lessons from creating immersive experiences with limited resources.",
    content: `VR development is humbling. Everything you think you know about game design gets challenged when users can look anywhere and reach for anything.

I started building VR games as a hobby, but it quickly became an obsession. There's something magical about creating a world that people can actually inhabit.

**Challenges Unique to VR**

1. **Performance is non-negotiable.** Drop below 90fps and people get sick. Every optimization matters.

2. **Comfort is complex.** Movement that feels fine on a screen can be nauseating in VR. You have to rethink basic interactions.

3. **Scale matters.** Objects that look right in Unity can feel wrong when you're standing next to them. Everything needs testing in-headset.

4. **Interaction design is different.** Mouse and keyboard abstractions disappear. You're designing for hands.

**What I've Built**

My current project is a physics puzzle game where you manipulate objects to solve environmental challenges. It's been in development for about a year, with most work happening on weekends and late nights.

The goal is simple: create something that makes people feel like they have superpowers. VR at its best isn't about escaping reality—it's about expanding what feels possible.

More updates coming soon.`,
    date: "2024-10-22",
    category: "Projects",
    readTime: 4
  },
  {
    id: "parenting-and-engineering",
    title: "What Parenting Taught Me About Engineering",
    excerpt: "Unexpected lessons from raising four kids while building a career.",
    content: `I became a father at 19. By 25, I had four kids. Most people thought I was crazy. Maybe I was.

But parenting taught me more about engineering than any course or job ever could.

**Patience with Failure**

Kids fail constantly. They fall when learning to walk, they mispronounce words, they break things. Your job is to create an environment where failure is safe and learning is possible.

Good engineering teams work the same way. Psychological safety, blame-free post-mortems, and iterative improvement—these aren't just buzzwords. They're how growth happens.

**Systems Over Willpower**

You can't force a toddler to behave through sheer willpower. You need systems: routines, environmental design, consistent consequences. When the system is good, compliance is natural.

Same with code. Good architecture doesn't require heroic effort to maintain. Bad architecture needs heroes constantly.

**Long-Term Thinking**

Every decision you make as a parent ripples forward for decades. The habits you build, the values you model, the environment you create—these compound over time.

Technical decisions compound too. The architecture you choose today will shape what's possible tomorrow.

My kids are older now, and I can see the results of decisions I made years ago. Some were great. Some I'd do differently. But I'm grateful for every lesson.`,
    date: "2024-09-15",
    category: "Life",
    readTime: 4
  }
]
