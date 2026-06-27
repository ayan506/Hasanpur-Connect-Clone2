import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageCircle, Building2, ArrowRight } from "lucide-react";
import { useGetSettings } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export function GetInTouchSection() {
  const { data: settings } = useGetSettings();
  const waNumber = settings?.whatsappNumber ?? "";

  return (
    <section className="py-14 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
          Join hundreds of local businesses already on Hasanpur Connect. Get discovered by thousands of customers every month.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`${BASE}/register`}>
            <Button size="lg" className="gap-2 px-8">
              <Building2 className="w-5 h-5" />
              List Your Business Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber.replace(/\D/g, "")}?text=Hi! I want to know more about listing my business on Hasanpur Connect.`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="gap-2 px-8 border-green-500 text-green-600 hover:bg-green-50">
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </Button>
            </a>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Free listing available · Premium plans for more visibility · No credit card required
        </p>
      </div>
    </section>
  );
}
