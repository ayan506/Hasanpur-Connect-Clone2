import { Shield, Search, Star, Users, Zap, MapPin } from "lucide-react";

const reasons = [
  { icon: Shield, title: "Verified Listings", desc: "Every business is manually reviewed by our team before going live." },
  { icon: Search, title: "Easy Discovery", desc: "Find local businesses by category, name, or location in seconds." },
  { icon: Star, title: "Trusted Reviews", desc: "Real reviews from real customers in Hasanpur and nearby areas." },
  { icon: Users, title: "Community First", desc: "Built by the people of Hasanpur, for the people of Hasanpur." },
  { icon: Zap, title: "Always Up to Date", desc: "Businesses keep their info current — no outdated phone numbers." },
  { icon: MapPin, title: "Truly Local", desc: "100% focused on Hasanpur, UP — not a generic national directory." },
];

export function WhyChooseUsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Why Hasanpur Connect?</p>
          <h2 className="text-3xl md:text-4xl font-bold">Your Trusted Local Business Directory</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            We connect Hasanpur residents with the best local businesses — verified, reviewed, and always up to date.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-background rounded-2xl p-6 border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
