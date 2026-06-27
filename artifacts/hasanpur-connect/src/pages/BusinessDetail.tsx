import { useParams, Link } from "wouter";
import { useState, useRef } from "react";
import {
  useGetBusiness, useSubmitReview,
  useSubmitEnquiry, useTrackEvent, useGetSettings
} from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { useAuth } from "@/hooks/use-auth";
import { BusinessHoursDisplay, getOpenStatus } from "@/components/business/BusinessHoursDisplay";
import {
  MapPin, Phone, Globe, MessageCircle, Star, ShieldCheck, Crown, Bookmark,
  ChevronRight, ChevronLeft, Clock, Send, Package, ThumbsUp, ChevronDown, ChevronUp,
  Share2, Navigation, Flag, Edit3, Mail, CalendarDays, Building2,
  Facebook, Instagram, Youtube, Twitter, HelpCircle
} from "lucide-react";
import { RelatedListings } from "@/components/business/RelatedListings";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function generateFAQs(business: any): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  const name = business.name;

  if (business.businessHours) {
    try {
      const hours = typeof business.businessHours === "string"
        ? JSON.parse(business.businessHours)
        : business.businessHours;
      const status = getOpenStatus(hours);
      faqs.push({
        question: `What are the opening hours of ${name}?`,
        answer: status.open ? `${name} is currently open. ${status.label}.` : `${name} is currently closed. ${status.label}.`,
      });
    } catch { /* skip */ }
  }

  if (business.address) {
    faqs.push({
      question: `Where is ${name} located?`,
      answer: `${name} is located at ${business.address}${business.landmark ? `, near ${business.landmark}` : ""}${business.pinCode ? `, Pin Code: ${business.pinCode}` : ""}, Hasanpur, Uttar Pradesh.`,
    });
  }

  if (business.phone || business.whatsapp) {
    faqs.push({
      question: `How can I contact ${name}?`,
      answer: [
        business.phone ? `Call us at ${business.phone}` : null,
        business.whatsapp ? `WhatsApp at ${business.whatsapp}` : null,
        business.email ? `Email at ${business.email}` : null,
      ].filter(Boolean).join(". ") + ".",
    });
  }

  if (business.description) {
    faqs.push({
      question: `What services does ${name} offer?`,
      answer: business.description,
    });
  }

  return faqs;
}

export default function BusinessDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { email: currentUserEmail, role: currentUserRole } = useAuth();
  const { data: business, isLoading } = useGetBusiness(slug!);
  const { data: settings } = useGetSettings();
  const submitReview = useSubmitReview();
  const submitEnquiry = useSubmitEnquiry();
  const trackEvent = useTrackEvent();

  const reviews = business?.reviews ?? [];
  const products = business?.products ?? [];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const getCoverImages = (coverImage?: string | null): string[] => {
    if (!coverImage) return [];
    if (coverImage.startsWith("[")) {
      try {
        const parsed = JSON.parse(coverImage);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    return [coverImage];
  };

  const coverImagesList = business ? getCoverImages(business.coverImage) : [];

  const [reviewForm, setReviewForm] = useState({ reviewerName: "", rating: 5, content: "" });
  const [enquiryForm, setEnquiryForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: "", description: "", reporterName: "" });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  useMetaTags({
    title: business ? `${business.name} - Hasanpur Connect` : "Business",
    description: business?.description || `View details for ${business?.name} in Hasanpur`,
  });

  useEffect(() => {
    if (business?.id) {
      trackEvent.mutate({ data: { entityId: business.id, entityType: "business", eventType: "view" } });
    }
  }, [business?.id]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReview.mutateAsync({ data: { businessId: business!.id, reviewerName: reviewForm.reviewerName, rating: reviewForm.rating, content: reviewForm.content } });
      toast({ title: "Review submitted!", description: "Your review is pending approval." });
      setReviewForm({ reviewerName: "", rating: 5, content: "" });
    } catch {
      toast({ title: "Error", description: "Could not submit review.", variant: "destructive" });
    }
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitEnquiry.mutateAsync({ data: { businessId: business!.id, ...enquiryForm } });
      toast({ title: "Enquiry sent!", description: "The business will contact you soon." });
      setEnquiryForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      toast({ title: "Error", description: "Could not send enquiry.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: business?.name || "Business", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied!", description: "Business profile link copied to clipboard." });
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied!", description: "Business profile link copied to clipboard." });
      } catch {
        toast({ title: "Could not copy link", variant: "destructive" });
      }
    }
  };

  const handleDirections = () => {
    if ((business as any)?.latitude && (business as any)?.longitude) {
      window.open(`https://maps.google.com/?q=${(business as any).latitude},${(business as any).longitude}`, "_blank");
    } else if (business?.address) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(business.address + ", Hasanpur, UP")}`, "_blank");
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id || !reportForm.reason) return;
    setReportSubmitting(true);
    try {
      await fetch(`${BASE}/api/business-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          reason: reportForm.reason,
          description: reportForm.description || undefined,
          reporterName: reportForm.reporterName || undefined,
        }),
      });
      setReportDone(true);
      setReportForm({ reason: "", description: "", reporterName: "" });
    } catch {
      toast({ title: "Failed to submit report", variant: "destructive" });
    } finally {
      setReportSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="h-64 rounded-2xl bg-muted animate-pulse mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-48 bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          <p className="text-2xl font-bold mb-2">Business not found</p>
          <Link href="/search"><Button className="mt-4">Browse Businesses</Button></Link>
        </div>
      </Layout>
    );
  }

  const biz = business as any;

  const isOwner = !!(currentUserEmail && biz.ownerEmail && currentUserEmail === biz.ownerEmail);
  const isAdmin = currentUserRole === "admin";

  if (biz.isSuspended && !isOwner && !isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
          <p className="text-xl font-semibold">This business has been suspended.</p>
          <p className="text-muted-foreground text-sm">This listing is temporarily unavailable.</p>
          <Link href="/search"><Button variant="outline">Browse Other Businesses</Button></Link>
        </div>
      </Layout>
    );
  }

  if ((biz.status === "pending" || biz.status === "rejected") && !isOwner && !isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
          <p className="text-xl font-semibold">Listing Not Available Yet</p>
          <p className="text-muted-foreground text-sm">
            {biz.status === "pending"
              ? "This business listing is currently under review and will be live once approved."
              : "This listing is not currently available."}
          </p>
          <Link href="/search"><Button variant="outline">Browse Other Businesses</Button></Link>
        </div>
      </Layout>
    );
  }

  const businessHours = typeof biz.businessHours === "object" ? biz.businessHours : null;
  const socialLinks = typeof biz.socialLinks === "object" ? biz.socialLinks : null;

  const allFaqs = [
    ...(biz.faqs || []),
    ...(biz.faqs?.length === 0 ? generateFAQs(biz) : []),
  ];
  const autoFaqs = allFaqs.length === 0 ? generateFAQs(biz) : allFaqs;
  const displayedFaqs = showAllFaqs ? autoFaqs : autoFaqs.slice(0, 3);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const openStatus = businessHours ? getOpenStatus(businessHours) : null;

  return (
    <Layout>
      {(coverImagesList.length > 0 || business.logo) && (
        <div className="w-full h-64 md:h-96 overflow-hidden bg-slate-900 relative group">
          {coverImagesList.length > 0 ? (
            <div className="w-full h-full relative">
              <img 
                src={coverImagesList[currentSlideIndex]} 
                alt={`${business.name} view ${currentSlideIndex + 1}`} 
                className="w-full h-full object-cover transition-all duration-300"
              />
              {coverImagesList.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentSlideIndex(p => (p === 0 ? coverImagesList.length - 1 : p - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-black/70 active:scale-95 z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setCurrentSlideIndex(p => (p === coverImagesList.length - 1 ? 0 : p + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-black/70 active:scale-95 z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 px-3 py-1.5 rounded-full">
                    {coverImagesList.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentSlideIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <img src={business.logo!} alt={business.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/search" className="hover:text-primary">Businesses</Link>
          <ChevronRight className="w-4 h-4" />
          {business.categoryName && (
            <>
              <Link href={`/category/${business.categoryId}`} className="hover:text-primary">{business.categoryName}</Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-foreground font-medium truncate">{business.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <div>
              <div className="flex flex-wrap items-start gap-2 mb-3">
                {biz.isFeatured && (
                  <Badge className="bg-purple-600 text-white border-none">
                    <Bookmark className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}
                {business.isPremium && (
                  <Badge className="bg-amber-500 text-white border-none">
                    <Crown className="w-3 h-3 mr-1" /> Premium
                  </Badge>
                )}
                {business.isVerified && (
                  <Badge className="bg-blue-500 text-white border-none">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
                {openStatus && (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    openStatus.open
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {openStatus.open ? "🟢 Open Now" : "🔴 Closed Now"}
                  </span>
                )}
                {business.categoryName && <Badge variant="outline">{business.categoryName}</Badge>}
              </div>

              <h1 className="text-3xl font-bold mb-2">{business.name}</h1>

              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mb-4">
                {business.averageRating != null && (
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Star className="w-4 h-4 fill-current" />
                    {business.averageRating.toFixed(1)}
                    <span className="text-muted-foreground font-normal">({business.reviewCount} reviews)</span>
                  </span>
                )}
                {business.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {business.address}
                    {biz.pinCode && <span className="text-xs">— {biz.pinCode}</span>}
                  </span>
                )}
                {biz.establishmentYear && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" /> Est. {biz.establishmentYear}
                  </span>
                )}
              </div>

              {/* Action buttons row */}
              <div className="flex flex-wrap gap-2">
                {business.phone && (
                  <a href={`tel:${business.phone}`} onClick={() => trackEvent.mutate({ data: { entityId: business.id, entityType: "business", eventType: "call_click" } })}>
                    <Button size="sm" className="gap-1.5"><Phone className="w-3.5 h-3.5" /> Call</Button>
                  </a>
                )}
                {business.whatsapp && business.isPremium && (
                  <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent.mutate({ data: { entityId: business.id, entityType: "business", eventType: "whatsapp_click" } })}>
                    <Button size="sm" className="bg-[#25D366] hover:bg-[#20BD5A] text-white gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</Button>
                  </a>
                )}
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleDirections}>
                  <Navigation className="w-3.5 h-3.5" /> Directions
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleShare}>
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent.mutate({ data: { entityId: business.id, entityType: "business", eventType: "website_click" } })}>
                    <Button size="sm" variant="outline" className="gap-1.5"><Globe className="w-3.5 h-3.5" /> Website</Button>
                  </a>
                )}
              </div>
            </div>

            {/* About */}
            {business.description && (
              <Card>
                <CardHeader><CardTitle>About</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{business.description}</p>
                  {biz.services && biz.services.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {biz.services.map((s: string, i: number) => (
                        <Badge key={i} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Business Hours */}
            {businessHours && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Business Hours</CardTitle></CardHeader>
                <CardContent>
                  <BusinessHoursDisplay hours={businessHours} />
                </CardContent>
              </Card>
            )}

            {/* Products */}
            {products && products.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> Products & Services</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((p: any) => (
                      <div key={p.id} className="border rounded-lg p-4 hover:border-primary/40 transition-colors">
                        {p.image && <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded-md mb-3" />}
                        <h3 className="font-semibold">{p.name}</h3>
                        {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                        {p.price && <p className="mt-2 font-bold text-primary">₹{p.price}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQs */}
            {(settings as any)?.faqGeneratorEnabled !== false && autoFaqs.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Frequently Asked Questions</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {displayedFaqs.map((faq: any, i: number) => (
                    <div key={i} className="border-b pb-3 last:border-0">
                      <p className="font-medium text-sm mb-1">Q: {faq.question}</p>
                      <p className="text-sm text-muted-foreground">A: {faq.answer}</p>
                    </div>
                  ))}
                  {autoFaqs.length > 3 && (
                    <Button variant="ghost" size="sm" onClick={() => setShowAllFaqs(!showAllFaqs)} className="w-full">
                      {showAllFaqs ? <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</> : <><ChevronDown className="w-4 h-4 mr-2" /> Show All {autoFaqs.length} FAQs</>}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" /> Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {displayedReviews.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
                ) : (
                  displayedReviews.map((r: any) => (
                    <div key={r.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{r.reviewerName}</span>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.content}</p>
                    </div>
                  ))
                )}
                {reviews.length > 3 && (
                  <Button variant="ghost" size="sm" onClick={() => setShowAllReviews(!showAllReviews)} className="w-full">
                    {showAllReviews ? <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</> : <><ChevronDown className="w-4 h-4 mr-2" /> All {reviews.length} Reviews</>}
                  </Button>
                )}
                <Separator />
                <div>
                  <h3 className="font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={handleReview} className="space-y-4">
                    <div>
                      <Label>Your Name</Label>
                      <Input className="mt-1" value={reviewForm.reviewerName} onChange={e => setReviewForm(p => ({ ...p, reviewerName: e.target.value }))} required placeholder="Enter your name" />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: n }))}>
                            <Star className={`w-6 h-6 ${n <= reviewForm.rating ? "text-amber-500 fill-current" : "text-muted-foreground"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Your Review</Label>
                      <Textarea className="mt-1" value={reviewForm.content} onChange={e => setReviewForm(p => ({ ...p, content: e.target.value }))} required placeholder="Share your experience..." rows={3} />
                    </div>
                    <Button type="submit" disabled={submitReview.isPending}>
                      {submitReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Report / Suggest edit */}
            <div className="flex gap-3 text-sm text-muted-foreground">
              <button onClick={() => { setReportOpen(true); setReportDone(false); }} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Flag className="w-4 h-4" /> Report Business
              </button>
              <button className="flex items-center gap-1.5 hover:text-foreground transition-colors" onClick={() => toast({ title: "Suggestion received", description: "Thank you! Our team will review it." })}>
                <Edit3 className="w-4 h-4" /> Suggest Edit
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-3">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="block" onClick={() => trackEvent.mutate({ data: { entityId: business.id, entityType: "business", eventType: "call_click" } })}>
                    <Button className="w-full" size="lg"><Phone className="mr-2 w-4 h-4" /> Call Now</Button>
                  </a>
                )}
                {biz.alternatePhone && (
                  <a href={`tel:${biz.alternatePhone}`} className="block">
                    <Button variant="outline" className="w-full"><Phone className="mr-2 w-4 h-4" /> Alt. Number</Button>
                  </a>
                )}
                {business.whatsapp && business.isPremium && (
                  <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent.mutate({ data: { entityId: business.id, entityType: "business", eventType: "whatsapp_click" } })}>
                    <Button className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white" size="lg">
                      <MessageCircle className="mr-2 w-4 h-4" /> WhatsApp
                    </Button>
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent.mutate({ data: { entityId: business.id, entityType: "business", eventType: "website_click" } })}>
                    <Button variant="outline" className="w-full"><Globe className="mr-2 w-4 h-4" /> Visit Website</Button>
                  </a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`}>
                    <Button variant="ghost" className="w-full"><Mail className="mr-2 w-4 h-4" /> Email</Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            {(business.address || biz.landmark || biz.pinCode) && (
              <Card>
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold">Location</h3>
                  {business.address && (
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                      {business.address}
                    </p>
                  )}
                  {biz.landmark && <p className="text-sm text-muted-foreground ml-6">Near: {biz.landmark}</p>}
                  {biz.pinCode && <p className="text-sm text-muted-foreground ml-6">Pin Code: {biz.pinCode}</p>}
                  <Button variant="outline" size="sm" className="w-full mt-2 gap-1.5" onClick={handleDirections}>
                    <Navigation className="w-3.5 h-3.5" /> Get Directions
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Business Info */}
            {(biz.establishmentYear || biz.ownerName || biz.email) && (
              <Card>
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold">Details</h3>
                  {biz.establishmentYear && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4 text-primary" />
                      Established: {biz.establishmentYear}
                    </div>
                  )}
                  {biz.ownerName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Owner: {biz.ownerName}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {socialLinks && Object.keys(socialLinks).length > 0 && (
              <Card>
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold mb-3">Follow Us</h3>
                  <div className="flex gap-2 flex-wrap">
                    {socialLinks.facebook && (
                      <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="outline" className="w-9 h-9"><Facebook className="w-4 h-4 text-blue-600" /></Button>
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="outline" className="w-9 h-9"><Instagram className="w-4 h-4 text-pink-600" /></Button>
                      </a>
                    )}
                    {socialLinks.youtube && (
                      <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="outline" className="w-9 h-9"><Youtube className="w-4 h-4 text-red-600" /></Button>
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="outline" className="w-9 h-9"><Twitter className="w-4 h-4" /></Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enquiry — moved to sidebar (Req #10) */}
            <Card>
              <CardHeader><CardTitle className="text-base">Send Enquiry</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleEnquiry} className="space-y-3">
                  <Input value={enquiryForm.name} onChange={e => setEnquiryForm(p => ({ ...p, name: e.target.value }))} required placeholder="Your Name" />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">+91</span>
                    <Input
                      className="pl-10"
                      value={enquiryForm.phone}
                      onChange={e => setEnquiryForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                      required
                      placeholder="9876543210"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      title="Enter 10-digit mobile number"
                    />
                  </div>
                  <Input value={enquiryForm.email} onChange={e => setEnquiryForm(p => ({ ...p, email: e.target.value }))} placeholder="yourmail@gmail.com" type="email" />
                  <Textarea value={enquiryForm.message} onChange={e => setEnquiryForm(p => ({ ...p, message: e.target.value }))} placeholder="Your message..." rows={3} />
                  <Button type="submit" className="w-full" disabled={submitEnquiry.isPending}>
                    <Send className="mr-2 w-4 h-4" />
                    {submitEnquiry.isPending ? "Sending..." : "Send Enquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {business && (
        <div className="container mx-auto px-4 pb-10 max-w-5xl">
          <RelatedListings categoryId={business.categoryId} excludeId={business.id} categoryName={business.categoryName ?? undefined} />
        </div>
      )}

      {/* Report Business Modal */}
      <Dialog open={reportOpen} onOpenChange={v => { setReportOpen(v); if (!v) setReportDone(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Flag className="w-4 h-4 text-red-500" />Report This Listing</DialogTitle>
          </DialogHeader>
          {reportDone ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Flag className="w-5 h-5 text-green-600" />
              </div>
              <p className="font-semibold">Report Submitted</p>
              <p className="text-sm text-muted-foreground mt-1">Thank you. Our team will review this listing.</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => setReportOpen(false)}>Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <Label className="text-sm">What is wrong? *</Label>
                <Select value={reportForm.reason} onValueChange={v => setReportForm(p => ({ ...p, reason: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wrong_info">Wrong information</SelectItem>
                    <SelectItem value="closed">Business closed / permanently shut</SelectItem>
                    <SelectItem value="spam">Spam or fake listing</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                    <SelectItem value="duplicate">Duplicate listing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Description (optional)</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={reportForm.description}
                  onChange={e => setReportForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Tell us more about the issue..."
                />
              </div>
              <div>
                <Label className="text-sm">Your Name (optional)</Label>
                <Input
                  className="mt-1"
                  value={reportForm.reporterName}
                  onChange={e => setReportForm(p => ({ ...p, reporterName: e.target.value }))}
                  placeholder="Anonymous"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!reportForm.reason || reportSubmitting}>
                  {reportSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
