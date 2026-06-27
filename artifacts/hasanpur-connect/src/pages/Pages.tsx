import { useEffect, useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ChevronRight } from "lucide-react";
import { useMetaTags } from "@/hooks/use-meta-tags";

interface CustomPage {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  metaDescription?: string;
  updatedAt?: string;
}

export default function PagesListPage() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

  useMetaTags({
    title: "Pages — Hasanpur Connect",
    description: "Browse all pages published on Hasanpur Connect.",
  });

  useEffect(() => {
    fetch(`${BASE}/api/pages`)
      .then(r => r.ok ? r.json() : [])
      .then(setPages)
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, [BASE]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground mt-1">All published pages on Hasanpur Connect</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No pages published yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map(page => (
              <Link key={page.id} href={`/${page.slug}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">{page.title}</p>
                        {page.metaDescription && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{page.metaDescription}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
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
