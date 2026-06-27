import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useListCategories } from "@workspace/api-client-react";
import { Loader2, Send } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function RequestServiceModal({ open, onClose }: Props) {
  const { data: categories } = useListCategories();
  const { toast } = useToast();

  const [serviceRequest, setServiceRequest] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast({ title: "Category required", description: "Please select a category for your request.", variant: "destructive" });
      return;
    }
    if (customerPhone.replace(/\D/g, "").length !== 10) {
      toast({ title: "Invalid phone", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceRequest,
          categoryId: categoryId ? Number(categoryId) : undefined,
          customerName,
          customerPhone,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }
      toast({ title: "Request sent! ✅", description: "Businesses in your category will contact you shortly." });
      setServiceRequest("");
      setCategoryId("");
      setCustomerName("");
      setCustomerPhone("");
      onClose();
    } catch (err) {
      toast({ title: "Failed to send", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Request a Service</DialogTitle>
          <DialogDescription>
            Tell us what you need — local businesses will reach out to you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="rs-service">What are you looking for?</Label>
            <Input
              id="rs-service"
              className="mt-1"
              placeholder="e.g. AC repair, catering, plumber..."
              value={serviceRequest}
              onChange={e => setServiceRequest(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="rs-category">Category <span className="text-destructive text-xs">*</span></Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a category (required)" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64 overflow-y-auto">
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="rs-name">Your Name</Label>
            <Input
              id="rs-name"
              className="mt-1"
              placeholder="Your full name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="rs-phone">Mobile Number</Label>
            <Input
              id="rs-phone"
              className="mt-1"
              type="tel"
              placeholder="10-digit mobile number"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
              maxLength={10}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
