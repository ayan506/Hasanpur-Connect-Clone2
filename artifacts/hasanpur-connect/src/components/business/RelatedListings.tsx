import { useState, useEffect } from "react";
import { Link } from "wouter";
import { MapPin, Star, Crown, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Business {
  id: number; name: string; slug: string; logo?: string | null;
  coverImage?: string | null; address?: string | null;
  isPremium?: boolean; isVerified?: boolean; isFeatured?: boolean;
  categoryName?: string; averageRating?: number | null; viewCount?: number;
}

interface Props { categoryId: number; excludeId: number; categoryName?: string; }

export function RelatedListings({ categoryId, excludeId, categoryName }: Props) {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    fetch(`${BASE}/api/businesses?status=approved&limit=7&category=`)
      .then(r => r.ok ? r.json() : { businesses: [] })
      .then(data => {
        const all: Business[] = data.businesses ?? [];
        const same = all.filter(b => b.id !== excludeId).slice(0, 6);
        setBusinesses(same);
      })
      .catch(() => {});
    const url = `${BASE}/api/businesses?status=approved&limit=12`;
    fetch(url)
      .then(r => r.ok ? r.json() : { businesses: [] })
      .then(data => {
        const all: Business[] = (data.businesses ?? []).filter(
          (b: Business) => b.id !== excludeId
        );
        setBusinesses(all.slice(0, 6));
      })
      .catch(() => {});
  }, [categoryId, excludeId]);

  if (businesses.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">More in {categoryName || "this category"}</h2>
        <Link href={`${BASE}/search?q=${encodeURIComponent(categoryName || "")}`} className="text-sm text-primary hover:underline">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {businesses.map(biz => (
          <Link key={biz.id} href={`${BASE}/business/${biz.slug}`}>
            <div className="bg-background border rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
              <div className="aspect-video bg-muted overflow-hidden">
                {biz.coverImage ? (
                  <img src={biz.coverImage} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : biz.logo ? (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <img src={biz.logo} alt={biz.name} className="h-12 w-12 object-contain" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary/40">{biz.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1 mb-1">
                  {biz.isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                  {biz.isVerified && <ShieldCheck className="w-3 h-3 text-blue-500" />}
                </div>
                <p className="font-semibold text-sm line-clamp-1">{biz.name}</p>
                {biz.address && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3 shrink-0" /> {biz.address}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
