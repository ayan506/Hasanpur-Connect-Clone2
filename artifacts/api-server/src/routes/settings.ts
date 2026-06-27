import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  siteName: "Hasanpur Connect",
  siteTagline: "Your Local Business Directory",
  contactPhone: "+91 00000 00000",
  contactWhatsapp: "+91 00000 00000",
  contactEmail: "info@hasanpurconnect.com",
  address: "Hasanpur, Uttar Pradesh, India",
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
  youtubeUrl: "",
  googleAnalyticsId: "",
  googleAdsenseId: "",
  metaTitle: "Hasanpur Connect - Local Business Directory",
  metaDescription: "Find the best businesses, doctors, restaurants, hotels, and services in Hasanpur. Your trusted local directory.",
  footerText: "© {year} Hasanpur Connect. All Rights Reserved.",
  developerCreditEnabled: "true",
  developerName: "Atypo Web Development",
  developerUrl: "https://example.com",
  developerLinkNewTab: "true",
  developerLinkNofollow: "true",
  marqueeText: "Welcome to Hasanpur Connect - Your trusted local business directory!",
  marqueeEnabled: "false",
  marqueeSpeed: "normal",
  maintenanceMode: "false",
  announcementText: "",
  announcementEnabled: "false",
  announcementType: "text",
  announcementBgColor: "#1e40af",
  announcementTextColor: "#ffffff",
  announcementLink: "",
  announcementImage: "",
  announcementPosition: "top",
  announcementStartDate: "",
  announcementEndDate: "",
  seoOgImage: "",
  seoKeywords: "Hasanpur, local business directory, Uttar Pradesh, doctors, restaurants, hotels",
  seoGoogleSearchConsole: "",
  seoRobotsNoIndex: "false",
  faviconUrl: "",
  otpVerificationEnabled: "false",
  masterBackupOtp: "000000",
  autoApproveListings: "false",
  autoSendWarnings: "false",
  premiumUpgradeContact: "+91 00000 00000",
  faqGeneratorEnabled: "true",
};

async function getAll(): Promise<Record<string, string>> {
  const rows = await db.select().from(siteSettingsTable);
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (r.value !== null) map[r.key] = r.value;
  }
  return map;
}

function toResponse(map: Record<string, string>) {
  return {
    siteName: map.siteName,
    siteTagline: map.siteTagline,
    contactPhone: map.contactPhone,
    contactWhatsapp: map.contactWhatsapp,
    contactEmail: map.contactEmail,
    address: map.address,
    facebookUrl: map.facebookUrl,
    instagramUrl: map.instagramUrl,
    twitterUrl: map.twitterUrl,
    youtubeUrl: map.youtubeUrl,
    googleAnalyticsId: map.googleAnalyticsId,
    googleAdsenseId: map.googleAdsenseId,
    metaTitle: map.metaTitle,
    metaDescription: map.metaDescription,
    footerText: map.footerText,
    developerCreditEnabled: map.developerCreditEnabled === "true",
    developerName: map.developerName,
    developerUrl: map.developerUrl,
    developerLinkNewTab: map.developerLinkNewTab === "true",
    developerLinkNofollow: map.developerLinkNofollow === "true",
    marqueeText: map.marqueeText,
    marqueeEnabled: map.marqueeEnabled === "true",
    marqueeSpeed: map.marqueeSpeed,
    maintenanceMode: map.maintenanceMode === "true",
    announcementText: map.announcementText,
    announcementEnabled: map.announcementEnabled === "true",
    announcementType: map.announcementType,
    announcementBgColor: map.announcementBgColor,
    announcementTextColor: map.announcementTextColor,
    announcementLink: map.announcementLink,
    announcementImage: map.announcementImage,
    announcementPosition: map.announcementPosition,
    announcementStartDate: map.announcementStartDate,
    announcementEndDate: map.announcementEndDate,
    seoOgImage: map.seoOgImage,
    seoKeywords: map.seoKeywords,
    seoGoogleSearchConsole: map.seoGoogleSearchConsole,
    seoRobotsNoIndex: map.seoRobotsNoIndex === "true",
    faviconUrl: map.faviconUrl,
    otpVerificationEnabled: map.otpVerificationEnabled === "true",
    masterBackupOtp: map.masterBackupOtp,
    autoApproveListings: map.autoApproveListings === "true",
    autoSendWarnings: map.autoSendWarnings === "true",
    premiumUpgradeContact: map.premiumUpgradeContact,
    faqGeneratorEnabled: map.faqGeneratorEnabled !== "false",
    themeColor: map.themeColor ?? "",
    webdevContactNumber: map.webdevContactNumber ?? "",
  };
}

router.get("/", async (_req, res) => {
  const map = await getAll();
  return res.json(toResponse(map));
});

router.put("/", async (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const data = parsed.data as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    const strVal = typeof value === "boolean" ? String(value) : String(value);
    await db.insert(siteSettingsTable)
      .values({ key, value: strVal })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: strVal } });
  }
  const map = await getAll();
  return res.json(toResponse(map));
});

export default router;
