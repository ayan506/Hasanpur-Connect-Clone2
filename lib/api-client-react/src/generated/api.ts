import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseMutationOptions,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { customFetch } from "../custom-fetch";
import type { ErrorType } from "../custom-fetch";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HealthStatus { status: string; }

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  isFeatured: boolean;
  sortOrder: number;
  businessCount?: number;
  createdAt?: string | null;
}

export interface Business {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  categoryName?: string | null;
  description?: string | null;
  address?: string | null;
  landmark?: string | null;
  pinCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  alternatePhone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  status: string;
  isPremium: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  isSuspended: boolean;
  establishmentYear?: string | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  ownerId?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  businessHours?: unknown;
  socialLinks?: unknown;
  faqs?: unknown;
  images?: string[];
  viewCount: number;
  averageRating?: number | null;
  reviewCount?: number;
  createdAt?: string | null;
  approvedAt?: string | null;
}

export interface Review {
  id: number;
  businessId: number;
  businessName?: string | null;
  reviewerName: string;
  reviewerEmail?: string | null;
  rating: number;
  content?: string | null;
  status: string;
  createdAt?: string | null;
}

export interface Enquiry {
  id: number;
  businessId: number;
  businessName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  createdAt?: string | null;
}

export interface Product {
  id: number;
  businessId: number;
  name: string;
  description?: string | null;
  price?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  excerpt?: string | null;
  featuredImage?: string | null;
  category?: string | null;
  tags?: string[];
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  authorName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  googleAnalyticsId: string;
  googleAdsenseId: string;
  metaTitle: string;
  metaDescription: string;
  footerText: string;
  developerCreditEnabled: boolean;
  developerName: string;
  developerUrl: string;
  developerLinkNewTab: boolean;
  developerLinkNofollow: boolean;
  marqueeText: string;
  marqueeEnabled: boolean;
  marqueeSpeed: string;
  maintenanceMode: boolean;
  announcementText: string;
  announcementEnabled: boolean;
  announcementType: string;
  announcementBgColor: string;
  announcementTextColor: string;
  announcementLink: string;
  announcementImage: string;
  announcementPosition: string;
  announcementStartDate: string;
  announcementEndDate: string;
  seoOgImage: string;
  seoKeywords: string;
  seoGoogleSearchConsole: string;
  seoRobotsNoIndex: boolean;
  faviconUrl: string;
  whatsappNumber?: string | null;
}

export interface AnalyticsSummary {
  totalBusinesses: number;
  premiumBusinesses: number;
  verifiedBusinesses: number;
  pendingBusinesses: number;
  totalReviews: number;
  totalEnquiries: number;
  totalProducts: number;
  totalBlogPosts: number;
  topCategories: { categoryId: number; categoryName: string; count: number }[];
  mostViewed: Business[];
  recentEvents: AnalyticsEvent[];
  dailyVisits: { date: string; count: number }[];
  totalUsers?: number;
}

export interface AnalyticsEvent {
  id: number;
  eventType: string;
  entityId?: number | null;
  entityType?: string | null;
  metadataJson?: string | null;
  createdAt?: string | null;
}

export interface BusinessAnalytics {
  viewCount: number;
  enquiryCount: number;
  reviewCount: number;
  profileViews: number;
  callClicks: number;
  whatsappClicks: number;
  websiteClicks: number;
  recentEvents: AnalyticsEvent[];
}

export interface Popup {
  id: number;
  title: string;
  description?: string | null;
  type: string;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  bgColor?: string | null;
  isEnabled: boolean;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  createdAt: string;
}

export interface CommunityPartner {
  id: number;
  name: string;
  about?: string | null;
  photoUrl?: string | null;
  badge?: string | null;
  socialLinksJson?: string | null;
  totalReferrals: number;
  totalVisitorsSent: number;
  joinedSince?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string | null;
}

export interface GovernmentContact {
  id: number;
  name: string;
  designation: string;
  phone: string;
  sortOrder: number;
  createdAt?: string | null;
}

export interface CarouselSlide {
  id: number;
  imageUrl: string;
  title?: string | null;
  subtitle?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string | null;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  isSuspended: boolean;
  isDeleted: boolean;
  createdAt?: string | null;
}

export interface WebDevEnquiry {
  id: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  businessType?: string | null;
  budget?: string | null;
  notes?: string | null;
  createdAt?: string | null;
}

export interface Lead {
  id: number;
  serviceRequest: string;
  categoryId?: number | null;
  categoryName?: string | null;
  customerName: string;
  customerPhone: string;
  createdAt?: string | null;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthCheck = () => customFetch<HealthStatus>("/api/healthz", { method: "GET" });
export const getHealthCheckQueryKey = () => ["/api/healthz"] as const;
export const useHealthCheck = () =>
  useQuery({ queryKey: getHealthCheckQueryKey(), queryFn: () => healthCheck() });

// ─── Categories ───────────────────────────────────────────────────────────────

export const listCategories = () => customFetch<Category[]>("/api/categories", { method: "GET" });
export const getListCategoriesQueryKey = () => ["/api/categories"] as const;

export const useListCategories = (
  options?: Partial<UseQueryOptions<Category[], ErrorType<unknown>>>
): UseQueryResult<Category[], ErrorType<unknown>> =>
  useQuery({ queryKey: getListCategoriesQueryKey(), queryFn: listCategories, ...options });

export const useCreateCategory = (
  options?: UseMutationOptions<Category, ErrorType<unknown>, { data: Record<string, unknown> }>
): UseMutationResult<Category, ErrorType<unknown>, { data: Record<string, unknown> }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => customFetch<Category>("/api/categories", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }),
    ...options,
  });
};

export const useUpdateCategory = (
  options?: UseMutationOptions<Category, ErrorType<unknown>, { id: number; data: Record<string, unknown> }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customFetch<Category>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }),
    ...options,
  });
};

export const useDeleteCategory = (
  options?: UseMutationOptions<void, ErrorType<unknown>, { id: number }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => customFetch<void>(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }),
    ...options,
  });
};

// ─── Businesses ───────────────────────────────────────────────────────────────

export interface ListBusinessesParams {
  category?: string;
  status?: string;
  premium?: string;
  verified?: string;
  q?: string;
  page?: number;
  limit?: number;
  ownerEmail?: string;
}

export const listBusinesses = (params?: ListBusinessesParams) => {
  const qs = params ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))) : "";
  return customFetch<{ businesses: Business[]; total: number; page: number; limit: number }>(`/api/businesses${qs}`, { method: "GET" });
};

export const getListBusinessesQueryKey = (params?: ListBusinessesParams) => ["/api/businesses", params] as const;

export const useListBusinesses = (
  params?: ListBusinessesParams,
  options?: Partial<UseQueryOptions<{ businesses: Business[]; total: number; page: number; limit: number }, ErrorType<unknown>>>
) =>
  useQuery({ queryKey: getListBusinessesQueryKey(params), queryFn: () => listBusinesses(params), ...options });

export const useGetBusiness = (
  slug: string,
  options?: Partial<UseQueryOptions<Business & { reviews: Review[]; averageRating: number | null; reviewCount: number; products?: Product[] }, ErrorType<unknown>>>
) =>
  useQuery({
    queryKey: ["/api/businesses", slug],
    queryFn: () => customFetch<Business & { reviews: Review[]; averageRating: number | null; reviewCount: number; products?: Product[] }>(`/api/businesses/${slug}`, { method: "GET" }),
    enabled: !!slug,
    ...options,
  });

export const useCreateBusiness = (
  options?: UseMutationOptions<Business, ErrorType<unknown>, { data: Record<string, unknown> }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => customFetch<Business>("/api/businesses", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/businesses"] }),
    ...options,
  });
};

export const useUpdateBusiness = (
  options?: UseMutationOptions<Business, ErrorType<unknown>, { id: number; body: Record<string, unknown> }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => customFetch<Business>(`/api/businesses/${id}`, { method: "PUT", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/businesses"] }),
    ...options,
  });
};

export const useUpdateBusinessStatus = (
  options?: UseMutationOptions<Business, ErrorType<unknown>, { id: number; data: Record<string, unknown> }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customFetch<Business>(`/api/businesses/${id}/status`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/businesses"] }),
    ...options,
  });
};

export const useDeleteBusiness = (
  options?: UseMutationOptions<void, ErrorType<unknown>, { id: number }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => customFetch<void>(`/api/businesses/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/businesses"] }),
    ...options,
  });
};

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const getListReviewsQueryKey = (params?: { businessId?: number; status?: string }) => ["/api/reviews", params] as const;

export const useListReviews = (
  params?: { businessId?: number; status?: string },
  options?: Partial<UseQueryOptions<Review[], ErrorType<unknown>>>
) => {
  const qs = params ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))) : "";
  return useQuery({ queryKey: getListReviewsQueryKey(params), queryFn: () => customFetch<Review[]>(`/api/reviews${qs}`, { method: "GET" }), ...options });
};

export const useSubmitReview = (
  options?: UseMutationOptions<Review, ErrorType<unknown>, { data: Record<string, unknown> }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => customFetch<Review>("/api/reviews", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/reviews"] }),
    ...options,
  });
};

export const useUpdateReviewStatus = (
  options?: UseMutationOptions<Review, ErrorType<unknown>, { id: number; data: Record<string, unknown> }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customFetch<Review>(`/api/reviews/${id}/status`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/reviews"] }),
    ...options,
  });
};

export const useDeleteReview = (
  options?: UseMutationOptions<void, ErrorType<unknown>, { id: number }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => customFetch<void>(`/api/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/reviews"] }),
    ...options,
  });
};

// ─── Enquiries ────────────────────────────────────────────────────────────────

export const getListEnquiriesQueryKey = (params?: { businessId?: number }) => ["/api/enquiries", params] as const;

export const useListEnquiries = (
  params?: { businessId?: number },
  options?: Partial<UseQueryOptions<Enquiry[], ErrorType<unknown>>>
) => {
  const qs = params?.businessId ? `?businessId=${params.businessId}` : "";
  return useQuery({ queryKey: getListEnquiriesQueryKey(params), queryFn: () => customFetch<Enquiry[]>(`/api/enquiries${qs}`, { method: "GET" }), ...options });
};

export const useSubmitEnquiry = (
  options?: UseMutationOptions<Enquiry, ErrorType<unknown>, { data: Record<string, unknown> }>
) =>
  useMutation({
    mutationFn: ({ data }) => customFetch<Enquiry>("/api/enquiries", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    ...options,
  });

// ─── Products ─────────────────────────────────────────────────────────────────

export const getListProductsQueryKey = (params?: { businessId?: number }) => ["/api/products", params] as const;

export const useListProducts = (
  params?: { businessId?: number },
  options?: Partial<UseQueryOptions<Product[], ErrorType<unknown>>>
) => {
  const qs = params?.businessId ? `?businessId=${params.businessId}` : "";
  return useQuery({ queryKey: getListProductsQueryKey(params), queryFn: () => customFetch<Product[]>(`/api/products${qs}`, { method: "GET" }), ...options });
};

export const useCreateProduct = (
  options?: UseMutationOptions<Product, ErrorType<unknown>, Record<string, unknown>>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => customFetch<Product>("/api/products", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/products"] }),
    ...options,
  });
};

export const useUpdateProduct = (
  options?: UseMutationOptions<Product, ErrorType<unknown>, { id: number; body: Record<string, unknown> }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => customFetch<Product>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/products"] }),
    ...options,
  });
};

export const useDeleteProduct = (
  options?: UseMutationOptions<void, ErrorType<unknown>, { id: number }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => customFetch<void>(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/products"] }),
    ...options,
  });
};

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const getListBlogPostsQueryKey = (params?: { status?: string; page?: number; limit?: number }) => ["/api/blog", params] as const;

export const useListBlogPosts = (
  params?: { status?: string; page?: number; limit?: number },
  options?: Partial<UseQueryOptions<{ posts: BlogPost[]; total: number; page: number; limit: number }, ErrorType<unknown>>>
) => {
  const qs = params ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))) : "";
  return useQuery({ queryKey: getListBlogPostsQueryKey(params), queryFn: () => customFetch<{ posts: BlogPost[]; total: number; page: number; limit: number }>(`/api/blog${qs}`, { method: "GET" }), ...options });
};

export const useGetBlogPost = (slug: string, options?: Partial<UseQueryOptions<BlogPost, ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/blog", slug], queryFn: () => customFetch<BlogPost>(`/api/blog/${slug}`, { method: "GET" }), enabled: !!slug, ...options });

export const useCreateBlogPost = (options?: UseMutationOptions<BlogPost, ErrorType<unknown>, { data: Record<string, unknown> }>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => customFetch<BlogPost>("/api/blog", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/blog"] }),
    ...options,
  });
};

export const useUpdateBlogPost = (options?: UseMutationOptions<BlogPost, ErrorType<unknown>, { id: number; data: Record<string, unknown> }>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customFetch<BlogPost>(`/api/blog/${id}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/blog"] }),
    ...options,
  });
};

export const useDeleteBlogPost = (options?: UseMutationOptions<void, ErrorType<unknown>, { id: number }>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => customFetch<void>(`/api/blog/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/blog"] }),
    ...options,
  });
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const useGetAnalyticsSummary = (options?: Partial<UseQueryOptions<AnalyticsSummary, ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/analytics/summary"], queryFn: () => customFetch<AnalyticsSummary>("/api/analytics/summary", { method: "GET" }), ...options });

export const useGetBusinessAnalytics = (id: number | null | undefined, options?: Partial<UseQueryOptions<BusinessAnalytics, ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/businesses", id, "analytics"], queryFn: () => customFetch<BusinessAnalytics>(`/api/businesses/${id}/analytics`, { method: "GET" }), enabled: !!id, ...options });

export const useTrackEvent = (options?: UseMutationOptions<{ ok: boolean }, ErrorType<unknown>, { data: { eventType: string; entityId?: number; entityType?: string; metadata?: unknown } }>) =>
  useMutation({
    mutationFn: ({ data }) => customFetch<{ ok: boolean }>("/api/analytics/track", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    ...options,
  });

// ─── Settings ─────────────────────────────────────────────────────────────────

export const useGetSettings = (options?: Partial<UseQueryOptions<SiteSettings, ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/settings"], queryFn: () => customFetch<SiteSettings>("/api/settings", { method: "GET" }), ...options });

export const useUpdateSettings = (options?: UseMutationOptions<SiteSettings, ErrorType<unknown>, { data: Partial<SiteSettings> }>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => customFetch<SiteSettings>("/api/settings", { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/settings"] }),
    ...options,
  });
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const useListUsers = (options?: Partial<UseQueryOptions<User[], ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/users"], queryFn: () => customFetch<User[]>("/api/users", { method: "GET" }), ...options });

export const useUpdateUserRole = (options?: UseMutationOptions<User, ErrorType<unknown>, { id: string; data: { role: string } }>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customFetch<User>(`/api/users/${id}/role`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/users"] }),
    ...options,
  });
};

// ─── Popups ───────────────────────────────────────────────────────────────────

export const useListPopups = (options?: Partial<UseQueryOptions<Popup[], ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/popups"], queryFn: () => customFetch<Popup[]>("/api/popups", { method: "GET" }), ...options });

export const useListAllPopups = (options?: Partial<UseQueryOptions<Popup[], ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/popups/all"], queryFn: () => customFetch<Popup[]>("/api/popups/all", { method: "GET" }), ...options });

export const useCreatePopup = (options?: UseMutationOptions<Popup, ErrorType<unknown>, { data: Record<string, unknown> }>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => customFetch<Popup>("/api/popups", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/popups"] }),
    ...options,
  });
};

export const useUpdatePopup = (options?: UseMutationOptions<Popup, ErrorType<unknown>, { id: number; data: Record<string, unknown> }>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customFetch<Popup>(`/api/popups/${id}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/popups"] }),
    ...options,
  });
};

export const useDeletePopup = (options?: UseMutationOptions<void, ErrorType<unknown>, { id: number }>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => customFetch<void>(`/api/popups/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/popups"] }),
    ...options,
  });
};

// ─── Community Partners ───────────────────────────────────────────────────────

export const useListCommunityPartners = (options?: Partial<UseQueryOptions<CommunityPartner[], ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/community-partners"], queryFn: () => customFetch<CommunityPartner[]>("/api/community-partners", { method: "GET" }), ...options });

// ─── Government Contacts ──────────────────────────────────────────────────────

export const useListGovernmentContacts = (options?: Partial<UseQueryOptions<GovernmentContact[], ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/government-contacts"], queryFn: () => customFetch<GovernmentContact[]>("/api/government-contacts", { method: "GET" }), ...options });

// ─── Carousel ─────────────────────────────────────────────────────────────────

export const useListCarouselSlides = (options?: Partial<UseQueryOptions<CarouselSlide[], ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/carousel"], queryFn: () => customFetch<CarouselSlide[]>("/api/carousel", { method: "GET" }), ...options });

// ─── Search ───────────────────────────────────────────────────────────────────

export const useSearch = (
  params: { q: string; category?: string } | null,
  options?: Partial<UseQueryOptions<{ businesses: Business[]; total: number; query: string }, ErrorType<unknown>>>
) => {
  const qs = params ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))) : "";
  return useQuery({
    queryKey: ["/api/search", params],
    queryFn: () => customFetch<{ businesses: Business[]; total: number; query: string }>(`/api/search${qs}`, { method: "GET" }),
    enabled: !!params?.q,
    ...options,
  });
};

// ─── Web Dev Enquiries ────────────────────────────────────────────────────────

export const useListWebDevEnquiries = (options?: Partial<UseQueryOptions<WebDevEnquiry[], ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/webdev"], queryFn: () => customFetch<WebDevEnquiry[]>("/api/webdev", { method: "GET" }), ...options });

export const useSubmitWebDevEnquiry = (options?: UseMutationOptions<WebDevEnquiry, ErrorType<unknown>, Record<string, unknown>>) =>
  useMutation({
    mutationFn: (body) => customFetch<WebDevEnquiry>("/api/webdev", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    ...options,
  });

// ─── Leads ────────────────────────────────────────────────────────────────────

export const useListLeads = (options?: Partial<UseQueryOptions<Lead[], ErrorType<unknown>>>) =>
  useQuery({ queryKey: ["/api/leads"], queryFn: () => customFetch<Lead[]>("/api/leads", { method: "GET" }), ...options });

export const useSubmitLead = (options?: UseMutationOptions<Lead, ErrorType<unknown>, Record<string, unknown>>) =>
  useMutation({
    mutationFn: (body) => customFetch<Lead>("/api/leads", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    ...options,
  });

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const useRegisterOwner = (options?: UseMutationOptions<{ id: string; email: string; name?: string | null; role: string }, ErrorType<unknown>, { email: string; password: string; name?: string }>) =>
  useMutation({
    mutationFn: (body) => customFetch<{ id: string; email: string; name?: string | null; role: string }>("/api/admin/register-owner", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    ...options,
  });

export const useLoginOwner = (options?: UseMutationOptions<{ id: string; email: string; name?: string | null; role: string }, ErrorType<unknown>, { email: string; password: string }>) =>
  useMutation({
    mutationFn: (body) => customFetch<{ id: string; email: string; name?: string | null; role: string }>("/api/admin/login-owner", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    ...options,
  });

export const useForgotPassword = (options?: UseMutationOptions<{ ok: boolean }, ErrorType<unknown>, { email: string }>) =>
  useMutation({
    mutationFn: (body) => customFetch<{ ok: boolean }>("/api/admin/forgot-password", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    ...options,
  });

export const useResetPassword = (options?: UseMutationOptions<{ ok: boolean }, ErrorType<unknown>, { email: string; token: string; password: string }>) =>
  useMutation({
    mutationFn: (body) => customFetch<{ ok: boolean }>("/api/admin/reset-password", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    ...options,
  });

export const getFeaturedBusinessesQueryKey = () => ["/api/businesses/featured"] as const;
export const useGetFeaturedBusinesses = (options?: Partial<UseQueryOptions<{ premium: Business[]; featured: Business[] }, ErrorType<unknown>>>) =>
  useQuery({
    queryKey: getFeaturedBusinessesQueryKey(),
    queryFn: () => customFetch<{ premium: Business[]; featured: Business[] }>("/api/businesses/featured", { method: "GET" }),
    ...options,
  });

export const useListActivePopups = useListPopups;
