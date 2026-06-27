import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

interface CustomPage { id: number; title: string; slug: string; }

export default function Footer() {
  const { data: settings } = useGetSettings();
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

  useEffect(() => {
    fetch(`${BASE}/api/pages`)
      .then(r => r.ok ? r.json() : [])
      .then(setCustomPages)
      .catch(() => setCustomPages([]));
  }, [BASE]);

  return (
    <footer className="bg-slate-950 text-slate-200 py-12 pb-24 md:pb-12 border-t border-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-white">
                {settings?.siteName || "Hasanpur Connect"}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {settings?.siteTagline || "The premium local business directory for Hasanpur."}
            </p>
            <div className="flex items-center gap-4 pt-2">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Hasanpur Connect */}
          <div>
            <h3 className="font-semibold text-white mb-4">Hasanpur Connect</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-slate-400 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-400 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-sm text-slate-400 hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/blog" className="text-sm text-slate-400 hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Business */}
          <div>
            <h3 className="font-semibold text-white mb-4">Business</h3>
            <ul className="space-y-2">
              <li><Link href="/register" className="text-sm text-slate-400 hover:text-primary transition-colors">Submit Listing</Link></li>
              <li><Link href="/login" className="text-sm text-slate-400 hover:text-primary transition-colors">Business Login</Link></li>
              <li><Link href="/search" className="text-sm text-slate-400 hover:text-primary transition-colors">Browse Businesses</Link></li>
              <li><Link href="/dashboard" className="text-sm text-slate-400 hover:text-primary transition-colors">My Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-sm text-slate-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-400 hover:text-primary transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-slate-400 hover:text-primary transition-colors">Disclaimer</Link></li>
              <li><Link href="/review-policy" className="text-sm text-slate-400 hover:text-primary transition-colors">Review Policy</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2">
              <li><Link href="/community-partners" className="text-sm text-slate-400 hover:text-primary transition-colors">Community Partners</Link></li>
              <li><Link href="/government-contacts" className="text-sm text-slate-400 hover:text-primary transition-colors">Government Contacts</Link></li>
              {settings?.contactPhone && (
                <li>
                  <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />{settings.contactPhone}
                  </a>
                </li>
              )}
              {settings?.contactEmail && (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors">
                    <Mail className="h-3.5 w-3.5 shrink-0" />{settings.contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Dynamic custom pages section — single "Pages" link only */}
        {customPages.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-900">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href="/pages" className="text-sm text-slate-400 hover:text-primary transition-colors font-medium">
                  Pages
                </Link>
              </li>
            </ul>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {settings?.footerText || `© ${new Date().getFullYear()} Hasanpur Connect. All rights reserved.`}
          </p>

          {settings?.developerCreditEnabled && settings.developerName && (
            <p className="text-sm text-slate-500">
              Developed by{" "}
              {settings.developerUrl ? (
                <a
                  href={settings.developerUrl}
                  className="text-primary hover:underline"
                  target={settings.developerLinkNewTab ? "_blank" : undefined}
                  rel={settings.developerLinkNofollow ? "nofollow" : undefined}
                >
                  {settings.developerName}
                </a>
              ) : (
                <span className="text-primary">{settings.developerName}</span>
              )}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
