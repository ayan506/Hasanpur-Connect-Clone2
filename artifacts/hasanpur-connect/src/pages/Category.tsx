import { useParams, Link } from "wouter";
import { useListBusinesses, useListCategories, type Business } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";
import { BusinessCard } from "@/components/business/BusinessCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { ChevronLeft, LayoutGrid } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories } = useListCategories();
  const category = categories?.find(c => c.slug === slug);

  const { data, isLoading } = useListBusinesses(
    slug ? { categorySlug: slug, status: "approved", limit: 50 } as any : undefined,
    { enabled: !!slug }
  );

  const businesses: Business[] = (data as any)?.businesses || [];

  useMetaTags({
    title: `${category?.name || "Category"} in Hasanpur — Hasanpur Connect`,
    description: `Browse ${category?.name || ""} businesses in Hasanpur, UP.`,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">{category?.name || slug}</h1>
          </div>
          {category?.description && (
            <p className="text-muted-foreground mt-1 ml-15">{category.description}</p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No businesses in this category yet</p>
            <p className="mb-6">Be the first to list your business here!</p>
            <Link href="/register">
              <Button>List Your Business</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{businesses.length} business{businesses.length !== 1 ? "es" : ""} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map(b => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
