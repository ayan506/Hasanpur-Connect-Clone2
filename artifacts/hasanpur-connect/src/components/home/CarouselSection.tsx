import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Slide {
  id: number;
  imageUrl: string;
  title?: string | null;
  subtitle?: string | null;
  linkUrl?: string | null;
}

export function CarouselSection() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/carousel`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setSlides(data); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [slides.length, next]);

  if (!loaded || slides.length === 0) return null;

  const slide = slides[current];

  const inner = (
    <div className="relative w-full h-full">
      <img
        src={slide.imageUrl}
        alt={slide.title || ""}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {(slide.title || slide.subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          {slide.title && <h2 className="text-white text-lg md:text-3xl font-bold leading-tight drop-shadow">{slide.title}</h2>}
          {slide.subtitle && <p className="text-white/85 text-sm md:text-base mt-1 drop-shadow">{slide.subtitle}</p>}
        </div>
      )}
    </div>
  );

  return (
    <section className="relative w-full px-4 py-4 bg-white">
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: "320px" }}>
        {slide.linkUrl ? (
          <Link href={slide.linkUrl} className="block w-full h-full">{inner}</Link>
        ) : (
          <div className="w-full h-full">{inner}</div>
        )}

        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-4" : "bg-white/50"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
