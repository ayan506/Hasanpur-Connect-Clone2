import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, MapPin, LogOut, Home, BookOpen, Headphones, FileText } from "lucide-react";
import { useGetSettings } from "@workspace/api-client-react";
import RequestServiceModal from "@/components/RequestServiceModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomPage { id: number; title: string; slug: string; }

export default function Header() {
  const { role, logout } = useAuth();
  const { data: settings } = useGetSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [location] = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const { lang, toggle, t } = useLanguage();
  const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    fetch(`${BASE}/api/pages`)
      .then(r => r.ok ? r.json() : [])
      .then(setCustomPages)
      .catch(() => setCustomPages([]));
  }, [BASE]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);


  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-primary tracking-tight">
                {settings?.siteName || "Hasanpur Connect"}
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">{t("home")}</Link>
              <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">{t("businesses")}</Link>
              <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">{t("blog")}</Link>

              {customPages.length > 0 && (
                <Link href="/pages" className="text-sm font-medium hover:text-primary transition-colors">
                  Pages
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/search">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            <button
              onClick={toggle}
              className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border hover:bg-muted transition-colors shrink-0"
              title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
            >
              {lang === "en" ? "हि" : "EN"}
            </button>

            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowModal(true)}>
                <Headphones className="w-4 h-4 mr-2" />
                {t("requestService")}
              </Button>
              {role ? (
                <Button variant="ghost" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("logout")}
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="ghost">{t("login")}</Button>
                </Link>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div ref={menuRef} className="md:hidden absolute top-16 left-0 right-0 bg-background border-b shadow-lg z-50 animate-in slide-in-from-top-2 duration-150">
            <nav className="container mx-auto px-4 py-3 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                <Home className="w-4 h-4" /> {t("home")}
              </Link>
              <Link href="/search" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                <Search className="w-4 h-4" /> {t("browseBusinesses")}
              </Link>
              <Link href="/blog" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                <BookOpen className="w-4 h-4" /> {t("blog")}
              </Link>
              {customPages.length > 0 && (
                <>
                  <div className="border-t my-1" />
                  <Link href="/pages" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                    <FileText className="w-4 h-4" /> Pages
                  </Link>
                </>
              )}
              <div className="border-t my-1" />
              <button
                onClick={() => { setMenuOpen(false); setShowModal(true); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
              >
                <Headphones className="w-4 h-4" /> {t("requestService")}
              </button>
              <div className="border-t my-1" />
              {role ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-red-500"
                >
                  <LogOut className="w-4 h-4" /> {t("logout")}
                </button>
              ) : (
                <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                  <LogOut className="w-4 h-4 rotate-180" /> {t("login")}
                </Link>
              )}
              <div className="border-t my-1" />
              <button
                onClick={toggle}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
              >
                🌐 {lang === "en" ? "हिंदी में देखें" : "View in English"}
              </button>
            </nav>
          </div>
        )}
      </header>

      <RequestServiceModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
