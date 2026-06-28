import { Shield, Search, Star, Users, Zap, MapPin } from "lucide-react";

const reasons = [
  { icon: Shield, title: "Verified Listings", desc: "Every business is manually reviewed before going live." },
  { icon: Search, title: "Easy Discovery", desc: "Find local businesses by category or name in seconds." },
  { icon: Star, title: "Trusted Reviews", desc: "Real reviews from real customers in Hasanpur." },
  { icon: Users, title: "Community First", desc: "Built by the people of Hasanpur, for Hasanpur." },
  { icon: Zap, title: "Always Updated", desc: "Businesses keep their info current — no outdated numbers." },
  { icon: MapPin, title: "Truly Local", desc: "100% focused on Hasanpur, UP — not a generic directory." },
];

export function WhyChooseUsSection() {
  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-6">
          <p className="text-primary font-semibold text-xs uppercase tracking-wider mb-1">Why Hasanpur Connect?</p>
          <h2 className="text-xl md:text-2xl font-bold">Your Trusted Local Business Directory</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-background rounded-xl p-4 border hover:shadow-sm transition-shadow text-center">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2 mx-auto">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed hidden md:block">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
