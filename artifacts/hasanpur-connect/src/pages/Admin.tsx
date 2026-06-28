import React, { useState, useMemo, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { ImageUpload } from "@/components/ImageUpload";
import {
  useListBusinesses, useUpdateBusinessStatus, useDeleteBusiness,
  useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useListReviews, useUpdateReviewStatus, useDeleteReview,
  useListBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost,
  useGetAnalyticsSummary, useListEnquiries, useListWebDevEnquiries,
  useListUsers, useUpdateUserRole, useGetSettings, useUpdateSettings,
  useListAllPopups, useCreatePopup, useUpdatePopup, useDeletePopup
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  Building2, Users, Star, BookOpen, Settings, LogOut, CheckCircle, XCircle,
  Trash2, Plus, Eye, EyeOff, TrendingUp, MessageSquare, Globe, Crown, ShieldCheck,
  Inbox, BarChart3, FileText, Clock, Check, X, MapPin, Bookmark, Megaphone,
  Zap, Layers, Edit2, Image, Phone, UserCheck, History, Shield,
  Lightbulb, AlertCircle, Lock, Key, User, Bell, Trash, CheckCircle2,
  RefreshCw, Pencil, Send
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { role, setAuth, logout } = useAuth();
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminMasterKey, setAdminMasterKey] = useState("");
  const [adminShowPass, setAdminShowPass] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // All hooks must be called before any conditional return (Rules of Hooks)
  const { data: analytics } = useGetAnalyticsSummary();
  const adminHeaders = useAdminToken();

  useMetaTags({ title: "Admin Panel — Hasanpur Connect", description: "Admin dashboard" });

  useEffect(() => {
    if (role !== "admin") return;
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    fetch(`${BASE}/api/notifications/unread-count`, { headers: { "x-admin-token": token } })
      .then(r => r.json())
      .then(d => setUnreadCount(d.count ?? 0))
      .catch(() => {});
  }, [role]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    setAdminLoginLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword, masterKey: adminMasterKey }),
      });
      const data = await res.json();
      if (!res.ok) { setAdminLoginError(data.error || "Invalid credentials"); return; }
      setAuth("admin", adminUsername, data.token);
    } catch {
      setAdminLoginError("Login failed. Please try again.");
    } finally {
      setAdminLoginLoading(false);
    }
  };

  if (role !== "admin") {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold">Admin Login</h2>
              <p className="text-muted-foreground text-sm mt-1">Three-factor authentication required</p>
            </div>
            <div className="border rounded-lg p-6 space-y-4 bg-card">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium leading-none">Username</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm pl-10 outline-none focus:ring-1 focus:ring-ring"
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      placeholder="Admin username"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium leading-none">Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm pl-10 pr-10 outline-none focus:ring-1 focus:ring-ring"
                      type={adminShowPass ? "text" : "password"}
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Admin password"
                      required
                      autoComplete="current-password"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setAdminShowPass(p => !p)} tabIndex={-1}>
                      {adminShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium leading-none">Master Key</label>
                  <div className="relative mt-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm pl-10 outline-none focus:ring-1 focus:ring-ring"
                      type="password"
                      value={adminMasterKey}
                      onChange={e => setAdminMasterKey(e.target.value)}
                      placeholder="Enter master key"
                      required
                    />
                  </div>
                </div>
                {adminLoginError && <p className="text-sm text-red-500">{adminLoginError}</p>}
                <button
                  type="submit"
                  disabled={adminLoginLoading}
                  className="inline-flex items-center justify-center w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {adminLoginLoading ? "Verifying..." : "Admin Sign In"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    { label: "Total Businesses", value: analytics?.totalBusinesses ?? 0, icon: Building2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Approved Listings", value: (analytics as any)?.approvedBusinesses ?? 0, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Registered Users", value: (analytics as any)?.totalUsers ?? 0, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "Total Visitors", value: (analytics as any)?.totalViews ?? 0, icon: Eye, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "Total Enquiries", value: analytics?.totalEnquiries ?? 0, icon: MessageSquare, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "Total Reviews", value: analytics?.totalReviews ?? 0, icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Premium", value: analytics?.premiumBusinesses ?? 0, icon: Crown, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "Verified", value: analytics?.verifiedBusinesses ?? 0, icon: ShieldCheck, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
    { label: "Pending", value: analytics?.pendingBusinesses ?? 0, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    { label: "Blog Posts", value: analytics?.totalBlogPosts ?? 0, icon: FileText, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary hidden sm:block">Hasanpur Connect</span>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm font-semibold text-foreground">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">View Site</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => { logout(); setLocation("/"); }}>
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {statCards.map(s => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className={`p-3 flex flex-col items-center text-center rounded-lg ${s.bg}`}>
                <s.icon className={`w-5 h-5 mb-1 ${s.color}`} />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="businesses" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-9">
              <TabsTrigger value="businesses" className="text-xs px-3"><Building2 className="w-3 h-3 mr-1" />Businesses</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs px-3"><Star className="w-3 h-3 mr-1" />Reviews</TabsTrigger>
              <TabsTrigger value="enquiries" className="text-xs px-3"><Inbox className="w-3 h-3 mr-1" />Enquiries</TabsTrigger>
              <TabsTrigger value="blog" className="text-xs px-3"><BookOpen className="w-3 h-3 mr-1" />Blog</TabsTrigger>
              <TabsTrigger value="categories" className="text-xs px-3"><Layers className="w-3 h-3 mr-1" />Categories</TabsTrigger>
              <TabsTrigger value="popups" className="text-xs px-3"><Megaphone className="w-3 h-3 mr-1" />Popups</TabsTrigger>
              <TabsTrigger value="carousel" className="text-xs px-3"><Image className="w-3 h-3 mr-1" />Carousel</TabsTrigger>
              <TabsTrigger value="pages" className="text-xs px-3"><FileText className="w-3 h-3 mr-1" />Pages</TabsTrigger>
              <TabsTrigger value="partners" className="text-xs px-3"><UserCheck className="w-3 h-3 mr-1" />Partners</TabsTrigger>
              <TabsTrigger value="govt" className="text-xs px-3"><Shield className="w-3 h-3 mr-1" />Govt</TabsTrigger>
              <TabsTrigger value="leads" className="text-xs px-3"><Lightbulb className="w-3 h-3 mr-1" />Leads</TabsTrigger>
              <TabsTrigger value="renewals" className="text-xs px-3"><History className="w-3 h-3 mr-1" />Renewals</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs px-3"><AlertCircle className="w-3 h-3 mr-1" />Reports</TabsTrigger>
              <TabsTrigger value="webdev" className="text-xs px-3"><Globe className="w-3 h-3 mr-1" />Web Dev</TabsTrigger>
              <TabsTrigger value="users" className="text-xs px-3"><Users className="w-3 h-3 mr-1" />Users</TabsTrigger>
              <TabsTrigger value="sessions" className="text-xs px-3"><History className="w-3 h-3 mr-1" />Sessions</TabsTrigger>
              <TabsTrigger value="export" className="text-xs px-3"><TrendingUp className="w-3 h-3 mr-1" />Export</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs px-3"><BarChart3 className="w-3 h-3 mr-1" />Analytics</TabsTrigger>
              <TabsTrigger value="products-admin" className="text-xs px-3"><Layers className="w-3 h-3 mr-1" />Products</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs px-3"><Settings className="w-3 h-3 mr-1" />Settings</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs px-3 relative">
                <Bell className="w-3 h-3 mr-1" />Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="support" className="text-xs px-3"><Inbox className="w-3 h-3 mr-1" />Support</TabsTrigger>
              <TabsTrigger value="announcements" className="text-xs px-3"><Megaphone className="w-3 h-3 mr-1" />Announce</TabsTrigger>
              <TabsTrigger value="reactivation" className="text-xs px-3"><RefreshCw className="w-3 h-3 mr-1" />Reactivation</TabsTrigger>
              <TabsTrigger value="pending-edits" className="text-xs px-3"><Pencil className="w-3 h-3 mr-1" />Edits</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="businesses"><BusinessesTab /></TabsContent>
          <TabsContent value="reviews"><ReviewsTab /></TabsContent>
          <TabsContent value="enquiries"><EnquiriesTab /></TabsContent>
          <TabsContent value="blog"><BlogTab /></TabsContent>
          <TabsContent value="categories"><CategoriesTab /></TabsContent>
          <TabsContent value="popups"><PopupsTab /></TabsContent>
          <TabsContent value="carousel"><CarouselTab /></TabsContent>
          <TabsContent value="pages"><CustomPagesTab /></TabsContent>
          <TabsContent value="partners"><CommunityPartnersTab /></TabsContent>
          <TabsContent value="govt"><GovernmentContactsTab /></TabsContent>
          <TabsContent value="leads"><LeadsTab /></TabsContent>
          <TabsContent value="renewals"><RenewalsTab /></TabsContent>
          <TabsContent value="reports"><BusinessReportsTab /></TabsContent>
          <TabsContent value="export"><ExportTab /></TabsContent>
          <TabsContent value="webdev"><WebDevTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="sessions"><SessionsTab /></TabsContent>
          <TabsContent value="analytics"><AnalyticsTab analytics={analytics} /></TabsContent>
          <TabsContent value="products-admin"><ProductsAdminTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
          <TabsContent value="notifications"><NotificationsTab onRead={() => setUnreadCount(0)} /></TabsContent>
          <TabsContent value="support"><SupportTicketsTab /></TabsContent>
          <TabsContent value="announcements"><AnnouncementsTab /></TabsContent>
          <TabsContent value="reactivation"><ReactivationTab /></TabsContent>
          <TabsContent value="pending-edits"><PendingEditsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    suspended: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
    published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    draft: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
}

function BusinessesTab() {
  const { toast } = useToast();
  const headers = useAdminToken();
  const { data: businessList, refetch } = useListBusinesses({ status: "all", limit: 200 } as any);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<Record<number, boolean>>({});
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);
  const [editHistory, setEditHistory] = useState<Record<number, any[]>>({});
  const [editingBusiness, setEditingBusiness] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editBusy, setEditBusy] = useState(false);

  const openEdit = (b: any) => {
    setEditingBusiness(b);
    setEditForm({
      name: b.name ?? "",
      address: b.address ?? "",
      landmark: b.landmark ?? "",
      phone: b.phone ?? "",
      alternatePhone: b.alternatePhone ?? "",
      whatsapp: b.whatsapp ?? "",
      email: b.email ?? "",
      website: b.website ?? "",
      ownerName: b.ownerName ?? "",
      ownerEmail: b.ownerEmail ?? "",
      ownerPhone: b.ownerPhone ?? "",
      description: b.description ?? "",
      establishmentYear: b.establishmentYear ?? "",
      gstNumber: b.gstNumber ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editingBusiness) return;
    setEditBusy(true);
    try {
      const res = await fetch(`${BASE}/api/businesses/${editingBusiness.id}/admin-edit`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      toast({ title: "Business updated" });
      setEditingBusiness(null);
      refetch();
    } catch (e: any) {
      toast({ title: "Failed: " + e.message, variant: "destructive" });
    } finally {
      setEditBusy(false);
    }
  };

  const loadEditHistory = async (id: number) => {
    if (expandedHistory === id) { setExpandedHistory(null); return; }
    try {
      const res = await fetch(`${BASE}/api/businesses/${id}/edit-history`, { headers });
      if (res.ok) { const data = await res.json(); setEditHistory(p => ({ ...p, [id]: data })); }
    } catch {}
    setExpandedHistory(id);
  };

  const all = businessList?.businesses || [];
  const filtered = all
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()) || String(b.id).includes(search));

  const patch = async (id: number, data: Record<string, unknown>) => {
    setBusy(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${BASE}/api/businesses/${id}/status`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      refetch();
    } catch (e: any) {
      toast({ title: "Failed: " + e.message, variant: "destructive" });
    } finally {
      setBusy(p => ({ ...p, [id]: false }));
    }
  };

  const handleStatus = (id: number, status: string) => patch(id, { status });

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${BASE}/api/businesses/${id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({ title: "Business deleted" });
      refetch();
    } catch (e: any) {
      toast({ title: "Failed to delete: " + e.message, variant: "destructive" });
    } finally {
      setBusy(p => ({ ...p, [id]: false }));
    }
  };

  return (
    <>
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Input placeholder="Search businesses..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs h-8 text-sm" />
        <div className="flex gap-1.5 flex-wrap">
          {["all", "pending", "approved", "rejected", "suspended"].map(s => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="h-7 text-xs capitalize px-3">
              {s} {s === "pending" && all.filter(b => b.status === "pending").length > 0 && <span className="ml-1 bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{all.filter(b => b.status === "pending").length}</span>}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">{filtered.length} businesses</div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm">No businesses found</p>}
        {filtered.map(b => {
          const loading = busy[b.id];
          return (
            <Card key={b.id} className={`border-0 shadow-sm ${b.status === "pending" ? "border-l-4 border-l-amber-400" : ""}`}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  {/* Info row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{b.name}</span>
                        <StatusBadge status={b.status} />
                        {b.isPremium && <span className="flex items-center gap-1 text-xs text-amber-600 font-medium"><Crown className="w-3 h-3" />Premium</span>}
                        {b.isVerified && <span className="flex items-center gap-1 text-xs text-blue-600 font-medium"><ShieldCheck className="w-3 h-3" />Verified</span>}
                        {(b as any).isFeatured && <span className="flex items-center gap-1 text-xs text-purple-600 font-medium"><Bookmark className="w-3 h-3" />Featured</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{b.categoryName} • {b.address}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {b.averageRating ? <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-current text-amber-500" />{b.averageRating.toFixed(1)} ({b.reviewCount})</span> : null}
                        <span className="font-mono text-muted-foreground/60">HC-{String(b.id).padStart(6, "0")}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{b.viewCount ?? 0} views</span>
                      </div>
                    </div>
                  </div>

                  {/* PRIMARY ACTIONS — first row: Approve/Reject/Re-approve/Suspend + View + Delete */}
                  <div className="flex flex-wrap gap-1.5">
                    {b.status === "pending" && (
                      <Button size="sm" disabled={loading} className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs px-3" onClick={() => handleStatus(b.id, "approved")}>
                        <Check className="w-3 h-3 mr-1" />Approve
                      </Button>
                    )}
                    {b.status === "pending" && (
                      <Button size="sm" disabled={loading} variant="outline" className="h-7 text-xs px-3 text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleStatus(b.id, "rejected")}>
                        <X className="w-3 h-3 mr-1" />Reject
                      </Button>
                    )}
                    {(b.status === "rejected" || b.status === "suspended") && (
                      <Button size="sm" disabled={loading} className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs px-3" onClick={() => handleStatus(b.id, "approved")}>
                        <Check className="w-3 h-3 mr-1" />Re-approve
                      </Button>
                    )}
                    {b.status === "approved" && (
                      <Button size="sm" disabled={loading} variant="outline" className="h-7 text-xs px-3 text-orange-500 border-orange-200 hover:bg-orange-50" onClick={() => handleStatus(b.id, "suspended")}>
                        Suspend
                      </Button>
                    )}
                    <Link href={`/business/${b.slug}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs px-3">
                        <Eye className="w-3 h-3 mr-1" />{b.status === "approved" ? "View" : "Preview"}
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => openEdit(b)}>
                      <Edit2 className="w-3 h-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" disabled={loading} variant="ghost" className="h-7 px-3 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleDelete(b.id, b.name)}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
                    </Button>
                  </div>

                  {/* SECONDARY ACTIONS — second row: Premium / Verify / Feature */}
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" disabled={loading} variant="outline" className={`h-7 text-xs px-2.5 ${b.isPremium ? "border-amber-400 text-amber-600 bg-amber-50" : ""}`}
                      onClick={() => patch(b.id, { status: b.status, isPremium: !b.isPremium })}>
                      <Crown className="w-3 h-3 mr-1" />{b.isPremium ? "Remove Premium" : "Set Premium"}
                    </Button>
                    <Button size="sm" disabled={loading} variant="outline" className={`h-7 text-xs px-2.5 ${b.isVerified ? "border-blue-400 text-blue-600 bg-blue-50" : ""}`}
                      onClick={() => patch(b.id, { status: b.status, isVerified: !b.isVerified })}>
                      <ShieldCheck className="w-3 h-3 mr-1" />{b.isVerified ? "Unverify" : "Verify"}
                    </Button>
                    <Button size="sm" disabled={loading} variant="outline" className={`h-7 text-xs px-2.5 ${(b as any).isFeatured ? "border-purple-400 text-purple-600 bg-purple-50" : ""}`}
                      onClick={() => patch(b.id, { status: b.status, isFeatured: !(b as any).isFeatured })}>
                      <Bookmark className="w-3 h-3 mr-1" />{(b as any).isFeatured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2.5 text-muted-foreground"
                      onClick={() => loadEditHistory(b.id)}>
                      <History className="w-3 h-3 mr-1" />Edit History
                    </Button>
                  </div>
                  {expandedHistory === b.id && (
                    <div className="mt-2 border rounded-lg p-3 bg-slate-50 dark:bg-slate-900/40 text-xs space-y-2">
                      <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Edit History</p>
                      {(editHistory[b.id] ?? []).length === 0
                        ? <p className="text-muted-foreground">No edits recorded yet.</p>
                        : (editHistory[b.id] ?? []).map((h: any) => (
                          <div key={h.id} className="border-b pb-1.5 last:border-0 last:pb-0">
                            <span className="text-muted-foreground">{new Date(h.createdAt).toLocaleString("en-IN")}</span>
                            <span className="mx-1.5 text-muted-foreground">·</span>
                            <span>{h.editedBy}</span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>

    {/* Admin Edit Business Dialog */}
    {editingBusiness && (
      <Dialog open={!!editingBusiness} onOpenChange={(o) => !o && setEditingBusiness(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />Edit Business — {editingBusiness.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded px-3 py-2">
              Admin edits apply immediately without resetting listing status.
            </p>
            {[
              { key: "name", label: "Business Name" },
              { key: "address", label: "Address" },
              { key: "landmark", label: "Landmark" },
              { key: "phone", label: "Phone" },
              { key: "alternatePhone", label: "Alternate Phone" },
              { key: "whatsapp", label: "WhatsApp" },
              { key: "email", label: "Business Email" },
              { key: "website", label: "Website" },
              { key: "ownerName", label: "Owner Name" },
              { key: "ownerEmail", label: "Owner Email" },
              { key: "ownerPhone", label: "Owner Phone" },
              { key: "establishmentYear", label: "Est. Year" },
              { key: "gstNumber", label: "GST Number" },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  value={editForm[key] ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                  className="h-8 text-sm mt-0.5"
                />
              </div>
            ))}
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={editForm.description ?? ""}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                className="text-sm mt-0.5"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" disabled={editBusy} onClick={saveEdit}>
                {editBusy ? "Saving…" : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditingBusiness(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}

function CategoriesTab() {
  const { toast } = useToast();
  const { data: categories, refetch } = useListCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "Building" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory.mutateAsync({ data: form });
      toast({ title: "Category created!" });
      setForm({ name: "", slug: "", description: "", icon: "Building" });
      setDialogOpen(false);
      refetch();
    } catch { toast({ title: "Failed to create", variant: "destructive" }); }
  };

  const handleToggleFeatured = async (id: number, current: boolean) => {
    try {
      await updateCategory.mutateAsync({ id, data: { isFeatured: !current } as any });
      toast({ title: current ? "Removed from featured" : "Marked as Featured" });
      refetch();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteCategory.mutateAsync({ id });
      toast({ title: "Category deleted" });
      refetch();
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{categories?.length ?? 0} categories</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8"><Plus className="w-3.5 h-3.5 mr-1.5" />Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <Label className="text-xs">Name *</Label>
                <Input className="mt-1 h-8" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }))} required />
              </div>
              <div>
                <Label className="text-xs">Slug *</Label>
                <Input className="mt-1 h-8" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input className="mt-1 h-8" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Icon (Lucide name)</Label>
                <Input className="mt-1 h-8" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="e.g. Building, Stethoscope, Utensils" />
              </div>
              <Button type="submit" className="w-full" disabled={createCategory.isPending}>
                {createCategory.isPending ? "Creating..." : "Create Category"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {categories?.map(cat => (
          <Card key={cat.id} className={`border-0 shadow-sm ${(cat as any).isFeatured ? "ring-2 ring-purple-400/40" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-semibold text-sm">{cat.name}</p>
                    {(cat as any).isFeatured && <span className="text-xs text-purple-600 font-medium">★ Featured</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.businessCount} businesses • /{cat.slug}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-7 text-xs flex-1 ${(cat as any).isFeatured ? "border-purple-400 text-purple-600" : ""}`}
                  onClick={() => handleToggleFeatured(cat.id, !!(cat as any).isFeatured)}
                >
                  <Bookmark className="w-3 h-3 mr-1" />{(cat as any).isFeatured ? "Unfeature" : "Feature"}
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cat.id, cat.name)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PopupsTab() {
  const { toast } = useToast();
  const { data: popups, refetch } = useListAllPopups();
  const createPopup = useCreatePopup();
  const updatePopup = useUpdatePopup();
  const deletePopup = useDeletePopup();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const emptyForm = { title: "", description: "", type: "promotional", imageUrl: "", buttonText: "", buttonUrl: "", bgColor: "#ffffff", isEnabled: true, scheduleStart: "", scheduleEnd: "" };
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      type: p.type || "promotional",
      imageUrl: p.imageUrl || "",
      buttonText: p.buttonText || "",
      buttonUrl: p.buttonUrl || "",
      bgColor: p.bgColor || "#ffffff",
      isEnabled: !!p.isEnabled,
      scheduleStart: p.scheduleStart || "",
      scheduleEnd: p.scheduleEnd || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      scheduleStart: form.scheduleStart || null,
      scheduleEnd: form.scheduleEnd || null,
    };
    try {
      if (editingId) {
        await updatePopup.mutateAsync({ id: editingId, data: payload as any });
        toast({ title: "Popup updated!" });
      } else {
        await createPopup.mutateAsync({ data: payload as any });
        toast({ title: "Popup created!" });
      }
      setForm(emptyForm);
      setEditingId(null);
      setDialogOpen(false);
      refetch();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete popup "${title}"?`)) return;
    try {
      await deletePopup.mutateAsync({ id });
      toast({ title: "Popup deleted" });
      refetch();
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  const handleToggle = async (p: any) => {
    try {
      await updatePopup.mutateAsync({ id: p.id, data: { ...p, isEnabled: !p.isEnabled } });
      toast({ title: p.isEnabled ? "Popup disabled" : "Popup enabled" });
      refetch();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  const typeOptions = ["promotional", "offer", "business_registration", "webdev", "announcement"];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Popup Management</p>
          <p className="text-xs text-muted-foreground">Create and manage promotional popups shown to visitors</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8"><Plus className="w-3.5 h-3.5 mr-1.5" />New Popup</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Edit Popup" : "Create Popup"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 mt-2">
              <div>
                <Label className="text-xs">Title *</Label>
                <Input className="mt-1 h-8" value={form.title} onChange={setF("title")} required placeholder="e.g. Special Offer This Week!" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea className="mt-1 text-sm" rows={3} value={form.description} onChange={setF("description")} placeholder="Brief description of the offer or announcement..." />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <ImageUpload label="Popup Image" placeholder="Upload popup image (max 5MB)" value={form.imageUrl} onChange={url => setForm(p => ({ ...p, imageUrl: url }))} />
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Button Text</Label><Input className="mt-1 h-8" value={form.buttonText} onChange={setF("buttonText")} placeholder="Learn More" /></div>
                <div><Label className="text-xs">Button URL</Label><Input className="mt-1 h-8" value={form.buttonUrl} onChange={setF("buttonUrl")} placeholder="https://..." /></div>
              </div>
              <div>
                <Label className="text-xs">Background Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={form.bgColor} onChange={e => setForm(p => ({ ...p, bgColor: e.target.value }))} className="h-8 w-12 rounded border cursor-pointer" />
                  <Input className="h-8 flex-1 text-sm" value={form.bgColor} onChange={setF("bgColor")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Schedule Start</Label><Input className="mt-1 h-8" type="datetime-local" value={form.scheduleStart} onChange={setF("scheduleStart")} /></div>
                <div><Label className="text-xs">Schedule End</Label><Input className="mt-1 h-8" type="datetime-local" value={form.scheduleEnd} onChange={setF("scheduleEnd")} /></div>
              </div>
              <div className="flex items-center gap-3 py-1">
                <Switch checked={form.isEnabled} onCheckedChange={v => setForm(p => ({ ...p, isEnabled: v }))} />
                <Label className="text-sm">Enable this popup</Label>
              </div>
              <Button type="submit" className="w-full" disabled={createPopup.isPending || updatePopup.isPending}>
                {createPopup.isPending || updatePopup.isPending ? "Saving..." : editingId ? "Update Popup" : "Create Popup"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!popups?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No popups created yet</p>
          <p className="text-xs mt-1">Create a popup to show visitors promotions, offers, or announcements</p>
        </div>
      ) : (
        <div className="space-y-2">
          {popups.map((p: any) => (
            <Card key={p.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt={p.title} className="w-14 h-14 rounded-lg object-cover shrink-0 border" />
                  )}
                  {!p.imageUrl && (
                    <div className="w-14 h-14 rounded-lg shrink-0 border flex items-center justify-center" style={{ backgroundColor: p.bgColor || "#f0f0f0" }}>
                      <Megaphone className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm">{p.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isEnabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {p.isEnabled ? "Active" : "Disabled"}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs capitalize">{p.type?.replace(/_/g, " ")}</span>
                    </div>
                    {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                    {(p.scheduleStart || p.scheduleEnd) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {p.scheduleStart && `From ${new Date(p.scheduleStart).toLocaleDateString("en-IN")}`}
                        {p.scheduleEnd && ` to ${new Date(p.scheduleEnd).toLocaleDateString("en-IN")}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch checked={!!p.isEnabled} onCheckedChange={() => handleToggle(p)} />
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => openEdit(p)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id, p.title)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsTab() {
  const { toast } = useToast();
  const { data: reviews, refetch } = useListReviews({});
  const updateStatus = useUpdateReviewStatus();
  const deleteReview = useDeleteReview();
  const [filter, setFilter] = useState("pending");
  const [bizSearch, setBizSearch] = useState("");

  const filtered = (reviews || []).filter(r => {
    const statusMatch = filter === "all" || r.status === filter;
    const bizMatch = !bizSearch.trim() || (() => {
      const q = bizSearch.trim().replace(/^hc-0*/i, "");
      return String(r.businessId) === q;
    })();
    return statusMatch && bizMatch;
  });

  const handleStatus = async (id: number, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, data: { status } });
      toast({ title: `Review ${status}` });
      refetch();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview.mutateAsync({ id });
      toast({ title: "Review deleted" });
      refetch();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  const pendingCount = (reviews || []).filter(r => r.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          className="h-8 text-sm max-w-xs"
          placeholder="Search by Business ID (e.g. HC-000001 or 1)"
          value={bizSearch}
          onChange={e => setBizSearch(e.target.value)}
        />
        {bizSearch && <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setBizSearch("")}>Clear</Button>}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {["pending", "approved", "rejected", "all"].map(s => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="h-7 text-xs capitalize px-3">
            {s} {s === "pending" && pendingCount > 0 && <span className="ml-1 bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{pendingCount}</span>}
          </Button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">{filtered.length} reviews</div>
      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm">No reviews found</p>}
        {filtered.map(r => (
          <Card key={r.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{r.reviewerName}</span>
                    <StatusBadge status={r.status} />
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-current" : "opacity-20"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.content}</p>
                  <p className="text-xs text-muted-foreground/60">Business ID: HC-{String(r.businessId).padStart(6, "0")} • {new Date(r.createdAt ?? "").toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {r.status !== "approved" && (
                    <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs px-2" onClick={() => handleStatus(r.id, "approved")}>
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  {r.status !== "rejected" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-red-500 border-red-200" onClick={() => handleStatus(r.id, "rejected")}>
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BlogTab() {
  const { toast } = useToast();
  const { data, refetch } = useListBlogPosts({ limit: 50 });
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", category: "", status: "draft" as "draft" | "published", coverImageUrl: "" });

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost.mutateAsync({ data: form });
      toast({ title: "Post created!" });
      setForm({ title: "", content: "", excerpt: "", category: "", status: "draft", coverImageUrl: "" });
      setDialogOpen(false);
      refetch();
    } catch { toast({ title: "Failed to create", variant: "destructive" }); }
  };

  const handleToggleStatus = async (post: { id: number; status: string; title: string; slug: string; content?: string | null }) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      await updatePost.mutateAsync({ id: post.id, data: { title: post.title, content: post.content ?? "", status: newStatus } });
      toast({ title: `Post ${newStatus}` });
      refetch();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deletePost.mutateAsync({ id });
      toast({ title: "Post deleted" });
      refetch();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  const posts = data?.posts || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">{posts.length} posts</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8"><Plus className="w-3.5 h-3.5 mr-1.5" />New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Blog Post</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <Label className="text-xs">Title *</Label>
                <Input className="mt-1 h-8" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Input className="mt-1 h-8" value={form.category} onChange={setF("category")} placeholder="e.g. Business Guide" />
              </div>
              <ImageUpload label="Cover Image" placeholder="Upload cover image (max 5MB)" value={form.coverImageUrl} onChange={url => setForm(p => ({ ...p, coverImageUrl: url }))} />
              <div>
                <Label className="text-xs">Excerpt</Label>
                <Textarea className="mt-1" rows={2} value={form.excerpt} onChange={setF("excerpt")} placeholder="Short summary..." />
              </div>
              <div>
                <Label className="text-xs">Content *</Label>
                <Textarea className="mt-1" rows={8} value={form.content} onChange={setF("content")} required placeholder="Full article content..." />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as "draft" | "published" }))}>
                  <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createPost.isPending}>{createPost.isPending ? "Creating..." : "Create Post"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {posts.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm">No blog posts yet</p>}
        {posts.map(p => (
          <Card key={p.id} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm truncate">{p.title}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-xs text-muted-foreground">{p.category} • {new Date(p.createdAt ?? "").toLocaleDateString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link href={`/blog/${p.slug}`}>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                </Link>
                <Button size="sm" variant="outline" className="h-7 text-xs px-2.5" onClick={() => handleToggleStatus(p)}>
                  {p.status === "published" ? "Unpublish" : "Publish"}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id, p.title)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EnquiriesTab() {
  const { data: enquiries } = useListEnquiries({});
  const [bizSearch, setBizSearch] = useState("");
  const filtered = (enquiries || []).filter(e => {
    if (!bizSearch.trim()) return true;
    const q = bizSearch.trim().replace(/^hc-0*/i, "");
    return String(e.businessId) === q;
  });
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          className="h-8 text-sm max-w-xs"
          placeholder="Search by Business ID (e.g. HC-000001 or 1)"
          value={bizSearch}
          onChange={e => setBizSearch(e.target.value)}
        />
        {bizSearch && <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setBizSearch("")}>Clear</Button>}
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} of {enquiries?.length || 0} enquiries</p>
      {!filtered.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">{bizSearch ? "No matches for that Business ID" : "No enquiries yet"}</p>
        </div>
      ) : filtered.map(e => (
        <Card key={e.id} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-sm">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.phone}{e.email && ` • ${e.email}`}</p>
                {e.message && <p className="text-sm mt-1">{e.message}</p>}
                <p className="text-xs text-muted-foreground/60">Business ID: HC-{String(e.businessId).padStart(6, "0")}</p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0">{new Date(e.createdAt ?? "").toLocaleDateString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WebDevTab() {
  const { data: leads } = useListWebDevEnquiries();
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{leads?.length || 0} web dev leads</p>
      {!leads?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No web dev enquiries yet</p>
        </div>
      ) : leads.map(l => (
        <Card key={l.id} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-sm">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.phone}</p>
                {l.businessType && <p className="text-xs">Type: {l.businessType}</p>}
                {l.message && <p className="text-sm mt-1">{l.message}</p>}
              </div>
              <p className="text-xs text-muted-foreground shrink-0">{new Date(l.createdAt ?? "").toLocaleDateString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersTab() {
  const { toast } = useToast();
  const headers = useAdminToken();
  const { data: users, refetch } = useListUsers();
  const updateRole = useUpdateUserRole();
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPass, setResetPass] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This will also delete their businesses and related data.`)) return;
    try {
      const res = await fetch(`${BASE}/api/admin/users/${id}?hard=true`, {
        method: "DELETE",
        headers: { ...headers },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to delete");
      }
      toast({ title: "User deleted" });
      refetch();
    } catch (e) {
      toast({ title: "Failed to delete", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleResetPassword = async () => {
    if (!resetUserId || resetPass.length < 6) return;
    setResetLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/users/${resetUserId}/reset-password`, {
        method: "PATCH",
        headers: { ...headers },
        body: JSON.stringify({ password: resetPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({ title: "Password reset successfully" });
      setResetUserId(null);
      setResetPass("");
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{users?.length || 0} registered users</p>
      {!users?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No users yet</p>
        </div>
      ) : users.map(u => (
        <Card key={u.id} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-0.5">
              <p className="font-semibold text-sm">{u.name || u.email}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={u.role} />
              <Select value={u.role} onValueChange={async val => {
                try {
                  await updateRole.mutateAsync({ id: String(u.id), data: { role: val } });
                  toast({ title: "Role updated" });
                  refetch();
                } catch { toast({ title: "Failed", variant: "destructive" }); }
              }}>
                <SelectTrigger className="w-36 h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="business_owner">Business Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setResetUserId(String(u.id)); setResetPass(""); }}>
                <Key className="w-3 h-3" /> Reset Password
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUser(String(u.id), u.name || u.email)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!resetUserId} onOpenChange={open => { if (!open) { setResetUserId(null); setResetPass(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="reset-new-pass">New Password</Label>
              <Input
                id="reset-new-pass"
                type="text"
                className="mt-1"
                placeholder="Min. 6 characters"
                value={resetPass}
                onChange={e => setResetPass(e.target.value)}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">Share this with the user so they can log in.</p>
            </div>
            <Button className="w-full" onClick={handleResetPassword} disabled={resetLoading || resetPass.length < 6}>
              {resetLoading ? "Saving..." : "Set New Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnalyticsTab({ analytics }: { analytics: any }) {
  const headers = useAdminToken();
  const [dateRange, setDateRange] = useState("this_week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [advanced, setAdvanced] = useState<any>(null);
  const [loadingAdv, setLoadingAdv] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const loadAdvanced = () => {
    setLoadingAdv(true);
    const params = (dateRange === "custom" && customFrom && customTo)
      ? `from=${customFrom}&to=${customTo}`
      : `range=${dateRange}`;
    fetch(`${BASE}/api/analytics/advanced?${params}`, { headers })
      .then(r => r.json())
      .then(setAdvanced)
      .catch(() => {})
      .finally(() => setLoadingAdv(false));
  };

  useEffect(() => { loadAdvanced(); }, [dateRange]);

  const RANGE_OPTS = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "this_week", label: "This Week" },
    { key: "last_week", label: "Last Week" },
    { key: "this_month", label: "This Month" },
    { key: "last_month", label: "Last Month" },
    { key: "custom", label: "Custom" },
  ];
  const DEVICE_COLORS = ["#ea5c29", "#3b82f6", "#10b981", "#8b5cf6"];
  const SECTIONS = ["overview", "traffic", "devices", "search", "businesses", "categories"];

  return (
    <div className="space-y-5">
      {/* Date Range Selector */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Range:</span>
            {RANGE_OPTS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setDateRange(opt.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${dateRange === opt.key ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
              >
                {opt.label}
              </button>
            ))}
            {dateRange === "custom" && (
              <div className="flex items-center gap-2 mt-2 w-full">
                <Input type="date" className="h-7 text-xs w-36" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                <span className="text-xs text-muted-foreground">to</span>
                <Input type="date" className="h-7 text-xs w-36" value={customTo} onChange={e => setCustomTo(e.target.value)} />
                <Button size="sm" className="h-7 text-xs" onClick={loadAdvanced} disabled={!customFrom || !customTo}>Apply</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors border ${activeSection === s ? "bg-foreground text-background border-foreground" : "bg-background border-border text-muted-foreground hover:border-foreground/40"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loadingAdv && <p className="text-sm text-muted-foreground animate-pulse">Loading analytics…</p>}

      {/* OVERVIEW */}
      {activeSection === "overview" && (
        <div className="space-y-5">
          {/* Platform summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Businesses", value: analytics?.totalBusinesses ?? 0, icon: Building2, color: "text-blue-500" },
              { label: "Approved Listings", value: analytics?.approvedBusinesses ?? 0, icon: CheckCircle, color: "text-emerald-500" },
              { label: "Registered Users", value: analytics?.totalUsers ?? 0, icon: Users, color: "text-indigo-500" },
              { label: "Premium Listings", value: analytics?.premiumBusinesses ?? 0, icon: Crown, color: "text-orange-500" },
              { label: "Total Reviews", value: analytics?.totalReviews ?? 0, icon: Star, color: "text-amber-500" },
              { label: "Total Enquiries", value: analytics?.totalEnquiries ?? 0, icon: MessageSquare, color: "text-green-500" },
              { label: "WhatsApp Clicks", value: analytics?.whatsappClicks ?? 0, icon: MessageSquare, color: "text-emerald-600" },
              { label: "Call Clicks", value: analytics?.callClicks ?? 0, icon: Phone, color: "text-blue-500" },
              { label: "Total Leads", value: analytics?.totalLeads ?? 0, icon: Users, color: "text-violet-500" },
              { label: "Pending Approval", value: analytics?.pendingBusinesses ?? 0, icon: Clock, color: "text-yellow-500" },
            ].map(item => (
              <Card key={item.label} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50"><item.icon className={`w-5 h-5 ${item.color}`} /></div>
                  <div><p className="text-lg font-bold">{item.value.toLocaleString()}</p><p className="text-[11px] text-muted-foreground">{item.label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Traffic summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Today's Views", value: advanced?.trafficSummary?.today ?? 0 },
              { label: "This Week", value: advanced?.trafficSummary?.thisWeek ?? 0 },
              { label: "This Month", value: advanced?.trafficSummary?.thisMonth ?? 0 },
              { label: "All Time", value: advanced?.trafficSummary?.total ?? 0 },
            ].map(item => (
              <Card key={item.label} className="border-0 shadow-sm bg-primary/5">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{item.value.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Fastest Growing */}
          {(advanced?.fastestGrowing?.length ?? 0) > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" />Fastest Growing Businesses (Week-over-Week)</CardTitle></CardHeader>
              <CardContent className="divide-y">
                {advanced.fastestGrowing.map((b: any, i: number) => (
                  <div key={b.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4 font-bold">#{i + 1}</span>
                      <span className="text-sm font-medium">{b.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">{b.prevWeek}→{b.currentWeek} views</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${b.growth >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {b.growth >= 0 ? "+" : ""}{b.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TRAFFIC */}
      {activeSection === "traffic" && (
        <div className="space-y-5">
          {/* Daily visitors chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Daily Page Views</CardTitle></CardHeader>
            <CardContent>
              {(advanced?.dailyVisits?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No page view data for this range.</p>
              ) : (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={advanced?.dailyVisits || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea5c29" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ea5c29" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                      <RechartsTooltip content={({ active, payload }) => active && payload?.length ? (
                        <div className="bg-popover border rounded-lg px-3 py-1.5 text-xs shadow"><p className="text-primary font-bold">{payload[0].value} views</p></div>
                      ) : null} />
                      <Area type="monotone" dataKey="views" stroke="#ea5c29" strokeWidth={2} fillOpacity={1} fill="url(#gViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Peak Traffic Hours (0–23)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advanced?.peakHours || []} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={6} tick={{ fontSize: 10 }} interval={2} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
                    <RechartsTooltip content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-popover border rounded-lg px-3 py-1.5 text-xs shadow"><p className="font-bold">{payload[0].payload.hour}: {payload[0].value} views</p></div>
                    ) : null} />
                    <Bar dataKey="count" fill="#ea5c29" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Peak Days */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Peak Traffic Days</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advanced?.peakDays || []} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={6} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
                    <RechartsTooltip content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-popover border rounded-lg px-3 py-1.5 text-xs shadow"><p className="font-bold">{payload[0].payload.day}: {payload[0].value} views</p></div>
                    ) : null} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Pages */}
          {(advanced?.topPages?.length ?? 0) > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Top Pages</CardTitle></CardHeader>
              <CardContent className="divide-y">
                {advanced.topPages.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                    <span className="text-sm font-mono text-muted-foreground truncate max-w-[70%]">{p.path}</span>
                    <span className="text-sm font-bold">{p.count.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* DEVICES */}
      {activeSection === "devices" && (
        <div className="space-y-5">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Device Breakdown</CardTitle></CardHeader>
            <CardContent>
              {(advanced?.deviceBreakdown?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No device data yet. Device info is tracked from page view metadata.</p>
              ) : (
                <>
                  <div className="h-52 w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={advanced.deviceBreakdown} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                        <XAxis dataKey="device" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {advanced.deviceBreakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {advanced.deviceBreakdown.map((d: any, i: number) => {
                      const total = advanced.deviceBreakdown.reduce((s: number, x: any) => s + x.count, 0);
                      const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                      return (
                        <div key={d.device} className="text-center p-3 rounded-lg bg-muted/40">
                          <p className="text-xl font-bold" style={{ color: DEVICE_COLORS[i] }}>{pct}%</p>
                          <p className="text-xs text-muted-foreground">{d.device}</p>
                          <p className="text-xs font-semibold">{d.count.toLocaleString()} visits</p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SEARCH */}
      {activeSection === "search" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Searches", value: advanced?.searchStats?.total ?? 0 },
              { label: "Zero Results", value: advanced?.searchStats?.zeroResults ?? 0 },
              { label: "Success Rate", value: `${advanced?.searchStats?.total > 0 ? Math.round(((advanced.searchStats.total - advanced.searchStats.zeroResults) / advanced.searchStats.total) * 100) : 0}%` },
            ].map(s => (
              <Card key={s.label} className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">🔥 Top Keywords</CardTitle></CardHeader>
              <CardContent className="divide-y">
                {(advanced?.searchStats?.topKeywords ?? []).length === 0
                  ? <p className="text-sm text-muted-foreground py-4 text-center">No search data yet.</p>
                  : advanced.searchStats.topKeywords.map((k: any, i: number) => (
                    <div key={k.query} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                        {k.query}
                      </span>
                      <Badge variant="outline" className="text-xs">{k.count} searches</Badge>
                    </div>
                  ))
                }
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">⚠️ Zero-Result Searches</CardTitle></CardHeader>
              <CardContent className="divide-y">
                {(advanced?.searchStats?.zeroResultKeywords ?? []).length === 0
                  ? <p className="text-sm text-muted-foreground py-4 text-center">No zero-result searches!</p>
                  : advanced.searchStats.zeroResultKeywords.map((k: any, i: number) => (
                    <div key={k.query} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                        {k.query}
                      </span>
                      <Badge className="bg-red-100 text-red-700 border-none text-xs">{k.count}×</Badge>
                    </div>
                  ))
                }
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* BUSINESSES */}
      {activeSection === "businesses" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Most Viewed", key: "mostViewed", metric: "viewCount", label: "views", icon: Eye },
            { title: "Most Enquired", key: "mostEnquired", metric: "count", label: "enquiries", icon: MessageSquare },
            { title: "Most Reviewed", key: "mostReviewed", metric: "count", label: "reviews", icon: Star },
          ].map(({ title, key, metric, label, icon: Icon }) => (
            <Card key={key} className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold flex items-center gap-2"><Icon className="w-4 h-4 text-primary" />{title}</CardTitle></CardHeader>
              <CardContent className="divide-y">
                {(advanced?.businessStats?.[key] ?? []).length === 0
                  ? <p className="text-xs text-muted-foreground py-4 text-center">No data yet.</p>
                  : (advanced?.businessStats?.[key] ?? []).map((b: any, i: number) => (
                    <div key={b.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-muted-foreground shrink-0">#{i + 1}</span>
                        <span className="text-xs font-medium truncate">{b.name}</span>
                      </div>
                      <span className="text-xs font-bold shrink-0 ml-2">{(b[metric] ?? 0).toLocaleString()} {label}</span>
                    </div>
                  ))
                }
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CATEGORIES */}
      {activeSection === "categories" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Category Analytics</CardTitle></CardHeader>
          <CardContent>
            {(advanced?.categoryStats?.length ?? 0) === 0
              ? <p className="text-sm text-muted-foreground py-8 text-center">No category data yet.</p>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        {["Category", "Businesses", "Leads", "Reviews", "Enquiries", "Views"].map(h => (
                          <th key={h} className="text-left py-2 px-2 font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {advanced.categoryStats.sort((a: any, b: any) => b.views - a.views).map((cat: any) => (
                        <tr key={cat.categoryId} className="hover:bg-muted/40 transition-colors">
                          <td className="py-2 px-2 font-medium">{cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.categoryName}</td>
                          <td className="py-2 px-2">{cat.businesses}</td>
                          <td className="py-2 px-2">{cat.leads}</td>
                          <td className="py-2 px-2">{cat.reviews}</td>
                          <td className="py-2 px-2">{cat.enquiries}</td>
                          <td className="py-2 px-2 font-semibold">{cat.views.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SettingsTab() {
  const { toast } = useToast();
  const { data: settings, refetch } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const [localChanges, setLocalChanges] = useState<Record<string, string | boolean>>({});
  const [saving, setSaving] = useState(false);

  const val = (key: string) => {
    if (key in localChanges) return localChanges[key];
    return (settings as any)?.[key] ?? "";
  };
  const setVal = (k: string, v: string | boolean) => setLocalChanges(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const merged = { ...settings, ...localChanges } as any;
      await updateSettings.mutateAsync({ data: merged });
      toast({ title: "Settings saved!" });
      setLocalChanges({});
      refetch();
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (!settings) return <div className="py-10 text-center text-muted-foreground text-sm">Loading settings...</div>;

  const Field = ({ label, k, type = "text", placeholder = "" }: { label: string; k: string; type?: string; placeholder?: string }) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="mt-1 h-8 text-sm" type={type} value={String(val(k))} onChange={e => setVal(k, e.target.value)} placeholder={placeholder} />
    </div>
  );

  const Toggle = ({ label, k, hint }: { label: string; k: string; hint?: string }) => (
    <div className="flex items-start gap-3">
      <Switch checked={Boolean(val(k))} onCheckedChange={v => setVal(k, v)} className="mt-0.5" />
      <div>
        <Label className="text-sm font-medium leading-none">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Site Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Site Name" k="siteName" />
          <Field label="Tagline" k="siteTagline" />
          <Field label="Contact Phone" k="contactPhone" />
          <Field label="Contact Email" k="contactEmail" type="email" />
          <Field label="Webdev Contact Number" k="webdevContactNumber" placeholder="+91 XXXXX XXXXX" />
          <div className="sm:col-span-2"><Field label="Address" k="address" /></div>
          <div>
            <Label className="text-xs">Theme Color (HSL)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input className="h-8 text-sm flex-1" type="text" value={String(val("themeColor") || "28 90% 55%")} onChange={e => setVal("themeColor", e.target.value)} placeholder="28 90% 55%" />
              <input type="color" className="w-8 h-8 rounded border cursor-pointer"
                value={"#" + (String(val("themeColor") || "28 90% 55%").match(/^[0-9a-f]{6}$/i) ? val("themeColor") : "")}
                onChange={() => {}} title="Preview color" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enter HSL values like: <code>28 90% 55%</code></p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Social Media</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Facebook URL" k="facebookUrl" placeholder="https://facebook.com/..." />
          <Field label="Instagram URL" k="instagramUrl" placeholder="https://instagram.com/..." />
          <Field label="WhatsApp Number" k="whatsappNumber" placeholder="+91 XXXXXXXXXX" />
          <Field label="YouTube URL" k="youtubeUrl" placeholder="https://youtube.com/..." />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Megaphone className="w-4 h-4" /> Announcement Banner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle label="Show Announcement Banner" k="announcementEnabled" hint="Displays a bar at the top of every page" />
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={String(val("announcementType") || "text")} onValueChange={v => setVal("announcementType", v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="Announcement Text" k="announcementText" placeholder="e.g. New businesses added! Browse now." />
          <Field label="Image URL (for image type)" k="announcementImage" placeholder="https://example.com/banner.png" />
          <Field label="Link URL (optional)" k="announcementLink" placeholder="https://hasanpurconnect.com/..." />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Background Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={String(val("announcementBgColor") || "#1e40af")} onChange={e => setVal("announcementBgColor", e.target.value)} className="h-8 w-10 rounded border cursor-pointer" />
                <Input className="h-8 text-sm flex-1" value={String(val("announcementBgColor") || "#1e40af")} onChange={e => setVal("announcementBgColor", e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Text Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={String(val("announcementTextColor") || "#ffffff")} onChange={e => setVal("announcementTextColor", e.target.value)} className="h-8 w-10 rounded border cursor-pointer" />
                <Input className="h-8 text-sm flex-1" value={String(val("announcementTextColor") || "#ffffff")} onChange={e => setVal("announcementTextColor", e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-xs">Position</Label>
            <Select value={String(val("announcementPosition") || "top")} onValueChange={v => setVal("announcementPosition", v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top (above header)</SelectItem>
                <SelectItem value="bottom">Bottom (fixed footer)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date (optional)" k="announcementStartDate" type="datetime-local" />
            <Field label="End Date (optional)" k="announcementEndDate" type="datetime-local" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> Marquee / Ticker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle label="Enable Marquee Ticker" k="marqueeEnabled" hint="Scrolling text bar shown below the header" />
          <div>
            <Label className="text-xs">Marquee Text</Label>
            <Textarea className="mt-1 text-sm" value={String(val("marqueeText"))} onChange={e => setVal("marqueeText", e.target.value)} rows={2} placeholder="e.g. Welcome to Hasanpur Connect! Browse 200+ local businesses." />
          </div>
          <div>
            <Label className="text-xs">Scroll Speed</Label>
            <Select value={String(val("marqueeSpeed") || "normal")} onValueChange={v => setVal("marqueeSpeed", v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Developer Credit</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Toggle label="Show Developer Credit in Footer" k="developerCreditEnabled" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Developer Name" k="developerName" placeholder="Your Name / Company" />
            <Field label="Developer Website" k="developerUrl" placeholder="https://yourwebsite.com" type="url" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Toggle label="Open link in new tab" k="developerLinkNewTab" />
            <Toggle label="Add nofollow attribute" k="developerLinkNofollow" />
          </div>
          <Field label="Footer Copyright Text" k="footerText" placeholder={`© ${new Date().getFullYear()} Hasanpur Connect. All Rights Reserved.`} />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Registration OTP Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Toggle
            label="Require OTP Verification for New Registrations"
            k="otpVerificationEnabled"
            hint="When ON: each new user must verify their email with a 6-digit OTP before account is created. When OFF (default): registration completes immediately without any OTP step."
          />
          {Boolean(val("otpVerificationEnabled")) && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">OTP system is currently ON — new registrations require email verification.</p>
            </div>
          )}
          <Separator />
          <div>
            <Label className="text-xs font-semibold">Master Backup OTP</Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">
              This code works as a universal fallback — if a user's email OTP fails to arrive, give them this code privately (e.g. via phone call) and they can use it to complete registration. Admin can change this anytime.
            </p>
            <div className="flex items-center gap-2">
              <Input
                className="mt-1 h-8 text-sm font-mono w-40"
                value={String(val("masterBackupOtp") || "000000")}
                onChange={e => setVal("masterBackupOtp", e.target.value)}
                placeholder="000000"
                maxLength={10}
              />
              <span className="text-xs text-muted-foreground">(Only works when OTP system is ON)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> Listing Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Toggle
            label="Auto-Approve New Listings"
            k="autoApproveListings"
            hint="When ON: new business submissions are instantly approved and go live. When OFF (default): submissions stay pending until manually approved by admin."
          />
          <Separator />
          <Toggle
            label="Auto-Send Warnings"
            k="autoSendWarnings"
            hint="When ON: warnings are automatically sent when a business reaches the report threshold. When OFF: admin sees a prompt and must send manually."
          />
          <Separator />
          <div>
            <Label className="text-xs font-semibold">Premium Upgrade Contact Number</Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">Displayed to free-tier business owners who want to upgrade to Premium.</p>
            <Input
              className="mt-1 h-8 text-sm w-56"
              value={String(val("premiumUpgradeContact") || "")}
              onChange={e => setVal("premiumUpgradeContact", e.target.value)}
              placeholder="+91 XXXXXXXXXX"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-500" /> FAQ Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            label="Enable FAQ Generator on Listings"
            k="faqGeneratorEnabled"
            hint="When ON: business listing pages and the registration form show auto-generated FAQs. When OFF: FAQ section is completely hidden everywhere."
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" /> Site Under Construction (Maintenance Mode)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            label="Enable Maintenance Mode"
            k="maintenanceMode"
            hint="When ON: all public pages show an 'Under Construction' page. Admin panel remains accessible at /admin."
          />
          {Boolean(val("maintenanceMode")) && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">⚠️ Maintenance mode is ON — the public site is showing the Under Construction page.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(localChanges).length > 0 && (
        <div className="sticky bottom-4">
          <Card className="border-primary shadow-lg">
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{Object.keys(localChanges).length} unsaved change(s)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setLocalChanges({})}>Discard</Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {Object.keys(localChanges).length === 0 && (
        <Button onClick={handleSave} className="w-full" disabled={saving}>{saving ? "Saving..." : "Save All Settings"}</Button>
      )}
    </div>
  );
}

function useAdminToken() {
  const { adminToken } = useAuth();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (adminToken) headers["x-admin-token"] = adminToken;
  return headers;
}

function SupportTicketsTab() {
  const { toast } = useToast();
  const headers = useAdminToken();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/support-tickets`, { headers });
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch { toast({ title: "Failed to load tickets", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const update = async (id: number, body: object) => {
    setBusyId(id);
    try {
      await fetch(`${BASE}/api/support-tickets/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      await load();
      toast({ title: "Updated" });
    } catch { toast({ title: "Failed to update", variant: "destructive" }); }
    finally { setBusyId(null); }
  };

  const deleteTicket = async (id: number) => {
    if (!confirm("Delete this ticket?")) return;
    setBusyId(id);
    try {
      await fetch(`${BASE}/api/support-tickets/${id}`, { method: "DELETE", headers });
      setTickets(prev => prev.filter(t => t.id !== id));
      toast({ title: "Deleted" });
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
    finally { setBusyId(null); }
  };

  const filtered = statusFilter === "all" ? tickets : tickets.filter(t => t.status === statusFilter);

  const statusColors: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-slate-100 text-slate-600",
  };

  const priorityColors: Record<string, string> = {
    low: "text-slate-500",
    normal: "text-blue-500",
    high: "text-orange-500",
    urgent: "text-red-600 font-bold",
  };

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading support tickets…</div>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Support Tickets</h2>
          <p className="text-sm text-muted-foreground">{tickets.length} total • {tickets.filter(t => t.status === "open").length} open</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "open", "in_progress", "resolved", "closed"].map(s => (
            <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} className="h-7 text-xs px-2.5 capitalize" onClick={() => setStatusFilter(s)}>
              {s.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>No support tickets found</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(ticket => (
          <Card key={ticket.id} className={`border-0 shadow-sm ${ticket.status === "open" ? "border-l-4 border-l-blue-400" : ticket.priority === "urgent" ? "border-l-4 border-l-red-500" : ""}`}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{ticket.subject}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ticket.status] ?? "bg-muted text-muted-foreground"}`}>{ticket.status.replace("_", " ")}</span>
                    <span className={`text-xs font-medium ${priorityColors[ticket.priority] ?? "text-muted-foreground"}`}>↑ {ticket.priority}</span>
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded capitalize">{ticket.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span className="font-medium text-foreground">{ticket.name}</span>
                    <span>•</span><span>{ticket.email}</span>
                    {ticket.phone && <><span>•</span><span>{ticket.phone}</span></>}
                    <span>•</span><span>{new Date(ticket.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{ticket.message}</p>
                  {ticket.adminNotes && (
                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-300">
                      <strong>Admin Note:</strong> {ticket.adminNotes}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0 min-w-36">
                  <Input
                    placeholder="Admin notes..."
                    className="h-7 text-xs"
                    value={notes[ticket.id] ?? ticket.adminNotes ?? ""}
                    onChange={e => setNotes(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                  />
                  <Select value={ticket.status} onValueChange={v => update(ticket.id, { status: v, adminNotes: notes[ticket.id] ?? ticket.adminNotes ?? undefined })}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={ticket.priority} onValueChange={v => update(ticket.id, { priority: v })}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button size="sm" className="flex-1 h-7 text-xs" disabled={busyId === ticket.id} onClick={() => update(ticket.id, { adminNotes: notes[ticket.id] ?? ticket.adminNotes ?? undefined })}>Save</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" disabled={busyId === ticket.id} onClick={() => deleteTicket(ticket.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CarouselTab() {
  const { toast } = useToast();
  const headers = useAdminToken();
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ imageUrl: "", title: "", subtitle: "", linkUrl: "", sortOrder: 0, isActive: true });
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch(`${BASE}/api/carousel/all`, { headers: { "x-admin-token": headers["x-admin-token"] || "" } });
    setSlides(r.ok ? await r.json() : []);
    setLoading(false);
  };
  useState(() => { load(); });

  const handleSave = async () => {
    const url = editId ? `${BASE}/api/carousel/${editId}` : `${BASE}/api/carousel`;
    const method = editId ? "PUT" : "POST";
    const r = await fetch(url, { method, headers, body: JSON.stringify(form) });
    if (r.ok) { toast({ title: editId ? "Slide updated" : "Slide added" }); setOpen(false); setEditId(null); setForm({ imageUrl: "", title: "", subtitle: "", linkUrl: "", sortOrder: 0, isActive: true }); load(); }
    else toast({ title: "Error", variant: "destructive" });
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE}/api/carousel/${id}`, { method: "DELETE", headers });
    load();
  };

  const handleEdit = (s: any) => {
    setEditId(s.id); setForm({ imageUrl: s.imageUrl || "", title: s.title || "", subtitle: s.subtitle || "", linkUrl: s.linkUrl || "", sortOrder: s.sortOrder || 0, isActive: s.isActive !== false }); setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Carousel Slides</h3>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ imageUrl: "", title: "", subtitle: "", linkUrl: "", sortOrder: 0, isActive: true }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Slide
        </Button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
        <div className="space-y-3">
          {slides.map(s => (
            <Card key={s.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                {s.imageUrl && <img src={s.imageUrl} alt={s.title || ""} className="w-20 h-12 object-cover rounded" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{s.title || <span className="text-muted-foreground italic">No title</span>}</p>
                  {s.subtitle && <p className="text-xs text-muted-foreground truncate">{s.subtitle}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.imageUrl}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Hidden"}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Edit2 className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {slides.length === 0 && <p className="text-center text-muted-foreground py-8">No carousel slides. Add one to display on the homepage.</p>}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Slide" : "Add Slide"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <ImageUpload label="Slide Image" placeholder="Upload slide image (wide banner, max 5MB)" value={form.imageUrl} onChange={url => setForm(p => ({ ...p, imageUrl: url }))} />
            <div><Label className="text-xs">Or paste Image URL</Label><Input className="mt-1" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." /></div>
            <div><Label className="text-xs">Title</Label><Input className="mt-1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label className="text-xs">Subtitle</Label><Input className="mt-1" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
            <div><Label className="text-xs">Link URL</Label><Input className="mt-1" value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} /></div>
            <div className="flex items-center gap-3">
              <div className="flex-1"><Label className="text-xs">Sort Order</Label><Input type="number" className="mt-1" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))} /></div>
              <div className="flex items-center gap-2 mt-4"><Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} /><Label className="text-xs">Active</Label></div>
            </div>
            <Button className="w-full" onClick={handleSave}>{editId ? "Save Changes" : "Add Slide"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomPagesTab() {
  const { toast } = useToast();
  const headers = useAdminToken();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const emptyForm = { title: "", slug: "", content: "", metaTitle: "", metaDescription: "", coverImage: "", galleryImages: [] as string[] };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch(`${BASE}/api/pages/all`, { headers: { "x-admin-token": headers["x-admin-token"] || "" } });
    setPages(r.ok ? await r.json() : []);
    setLoading(false);
  };
  useState(() => { load(); });

  const handleSave = async () => {
    const url = editId ? `${BASE}/api/pages/${editId}` : `${BASE}/api/pages`;
    const galleryAll = form.coverImage
      ? [form.coverImage, ...form.galleryImages.filter(i => i && i !== form.coverImage)]
      : form.galleryImages.filter(Boolean);
    const payload = {
      title: form.title, slug: form.slug, content: form.content,
      metaTitle: form.metaTitle, metaDescription: form.metaDescription,
      coverImage: form.coverImage || null,
      galleryJson: galleryAll.length > 1 ? JSON.stringify(galleryAll) : null,
      status: "published",
    };
    const r = await fetch(url, { method: editId ? "PUT" : "POST", headers, body: JSON.stringify(payload) });
    if (r.ok) { toast({ title: "Saved" }); setOpen(false); setEditId(null); load(); }
    else toast({ title: "Error", variant: "destructive" });
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE}/api/pages/${id}`, { method: "DELETE", headers });
    load();
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    let gallery: string[] = [];
    if (p.galleryJson) { try { gallery = JSON.parse(p.galleryJson).filter((i: string) => i !== p.coverImage); } catch {} }
    setForm({ title: p.title || "", slug: p.slug || "", content: p.content || "", metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "", coverImage: p.coverImage || "", galleryImages: gallery });
    setOpen(true);
  };

  const addGalleryImage = (url: string) => {
    if (!url || form.galleryImages.includes(url)) return;
    setForm(f => ({ ...f, galleryImages: [...f.galleryImages, url] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Custom Pages</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Pages are published instantly and appear in the nav &amp; footer</p>
        </div>
        <Button size="sm" onClick={() => { setEditId(null); setForm(emptyForm); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> New Page
        </Button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
        <div className="space-y-2">
          {pages.map(p => (
            <Card key={p.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {p.coverImage && <img src={p.coverImage} alt={p.title} className="w-10 h-10 rounded object-cover border shrink-0" />}
                  <div>
                    <p className="font-medium text-sm">{p.title}</p>
                    <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">/{p.slug}</a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Edit2 className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pages.length === 0 && <p className="text-center text-muted-foreground py-8">No custom pages yet.</p>}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Page" : "Create Page"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div>
                <Label className="text-xs">Slug * <span className="text-muted-foreground">(URL path)</span></Label>
                <Input className="mt-1" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="e.g. about-us" />
              </div>
            </div>
            <ImageUpload label="Cover / Hero Image" placeholder="Upload cover photo (wide banner)" value={form.coverImage} onChange={url => setForm(p => ({ ...p, coverImage: url }))} />
            {/* Gallery images */}
            <div>
              <Label className="text-xs">Gallery Images <span className="text-muted-foreground">(additional photos shown in a grid)</span></Label>
              <div className="mt-1 space-y-2">
                {form.galleryImages.map((img, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <img src={img} alt="" className="w-14 h-10 rounded object-cover border" />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{img}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm(f => ({ ...f, galleryImages: f.galleryImages.filter((_, j) => j !== i) }))}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                  </div>
                ))}
                <ImageUpload label="" placeholder="Upload gallery photo" value="" onChange={addGalleryImage} />
              </div>
            </div>
            <div><Label className="text-xs">Content (HTML)</Label><Textarea className="mt-1 text-sm font-mono" rows={8} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Meta Title</Label><Input className="mt-1" value={form.metaTitle} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))} /></div>
              <div><Label className="text-xs">Meta Description</Label><Input className="mt-1" value={form.metaDescription} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))} /></div>
            </div>
            <Button className="w-full" onClick={handleSave}>Publish Page</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CommunityPartnersTab() {
  const { toast } = useToast();
  const headers = useAdminToken();
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", about: "", photoUrl: "", badge: "", instagram: "", sortOrder: 0, isActive: true });
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch(`${BASE}/api/community-partners/all`, { headers: { "x-admin-token": headers["x-admin-token"] || "" } });
    setPartners(r.ok ? await r.json() : []);
    setLoading(false);
  };
  useState(() => { load(); });

  const handleSave = async () => {
    const url = editId ? `${BASE}/api/community-partners/${editId}` : `${BASE}/api/community-partners`;
    const { instagram, ...rest } = form;
    const payload = { ...rest, socialLinksJson: JSON.stringify({ instagram }) };
    const r = await fetch(url, { method: editId ? "PUT" : "POST", headers, body: JSON.stringify(payload) });
    if (r.ok) { toast({ title: "Saved" }); setOpen(false); setEditId(null); load(); }
    else toast({ title: "Error", variant: "destructive" });
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE}/api/community-partners/${id}`, { method: "DELETE", headers });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Community Partners</h3>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ name: "", about: "", photoUrl: "", badge: "", instagram: "", sortOrder: 0, isActive: true }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Partner
        </Button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
        <div className="space-y-2">
          {partners.map(p => (
            <Card key={p.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {p.photoUrl ? <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><UserCheck className="w-5 h-5 text-muted-foreground" /></div>}
                  <div><p className="font-medium text-sm">{p.name}</p>{p.badge && <Badge variant="secondary" className="text-xs">{p.badge}</Badge>}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.isActive ? "default" : "secondary"}>{p.isActive ? "Active" : "Hidden"}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => { setEditId(p.id); setForm({ name: p.name, about: p.about || "", photoUrl: p.photoUrl || "", badge: p.badge || "", instagram: (() => { try { return JSON.parse(p.socialLinksJson || "{}").instagram || ""; } catch { return ""; } })(), sortOrder: p.sortOrder || 0, isActive: p.isActive !== false }); setOpen(true); }}><Edit2 className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {partners.length === 0 && <p className="text-center text-muted-foreground py-8">No community partners yet.</p>}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Partner" : "Add Partner"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name *</Label><Input className="mt-1" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label className="text-xs">About</Label><Textarea className="mt-1 text-sm" rows={3} value={form.about} onChange={e => setForm(p => ({ ...p, about: e.target.value }))} /></div>
            <ImageUpload label="Photo" placeholder="Upload partner photo (max 5MB)" value={form.photoUrl} onChange={url => setForm(p => ({ ...p, photoUrl: url }))} />
            <div><Label className="text-xs">Badge</Label><Input className="mt-1" value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} placeholder="e.g. Top Contributor" /></div>
            <div><Label className="text-xs">Instagram URL</Label><Input className="mt-1" value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="https://instagram.com/..." /></div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} /><Label className="text-xs">Active / Visible</Label></div>
            <Button className="w-full" onClick={handleSave}>{editId ? "Save Changes" : "Add Partner"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GovernmentContactsTab() {
  const { toast } = useToast();
  const headers = useAdminToken();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", designation: "", phone: "", sortOrder: 0 });
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch(`${BASE}/api/government-contacts`, { headers: { "x-admin-token": headers["x-admin-token"] || "" } });
    setContacts(r.ok ? await r.json() : []);
    setLoading(false);
  };
  useState(() => { load(); });

  const handleSave = async () => {
    const url = editId ? `${BASE}/api/government-contacts/${editId}` : `${BASE}/api/government-contacts`;
    const r = await fetch(url, { method: editId ? "PUT" : "POST", headers, body: JSON.stringify(form) });
    if (r.ok) { toast({ title: "Saved" }); setOpen(false); setEditId(null); setForm({ name: "", designation: "", phone: "", sortOrder: 0 }); load(); }
    else toast({ title: "Error", variant: "destructive" });
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE}/api/government-contacts/${id}`, { method: "DELETE", headers });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Government Contacts</h3>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ name: "", designation: "", phone: "", sortOrder: 0 }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Contact
        </Button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
        <div className="space-y-2">
          {contacts.map(c => (
            <Card key={c.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.designation} • {c.phone}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditId(c.id); setForm({ name: c.name, designation: c.designation, phone: c.phone, sortOrder: c.sortOrder || 0 }); setOpen(true); }}><Edit2 className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {contacts.length === 0 && <p className="text-center text-muted-foreground py-8">No government contacts yet.</p>}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Contact" : "Add Contact"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name *</Label><Input className="mt-1" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label className="text-xs">Designation *</Label><Input className="mt-1" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} placeholder="e.g. SDM, Tehsildar" /></div>
            <div><Label className="text-xs">Phone *</Label><Input className="mt-1" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div><Label className="text-xs">Sort Order</Label><Input type="number" className="mt-1" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))} /></div>
            <Button className="w-full" onClick={handleSave}>{editId ? "Save Changes" : "Add Contact"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadsTab() {
  const headers = useAdminToken();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectNotes, setRejectNotes] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    fetch(`${BASE}/api/leads`, { headers })
      .then(r => r.json())
      .then(data => setLeads(Array.isArray(data) ? data : []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: number) => {
    const res = await fetch(`${BASE}/api/leads/${id}/approve`, { method: "PATCH", headers });
    if (res.ok) { toast({ title: "Lead approved & distributed ✓" }); load(); }
    else toast({ title: "Error approving lead", variant: "destructive" });
  };

  const reject = async (id: number) => {
    const res = await fetch(`${BASE}/api/leads/${id}/reject`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: rejectNotes[id] || "" }),
    });
    if (res.ok) { toast({ title: "Lead rejected" }); load(); }
    else toast({ title: "Error rejecting lead", variant: "destructive" });
  };

  const pending = leads.filter(l => l.status === "pending");
  const approved = leads.filter(l => l.status === "approved");
  const rejected = leads.filter(l => l.status === "rejected");
  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Service Leads</h3>
        <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
      </div>
      <p className="text-sm text-muted-foreground">Customers requesting services — admin must approve before distributing to businesses.</p>

      <div className="grid grid-cols-4 gap-2">
        {[
          { key: "all", label: "All", count: leads.length, color: "" },
          { key: "pending", label: "Pending", count: pending.length, color: "text-amber-600" },
          { key: "approved", label: "Approved", count: approved.length, color: "text-emerald-600" },
          { key: "rejected", label: "Rejected", count: rejected.length, color: "text-red-600" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`p-2 rounded-lg text-center transition-colors border ${filter === tab.key ? "bg-foreground text-background border-foreground" : "bg-background border-border hover:border-foreground/40"}`}
          >
            <p className={`text-lg font-bold ${filter === tab.key ? "" : tab.color}`}>{tab.count}</p>
            <p className="text-[11px]">{tab.label}</p>
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="space-y-2">
          {filtered.map((l: any) => (
            <Card key={l.id} className="border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={l.status} />
                      {l.categoryName && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{l.categoryName}</span>}
                    </div>
                    <p className="font-medium text-sm">{l.serviceRequest}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {l.customerName} · {l.customerPhone} · {new Date(l.createdAt).toLocaleDateString("en-IN")}
                    </p>
                    {l.adminNotes && <p className="text-xs text-red-600 mt-1">Note: {l.adminNotes}</p>}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {l.status === "pending" && (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => approve(l.id)}>
                          ✓ Approve & Distribute
                        </Button>
                        <div className="flex gap-1 items-center">
                          <Input
                            placeholder="Rejection reason (opt.)"
                            className="h-6 text-xs w-36"
                            value={rejectNotes[l.id] ?? ""}
                            onChange={e => setRejectNotes(prev => ({ ...prev, [l.id]: e.target.value }))}
                          />
                          <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 shrink-0" onClick={() => reject(l.id)}>
                            ✗ Reject
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No {filter === "all" ? "" : filter} leads.</p>}
        </div>
      )}
    </div>
  );
}

function SessionsTab() {
  const { adminToken } = useAuth();
  const headers = useAdminToken();
  const [sessions, setSessions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const [sRes, hRes] = await Promise.all([
      fetch(`${BASE}/api/admin/sessions`, { headers: { "x-admin-token": headers["x-admin-token"] || "" } }),
      fetch(`${BASE}/api/admin/login-history`, { headers: { "x-admin-token": headers["x-admin-token"] || "" } }),
    ]);
    setSessions(sRes.ok ? await sRes.json() : []);
    setHistory(hRes.ok ? await hRes.json() : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const revokeSession = async (id: string) => {
    await fetch(`${BASE}/api/admin/sessions/${id}`, { method: "DELETE", headers });
    toast({ title: "Session revoked" });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Active Sessions</h3>
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
          <div className="space-y-2">
            {sessions.map((s: any) => (
              <Card key={s.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">{s.token.substring(0, 20)}...</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.ipAddress} • Created {new Date(s.createdAt).toLocaleDateString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground">Expires {new Date(s.expiresAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.token === adminToken && <Badge variant="default" className="text-xs">Current</Badge>}
                    {s.token !== adminToken && (
                      <Button variant="outline" size="sm" onClick={() => revokeSession(s.id)}><XCircle className="w-3 h-3 mr-1 text-red-500" />Revoke</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {sessions.length === 0 && <p className="text-muted-foreground text-sm">No active sessions.</p>}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Login History (last 100)</h3>
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
          <div className="space-y-2">
            {history.map((h: any) => (
              <Card key={h.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{h.ipAddress} • {h.userAgent?.substring(0, 60)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(h.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  {h.success ? <Badge className="bg-green-100 text-green-700 border-none text-xs"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge> : <Badge className="bg-red-100 text-red-700 border-none text-xs"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>}
                </CardContent>
              </Card>
            ))}
            {history.length === 0 && <p className="text-muted-foreground text-sm">No login history.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function BusinessReportsTab() {
  const { toast } = useToast();
  const headers = useAdminToken();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnBiz, setWarnBiz] = useState<{ id: number; name: string } | null>(null);
  const [warnMsg, setWarnMsg] = useState("");
  const [warnSending, setWarnSending] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${BASE}/api/reports`, { headers })
      .then(r => r.json())
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(() => toast({ title: "Failed to load reports", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: number, status: string) => {
    await fetch(`${BASE}/api/reports/${id}/status`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
    toast({ title: `Report marked as ${status}` });
    load();
  };

  const sendWarning = async () => {
    if (!warnBiz || !warnMsg.trim()) return;
    setWarnSending(true);
    try {
      const res = await fetch(`${BASE}/api/warnings`, {
        method: "POST",
        headers,
        body: JSON.stringify({ businessId: warnBiz.id, message: warnMsg.trim(), level: "custom", sentBy: "admin (manual)" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Warning sent" });
      setWarnBiz(null);
      setWarnMsg("");
    } catch {
      toast({ title: "Failed to send warning", variant: "destructive" });
    } finally { setWarnSending(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />Business Reports ({reports.length})
        </h2>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>Refresh</Button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reports yet.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r: any) => (
            <Card key={r.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{r.businessName || `Business #${r.businessId}`}</span>
                      <Badge variant="outline" className="text-xs">{r.reason}</Badge>
                      {r.totalReportsForBusiness > 1 && (
                        <Badge className="bg-red-100 text-red-700 border-none text-xs">{r.totalReportsForBusiness} total reports</Badge>
                      )}
                      <Badge className={`text-xs border-none ${r.status === "resolved" ? "bg-green-100 text-green-700" : r.status === "dismissed" ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-700"}`}>
                        {r.status || "pending"}
                      </Badge>
                    </div>
                    {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      By: {r.reporterName || "Anonymous"} · {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    <Button size="sm" variant="outline" className="h-7 text-xs border-amber-400 text-amber-700"
                      onClick={() => { setWarnBiz({ id: r.businessId, name: r.businessName || `Business #${r.businessId}` }); setWarnMsg(""); }}>
                      <AlertCircle className="w-3 h-3 mr-1" />Warn
                    </Button>
                    {r.status !== "resolved" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs border-green-400 text-green-700" onClick={() => setStatus(r.id, "resolved")}>
                        <CheckCircle className="w-3 h-3 mr-1" />Resolve
                      </Button>
                    )}
                    {r.status !== "dismissed" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs text-muted-foreground" onClick={() => setStatus(r.id, "dismissed")}>
                        <XCircle className="w-3 h-3 mr-1" />Dismiss
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!warnBiz} onOpenChange={o => { if (!o) setWarnBiz(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Custom Warning</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Sending warning to: <strong>{warnBiz?.name}</strong></p>
            <div>
              <Label className="text-xs">Custom Warning Message *</Label>
              <Textarea
                className="mt-1 text-sm"
                rows={4}
                value={warnMsg}
                onChange={e => setWarnMsg(e.target.value)}
                placeholder="Describe the issue and what action is required from this business owner..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setWarnBiz(null)}>Cancel</Button>
              <Button size="sm" disabled={!warnMsg.trim() || warnSending} onClick={sendWarning} className="bg-amber-600 hover:bg-amber-700">
                {warnSending ? "Sending..." : "Send Warning"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RenewalsTab() {
  const { toast } = useToast();
  const headers = useAdminToken();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminderBiz, setReminderBiz] = useState<any | null>(null);
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${BASE}/api/businesses?status=all&limit=500`, { headers })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data?.businesses) ? data.businesses : Array.isArray(data) ? data : [];
        setBusinesses(list.filter((b: any) => b.isPremium || b.isVerified));
      })
      .catch(() => toast({ title: "Failed to load businesses", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useState(() => { load(); });

  const daysUntil = (dateStr: string | null | undefined): number | null => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const sendReminder = async () => {
    if (!reminderBiz) return;
    setSending(true);
    try {
      const res = await fetch(`${BASE}/api/warnings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          businessId: reminderBiz.id,
          message: `Your Premium listing is expiring soon. Please contact us to renew your premium membership and keep your listing active.`,
          level: "renewal",
          sentBy: "admin (manual)",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Renewal reminder sent" });
      setReminderBiz(null);
    } catch {
      toast({ title: "Failed to send reminder", variant: "destructive" });
    } finally { setSending(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-4 h-4" /> Premium & Verified Renewals
        </h2>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>Refresh</Button>
      </div>
      <p className="text-xs text-muted-foreground">Shows all Premium and Verified businesses with their expiry dates. Set expiry dates via the Businesses tab when toggling Premium/Verified.</p>
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : businesses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No premium or verified businesses found.</p>
      ) : (
        <div className="space-y-2">
          {businesses.map((b: any) => {
            const premDays = daysUntil(b.premiumExpiresAt);
            const verDays = daysUntil(b.verifiedExpiresAt);
            const minDays = [premDays, verDays].filter(d => d !== null) as number[];
            const urgent = minDays.some(d => d <= 3);
            const warn = minDays.some(d => d <= 7);
            return (
              <Card key={b.id} className={`border-0 shadow-sm ${urgent ? "border-l-4 border-l-red-500" : warn ? "border-l-4 border-l-yellow-500" : ""}`}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{b.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">HC-{String(b.id).padStart(6, "0")}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {b.isPremium && (
                        <div className="flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-500" />
                          <span className="text-xs">Premium</span>
                          {premDays !== null ? (
                            <span className={`text-xs font-medium ${premDays <= 0 ? "text-red-600" : premDays <= 3 ? "text-red-500" : premDays <= 7 ? "text-yellow-600" : "text-muted-foreground"}`}>
                              {premDays <= 0 ? "EXPIRED" : `${premDays}d left`}
                            </span>
                          ) : <span className="text-xs text-muted-foreground">No expiry set</span>}
                        </div>
                      )}
                      {b.isVerified && (
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-blue-500" />
                          <span className="text-xs">Verified</span>
                          {verDays !== null ? (
                            <span className={`text-xs font-medium ${verDays <= 0 ? "text-red-600" : verDays <= 3 ? "text-red-500" : verDays <= 7 ? "text-yellow-600" : "text-muted-foreground"}`}>
                              {verDays <= 0 ? "EXPIRED" : `${verDays}d left`}
                            </span>
                          ) : <span className="text-xs text-muted-foreground">No expiry set</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => setReminderBiz(b)}>
                    Send Reminder
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!reminderBiz} onOpenChange={o => { if (!o) setReminderBiz(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Renewal Reminder</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">Send a renewal reminder email to the owner of <strong>{reminderBiz?.name}</strong>?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setReminderBiz(null)}>Cancel</Button>
              <Button size="sm" disabled={sending} onClick={sendReminder}>
                {sending ? "Sending..." : "Send Reminder"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductsAdminTab() {
  const headers = useAdminToken();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [limitInputs, setLimitInputs] = useState<Record<number, string>>({});
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [processingProduct, setProcessingProduct] = useState<number | null>(null);
  const [addProductBiz, setAddProductBiz] = useState<any | null>(null);
  const [addForm, setAddForm] = useState({ name: "", description: "", price: "", unit: "", imageUrl: "", knowMoreUrl: "" });
  const [addBusy, setAddBusy] = useState(false);
  const { toast } = useToast();

  const submitAdminProduct = async () => {
    if (!addProductBiz || !addForm.name.trim()) return;
    setAddBusy(true);
    try {
      const res = await fetch(`${BASE}/api/products/admin/add`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: addProductBiz.id,
          name: addForm.name.trim(),
          description: addForm.description.trim() || undefined,
          price: addForm.price ? Number(addForm.price) : undefined,
          unit: addForm.unit.trim() || undefined,
          imageUrl: addForm.imageUrl.trim() || undefined,
          knowMoreUrl: addForm.knowMoreUrl.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      toast({ title: "Product added!" });
      setAddProductBiz(null);
      setAddForm({ name: "", description: "", price: "", unit: "", imageUrl: "", knowMoreUrl: "" });
      // Refresh search results
      setResults(prev => prev.map(b => b.id === addProductBiz.id ? { ...b, productCount: b.productCount + 1 } : b));
    } catch (e: any) {
      toast({ title: "Failed: " + e.message, variant: "destructive" });
    } finally {
      setAddBusy(false);
    }
  };

  const loadPending = () => {
    setLoadingPending(true);
    fetch(`${BASE}/api/products/admin/pending`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(setPendingProducts)
      .catch(() => {})
      .finally(() => setLoadingPending(false));
  };

  useEffect(() => { loadPending(); }, []);

  const handleProductAction = async (productId: number, action: "approve" | "reject") => {
    setProcessingProduct(productId);
    try {
      await fetch(`${BASE}/api/products/admin/${productId}/status`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      toast({ title: action === "approve" ? "Product approved!" : "Product rejected" });
      loadPending();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setProcessingProduct(null); }
  };

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetch(`${BASE}/api/products/admin/search?q=${encodeURIComponent(query.trim())}`, { headers });
    const data = res.ok ? await res.json() : [];
    setResults(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const adjustLimit = async (bizId: number, delta: number) => {
    const res = await fetch(`${BASE}/api/products/admin/${bizId}/limit`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    });
    if (res.ok) {
      const updated = await res.json();
      setResults(prev => prev.map(b => b.id === bizId ? { ...b, productLimit: updated.productLimit } : b));
      toast({ title: `Limit updated to ${updated.productLimit}` });
    } else {
      toast({ title: "Failed to update limit", variant: "destructive" });
    }
  };

  const setCustomLimit = async (bizId: number) => {
    const raw = limitInputs[bizId];
    const val = parseInt(raw, 10);
    if (isNaN(val) || val < 0) { toast({ title: "Enter a valid number", variant: "destructive" }); return; }
    const res = await fetch(`${BASE}/api/products/admin/${bizId}/limit`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ setTo: val }),
    });
    if (res.ok) {
      const updated = await res.json();
      setResults(prev => prev.map(b => b.id === bizId ? { ...b, productLimit: updated.productLimit } : b));
      setLimitInputs(prev => ({ ...prev, [bizId]: "" }));
      toast({ title: `Limit set to ${updated.productLimit}` });
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold">Product Limit Management</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Search by HC-ID (e.g. HC-000001), email, or business name to manage product limits.</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="HC-000001 / email / business name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          className="flex-1"
        />
        <Button onClick={search} disabled={loading || !query.trim()}>
          {loading ? "Searching…" : "Search"}
        </Button>
      </div>

      {results.length === 0 && !loading && query && (
        <p className="text-sm text-muted-foreground text-center py-8">No businesses found for "{query}".</p>
      )}

      <div className="space-y-4">
        {results.map(biz => (
          <Card key={biz.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{biz.name}</p>
                    <span className="text-xs font-mono text-muted-foreground">HC-{String(biz.id).padStart(6, "0")}</span>
                    {biz.isPremium && <Badge className="bg-amber-100 text-amber-700 border-none text-xs">Premium</Badge>}
                    <StatusBadge status={biz.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{biz.ownerEmail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-primary">{biz.productCount}</p>
                  <p className="text-xs text-muted-foreground">of {biz.productLimit} used</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div
                  className={`h-full rounded-full transition-all ${biz.productCount >= biz.productLimit ? "bg-red-500" : "bg-primary"}`}
                  style={{ width: `${Math.min(100, (biz.productCount / Math.max(1, biz.productLimit)) * 100)}%` }}
                />
              </div>

              {/* Quick adjust buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Adjust limit:</span>
                {[-5, -1, +1, +5, +10].map(d => (
                  <button
                    key={d}
                    onClick={() => adjustLimit(biz.id, d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${d > 0 ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50" : "border-red-200 text-red-600 hover:bg-red-50"}`}
                  >
                    {d > 0 ? `+${d}` : d}
                  </button>
                ))}
                <div className="flex items-center gap-1.5 ml-2">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Set to…"
                    className="h-7 text-xs w-20"
                    value={limitInputs[biz.id] ?? ""}
                    onChange={e => setLimitInputs(prev => ({ ...prev, [biz.id]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && setCustomLimit(biz.id)}
                  />
                  <Button size="sm" className="h-7 text-xs" onClick={() => setCustomLimit(biz.id)}>Set</Button>
                </div>
              </div>

              {/* Products list + Add Product */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Products ({biz.products?.length ?? 0})
                  </p>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 border-primary/40 text-primary" onClick={() => { setAddProductBiz(biz); setAddForm({ name: "", description: "", price: "", unit: "", imageUrl: "", knowMoreUrl: "" }); }}>
                    <Plus className="w-3 h-3 mr-1" />Add Product
                  </Button>
                </div>
                {biz.products?.length > 0 && (
                  <div className="space-y-1">
                    {biz.products.slice(0, 5).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between text-xs py-1 px-2 bg-muted/30 rounded">
                        <span className="font-medium truncate max-w-[60%]">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">₹{(p.price ?? 0).toLocaleString()}</span>
                          <StatusBadge status={p.status} />
                        </div>
                      </div>
                    ))}
                    {biz.products.length > 5 && <p className="text-xs text-muted-foreground pl-2">+{biz.products.length - 5} more</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Product Dialog */}
      {addProductBiz && (
        <Dialog open={!!addProductBiz} onOpenChange={(o) => !o && setAddProductBiz(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-4 h-4" />Add Product — {addProductBiz.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p className="text-xs text-muted-foreground bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded px-3 py-2">
                Admin-added products are auto-approved and published immediately.
              </p>
              <div>
                <Label className="text-xs">Product Name *</Label>
                <Input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-sm mt-0.5" placeholder="e.g. Fresh Paneer" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} className="text-sm mt-0.5" rows={2} placeholder="Short product description" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Price (₹)</Label>
                  <Input type="number" min="0" value={addForm.price} onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))} className="h-8 text-sm mt-0.5" placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs">Unit</Label>
                  <Input value={addForm.unit} onChange={e => setAddForm(f => ({ ...f, unit: e.target.value }))} className="h-8 text-sm mt-0.5" placeholder="per kg, per piece…" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Image URL</Label>
                <Input value={addForm.imageUrl} onChange={e => setAddForm(f => ({ ...f, imageUrl: e.target.value }))} className="h-8 text-sm mt-0.5" placeholder="https://…" />
              </div>
              <div>
                <Label className="text-xs">Know More URL</Label>
                <Input value={addForm.knowMoreUrl} onChange={e => setAddForm(f => ({ ...f, knowMoreUrl: e.target.value }))} className="h-8 text-sm mt-0.5" placeholder="https://…" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button className="flex-1" disabled={addBusy || !addForm.name.trim()} onClick={submitAdminProduct}>
                  {addBusy ? "Adding…" : "Add Product"}
                </Button>
                <Button variant="outline" onClick={() => setAddProductBiz(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Pending Products Approval */}
      {!loadingPending && pendingProducts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-amber-800 dark:text-amber-300">Pending Products ({pendingProducts.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between gap-3 p-3 bg-background rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.businessName} • ₹{(p.price ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white" disabled={processingProduct === p.id} onClick={() => handleProductAction(p.id, "approve")}>
                      <CheckCircle className="w-3 h-3 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200" disabled={processingProduct === p.id} onClick={() => handleProductAction(p.id, "reject")}>
                      <X className="w-3 h-3 mr-1" />Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ExportTab() {
  const { toast } = useToast();
  const headers = useAdminToken();
  const [loading, setLoading] = useState<string | null>(null);

  const exportCSV = async (endpoint: string, filename: string) => {
    setLoading(filename);
    try {
      const res = await fetch(`${BASE}/api/export/${endpoint}`, { headers });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Exported ${filename}` });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const exports = [
    { label: "All Businesses", endpoint: "businesses", file: "businesses.csv", desc: "Name, category, status, contact, address, created date" },
    { label: "Enquiries", endpoint: "enquiries", file: "enquiries.csv", desc: "All customer enquiries with business, email, phone, message" },
    { label: "Reviews", endpoint: "reviews", file: "reviews.csv", desc: "All reviews with rating, text, business, status" },
    { label: "Webdev Leads", endpoint: "webdev-enquiries", file: "webdev-leads.csv", desc: "Web development enquiries with contact details" },
    { label: "Business Reports", endpoint: "reports", file: "business-reports.csv", desc: "All user-submitted reports about businesses" },
    { label: "Search Queries", endpoint: "search-queries", file: "search-queries.csv", desc: "Recent searches on the platform" },
    { label: "Users", endpoint: "users", file: "users.csv", desc: "Registered user accounts" },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />Export Data
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Download your platform data as CSV files for analysis, backup, or reporting.</p>
      </div>
      <div className="grid gap-3">
        {exports.map(({ label, endpoint, file, desc }) => (
          <Card key={endpoint} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0"
                disabled={loading === file}
                onClick={() => exportCSV(endpoint, file)}
              >
                {loading === file ? "Exporting..." : "Export CSV"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Files exported as UTF-8 CSV — compatible with Excel, Google Sheets, and data tools.</p>
    </div>
  );
}

function NotificationsTab({ onRead }: { onRead: () => void }) {
  const { toast } = useToast();
  const headers = useAdminToken();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [notifRes, delRes] = await Promise.all([
        fetch(`${BASE}/api/notifications`, { headers }),
        fetch(`${BASE}/api/deletion-requests`, { headers }),
      ]);
      setNotifications(await notifRes.json());
      setDeletionRequests(await delRes.json());
    } catch { toast({ title: "Failed to load notifications", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await fetch(`${BASE}/api/notifications/${id}/read`, { method: "PATCH", headers });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    const remaining = notifications.filter(n => !n.isRead && n.id !== id).length;
    if (remaining === 0) onRead();
  };

  const markAllRead = async () => {
    await fetch(`${BASE}/api/notifications/mark-all-read`, { method: "PATCH", headers });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    onRead();
  };

  const reviewRequest = async (id: number, status: "approved" | "rejected") => {
    setActionBusy(id);
    try {
      const res = await fetch(`${BASE}/api/deletion-requests/${id}/review`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: adminNotes[id] || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: status === "approved" ? "Request approved & executed" : "Request rejected" });
      setDeletionRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      load();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally { setActionBusy(null); }
  };

  const unread = notifications.filter(n => !n.isRead);
  const pendingDeletions = deletionRequests.filter(r => r.status === "pending");

  const typeIcon: Record<string, string> = {
    account_deletion_request: "👤",
    listing_deletion_request: "🏢",
    new_lead: "💡",
    new_report: "⚠️",
  };

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4" />Notifications
            {unread.length > 0 && <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">{unread.length} unread</span>}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Deletion requests and system alerts</p>
        </div>
        {unread.length > 0 && (
          <Button size="sm" variant="outline" onClick={markAllRead}>Mark all read</Button>
        )}
      </div>

      {pendingDeletions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Trash className="w-4 h-4 text-destructive" />
            Pending Deletion Requests ({pendingDeletions.length})
          </h3>
          <div className="space-y-3">
            {pendingDeletions.map(req => (
              <Card key={req.id} className="border-destructive/30">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{req.type === "account" ? "👤" : "🏢"}</span>
                        <p className="font-semibold capitalize">{req.type} Deletion Request</p>
                        <Badge variant="secondary" className="text-xs">Pending Review</Badge>
                      </div>
                      <p className="text-sm"><span className="text-muted-foreground">From:</span> {req.userName || req.userEmail}</p>
                      {req.type === "listing" && req.businessName && (
                        <p className="text-sm"><span className="text-muted-foreground">Listing:</span> {req.businessName}</p>
                      )}
                      {req.reason && <p className="text-sm"><span className="text-muted-foreground">Reason:</span> {req.reason}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 min-w-40">
                      <Input
                        placeholder="Admin notes (optional)"
                        className="h-7 text-xs"
                        value={adminNotes[req.id] ?? ""}
                        onChange={e => setAdminNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 h-7 text-xs"
                          disabled={actionBusy === req.id}
                          onClick={() => reviewRequest(req.id, "approved")}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {actionBusy === req.id ? "…" : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-xs"
                          disabled={actionBusy === req.id}
                          onClick={() => reviewRequest(req.id, "rejected")}
                        >
                          <X className="w-3 h-3 mr-1" />Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {deletionRequests.filter(r => r.status !== "pending").length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Reviewed Requests</h3>
          <div className="space-y-2">
            {deletionRequests.filter(r => r.status !== "pending").map(req => (
              <Card key={req.id} className="opacity-70">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>{req.type === "account" ? "👤" : "🏢"}</span>
                    <div>
                      <p className="text-sm font-medium capitalize">{req.type} deletion — {req.userName || req.userEmail}</p>
                      {req.type === "listing" && req.businessName && <p className="text-xs text-muted-foreground">{req.businessName}</p>}
                    </div>
                  </div>
                  <Badge variant={req.status === "approved" ? "default" : "secondary"} className="capitalize shrink-0">{req.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-3">All Notifications</h3>
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${n.isRead ? "bg-muted/20 opacity-70" : "bg-card border-primary/20 hover:bg-muted/10"}`}
                onClick={() => { if (!n.isRead) markRead(n.id); }}
              >
                <span className="text-lg shrink-0">{typeIcon[n.type] ?? "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementsTab() {
  const { toast } = useToast();
  const token = localStorage.getItem("admin_token") || "";
  const headers = { "Content-Type": "application/json", "x-admin-token": token };
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", message: "", targetType: "all", targetCategoryId: "", targetBusinessId: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const load = () => {
    setFetching(true);
    fetch(`${BASE}/api/announcements`, { headers: { "x-admin-token": token } })
      .then(r => r.json()).then(setList).catch(() => {}).finally(() => setFetching(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body: any = { title: form.title, message: form.message, targetType: form.targetType };
      if (form.targetType === "category" && form.targetCategoryId) body.targetCategoryId = parseInt(form.targetCategoryId);
      if (form.targetType === "business" && form.targetBusinessId) body.targetBusinessId = parseInt(form.targetBusinessId);
      const res = await fetch(`${BASE}/api/announcements`, { method: "POST", headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({ title: "Announcement sent!", description: `Delivered to ${data.sent} owners.` });
      setForm({ title: "", message: "", targetType: "all", targetCategoryId: "", targetBusinessId: "" });
      load();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE}/api/announcements/${id}`, { method: "DELETE", headers: { "x-admin-token": token } });
    toast({ title: "Deleted" });
    load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone className="w-4 h-4" />New Announcement</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div><Label>Title *</Label><input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. New Feature Launch" /></div>
            <div><Label>Message *</Label><textarea className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required placeholder="Announcement body text..." /></div>
            <div>
              <Label>Target</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={form.targetType} onChange={e => setForm(p => ({ ...p, targetType: e.target.value }))}>
                <option value="all">All Business Owners</option>
                <option value="category">By Category</option>
                <option value="business">Specific Business</option>
              </select>
            </div>
            {form.targetType === "category" && (
              <div><Label>Category ID</Label><input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={form.targetCategoryId} onChange={e => setForm(p => ({ ...p, targetCategoryId: e.target.value }))} placeholder="Enter category ID" /></div>
            )}
            {form.targetType === "business" && (
              <div><Label>Business ID</Label><input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={form.targetBusinessId} onChange={e => setForm(p => ({ ...p, targetBusinessId: e.target.value }))} placeholder="Enter business ID" /></div>
            )}
            <Button type="submit" disabled={loading} className="gap-2"><Send className="w-4 h-4" />{loading ? "Sending…" : "Send Announcement"}</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Sent Announcements</CardTitle></CardHeader>
        <CardContent>
          {fetching ? <p className="text-sm text-muted-foreground">Loading…</p> : list.length === 0 ? <p className="text-sm text-muted-foreground">No announcements yet.</p> : (
            <div className="space-y-3">
              {list.map((a: any) => (
                <div key={a.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">{a.targetType}</Badge>
                      {a.deliveryStatus && <span className="text-xs text-muted-foreground">{a.deliveryStatus}</span>}
                      <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 shrink-0" onClick={() => handleDelete(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReactivationTab() {
  const { toast } = useToast();
  const token = localStorage.getItem("admin_token") || "";
  const headers = { "Content-Type": "application/json", "x-admin-token": token };
  const [list, setList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const load = () => {
    setFetching(true);
    fetch(`${BASE}/api/reactivation`, { headers: { "x-admin-token": token } })
      .then(r => r.json()).then(setList).catch(() => []).finally(() => setFetching(false));
  };
  useEffect(() => { load(); }, []);

  const handleAction = async (id: number, action: "approve" | "reject", adminNotes?: string) => {
    setProcessing(id);
    try {
      await fetch(`${BASE}/api/reactivation/${id}`, { method: "PATCH", headers, body: JSON.stringify({ action, adminNotes }) });
      toast({ title: action === "approve" ? "Reactivated!" : "Rejected" });
      load();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setProcessing(null); }
  };

  const pending = list.filter(r => r.status === "pending");
  const reviewed = list.filter(r => r.status !== "pending");

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Reactivation Requests ({pending.length} pending)</h3>
      {fetching ? <p className="text-sm text-muted-foreground">Loading…</p> : pending.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-20" /><p>No pending reactivation requests</p></div>
      ) : (
        <div className="space-y-4">
          {pending.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Business #{r.businessId}</p>
                    <p className="text-sm text-muted-foreground mt-1">{r.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={processing === r.id} onClick={() => handleAction(r.id, "approve")}>
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" disabled={processing === r.id} onClick={() => handleAction(r.id, "reject")}>
                      <X className="w-3.5 h-3.5 mr-1" />Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {reviewed.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">Reviewed Requests</h4>
          <div className="space-y-2">
            {reviewed.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border opacity-70">
                <div>
                  <p className="text-sm font-medium">Business #{r.businessId}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <Badge variant={r.status === "approved" ? "default" : "secondary"} className="capitalize">{r.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PendingEditsTab() {
  const { toast } = useToast();
  const token = localStorage.getItem("admin_token") || "";
  const headers = { "Content-Type": "application/json", "x-admin-token": token };
  const [list, setList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const load = () => {
    setFetching(true);
    fetch(`${BASE}/api/businesses?hasPendingEdit=true&limit=100`, { headers: { "x-admin-token": token } })
      .then(r => r.ok ? r.json() : { businesses: [] })
      .then(data => setList((data.businesses ?? []).filter((b: any) => b.pendingEditStatus === "pending")))
      .catch(() => [])
      .finally(() => setFetching(false));
  };
  useEffect(() => { load(); }, []);

  const handleAction = async (bizId: number, action: "approve" | "reject") => {
    setProcessing(bizId);
    try {
      await fetch(`${BASE}/api/businesses/${bizId}/pending-edit`, { method: "PATCH", headers, body: JSON.stringify({ action }) });
      toast({ title: action === "approve" ? "Edit approved!" : "Edit rejected" });
      load();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setProcessing(null); }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Pending Business Edits ({list.length})</h3>
      {fetching ? <p className="text-sm text-muted-foreground">Loading…</p> : list.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Pencil className="w-10 h-10 mx-auto mb-3 opacity-20" /><p>No pending edits to review</p></div>
      ) : (
        <div className="space-y-4">
          {list.map((biz: any) => (
            <Card key={biz.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold">{biz.name} <span className="text-xs text-muted-foreground">#{biz.id}</span></p>
                    <p className="text-xs text-muted-foreground">Submitted a listing edit for review</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setExpanded(expanded === biz.id ? null : biz.id)}>
                      <Eye className="w-3.5 h-3.5 mr-1" />View Edits
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={processing === biz.id} onClick={() => handleAction(biz.id, "approve")}>
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" disabled={processing === biz.id} onClick={() => handleAction(biz.id, "reject")}>
                      <X className="w-3.5 h-3.5 mr-1" />Reject
                    </Button>
                  </div>
                </div>
                {expanded === biz.id && biz.pendingEditJson && (
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-64">{JSON.stringify(JSON.parse(biz.pendingEditJson ?? "{}"), null, 2)}</pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
