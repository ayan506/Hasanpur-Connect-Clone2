import { useParams, Link } from "wouter";
import { useGetBlogPost } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { useMetaTags } from "@/hooks/use-meta-tags";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useGetBlogPost(slug!);

  useMetaTags({
    title: post?.metaTitle || post?.title || "Blog Post",
    description: post?.metaDescription || post?.excerpt || "",
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="h-8 w-2/3 bg-muted animate-pulse rounded mb-4" />
          <div className="h-4 w-1/3 bg-muted animate-pulse rounded mb-8" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-2xl font-bold mb-4">Post not found</p>
          <Link href="/blog"><Button>Back to Blog</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {post.featuredImage && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Button>
        </Link>

        {post.category && <Badge variant="secondary" className="mb-4">{post.category}</Badge>}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 flex-wrap">
          {post.authorName && (
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> {post.authorName}
            </span>
          )}
          {post.createdAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none leading-relaxed">
          {(post.content ?? "").split("\n").map((para, i) => (
            para.trim() ? <p key={i} className="mb-4 text-muted-foreground">{para}</p> : <br key={i} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
