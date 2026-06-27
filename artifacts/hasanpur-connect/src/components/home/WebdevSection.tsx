import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGetSettings } from "@workspace/api-client-react";
import { Globe, Smartphone, Search, Zap, CheckCircle, MessageCircle } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const features = [
  { icon: Globe, label: "Professional Website" },
  { icon: Smartphone, label: "Mobile Responsive" },
  { icon: Search, label: "SEO Optimised" },
  { icon: Zap, label: "Fast & Reliable" },
];

export function WebdevSection() {
  const { data: settings } = useGetSettings();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const webdevPhone = (settings as any)?.webdevContactNumber || settings?.contactPhone || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${BASE}/api/webdev-enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, message: form.message }),
      });
      toast({ title: "Enquiry submitted!", description: "We'll contact you shortly." });
      setForm({ name: "", phone: "", message: "" });
      setDone(true);
    } catch {
      toast({ title: "Failed to submit", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Web Development</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Your Business Website Built
            </h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Take your business online with a professional, mobile-friendly website. We create fast, SEO-optimised websites tailored to your needs — so customers can find you online, anytime.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-slate-300">{label}</span>
                </div>
              ))}
            </div>
            {webdevPhone && (
              <a
                href={`https://wa.me/${webdevPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fbd5a] text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us: {webdevPhone}
              </a>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            {done ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Enquiry Submitted!</h3>
                <p className="text-slate-300 text-sm">We'll contact you soon to discuss your project.</p>
                <Button variant="outline" size="sm" className="mt-4 text-white border-white/30" onClick={() => setDone(false)}>
                  Submit Another
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-lg mb-4">Get a Free Quote</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="text-slate-300 text-sm">Your Name *</Label>
                    <Input
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      required
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">Phone Number *</Label>
                    <Input
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      required
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">What do you need?</Label>
                    <Textarea
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      rows={3}
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="e.g. Business website, online store, portfolio..."
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? "Submitting..." : "Get Free Quote"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
