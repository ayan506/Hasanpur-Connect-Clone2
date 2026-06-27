import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function CookiesBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("cookiesAccepted")) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-end justify-center sm:justify-start p-4 sm:p-6"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div className="bg-background border rounded-2xl shadow-2xl p-5 w-full sm:max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3 mb-3">
          <Cookie className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-foreground mb-1">We use cookies 🍪</p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>
            <strong>What are cookies?</strong> Cookies are small files stored on your device that help websites remember your preferences and improve your experience.
          </p>
          <p>
            Hasanpur Connect uses cookies for <strong>essential functions</strong> (keeping you logged in, saving your preferences) and for <strong>analytics</strong> (understanding how visitors use our site so we can improve it for local businesses and residents).
          </p>
          <p>
            By clicking <strong>"I Agree & Continue"</strong> below, you agree to our use of cookies as described in our Privacy Policy. Continuing to use this site also implies your acceptance.
          </p>
          <p>
            Read our full policies:{" "}
            <Link href={`${BASE}/terms`} className="text-primary underline hover:no-underline" onClick={handleAccept}>Terms & Conditions</Link>
            {" · "}
            <Link href={`${BASE}/privacy-policy`} className="text-primary underline hover:no-underline" onClick={handleAccept}>Privacy Policy</Link>
            {" · "}
            <Link href={`${BASE}/disclaimer`} className="text-primary underline hover:no-underline" onClick={handleAccept}>Disclaimer</Link>
          </p>
        </div>

        <Button size="sm" className="mt-4 w-full font-semibold" onClick={handleAccept}>
          I Agree &amp; Continue
        </Button>
      </div>
    </div>
  );
}
