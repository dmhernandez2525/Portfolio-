import { blogPosts } from "@/data/blog"
import { DashboardCard } from "./DashboardCard"

const CATEGORY_COLORS: Record<string, string> = {
  Engineering: "#00D4FF",
  Philosophy: "#7B2DFF",
  Projects: "#00CC66",
  Life: "#FF4D94",
}

export function RecentBlogCard() {
  const posts = blogPosts.slice(0, 5)

  return (
    <DashboardCard title="Recent Blog Posts" subtitle={`${blogPosts.length} total`}>
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="flex items-start gap-3">
            <div
              className="w-1 h-8 rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: CATEGORY_COLORS[post.category] ?? "#888" }}
            />
            <div className="min-w-0">
              <p className="text-xs text-[#ccc] truncate">{post.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[#555]">{post.date}</span>
                <span className="text-[10px] text-[#555]">{post.readTime} min</span>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: CATEGORY_COLORS[post.category] ?? "#888" }}
                >
                  {post.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
