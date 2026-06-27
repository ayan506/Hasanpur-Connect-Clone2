import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, LogIn, Headphones, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import RequestServiceModal from "@/components/RequestServiceModal";

export default function MobileNav() {
  const [location] = useLocation();
  const { role } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const loginHref = role === "admin" ? "/admin" : (role ? "/dashboard" : "/login");

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-stretch h-16 pb-safe">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 gap-1 ${location === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          href="/search"
          className={`flex flex-col items-center justify-center flex-1 gap-1 ${location.startsWith("/search") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Search className="h-5 w-5" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        {/* Center FAB — Add Listing */}
        <div className="flex-1 flex items-center justify-center relative">
          <Link
            href="/register"
            className="absolute -top-5 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 active:scale-95 transition-all border-[3px] border-background"
            aria-label="Add Listing"
          >
            <Plus className="h-7 w-7" />
          </Link>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex flex-col items-center justify-center flex-1 gap-1 text-muted-foreground hover:text-foreground"
        >
          <Headphones className="h-5 w-5" />
          <span className="text-[10px] font-medium">Services</span>
        </button>

        <Link
          href={loginHref}
          className={`flex flex-col items-center justify-center flex-1 gap-1 ${(location === "/login" || location === "/dashboard" || location === "/admin") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <LogIn className="h-5 w-5" />
          <span className="text-[10px] font-medium">{role ? "Account" : "Login"}</span>
        </Link>
      </div>

      <RequestServiceModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
