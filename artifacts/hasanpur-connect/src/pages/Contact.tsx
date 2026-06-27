import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { useGetSettings } from "@workspace/api-client-react";
import { Mail, Phone, MapPin, MessageCircle, CheckCircle, Search, Clock, TicketCheck } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "In Progress", color: "bg-yellow-100 text-yellow-700" },
  solved: { label: "Solved", color: "bg-green-100 text-green-700" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600" },
};

export default function ContactPage() {
  const { toast } = useToast();
  const { data: settings } = useGetSettings();
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useMetaTags({
    title: "Contact Us — Hasanpur Connect",
    description: "Get in touch with the Hasanpur Connect team.",
  });

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    try {
      const res = await fetch(`${BASE}/api/support-tickets/lookup?ticketId=${encodeURIComponent(lookupId.trim().toUpperCase())}`);
      if (res.status === 404) { setLookupError("Ticket not found. Check your Ticket ID."); return; }
      if (!res.ok) throw new Error("Failed");
      setLookupResult(await res.json());
    } catch {
      setLookupError("Could not look up ticket. Try again.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/support-tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          subject: form.subject || "General Enquiry",
          message: form.message,
          category: "general",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTicketId(data.ticketId ?? null);
      setSent(true);
    } catch {
      toast({ title: "Failed to send", description: "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a question or want to list your business? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Location</h3>
                <p className="text-muted-foreground">Hasanpur, Amroha District, Uttar Pradesh — 244241</p>
              </div>
            </div>
            {settings?.contactEmail && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a href={`mailto:${settings.contactEmail}`} className="text-primary hover:underline">{settings.contactEmail}</a>
                </div>
              </div>
            )}
            {settings?.contactPhone && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <a href={`tel:${settings.contactPhone}`} className="text-primary hover:underline">{settings.contactPhone}</a>
                </div>
              </div>
            )}
            {settings?.whatsappNumber && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            )}

            <div className="border rounded-xl p-5 bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <TicketCheck className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Track Your Ticket</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Enter your Ticket ID (from confirmation email) to check status.</p>
              <form onSubmit={handleLookup} className="flex gap-2">
                <Input
                  value={lookupId}
                  onChange={e => setLookupId(e.target.value.toUpperCase())}
                  placeholder="HC-XXXXXXXX-XXX"
                  className="font-mono text-sm"
                />
                <Button type="submit" size="sm" variant="outline" disabled={lookupLoading || !lookupId.trim()}>
                  {lookupLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </form>
              {lookupError && <p className="text-sm text-destructive mt-2">{lookupError}</p>}
              {lookupResult && (
                <div className="mt-3 p-3 bg-background rounded-lg border space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">{lookupResult.ticketId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[lookupResult.status]?.color ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[lookupResult.status]?.label ?? lookupResult.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{lookupResult.subject}</p>
                  <p className="text-xs text-muted-foreground">Submitted: {lookupResult.createdAt ? new Date(lookupResult.createdAt).toLocaleDateString("en-IN") : "—"}</p>
                  {lookupResult.resolvedAt && <p className="text-xs text-green-600">Resolved: {new Date(lookupResult.resolvedAt).toLocaleDateString("en-IN")}</p>}
                </div>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              {sent ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
                  <p className="text-xl font-bold">Message sent!</p>
                  {ticketId && (
                    <div className="bg-muted rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Your Ticket ID</p>
                      <p className="text-2xl font-bold text-primary tracking-widest font-mono">{ticketId}</p>
                      <p className="text-xs text-muted-foreground mt-2">Save this to track your request using the tracker on the left.</p>
                    </div>
                  )}
                  <p className="text-muted-foreground text-sm">We'll respond within 24–48 hours.</p>
                  <Button variant="outline" size="sm" onClick={() => { setSent(false); setTicketId(null); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your Name <span className="text-destructive">*</span></Label>
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email <span className="text-destructive">*</span></Label>
                    <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                      placeholder="10-digit mobile number" maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="What is this regarding?" />
                  </div>
                  <div className="space-y-2">
                    <Label>Message <span className="text-destructive">*</span></Label>
                    <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="How can we help you?" rows={4} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
