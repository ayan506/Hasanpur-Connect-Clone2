import { useGetFeaturedBusinesses } from "@workspace/api-client-react";
import { BusinessCard } from "@/components/business/BusinessCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function FeaturedSection() {
  const { data, isLoading } = useGetFeaturedBusinesses();

  if (isLoading || !data) {
    return null;
  }

  const { premium, featured } = data;
  const itemsToShow = [...premium, ...featured].slice(0, 8);

  if (itemsToShow.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-bold tracking-wider text-primary uppercase">FEATURED</h2>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              Top Rated in Hasanpur
            </h3>
          </div>
          <Link href="/search?premium=true">
            <Button variant="ghost" className="group">
              View all premium <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {itemsToShow.map(business => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      </div>
    </section>
  );
}
