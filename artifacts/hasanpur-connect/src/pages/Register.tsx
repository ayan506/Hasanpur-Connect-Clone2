import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCreateBusiness, useListCategories, useGetSettings } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { Building2, CheckCircle, User, Lock, ArrowRight, ShieldCheck, Clock, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { type DayHours, type BusinessHours } from "@/components/business/BusinessHoursDisplay";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

function defaultHours(): BusinessHours {
  const h: BusinessHours = {};
  for (const day of DAYS) {
    h[day] = { open: "09:00", close: "18:00", closed: day === "sunday", open24: false };
  }
  return h;
}

function generateFAQsFromForm(form: any, categories: any[]): Array<{ question: string; answer: string }> {
  const name = form.name;
  if (!name) return [];
  const catName = categories.find((c: any) => String(c.id) === form.categoryId)?.name || "business";
  const faqs = [];
  if (form.address) {
    faqs.push({
      question: `Where is ${name} located?`,
      answer: `${name} is located at ${form.address}${form.landmark ? `, near ${form.landmark}` : ""}${form.pinCode ? ` — Pin ${form.pinCode}` : ""}, Hasanpur, UP.`,
    });
  }
  if (form.phone || form.whatsapp) {
    faqs.push({
      question: `How can I contact ${name}?`,
      answer: [form.phone && `Call: ${form.phone}`, form.whatsapp && `WhatsApp: ${form.whatsapp}`].filter(Boolean).join(" | "),
    });
  }
  faqs.push({
    question: `What type of ${catName} is ${name}?`,
    answer: form.description || `${name} is a ${catName} in Hasanpur, offering quality services to local residents.`,
  });
  faqs.push({
    question: `Is ${name} open today?`,
    answer: `Please check the business hours listed on our profile page for the latest timings.`,
  });
  return faqs;
}

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { role, setAuth, email: authEmail } = useAuth();
  const { data: categories } = useListCategories();
  const { data: settings } = useGetSettings();
  const createBusiness = useCreateBusiness();
  const [submitted, setSubmitted] = useState(false);
  const [submittedSlug, setSubmittedSlug] = useState("");
  const [showHours, setShowHours] = useState(false);

  const [accountForm, setAccountForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [accountError, setAccountError] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingId, setPendingId] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", categoryId: "", description: "", address: "", landmark: "", pinCode: "",
    latitude: "", longitude: "",
    phone: "", whatsapp: "",
    ownerName: "", ownerPhone: "",
    establishmentYear: "", gstNumber: "", panNumber: "",
    facebook: "", instagram: "", youtube: "",
    logo: "", coverImage: "",
  });

  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultHours());
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);

  useMetaTags({ title: "Add Your Business | Hasanpur Connect", description: "List your business on Hasanpur Connect" });

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const updateHours = (day: string, field: keyof DayHours, value: any) => {
    setBusinessHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleAccountCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError("");
    if (accountForm.password.length < 6) { setAccountError("Password must be at least 6 characters."); return; }
    if (accountForm.password !== accountForm.confirm) { setAccountError("Passwords do not match."); return; }
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
    try {
      const res = await fetch(`${base}/api/admin/register-owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: accountForm.email, password: accountForm.password, name: accountForm.name }),
      });
      const data = await res.json();
      if (!res.ok) { setAccountError(data.error || "Registration failed. Please try again."); return; }
      if (data.pendingVerification) {
        setPendingId(data.pendingId);
        setPendingEmail(data.email);
        if (data.devOtp) setDevOtp(data.devOtp);
        setPendingVerification(true);
        return;
      }
      setAuth("business_owner", data.email);
      setForm(p => ({ ...p, ownerName: accountForm.name, ownerPhone: accountForm.phone, phone: p.phone || accountForm.phone }));
      toast({ title: "Account created!", description: "Now fill in your business details." });
    } catch {
      setAccountError("Registration failed. Please try again.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    if (!otpValue.trim()) { setOtpError("Please enter the OTP."); return; }
    setOtpLoading(true);
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
    try {
      const res = await fetch(`${base}/api/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.expired) {
          setOtpError("OTP has expired. Please click 'Resend OTP' to get a new code.");
        } else {
          setOtpError(data.error || "Invalid OTP. Please try again.");
        }
        return;
      }
      setAuth("business_owner", data.email);
      setForm(p => ({ ...p, ownerName: accountForm.name, ownerPhone: accountForm.phone, phone: p.phone || accountForm.phone }));
      setPendingVerification(false);
      toast({ title: "Email verified!", description: "Account created. Now fill in your business details." });
    } catch {
      setOtpError("Verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtpError("");
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
    try {
      const res = await fetch(`${base}/api/admin/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setOtpError(data.error || "Could not resend OTP.");
        return;
      }
      const resendData = await res.json().catch(() => ({}));
      if (resendData.devOtp) setDevOtp(resendData.devOtp);
      setOtpValue("");
      toast({ title: "New OTP sent!", description: `A new verification code has been sent to ${pendingEmail}.` });
    } catch {
      setOtpError("Could not resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGenerateFAQs = () => {
    if (!form.name) { toast({ title: "Enter a business name first", variant: "destructive" }); return; }
    const generated = generateFAQsFromForm(form, categories || []);
    setFaqs(generated);
    toast({ title: `${generated.length} FAQs generated!`, description: "You can edit or delete them below." });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { toast({ title: "Please select a category", variant: "destructive" }); return; }
    if (!form.description || form.description.trim().length < 20) { toast({ title: "Description required", description: "Please enter at least 20 characters describing your business.", variant: "destructive" }); return; }
    try {
      const socialLinks: Record<string, string> = {};
      if (form.facebook) socialLinks.facebook = form.facebook;
      if (form.instagram) socialLinks.instagram = form.instagram;
      if (form.youtube) socialLinks.youtube = form.youtube;

      const result = await createBusiness.mutateAsync({
        data: {
          name: form.name,
          categoryId: Number(form.categoryId),
          description: form.description || undefined,
          address: form.address || undefined,
          landmark: form.landmark || undefined,
          pinCode: form.pinCode || undefined,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          phone: form.phone || undefined,
          whatsapp: form.whatsapp || undefined,
          logo: form.logo || undefined,
          coverImage: form.coverImage || undefined,
          ownerName: form.ownerName || undefined,
          ownerPhone: form.ownerPhone || undefined,
          ownerEmail: authEmail || undefined,
          establishmentYear: form.establishmentYear || undefined,
          gstNumber: form.gstNumber || undefined,
          panNumber: form.panNumber || undefined,
          businessHours: showHours ? businessHours : undefined,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
          faqs: faqs.length > 0 ? faqs : undefined,
        } as any
      });
      setSubmittedSlug((result as any)?.slug ?? "");
      setSubmitted(true);
    } catch {
      toast({ title: "Error", description: "Could not submit listing. Please try again.", variant: "destructive" });
    }
  };

  if (pendingVerification) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Verify Your Email</h2>
              <p className="text-muted-foreground text-sm mt-1">
                A 6-digit code was sent to <strong>{pendingEmail}</strong>. Enter it below to complete registration.
              </p>
              {devOtp && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <strong>⚠️ Email not configured (test mode)</strong><br />
                  OTP: <strong className="font-mono text-lg tracking-widest">{devOtp}</strong>
                </div>
              )}
            </div>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <Label>Verification Code *</Label>
                    <Input
                      className="mt-1 text-center text-2xl font-mono tracking-widest h-14"
                      value={otpValue}
                      onChange={e => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="_ _ _ _ _ _"
                      maxLength={6}
                      autoFocus
                      inputMode="numeric"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Valid for 10 minutes</p>
                  </div>
                  {otpError && <p className="text-sm text-red-500">{otpError}</p>}
                  <Button type="submit" className="w-full" size="lg" disabled={otpLoading}>
                    {otpLoading ? "Verifying..." : "Verify & Create Account"}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
                  <Button variant="link" className="text-sm p-0 h-auto mt-1" onClick={handleResendOtp} disabled={resendLoading}>
                    {resendLoading ? "Sending..." : "Resend OTP"}
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Wrong email?{" "}
                  <button className="text-primary hover:underline" onClick={() => { setPendingVerification(false); setOtpValue(""); setOtpError(""); }}>
                    Go back
                  </button>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold">Listing Submitted!</h2>
            <p className="text-muted-foreground">Your business listing has been submitted for review. Our team will approve it within 24–48 hours.</p>
            <div className="flex gap-3 justify-center pt-4">
              <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
              <Link href="/"><Button variant="outline">Go to Home</Button></Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isLoggedIn = role === "business_owner" || role === "admin";

  return (
    <Layout>
      <div className="bg-slate-950 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-white">Add Your Business</h1>
          </div>
          <p className="text-slate-400">List your business on Hasanpur's #1 directory — free!</p>
          <div className="flex items-center gap-2 mt-4">
            {!isLoggedIn ? (
              <>
                <span className="flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary rounded-full px-3 py-1 text-sm font-medium">
                  <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span> Create Account
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="flex items-center gap-2 bg-slate-800 text-slate-400 rounded-full px-3 py-1 text-sm">
                  <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs">2</span> Add Listing
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full px-3 py-1 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Account Ready
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary rounded-full px-3 py-1 text-sm font-medium">
                  <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span> Add Listing
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl space-y-6">

        {!isLoggedIn && (
          <Card className="border-primary/40 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Step 1: Create Your Account</CardTitle>
              <CardDescription>You need an account to manage your listing and view enquiries.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountCreate} className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input className="mt-1" value={accountForm.name} onChange={e => setAccountForm(p => ({ ...p, name: e.target.value }))} required placeholder="Your full name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Email *</Label><Input className="mt-1" type="email" value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} required placeholder="yourmail@gmail.com" /></div>
                  <div><Label>Phone *</Label><div className="relative mt-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">+91</span><Input className="pl-10" value={accountForm.phone} onChange={e => setAccountForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} required placeholder="9876543210" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" title="Enter 10-digit mobile number" /></div></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Password *</Label><div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input className="pl-10" type="password" value={accountForm.password} onChange={e => setAccountForm(p => ({ ...p, password: e.target.value }))} required placeholder="Min. 6 characters" autoComplete="new-password" /></div></div>
                  <div><Label>Confirm Password *</Label><div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input className="pl-10" type="password" value={accountForm.confirm} onChange={e => setAccountForm(p => ({ ...p, confirm: e.target.value }))} required placeholder="Repeat password" autoComplete="new-password" /></div></div>
                </div>
                {accountError && <p className="text-sm text-red-500">{accountError}</p>}
                <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg border">
                  <input
                    type="checkbox"
                    id="terms-agree"
                    required
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary cursor-pointer"
                  />
                  <label htmlFor="terms-agree" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                    I agree to the{" "}
                    <a href="/terms" className="text-primary hover:underline font-medium">Terms of Service</a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a>.
                    I confirm all information provided is accurate.
                  </label>
                </div>
                <Button type="submit" className="w-full" size="lg">Create Account & Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in here</Link></p>
            </CardContent>
          </Card>
        )}

        {isLoggedIn && (
          <>
            {role !== "admin" && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-400">You're logged in as a business owner.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Basic Info */}
              <Card>
                <CardHeader><CardTitle>Business Information</CardTitle><CardDescription>Basic details about your business</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Business Name *</Label><Input className="mt-1" value={form.name} onChange={setField("name")} required placeholder="e.g. City Medical Store" /></div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={form.categoryId || undefined} onValueChange={v => setForm(p => ({ ...p, categoryId: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>{categories?.map(cat => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Description *</Label><Textarea className="mt-1" value={form.description} onChange={setField("description")} rows={4} placeholder="Describe your business, services, specialties..." required /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Establishment Year</Label><Input className="mt-1" value={form.establishmentYear} onChange={setField("establishmentYear")} placeholder="e.g. 2005" /></div>
                  </div>
                  <div className="pt-2">
                    <MultiImageUpload label="Business Images / Cover Images (Multiple)" value={form.coverImage} onChange={url => setForm(p => ({ ...p, coverImage: url }))} />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader><CardTitle>Location Details</CardTitle><CardDescription>Help customers find you easily</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Full Address *</Label><Input className="mt-1" value={form.address} onChange={setField("address")} required placeholder="Full address in Hasanpur" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label>Pin Code *</Label><Input className="mt-1" value={form.pinCode} onChange={setField("pinCode")} placeholder="244241" required /></div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader><CardTitle>Contact Details</CardTitle><CardDescription>How customers can reach you</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Primary Phone</Label><div className="relative mt-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">+91</span><Input className="pl-10" value={form.phone} onChange={e => { const val = e.target.value.replace(/\D/g, "").slice(0, 10); setForm(p => ({ ...p, phone: val, whatsapp: p.whatsapp || val })); }} placeholder="9876543210" inputMode="numeric" maxLength={10} /></div></div>
                  </div>
                  <div>
                    <Label>WhatsApp Number</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">+91</span>
                      <Input className="pl-10" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="9876543210" inputMode="numeric" maxLength={10} />
                    </div>
                    {form.whatsapp && form.whatsapp === form.phone && <p className="text-xs text-muted-foreground mt-1">✓ Auto-filled from phone number</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader><CardTitle>Social Media</CardTitle><CardDescription>Optional — helps customers follow you</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Facebook</Label><Input className="mt-1" value={form.facebook} onChange={setField("facebook")} placeholder="https://facebook.com/yourbusiness" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Instagram</Label><Input className="mt-1" value={form.instagram} onChange={setField("instagram")} placeholder="https://instagram.com/..." /></div>
                    <div><Label>YouTube</Label><Input className="mt-1" value={form.youtube} onChange={setField("youtube")} placeholder="https://youtube.com/..." /></div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Business Hours</CardTitle>
                      <CardDescription>Optional — shows open/closed status to customers</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowHours(!showHours)}>
                      {showHours ? <><ChevronUp className="w-4 h-4 mr-1.5" />Hide</> : <><ChevronDown className="w-4 h-4 mr-1.5" />Add Hours</>}
                    </Button>
                  </div>
                </CardHeader>
                {showHours && (
                  <CardContent className="space-y-3">
                    {DAYS.map(day => {
                      const h = businessHours[day];
                      return (
                        <div key={day} className="grid grid-cols-[100px_1fr] items-center gap-3">
                          <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Switch
                              checked={!h.closed}
                              onCheckedChange={v => updateHours(day, "closed", !v)}
                            />
                            <span className="text-xs text-muted-foreground w-12">{h.closed ? "Closed" : "Open"}</span>
                            {!h.closed && (
                              <>
                                <Switch checked={h.open24} onCheckedChange={v => updateHours(day, "open24", v)} />
                                <span className="text-xs text-muted-foreground w-12">{h.open24 ? "24 hrs" : "Hours"}</span>
                                {!h.open24 && (
                                  <>
                                    <Input type="time" value={h.open} onChange={e => updateHours(day, "open", e.target.value)} className="h-7 w-28 text-xs" />
                                    <span className="text-xs">–</span>
                                    <Input type="time" value={h.close} onChange={e => updateHours(day, "close", e.target.value)} className="h-7 w-28 text-xs" />
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>

              {/* FAQs */}
              {(settings as any)?.faqGeneratorEnabled !== false && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>FAQs</CardTitle>
                      <CardDescription>Auto-generated from your info, or add custom</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateFAQs} className="gap-1.5">
                      <Wand2 className="w-3.5 h-3.5" /> Auto-Generate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border rounded-lg p-3 space-y-2">
                      <div>
                        <Label className="text-xs">Question</Label>
                        <Input className="mt-1 h-8 text-sm" value={faq.question} onChange={e => setFaqs(prev => prev.map((f, j) => j === i ? { ...f, question: e.target.value } : f))} />
                      </div>
                      <div>
                        <Label className="text-xs">Answer</Label>
                        <Textarea className="mt-1 text-sm" value={faq.answer} rows={2} onChange={e => setFaqs(prev => prev.map((f, j) => j === i ? { ...f, answer: e.target.value } : f))} />
                      </div>
                      <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7 text-xs" onClick={() => setFaqs(prev => prev.filter((_, j) => j !== i))}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={() => setFaqs(prev => [...prev, { question: "", answer: "" }])}>
                    + Add FAQ Manually
                  </Button>
                </CardContent>
              </Card>
              )}

              {/* Owner Details */}
              <Card>
                <CardHeader><CardTitle>Owner Details</CardTitle><CardDescription>For our team to contact you about the listing</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Owner Name *</Label><Input className="mt-1" value={form.ownerName} onChange={setField("ownerName")} placeholder="Your full name" required /></div>
                  <div><Label>Owner Phone *</Label><Input className="mt-1" value={form.ownerPhone} onChange={setField("ownerPhone")} placeholder="+91 XXXXXXXXXX" required /></div>
                </CardContent>
              </Card>

              {/* Optional Legal */}
              <Card>
                <CardHeader><CardTitle>Optional Business Details</CardTitle><CardDescription>GST number — only for your records, not publicly shown</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>GST Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input className="mt-1" value={form.gstNumber} onChange={setField("gstNumber")} placeholder="22AAAAA0000A1Z5" />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={createBusiness.isPending}>
                {createBusiness.isPending ? "Submitting..." : "Submit Listing for Review"}
              </Button>
              <p className="text-xs text-center text-muted-foreground pb-6">
                Your listing will be reviewed and published within 24–48 hours.
              </p>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}
