import { Link } from "wouter";
import { useListBlogPosts } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { useMetaTags } from "@/hooks/use-meta-tags";

export default function BlogPage() {
  const { data, isLoading } = useListBlogPosts({ status: "published", limit: 20 });
  useMetaTags({ title: "Blog", description: "Latest news and articles from Hasanpur Connect" });

  const posts = data?.posts || [];

  return (
    <Layout>
      <div className="bg-slate-950 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold tracking-wider text-primary uppercase">BLOG</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Local News & Guides</h1>
          <p className="text-slate-400 mt-2">Stay updated with the latest from Hasanpur</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-semibold">No blog posts yet</p>
            <p className="text-sm mt-2">Check back soon for articles and guides!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:border-primary/50 transition-all cursor-pointer group overflow-hidden">
                  {post.featuredImage && (
                    <div className="w-full h-48 overflow-hidden">
                      <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <CardContent className="p-5 space-y-3">
                    {post.category && (
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    )}
                    <h2 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-3">
                        {post.authorName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {post.authorName}
                          </span>
                        )}
                        {post.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
