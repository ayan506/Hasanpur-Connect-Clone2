import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListBusinesses, useListCategories, type Business } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";
import { BusinessCard } from "@/components/business/BusinessCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { Search, X, SlidersHorizontal } from "lucide-react";

function parseQuery(search: string) {
  const params = new URLSearchParams(search);
  return { q: params.get("q") || "", category: params.get("category") || "" };
}

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const search = typeof window !== "undefined" ? window.location.search : "";
  const { q: initialQ, category: initialCategory } = parseQuery(search);

  const [query, setQuery] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [submitted, setSubmitted] = useState(true);

  useMetaTags({
    title: `Search Businesses${initialQ ? ` — ${initialQ}` : ""} — Hasanpur Connect`,
    description: "Search and discover local businesses in Hasanpur, UP.",
  });

  const { data: categories } = useListCategories();
  const { data, isLoading } = useListBusinesses(
    submitted ? { search: query || undefined, categorySlug: (category && category !== "all") ? category : undefined, status: "approved", limit: 50 } as any : undefined,
    { enabled: submitted }
  );

  const businesses: Business[] = (data as any)?.businesses || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    setLocation(`/search?${params.toString()}`);
    setSubmitted(true);
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setLocation("/search");
    setSubmitted(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Find Businesses in Hasanpur</h1>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, description..."
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="md:w-56">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64 overflow-y-auto">
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="md:w-auto">Search</Button>
            {(query || category) && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}
          </form>

          {(query || category) && submitted && (
            <div className="flex flex-wrap gap-2 mt-4">
              {query && (
                <Badge variant="secondary" className="gap-1">
                  Query: {query}
                  <button onClick={() => { setQuery(""); }}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {category && (
                <Badge variant="secondary" className="gap-1">
                  Category: {categories?.find(c => c.slug === category)?.name || category}
                  <button onClick={() => { setCategory(""); }}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {!submitted ? (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Enter a search term or select a category to find businesses.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No businesses found</p>
            <p>Try a different search term or category.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{businesses.length} result{businesses.length !== 1 ? "s" : ""} found</p>
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
