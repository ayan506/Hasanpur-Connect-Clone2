import Layout from "@/components/layout/Layout";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { MapPin, Target, Eye, Heart, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  useMetaTags({
    title: "About Us — Hasanpur Connect",
    description: "Learn about Hasanpur Connect — the premier local business directory for Hasanpur, Uttar Pradesh."
  });

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MapPin className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">About Hasanpur Connect</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connecting the businesses and people of Hasanpur, Uttar Pradesh
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hasanpur Connect is the premier local business directory for Hasanpur, a vibrant town in Amroha district, Uttar Pradesh. We were created to bridge the gap between local businesses and the community they serve — making it easy for residents to discover, connect, and support local enterprises.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              From small shops and restaurants to hospitals and educational institutions, Hasanpur Connect is the go-to platform for finding everything local. We believe that when local businesses thrive, the entire community prospers.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted/40 rounded-xl p-6 text-center">
              <Target className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Our Mission</h3>
              <p className="text-sm text-muted-foreground">To digitally empower every local business in Hasanpur and make community services accessible to all residents.</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-6 text-center">
              <Eye className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Our Vision</h3>
              <p className="text-sm text-muted-foreground">To become the most trusted and comprehensive digital platform for the Hasanpur community.</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-6 text-center">
              <Heart className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Our Values</h3>
              <p className="text-sm text-muted-foreground">Community first, transparency, accuracy, and a deep commitment to local growth and development.</p>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold mb-4">Why Hasanpur Connect?</h2>
            <ul className="space-y-3">
              {[
                "Free business listings for local businesses",
                "Verified and premium badges for trusted businesses",
                "Direct contact — call, WhatsApp, and enquiry in one place",
                "Community reviews and ratings",
                "Regular blog posts about local events and businesses",
                "Mobile-friendly design for easy access on any device",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-primary/5 rounded-2xl p-8 text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Join Our Community</h2>
            <p className="text-muted-foreground mb-6">Are you a business owner in Hasanpur? List your business for free and reach thousands of local customers.</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/register"><Button size="lg">Add Your Business</Button></Link>
              <Link href="/contact"><Button variant="outline" size="lg">Contact Us</Button></Link>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
