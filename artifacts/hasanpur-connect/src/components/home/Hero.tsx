import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListCategories } from "@workspace/api-client-react";

export function Hero() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const { data: categories } = useListCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const popularCategories = categories?.slice(0, 5) || [];

  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-slate-950">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-primary/20 mix-blend-multiply" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent blur-3xl opacity-50" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <Badge className="bg-primary/20 text-primary border-primary/30 mb-6 px-4 py-1 text-sm rounded-full backdrop-blur-sm">
          <MapPin className="w-4 h-4 mr-2 inline" />
          Hasanpur's #1 Local Directory
        </Badge>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight">
          Find the best in <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
            Hasanpur City
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Discover trusted local businesses, premium services, and exclusive offers right in your neighborhood.
        </p>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for? (e.g. Restaurants, Doctors)" 
                className="pl-12 h-14 text-lg border-0 shadow-none focus-visible:ring-0 rounded-xl"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-lg rounded-xl md:w-auto w-full">
              Search
            </Button>
          </form>
        </div>

        {popularCategories.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-slate-400 font-medium mr-2">Popular:</span>
            {popularCategories.map(cat => (
              <Button 
                key={cat.id} 
                variant="outline" 
                size="sm"
                className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-primary/20 hover:text-white rounded-full transition-colors"
                onClick={() => setLocation(`/category/${cat.slug}`)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Need to import Badge in the file since it's used
import { Badge } from "@/components/ui/badge";
