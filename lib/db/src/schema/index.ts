import { pgTable, serial, text, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  description: text("description"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businessesTable = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  categoryId: integer("category_id").notNull(),
  description: text("description"),
  address: text("address"),
  landmark: text("landmark"),
  pinCode: text("pin_code"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  phone: text("phone"),
  alternatePhone: text("alternate_phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  website: text("website"),
  logo: text("logo"),
  coverImage: text("cover_image"),
  status: text("status").default("pending").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  establishmentYear: text("establishment_year"),
  ownerName: text("owner_name"),
  ownerEmail: text("owner_email"),
  ownerPhone: text("owner_phone"),
  ownerId: text("owner_id"),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  businessHoursJson: text("business_hours_json"),
  socialLinksJson: text("social_links_json"),
  faqsJson: text("faqs_json"),
  imagesJson: text("images_json"),
  viewCount: integer("view_count").default(0).notNull(),
  rankingScore: integer("ranking_score").default(0).notNull(),
  approvedAt: timestamp("approved_at"),
  premiumExpiresAt: timestamp("premium_expires_at"),
  verifiedExpiresAt: timestamp("verified_expires_at"),
  featuredExpiresAt: timestamp("featured_expires_at"),
  customBadge: text("custom_badge"),
  customBadgeColor: text("custom_badge_color"),
  customBadgeStartDate: timestamp("custom_badge_start_date"),
  customBadgeEndDate: timestamp("custom_badge_end_date"),
  pendingEditJson: text("pending_edit_json"),
  pendingEditStatus: text("pending_edit_status"),
  productLimit: integer("product_limit").default(5).notNull(),
  services: text("services"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businessWarningsTable = pgTable("business_warnings", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  level: text("level").notNull().default("warning"),
  message: text("message").notNull(),
  sentBy: text("sent_by").notNull().default("admin (manual)"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  reviewerName: text("reviewer_name").notNull(),
  reviewerEmail: text("reviewer_email"),
  rating: integer("rating").notNull(),
  content: text("content"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enquiriesTable = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id"),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price"),
  imageUrl: text("image_url"),
  imagesJson: text("images_json"),
  knowMoreUrl: text("know_more_url"),
  status: text("status").default("pending").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isAdminAdded: boolean("is_admin_added").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  category: text("category"),
  tagsJson: text("tags_json"),
  status: text("status").default("draft").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  authorName: text("author_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analyticsEventsTable = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  entityId: integer("entity_id"),
  entityType: text("entity_type"),
  metadataJson: text("metadata_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSessionsTable = pgTable("admin_sessions", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminLoginHistoryTable = pgTable("admin_login_history", {
  id: text("id").primaryKey(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  role: text("role").default("business_owner").notNull(),
  passwordHash: text("password_hash"),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at"),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  agreedToTerms: boolean("agreed_to_terms").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const businessMilestonesTable = pgTable("business_milestones", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  milestoneKey: text("milestone_key").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const carouselSlidesTable = pgTable("carousel_slides", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  subtitle: text("subtitle"),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const popupsTable = pgTable("popups", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  imageUrl: text("image_url"),
  buttonText: text("button_text"),
  buttonUrl: text("button_url"),
  bgColor: text("bg_color"),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  scheduleStart: timestamp("schedule_start"),
  scheduleEnd: timestamp("schedule_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityPartnersTable = pgTable("community_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  about: text("about"),
  photoUrl: text("photo_url"),
  badge: text("badge"),
  socialLinksJson: text("social_links_json"),
  totalReferrals: integer("total_referrals").default(0).notNull(),
  totalVisitorsSent: integer("total_visitors_sent").default(0).notNull(),
  joinedSince: timestamp("joined_since"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const governmentContactsTable = pgTable("government_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  phone: text("phone").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customPagesTable = pgTable("custom_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").default("").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  status: text("status").default("draft").notNull(),
  showInNav: boolean("show_in_nav").default(false).notNull(),
  footerSection: text("footer_section"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const businessReportsTable = pgTable("business_reports", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  reason: text("reason").notNull(),
  description: text("description"),
  reporterName: text("reporter_name"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  serviceRequest: text("service_request").notNull(),
  categoryId: integer("category_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  message: text("message"),
  status: text("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leadAssignmentsTable = pgTable("lead_assignments", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  businessId: integer("business_id").notNull(),
  status: text("status").default("pending").notNull(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webdevEnquiriesTable = pgTable("webdev_enquiries", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  businessName: text("business_name"),
  message: text("message"),
  businessType: text("business_type"),
  budget: text("budget"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const searchQueriesTable = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  resultsCount: integer("results_count").default(0),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pendingRegistrationsTable = pgTable("pending_registrations", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deletionRequestsTable = pgTable("deletion_requests", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  userId: text("user_id").notNull(),
  businessId: integer("business_id"),
  reason: text("reason"),
  status: text("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  reviewedAt: timestamp("reviewed_at"),
  restoredAt: timestamp("restored_at"),
  permanentDeleteAt: timestamp("permanent_delete_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminNotificationsTable = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  entityId: integer("entity_id"),
  entityType: text("entity_type"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTicketsTable = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  category: text("category").default("general").notNull(),
  status: text("status").default("open").notNull(),
  priority: text("priority").default("normal").notNull(),
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businessEditHistoryTable = pgTable("business_edit_history", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  editedBy: text("edited_by").notNull(),
  changesJson: text("changes_json"),
  previousStatusJson: text("previous_status_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businessAuditLogTable = pgTable("business_audit_log", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  field: text("field").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  editedBy: text("edited_by").notNull(),
  editedByType: text("edited_by_type").default("owner").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetType: text("target_type").default("all").notNull(),
  targetCategoryId: integer("target_category_id"),
  targetBusinessId: integer("target_business_id"),
  sentAt: timestamp("sent_at").defaultNow(),
  deliveryStatus: text("delivery_status").default("sent").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reactivationRequestsTable = pgTable("reactivation_requests", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categoryRankingHistoryTable = pgTable("category_ranking_history", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  categoryId: integer("category_id").notNull(),
  rank: integer("rank").notNull(),
  score: integer("score").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});
