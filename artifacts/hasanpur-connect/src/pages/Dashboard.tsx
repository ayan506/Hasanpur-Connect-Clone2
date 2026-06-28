import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  useListBusinesses, useListEnquiries, useListReviews, useGetBusinessAnalytics,
  useCreateProduct, useDeleteProduct, useListProducts, useGetSettings
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
import { useToast } from "@/hooks/use-toast";
import { useMetaTags } from "@/hooks/use-meta-tags";
import {
  Building2, Eye, Phone, MessageCircle, Star, Package, Inbox,
  Plus, Trash2, TrendingUp, LogOut, ShieldCheck, Crown, Clock, AlertCircle, Trophy, Lock,
  User, Settings, ChevronDown, Pencil, X, CheckCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SuspendedReactivationBanner } from "@/components/dashboard/SuspendedReactivationBanner";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { role, email } = useAuth();
  const { logout } = useAuth();
  const { toast } = useToast();

  useMetaTags({ title: "Business Dashboard", description: "Manage your business listing" });

  const { data: businessList } = useListBusinesses(email ? { ownerEmail: email, status: "all" } as any : { limit: 0 });
  const allMyBusinesses = (businessList?.businesses ?? []).filter((b: any) => !email || b.ownerEmail === email);

  const [selectedBizId, setSelectedBizId] = useState<number | null>(null);
  const myBusiness = selectedBizId
    ? allMyBusinesses.find((b: any) => b.id === selectedBizId) ?? allMyBusinesses[0]
    : allMyBusinesses[0];

  useEffect(() => {
    if (!selectedBizId && allMyBusinesses.length > 0) {
      setSelectedBizId(allMyBusinesses[0].id);
    }
  }, [allMyBusinesses.length]);

  const { data: enquiries } = useListEnquiries({ businessId: myBusiness?.id });
  const { data: reviews } = useListReviews({ businessId: myBusiness?.id });
  const { data: analytics } = useGetBusinessAnalytics(myBusiness?.id ?? null, { enabled: !!myBusiness?.id && myBusiness?.status === "approved" });
  const { data: products, refetch: refetchProducts } = useListProducts({ businessId: myBusiness?.id });
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const { data: settings } = useGetSettings();

  const productLimit = (myBusiness as any)?.productLimit ?? 5;

  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", imageUrl: "", knowMoreUrl: "" });
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    if (myBusiness?.id) {
      setLoadingLeads(true);
      fetch(`${BASE}/api/leads/for-business/${myBusiness.id}`)
        .then(res => res.json())
        .then(data => setLeads(data || []))
        .catch(() => {})
        .finally(() => setLoadingLeads(false));
    }
  }, [myBusiness?.id]);

  if (role === "admin") { setLocation("/admin"); return null; }

  if (!role || role === "visitor") {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center text-center px-4">
          <div>
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You need to be logged in as a business owner.</p>
            <Link href="/login"><Button>Login</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isLocked = myBusiness && (myBusiness.status !== "approved" || (myBusiness as any).isSuspended);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myBusiness) return;
    try {
      await createProduct.mutateAsync({ data: { businessId: myBusiness.id, name: productForm.name, description: productForm.description || undefined, price: productForm.price || undefined, imageUrl: productForm.imageUrl || undefined, knowMoreUrl: productForm.knowMoreUrl || undefined } });
      toast({ title: "Product submitted for review!" });
      setProductForm({ name: "", description: "", price: "", imageUrl: "", knowMoreUrl: "" });
      setProductDialogOpen(false);
      refetchProducts();
    } catch { toast({ title: "Error adding product", variant: "destructive" }); }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct.mutateAsync({ id });
      toast({ title: "Product deleted" });
      refetchProducts();
    } catch { toast({ title: "Error deleting product", variant: "destructive" }); }
  };

  return (
    <Layout>
      <div className="bg-slate-950 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Business Dashboard</h1>
              <p className="text-slate-400 text-sm mt-0.5">{email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { logout(); setLocation("/"); }}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>

          {allMyBusinesses.length > 1 && (
            <div className="mt-4">
              <Select value={String(selectedBizId ?? allMyBusinesses[0]?.id)} onValueChange={v => setSelectedBizId(Number(v))}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-full sm:w-72">
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {allMyBusinesses.map((b: any) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3 h-3" />
                        <span>{b.name}</span>
                        <span className="text-xs text-muted-foreground ml-1">HC-{String(b.id).padStart(6, "0")}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!myBusiness ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-lg font-semibold mb-2">No business listing found</p>
              <p className="text-muted-foreground text-sm mb-4">Submit your business to get started</p>
              <Link href="/register"><Button>Add Your Business</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {myBusiness.status === "pending" && (
              <div className="mb-5 p-4 rounded-xl bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                    {(myBusiness as any)._hasPendingEdit ? "Edit Pending Re-approval" : "Listing Pending Approval"}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-0.5">
                    {(myBusiness as any)._hasPendingEdit
                      ? "Your recent edits are under admin review and will go live once approved."
                      : "Your listing is under review. This typically takes 24–48 hours."}
                  </p>
                </div>
              </div>
            )}
            {(myBusiness as any).isSuspended && (
              <SuspendedReactivationBanner businessId={myBusiness.id} />
            )}
            {myBusiness.status === "rejected" && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">Listing Rejected</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">Your listing was not approved. Please contact us for details.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Eye, label: "Total Views", value: analytics?.profileViews ?? myBusiness.viewCount ?? 0, color: "text-primary" },
                { icon: Phone, label: "Call Clicks", value: analytics?.callClicks ?? 0, color: "text-green-500" },
                { icon: MessageCircle, label: "WhatsApp", value: analytics?.whatsappClicks ?? 0, color: "text-[#25D366]" },
                { icon: Inbox, label: "Enquiries", value: analytics?.enquiryCount ?? enquiries?.length ?? 0, color: "text-blue-500" },
              ].map(item => (
                <Card key={item.label}>
                  <CardContent className="p-4 text-center">
                    <item.icon className={`w-7 h-7 mx-auto mb-2 ${item.color}`} />
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-6">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-xl font-bold">{myBusiness.name}</h2>
                      {(myBusiness as any).isPremium && <Badge className="bg-amber-500 text-white border-none text-xs"><Crown className="w-3 h-3 mr-1" />Premium</Badge>}
                      {(myBusiness as any).isVerified && <Badge className="bg-blue-500 text-white border-none text-xs"><ShieldCheck className="w-3 h-3 mr-1" />Verified</Badge>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={myBusiness.status === "approved" ? "default" : myBusiness.status === "pending" ? "secondary" : "destructive"}>
                        {myBusiness.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">HC-{String(myBusiness.id).padStart(6, "0")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {!isLocked && (
                      <Link href={`/business/${myBusiness.slug}`}>
                        <Button variant="outline" size="sm">
                          {myBusiness.status === "approved" ? "View Listing" : "Preview Listing"}
                        </Button>
                      </Link>
                    )}
                    <Link href={`/register?edit=${myBusiness.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit Listing
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="enquiries">
              <div className="overflow-x-auto">
                <TabsList className="inline-flex h-auto mb-5 flex-nowrap min-w-max">
                  <TabsTrigger value="enquiries" className="text-xs sm:text-sm">Enquiries {enquiries?.length ? `(${enquiries.length})` : ""}</TabsTrigger>
                  <TabsTrigger value="leads" className="text-xs sm:text-sm">Leads {leads?.length ? `(${leads.length})` : ""}</TabsTrigger>
                  <TabsTrigger value="reviews" className="text-xs sm:text-sm">Reviews {reviews?.length ? `(${reviews.length})` : ""}</TabsTrigger>
                  <TabsTrigger value="products" className="text-xs sm:text-sm">Products</TabsTrigger>
                  <TabsTrigger value="milestones" className="text-xs sm:text-sm"><Trophy className="w-3 h-3 mr-1" />Milestones</TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
                  <TabsTrigger value="account" className="text-xs sm:text-sm"><User className="w-3 h-3 mr-1" />Account</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="enquiries">
                <div className="space-y-3">
                  {!enquiries?.length ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No enquiries yet</p>
                    </div>
                  ) : enquiries.map((e: any) => (
                    <Card key={e.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">{e.name}</p>
                            <p className="text-sm text-muted-foreground">{e.phone} {e.email && `• ${e.email}`}</p>
                            {e.message && <p className="text-sm mt-2 text-muted-foreground">{e.message}</p>}
                          </div>
                          <p className="text-xs text-muted-foreground shrink-0">{new Date(e.createdAt ?? "").toLocaleDateString("en-IN")}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="leads">
                {isLocked ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Leads are available after your listing is approved</p>
                  </div>
                ) : loadingLeads ? (
                  <div className="text-center py-12 text-muted-foreground">Loading leads…</div>
                ) : !leads?.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No leads in your category yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads.map((item: any) => {
                      const l = item.lead;
                      if (!l) return null;
                      return (
                        <Card key={item.id} className={item.status === "pending" ? "border-l-4 border-l-amber-500" : ""}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="font-semibold text-base text-primary">{l.serviceRequest}</p>
                                <p className="text-sm font-medium">{l.customerName}</p>
                                <p className="text-sm text-muted-foreground">Phone: {l.customerPhone}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={item.status === "accepted" ? "default" : item.status === "rejected" ? "destructive" : "secondary"} className="text-xs capitalize">
                                    {item.status}
                                  </Badge>
                                  {l.categoryName && <span className="text-xs text-muted-foreground">{l.categoryName}</span>}
                                </div>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                {item.status === "pending" && (
                                  <>
                                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={async () => {
                                      await fetch(`${BASE}/api/leads/assignments/${item.id}/respond`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "accepted" }) });
                                      setLeads(prev => prev.map(a => a.id === item.id ? { ...a, status: "accepted" } : a));
                                    }}>
                                      <CheckCircle className="w-3 h-3 mr-1" />Accept
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive" onClick={async () => {
                                      await fetch(`${BASE}/api/leads/assignments/${item.id}/respond`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected" }) });
                                      setLeads(prev => prev.map(a => a.id === item.id ? { ...a, status: "rejected" } : a));
                                    }}>
                                      <X className="w-3 h-3 mr-1" />Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                {isLocked ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Reviews are available after your listing is approved</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!reviews?.length ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No reviews yet</p>
                      </div>
                    ) : reviews.map((r: any) => (
                      <Card key={r.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{r.reviewerName}</p>
                              <div className="flex items-center gap-0.5 text-amber-500 my-1">
                                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                              </div>
                              {r.content && <p className="text-sm text-muted-foreground">{r.content}</p>}
                            </div>
                            <Badge variant={r.status === "approved" ? "default" : "secondary"} className="shrink-0">{r.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="products">
                {isLocked ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Products are available after your listing is approved</p>
                  </div>
                ) : !(myBusiness as any).isPremium ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-xl bg-muted/20">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">🔒 Unlock Products — Buy Premium</h3>
                    <p className="text-muted-foreground max-w-sm text-sm mb-4">
                      Adding products &amp; services is exclusive to Premium members. Upgrade to list your inventory and attract more customers!
                    </p>
                    {(settings as any)?.premiumUpgradeContact ? (
                      <p className="text-sm font-medium">Contact us to upgrade: <a href={`tel:${(settings as any).premiumUpgradeContact}`} className="text-primary underline">{(settings as any).premiumUpgradeContact}</a></p>
                    ) : (
                      <Link href="/contact"><Button className="bg-amber-500 hover:bg-amber-600 font-semibold">Contact Us to Buy Premium</Button></Link>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-muted-foreground">{products?.length || 0}/{productLimit} products listed</p>
                      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" disabled={(products?.length ?? 0) >= productLimit}>
                            {(products?.length ?? 0) >= productLimit ? "Limit reached" : <><Plus className="w-4 h-4 mr-1.5" />Add Product</>}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader><DialogTitle>Add Product / Service</DialogTitle></DialogHeader>
                          <form onSubmit={handleAddProduct} className="space-y-4">
                            <div><Label>Name *</Label><Input className="mt-1" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} required placeholder="Product/service name" /></div>
                            <div><Label>Description</Label><Textarea className="mt-1" value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" rows={2} /></div>
                            <div><Label>Price (₹)</Label><Input className="mt-1" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 500" /></div>
                            <div>
                              <Label>Product Image <span className="text-xs text-muted-foreground">(required, min 1)</span></Label>
                              <div className="mt-1">
                                {productForm.imageUrl ? (
                                  <div className="relative inline-block">
                                    <img src={productForm.imageUrl} alt="Product" className="w-24 h-24 object-cover rounded-lg border" />
                                    <button type="button" onClick={() => setProductForm(p => ({ ...p, imageUrl: "" }))} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                                  </div>
                                ) : (
                                  <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/20 text-muted-foreground text-sm">
                                    <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const fd = new FormData(); fd.append("file", file);
                                      const res = await fetch(`${BASE}/api/upload`, { method: "POST", body: fd });
                                      if (res.ok) { const d = await res.json(); setProductForm(p => ({ ...p, imageUrl: d.url })); }
                                    }} />
                                    <span>+ Upload image</span>
                                  </label>
                                )}
                              </div>
                            </div>
                            <div><Label>Know More Link <span className="text-xs text-muted-foreground">(optional URL)</span></Label><Input className="mt-1" value={productForm.knowMoreUrl} onChange={e => setProductForm(p => ({ ...p, knowMoreUrl: e.target.value }))} placeholder="https://..." /></div>
                            <p className="text-xs text-muted-foreground">Your product will be reviewed before it appears publicly.</p>
                            <Button type="submit" className="w-full" disabled={createProduct.isPending || !productForm.imageUrl}>{createProduct.isPending ? "Submitting…" : "Submit Product for Review"}</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {!products?.length ? (
                        <p className="col-span-2 text-center text-muted-foreground py-8">No products yet. Add your first product!</p>
                      ) : products.map((p: any) => (
                        <Card key={p.id} className={p.status === "pending" ? "border-amber-200 bg-amber-50/40" : p.status === "rejected" ? "border-red-200 bg-red-50/30" : ""}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-lg shrink-0 border" />}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <p className="font-semibold text-sm leading-tight">{p.name}</p>
                                  <Button variant="ghost" size="icon" className="text-destructive shrink-0 -mt-1 -mr-1 h-7 w-7" onClick={() => handleDeleteProduct(p.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                                {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.description}</p>}
                                {p.price && <p className="text-sm font-bold text-primary mt-1">₹{p.price}</p>}
                                {p.knowMoreUrl && <a href={p.knowMoreUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 inline-block">Know More →</a>}
                                <div className="mt-1.5">
                                  {p.status === "pending" && <span className="text-xs text-amber-600 font-medium">⏳ Pending review</span>}
                                  {p.status === "rejected" && <span className="text-xs text-red-500 font-medium">✗ Rejected</span>}
                                  {p.status === "approved" && <span className="text-xs text-green-600 font-medium">✓ Approved</span>}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="milestones">
                <MilestonesTab
                  viewCount={analytics?.profileViews ?? myBusiness.viewCount ?? 0}
                  enquiryCount={analytics?.enquiryCount ?? enquiries?.length ?? 0}
                  reviewCount={reviews?.length ?? 0}
                  hasStarReview={!!(reviews?.some((r: any) => r.rating === 5 && r.status === "approved"))}
                  callClicks={analytics?.callClicks ?? 0}
                  whatsappClicks={analytics?.whatsappClicks ?? 0}
                  status={myBusiness.status ?? ""}
                  createdAt={(myBusiness as any).approvedAt ?? (myBusiness as any).createdAt}
                />
              </TabsContent>

              <TabsContent value="analytics">
                {isLocked ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Analytics are available after your listing is approved</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" />Activity Summary</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { label: "Total Views", value: analytics?.profileViews ?? 0 },
                          { label: "Call Clicks", value: analytics?.callClicks ?? 0 },
                          { label: "WhatsApp Clicks", value: analytics?.whatsappClicks ?? 0 },
                          { label: "Website Clicks", value: analytics?.websiteClicks ?? 0 },
                          { label: "Enquiries", value: analytics?.enquiryCount ?? 0 },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between py-1 border-b last:border-0">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <span className="font-bold">{item.value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" />Category Ranking</CardTitle></CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p className="text-muted-foreground text-xs">Your visibility score in search and category listings:</p>
                        {[
                          { label: "Views", weight: "×1", value: analytics?.profileViews ?? 0, score: (analytics?.profileViews ?? 0) * 1 },
                          { label: "Enquiries", weight: "×10", value: analytics?.enquiryCount ?? 0, score: (analytics?.enquiryCount ?? 0) * 10 },
                          { label: "WhatsApp Clicks", weight: "×5", value: analytics?.whatsappClicks ?? 0, score: (analytics?.whatsappClicks ?? 0) * 5 },
                          { label: "Call Clicks", weight: "×5", value: analytics?.callClicks ?? 0, score: (analytics?.callClicks ?? 0) * 5 },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between py-1 border-b last:border-0">
                            <span className="text-muted-foreground">{item.label} <span className="text-xs opacity-60">{item.weight}</span></span>
                            <span className="font-semibold">+{item.score}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 font-bold text-base">
                          <span>Total Score</span>
                          <span className="text-primary">
                            {((analytics?.profileViews ?? 0) + (analytics?.enquiryCount ?? 0) * 10 + (analytics?.whatsappClicks ?? 0) * 5 + (analytics?.callClicks ?? 0) * 5)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="account">
                <AccountTab email={email!} businessId={myBusiness?.id} businessName={myBusiness?.name} businessPhone={(myBusiness as any)?.phone ?? ""} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}

function AccountTab({ email, businessId, businessName, businessPhone }: { email: string; businessId?: number; businessName?: string; businessPhone?: string }) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteType, setDeleteType] = useState<"account" | "listing" | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deletePending, setDeletePending] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BASE}/api/admin/profile?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setEditName(data.name ?? "");
        setEditPhone(data.phone ?? businessPhone ?? "");
      })
      .catch(() => {});

    fetch(`${BASE}/api/deletion-requests/my?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => setMyRequests(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [email]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/admin/update-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: editName, phone: editPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data);
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteType) return;
    setDeletePending(true);
    try {
      const res = await fetch(`${BASE}/api/deletion-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: deleteType, email, businessId: deleteType === "listing" ? businessId : undefined, reason: deleteReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Deletion request submitted", description: "Admin will review and process your request within 24–48 hours." });
      setDeleteType(null);
      setDeleteReason("");
      setMyRequests(prev => [{ ...data, type: deleteType }, ...prev]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletePending(false);
    }
  };

  const pendingAccountDeletion = myRequests.find(r => r.type === "account" && r.status === "pending");
  const pendingListingDeletion = myRequests.find(r => r.type === "listing" && r.status === "pending" && r.businessId === businessId);

  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" />Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input className="mt-1" value={email} disabled />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input className="mt-1" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input className="mt-1" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="e.g. 9876543210" type="tel" />
            </div>
            {profile?.createdAt && (
              <p className="text-xs text-muted-foreground">Member since {new Date(profile.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
            )}
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2"><AlertCircle className="w-4 h-4" />Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {businessId && (
            <div className="p-3 rounded-lg bg-muted/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Delete Listing</p>
                <p className="text-xs text-muted-foreground mt-0.5">Request deletion of "{businessName}"</p>
              </div>
              {pendingListingDeletion ? (
                <Badge variant="secondary" className="shrink-0">Request Pending</Badge>
              ) : (
                <Button variant="destructive" size="sm" onClick={() => setDeleteType("listing")}>Request Deletion</Button>
              )}
            </div>
          )}
          <div className="p-3 rounded-lg bg-muted/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently remove your account and all data</p>
            </div>
            {pendingAccountDeletion ? (
              <Badge variant="secondary" className="shrink-0">Request Pending</Badge>
            ) : (
              <Button variant="destructive" size="sm" onClick={() => setDeleteType("account")}>Request Deletion</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!deleteType} onOpenChange={o => { if (!o) { setDeleteType(null); setDeleteReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {deleteType === "account" ? "Request Account Deletion" : `Request Listing Deletion`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {deleteType === "account"
                ? "Your account deletion request will be sent to admin for approval. This cannot be undone once approved."
                : `Your request to delete "${businessName}" will be sent to admin for review.`}
            </p>
            <div>
              <Label>Reason (optional)</Label>
              <Textarea className="mt-1" value={deleteReason} onChange={e => setDeleteReason(e.target.value)} placeholder="Tell us why…" rows={3} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setDeleteType(null); setDeleteReason(""); }}>Cancel</Button>
              <Button variant="destructive" disabled={deletePending} onClick={handleDeleteRequest}>
                {deletePending ? "Submitting…" : "Submit Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MilestonesProps {
  viewCount: number;
  enquiryCount: number;
  reviewCount: number;
  hasStarReview: boolean;
  callClicks: number;
  whatsappClicks: number;
  status: string;
  createdAt?: string | null;
}

function MilestonesTab({ viewCount, enquiryCount, reviewCount, hasStarReview, callClicks, whatsappClicks, status, createdAt }: MilestonesProps) {
  const milestones = [
    { key: "first_approved", label: "🎉 Listing Approved", desc: "Your business was approved", done: status === "approved" },
    { key: "first_view", label: "👀 First 10 Views", desc: "Your listing reached 10 views", done: viewCount >= 10 },
    { key: "views_50", label: "📈 50 Views", desc: "50 people have seen your listing", done: viewCount >= 50 },
    { key: "views_100", label: "🚀 100 Views", desc: "Hit the 100 view milestone!", done: viewCount >= 100 },
    { key: "first_enquiry", label: "💬 First Enquiry", desc: "Received your first customer enquiry", done: enquiryCount >= 1 },
    { key: "enquiries_5", label: "📬 5 Enquiries", desc: "Received 5 customer enquiries", done: enquiryCount >= 5 },
    { key: "first_review", label: "⭐ First Review", desc: "Received your first review", done: reviewCount >= 1 },
    { key: "star_review", label: "🏆 5-Star Review", desc: "Received a 5-star review", done: hasStarReview },
    { key: "first_call", label: "📞 First Call Click", desc: "Someone clicked your phone number", done: callClicks >= 1 },
    { key: "first_whatsapp", label: "💚 First WhatsApp", desc: "Someone clicked your WhatsApp", done: whatsappClicks >= 1 },
    { key: "age_30", label: "🗓️ 30 Days Listed", desc: "Been on Hasanpur Connect for 30 days", done: createdAt ? (Date.now() - new Date(createdAt).getTime()) / 86400000 >= 30 : false },
  ];

  const achieved = milestones.filter(m => m.done).length;

  return (
    <div>
      <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <p className="font-bold text-amber-800 dark:text-amber-300">{achieved} / {milestones.length} Milestones Achieved</p>
        <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2 mt-2">
          <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${(achieved / milestones.length) * 100}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {milestones.map(m => (
          <div key={m.key} className={`flex items-start gap-3 p-3 rounded-xl border ${m.done ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-muted/30 opacity-60"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${m.done ? "bg-green-500" : "bg-muted"}`}>
              {m.done && <CheckCircle className="w-4 h-4 text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
