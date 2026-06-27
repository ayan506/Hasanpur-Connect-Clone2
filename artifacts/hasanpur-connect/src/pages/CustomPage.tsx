import { useEffect, useState } from "react";
import { useParams } from "wouter";
import Layout from "@/components/layout/Layout";
import { useMetaTags } from "@/hooks/use-meta-tags";
import NotFound from "./not-found";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`${BASE}/api/pages/${slug}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (!data || data.status !== "published") {
          setNotFound(true);
        } else {
          setPage(data);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useMetaTags({
    title: page?.metaTitle || page?.title || "Page",
    description: page?.metaDescription || "",
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (notFound || !page) return <NotFound />;

  // Parse gallery images
  let galleryImages: string[] = [];
  if (page.galleryJson) {
    try { galleryImages = JSON.parse(page.galleryJson); } catch {}
  }
  if (galleryImages.length === 0 && page.coverImage) {
    galleryImages = [page.coverImage];
  }

  return (
    <Layout>
      {/* Cover / hero image */}
      {page.coverImage && (
        <div className="w-full h-56 sm:h-72 md:h-80 bg-muted overflow-hidden relative">
          <img
            src={page.coverImage}
            alt={page.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">{page.title}</h1>

        {/* Gallery — show if more than one image */}
        {galleryImages.length > 1 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  className="aspect-video rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 ring-primary"
                  onClick={() => setLightbox(img)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: page.content || "" }}
        />
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Enlarged"
            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl font-light leading-none"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >×</button>
        </div>
      )}
    </Layout>
  );
}
