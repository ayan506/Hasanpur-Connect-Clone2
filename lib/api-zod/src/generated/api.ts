import { z } from "zod";

export const HealthCheckResponse = z.object({ status: z.string() });

export const CreateBusinessBody = z.object({
  name: z.string(),
  categoryId: z.number(),
  description: z.string().optional(),
  address: z.string().optional(),
  landmark: z.string().optional(),
  pinCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().optional(),
  ownerPhone: z.string().optional(),
  establishmentYear: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  businessHours: z.any().optional(),
  socialLinks: z.any().optional(),
  faqs: z.any().optional(),
  images: z.array(z.string()).optional(),
});

export const UpdateBusinessBody = z.object({
  name: z.string().optional(),
  categoryId: z.number().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  landmark: z.string().optional(),
  pinCode: z.string().optional(),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().optional(),
  ownerPhone: z.string().optional(),
  establishmentYear: z.string().optional(),
  gstNumber: z.string().optional(),
  isPremium: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  businessHours: z.any().optional(),
  socialLinks: z.any().optional(),
  faqs: z.any().optional(),
  images: z.array(z.string()).optional(),
});

export const UpdateBusinessParams = z.object({ id: z.coerce.number() });
export const UpdateBusinessStatusBody = z.object({
  status: z.enum(["approved", "pending", "rejected", "suspended"]),
  isPremium: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});
export const UpdateBusinessStatusParams = z.object({ id: z.coerce.number() });
export const DeleteBusinessParams = z.object({ id: z.coerce.number() });
export const GetBusinessParams = z.object({ slug: z.string() });

export const ListBusinessesQueryParams = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  premium: z.string().optional(),
  verified: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  ownerEmail: z.string().optional(),
});

export const CreateCategoryBody = z.object({
  name: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const UpdateCategoryBody = z.object({
  name: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const UpdateCategoryParams = z.object({ id: z.coerce.number() });
export const DeleteCategoryParams = z.object({ id: z.coerce.number() });

export const SubmitReviewBody = z.object({
  businessId: z.number(),
  reviewerName: z.string(),
  reviewerEmail: z.string().optional(),
  rating: z.number().min(1).max(5),
  content: z.string().optional(),
});

export const UpdateReviewStatusBody = z.object({ status: z.enum(["approved", "pending", "rejected"]) });
export const UpdateReviewStatusParams = z.object({ id: z.coerce.number() });
export const DeleteReviewParams = z.object({ id: z.coerce.number() });

export const ListReviewsQueryParams = z.object({
  businessId: z.coerce.number().optional(),
  status: z.string().optional(),
});

export const SubmitEnquiryBody = z.object({
  businessId: z.number(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export const ListEnquiriesQueryParams = z.object({
  businessId: z.coerce.number().optional(),
});

export const SubmitWebDevEnquiryBody = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  message: z.string().optional(),
  businessType: z.string().optional(),
  budget: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateBlogPostBody = z.object({
  title: z.string(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  authorName: z.string().optional(),
});

export const UpdateBlogPostBody = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  authorName: z.string().optional(),
});

export const UpdateBlogPostParams = z.object({ id: z.coerce.number() });
export const DeleteBlogPostParams = z.object({ id: z.coerce.number() });
export const GetBlogPostParams = z.object({ slug: z.string() });

export const ListBlogPostsQueryParams = z.object({
  status: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export const TrackEventBody = z.object({
  eventType: z.string(),
  entityId: z.number().optional(),
  entityType: z.string().optional(),
  metadata: z.any().optional(),
});

export const GetBusinessAnalyticsParams = z.object({ id: z.coerce.number() });

export const UpdateSettingsBody = z.object({
  siteName: z.string().optional(),
  siteTagline: z.string().optional(),
  contactPhone: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  contactEmail: z.string().optional(),
  address: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  googleAdsenseId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  footerText: z.string().optional(),
  developerCreditEnabled: z.boolean().optional(),
  developerName: z.string().optional(),
  developerUrl: z.string().optional(),
  developerLinkNewTab: z.boolean().optional(),
  developerLinkNofollow: z.boolean().optional(),
  marqueeText: z.string().optional(),
  marqueeEnabled: z.boolean().optional(),
  marqueeSpeed: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  announcementText: z.string().optional(),
  announcementEnabled: z.boolean().optional(),
  announcementType: z.string().optional(),
  announcementBgColor: z.string().optional(),
  announcementTextColor: z.string().optional(),
  announcementLink: z.string().optional(),
  announcementImage: z.string().optional(),
  announcementPosition: z.string().optional(),
  announcementStartDate: z.string().optional(),
  announcementEndDate: z.string().optional(),
  seoOgImage: z.string().optional(),
  seoKeywords: z.string().optional(),
  seoGoogleSearchConsole: z.string().optional(),
  seoRobotsNoIndex: z.boolean().optional(),
  faviconUrl: z.string().optional(),
  otpVerificationEnabled: z.boolean().optional(),
  masterBackupOtp: z.string().optional(),
}).passthrough();

export const VerifyOtpBody = z.object({
  pendingId: z.string(),
  otp: z.string(),
});

export const CreateProductBody = z.object({
  businessId: z.number(),
  name: z.string(),
  description: z.string().optional(),
  price: z.string().optional(),
  imageUrl: z.string().optional(),
  imagesJson: z.string().optional(),
  knowMoreUrl: z.string().optional(),
  status: z.string().optional(),
});

export const UpdateProductBody = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  imageUrl: z.string().optional(),
  imagesJson: z.string().optional(),
  knowMoreUrl: z.string().optional(),
  status: z.string().optional(),
});

export const UpdateProductParams = z.object({ id: z.coerce.number() });
export const DeleteProductParams = z.object({ id: z.coerce.number() });

export const ListProductsQueryParams = z.object({
  businessId: z.coerce.number().optional(),
});

export const UpdateUserRoleBody = z.object({ role: z.string() });
export const UpdateUserRoleParams = z.object({ id: z.string() });

export const RegisterUserBody = z.object({
  email: z.string(),
  name: z.string().optional(),
  role: z.string().optional(),
});

export const SearchQueryParams = z.object({
  q: z.string().optional().default(""),
  category: z.string().optional(),
});
