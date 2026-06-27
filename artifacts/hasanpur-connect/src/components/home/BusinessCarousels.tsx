import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Flame, Crown, ShieldCheck, Star, Eye, Gift, Phone, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const FONT = "'Allison', cursive";

interface Business {
  id: number; name: string; slug: string;
  categoryName?: string | null; phone?: string | null; whatsapp?: string | null;
  logo?: string | null; coverImage?: string | null; address?: string | null;
  isPremium: boolean; isVerified: boolean; isFeatured: boolean;
  viewCount: number; averageRating?: number | null; reviewCount?: number;
}
interface ProductItem {
  id: number; name: string; price?: string | null;
  imageUrl?: string | null; imagesJson?: string | null;
  businessName?: string | null; businessSlug?: string | null;
}
interface CarouselsData {
  trendingNow: Business[]; platinum: Business[]; trusted: Business[];
  masterProducts: Business[]; masterProductItems: ProductItem[];
  topViews: Business[]; freeListing: Business[];
}

function getImg(coverImage?: string | null, logo?: string | null) {
  if (coverImage) {
    if (coverImage.startsWith("[")) { try { const p = JSON.parse(coverImage); if (Array.isArray(p) && p.length) return p[0]; } catch {} }
    return coverImage;
  }
  return logo || "";
}
function getProductImg(imageUrl?: string | null, imagesJson?: string | null) {
  if (imageUrl) return imageUrl;
  if (imagesJson) { try { const p = JSON.parse(imagesJson); if (Array.isArray(p) && p.length) return p[0]; } catch {} }
  return "";
}

function useCardWidth(cols: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      const cw = ref.current.offsetWidth;
      const gap = 12;
      setW(Math.floor((cw - gap * (cols - 1)) / cols));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [cols]);
  return { ref, w };
}

function useDragScroll(autoInterval: number, reverse = false, itemCount = 0, cardWidth = 0) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  // Recenter into middle copy to allow infinite looping in both directions
  const recenter = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !itemCount || !cardWidth) return;
    const blockWidth = cardWidth + 12;
    const oneBlock = blockWidth * itemCount;
    if (el.scrollLeft < oneBlock * 0.5) {
      el.scrollLeft += oneBlock;
    } else if (el.scrollLeft > oneBlock * 2 - oneBlock * 0.5) {
      el.scrollLeft -= oneBlock;
    }
  }, [itemCount, cardWidth]);

  const advance = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = cardWidth ? cardWidth + 12 : el.offsetWidth / 4;
    if (!reverse) {
      el.scrollLeft += step;
    } else {
      el.scrollLeft -= step;
    }
    recenter();
  }, [reverse, recenter, cardWidth]);

  const stop = () => { if (autoRef.current) clearInterval(autoRef.current); };
  const start = useCallback(() => { autoRef.current = setInterval(advance, autoInterval); }, [advance, autoInterval]);

  useEffect(() => {
    start();
    return stop;
  }, [start]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true; startX.current = e.pageX; scrollStart.current = scrollRef.current?.scrollLeft ?? 0;
    stop(); if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault(); scrollRef.current.scrollLeft = scrollStart.current - (e.pageX - startX.current);
    recenter();
  };
  const onMouseUp = () => {
    isDragging.current = false; if (scrollRef.current) scrollRef.current.style.cursor = "grab"; start();
  };
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].pageX; scrollStart.current = scrollRef.current?.scrollLeft ?? 0; stop();
  };
  const onTouchEnd = () => { recenter(); start(); };

  return { scrollRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp, onTouchStart, onTouchEnd };
}

function ScrollRow({ items, cardWidth, reverse, autoInterval, renderCard }: {
  items: any[]; cardWidth: number; reverse?: boolean; autoInterval: number;
  renderCard: (item: any) => React.ReactNode;
}) {
  // Duplicate items 3x for seamless infinite loop (middle copy is the "real" start)
  const looped = items.length > 0 ? [...items, ...items, ...items] : [];
  const { scrollRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd } = useDragScroll(autoInterval, reverse, items.length, cardWidth);

  // Initialise scroll to middle copy so looping works in both directions
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !cardWidth || items.length === 0) return;
    const blockWidth = cardWidth + 12; // gap 12px
    el.scrollLeft = blockWidth * items.length;
  }, [cardWidth, items.length]);

  return (
    <div
      ref={scrollRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="flex gap-3 overflow-x-auto pb-1 select-none"
      style={{ cursor: "grab", scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
    >
      {looped.map((item, i) => (
        <div key={`${item.id}-${i}`} style={{ minWidth: cardWidth || 160, width: cardWidth || 160, flexShrink: 0 }}>
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
}

interface BizCardProps { biz: Business; badgeText?: string; badgeColor?: string; platinumOnly?: boolean; }
function BizCard({ biz, badgeText, badgeColor, platinumOnly }: BizCardProps) {
  const img = getImg(biz.coverImage, biz.logo);
  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {img ? <img src={img} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" draggable={false} />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"><span className="text-3xl font-bold text-primary/40">{biz.name.charAt(0)}</span></div>}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {/* platinumOnly: show ONLY Platinum badge, never individual Premium/Verified */}
          {platinumOnly ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r from-amber-500 to-yellow-400">Platinum</span>
          ) : (
            <>
              {badgeText && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${badgeColor || "bg-primary"}`}>{badgeText}</span>}
              {biz.isFeatured && !badgeText && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-purple-600">Featured</span>}
              {biz.isPremium && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-amber-500">Premium</span>}
              {biz.isVerified && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-blue-500">Verified</span>}
            </>
          )}
        </div>
      </div>
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <div>
          <h3 className="font-semibold text-xs md:text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">{biz.name}</h3>
          {biz.categoryName && <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">{biz.categoryName}</p>}
          {biz.address && <p className="hidden md:block text-xs text-muted-foreground line-clamp-1 mt-0.5">{biz.address}</p>}
        </div>
        {(biz.averageRating || 0) > 0 && (
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-medium">{biz.averageRating?.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">({biz.reviewCount || 0})</span>
          </div>
        )}
        <div className="flex gap-1.5 mt-auto">
          <Link href={`/business/${biz.slug}`} className="flex-1" onClick={e => e.stopPropagation()}>
            <Button variant="outline" size="sm" className="w-full text-xs h-7">View</Button>
          </Link>
          {biz.phone && <a href={`tel:${biz.phone}`} onClick={e => e.stopPropagation()}><Button variant="secondary" size="sm" className="h-7 px-2"><Phone className="w-3 h-3" /></Button></a>}
          {biz.whatsapp && biz.isPremium && (
            <a href={`https://wa.me/${biz.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <Button size="sm" className="h-7 px-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"><MessageCircle className="w-3 h-3" /></Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

interface SectionHeadingProps { line1: string; icon: React.ReactNode; accentColor: string; viewAllHref?: string; }
function SectionHeading({ line1, icon, accentColor, viewAllHref }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${accentColor}`}>{icon}</div>
        <h2 style={{ fontFamily: FONT }} className="text-2xl md:text-3xl text-foreground leading-tight">{line1}</h2>
      </div>
      {viewAllHref && (
        <Link href={viewAllHref}><Button variant="ghost" size="sm" className="text-primary text-sm shrink-0">View All →</Button></Link>
      )}
    </div>
  );
}

interface SingleRowProps {
  line1: string; icon: React.ReactNode; accentColor: string;
  businesses: Business[]; badgeText?: string; badgeColor?: string; viewAllHref?: string;
  platinumOnly?: boolean;
}
function SingleRowCarousel({ line1, icon, accentColor, businesses, badgeText, badgeColor, viewAllHref, platinumOnly }: SingleRowProps) {
  const mobileCols = 2;
  const desktopCols = 4;
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    const check = () => setIsMd(window.innerWidth >= 1024);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const cols = isMd ? desktopCols : mobileCols;
  const { ref: measureRef, w: cardWidth } = useCardWidth(cols);

  if (businesses.length === 0) return null;
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <SectionHeading line1={line1} icon={icon} accentColor={accentColor} viewAllHref={viewAllHref} />
        <div ref={measureRef}>
          <ScrollRow items={businesses} cardWidth={cardWidth} autoInterval={3500}
            renderCard={(biz) => <BizCard biz={biz} badgeText={badgeText} badgeColor={badgeColor} platinumOnly={platinumOnly} />}
          />
        </div>
      </div>
    </section>
  );
}

interface TwoRowProps {
  line1: string; icon: React.ReactNode; accentColor: string;
  businesses: Business[]; badgeText?: string; badgeColor?: string; viewAllHref?: string;
  platinumOnly?: boolean;
}
function TwoRowCarousel({ line1, icon, accentColor, businesses, badgeText, badgeColor, viewAllHref, platinumOnly }: TwoRowProps) {
  const mobileCols = 2;
  const desktopCols = 4;
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    const check = () => setIsMd(window.innerWidth >= 1024);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const cols = isMd ? desktopCols : mobileCols;
  const { ref: measureRef, w: cardWidth } = useCardWidth(cols);

  if (businesses.length === 0) return null;
  const half = Math.ceil(businesses.length / 2);
  const row1 = businesses.slice(0, half);
  const row2 = businesses.slice(half);

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <SectionHeading line1={line1} icon={icon} accentColor={accentColor} viewAllHref={viewAllHref} />
        <div ref={measureRef} className="flex flex-col gap-3">
          <ScrollRow items={row1} cardWidth={cardWidth} autoInterval={3500}
            renderCard={(biz) => <BizCard biz={biz} badgeText={badgeText} badgeColor={badgeColor} platinumOnly={platinumOnly} />}
          />
          {row2.length > 0 && (
            <ScrollRow items={row2} cardWidth={cardWidth} reverse autoInterval={3500}
              renderCard={(biz) => <BizCard biz={biz} badgeText={badgeText} badgeColor={badgeColor} platinumOnly={platinumOnly} />}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ProductCarouselSection({ products }: { products: ProductItem[] }) {
  const mobileCols = 2;
  const desktopCols = 4;
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    const check = () => setIsMd(window.innerWidth >= 1024);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const cols = isMd ? desktopCols : mobileCols;
  const { ref: measureRef, w: cardWidth } = useCardWidth(cols);

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <SectionHeading
          line1="Shop Local, Buy Better"
          icon={<Package className="w-5 h-5 text-purple-500" />}
          accentColor="bg-purple-50 dark:bg-purple-950/30"
        />
        {products.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm border rounded-2xl bg-muted/30">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Products coming soon — premium businesses are adding their catalog.
          </div>
        ) : (
          <div ref={measureRef} className="flex flex-col gap-3">
            <ScrollRow items={products.slice(0, Math.ceil(products.length / 2))} cardWidth={cardWidth} autoInterval={3800}
              renderCard={(p: ProductItem) => {
                const img = getProductImg(p.imageUrl, p.imagesJson);
                return (
                  <Link href={p.businessSlug ? `/business/${p.businessSlug}` : "#"} onClick={e => e.stopPropagation()}>
                    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer">
                      <div className="relative aspect-square w-full overflow-hidden bg-muted">
                        {img ? <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" draggable={false} />
                          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-950/20"><Package className="w-10 h-10 text-purple-300" /></div>}
                        <div className="absolute top-2 left-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-purple-600">Product</span></div>
                      </div>
                      <div className="p-3 flex flex-col gap-1 flex-1">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary">{p.name}</h3>
                        {p.price && <p className="text-primary font-bold text-sm">₹{p.price}</p>}
                        {p.businessName && <p className="text-xs text-muted-foreground line-clamp-1">{p.businessName}</p>}
                      </div>
                    </div>
                  </Link>
                );
              }}
            />
            {products.length > 1 && (
              <ScrollRow items={products.slice(Math.ceil(products.length / 2))} cardWidth={cardWidth} reverse autoInterval={3800}
                renderCard={(p: ProductItem) => {
                  const img = getProductImg(p.imageUrl, p.imagesJson);
                  return (
                    <Link href={p.businessSlug ? `/business/${p.businessSlug}` : "#"} onClick={e => e.stopPropagation()}>
                      <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer">
                        <div className="relative aspect-square w-full overflow-hidden bg-muted">
                          {img ? <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" draggable={false} />
                            : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-950/20"><Package className="w-10 h-10 text-purple-300" /></div>}
                          <div className="absolute top-2 left-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-purple-600">Product</span></div>
                        </div>
                        <div className="p-3 flex flex-col gap-1 flex-1">
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary">{p.name}</h3>
                          {p.price && <p className="text-primary font-bold text-sm">₹{p.price}</p>}
                          {p.businessName && <p className="text-xs text-muted-foreground line-clamp-1">{p.businessName}</p>}
                        </div>
                      </div>
                    </Link>
                  );
                }}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function BusinessCarousels() {
  const [data, setData] = useState<CarouselsData | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/businesses/carousels`)
      .then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="divide-y divide-border/50">
      {/* Trending Now: isFeatured businesses only */}
      <SingleRowCarousel
        line1="Trending Now"
        icon={<Flame className="w-5 h-5 text-orange-500" />}
        accentColor="bg-orange-50 dark:bg-orange-950/30"
        businesses={data.trendingNow} badgeText="Trending" badgeColor="bg-orange-500"
        viewAllHref="/search?featured=true"
      />
      {/* Platinum: isPremium + isVerified — show only Platinum badge */}
      <TwoRowCarousel
        line1="Platinum Businesses"
        icon={<Crown className="w-5 h-5 text-yellow-500" />}
        accentColor="bg-yellow-50 dark:bg-yellow-950/30"
        businesses={data.platinum}
        platinumOnly
        viewAllHref="/search?premium=true&verified=true"
      />
      {/* Trusted/Verified: isVerified only */}
      <SingleRowCarousel
        line1="Trusted + Verified"
        icon={<ShieldCheck className="w-5 h-5 text-blue-500" />}
        accentColor="bg-blue-50 dark:bg-blue-950/30"
        businesses={data.trusted} badgeText="Trusted" badgeColor="bg-blue-600"
        viewAllHref="/search?verified=true"
      />
      {/* Products: featured products first (with Trending Now badge), then platinum biz products */}
      <ProductCarouselSection products={data.masterProductItems ?? []} />
      {/* Popular: highest view count */}
      <SingleRowCarousel
        line1="Popular"
        icon={<Eye className="w-5 h-5 text-green-500" />}
        accentColor="bg-green-50 dark:bg-green-950/30"
        businesses={data.topViews}
        viewAllHref="/search"
      />
      {/* Explore: free tier businesses */}
      <SingleRowCarousel
        line1="Explore"
        icon={<Gift className="w-5 h-5 text-pink-500" />}
        accentColor="bg-pink-50 dark:bg-pink-950/30"
        businesses={data.freeListing}
        viewAllHref="/search"
      />
    </div>
  );
}
