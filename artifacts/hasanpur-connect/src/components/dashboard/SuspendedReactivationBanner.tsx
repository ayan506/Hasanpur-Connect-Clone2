import { useState } from "react";
import { AlertCircle, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Props { businessId: number; }

export function SuspendedReactivationBanner({ businessId }: Props) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/reactivation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, reason }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
      toast({ title: "Request submitted", description: "Our team will review it within 24–48 hours." });
    } catch {
      toast({ title: "Failed to submit", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-800 dark:text-green-300">Reactivation Request Submitted</p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">Our team will review your request within 24–48 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
      <div className="p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-red-800 dark:text-red-300">Listing Suspended</p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
            Your listing has been suspended by our team. If you believe this is incorrect, you can request reactivation.
          </p>
          {!expanded && (
            <Button size="sm" variant="outline" className="mt-3 border-red-300 text-red-700 hover:bg-red-100" onClick={() => setExpanded(true)}>
              Request Reactivation
            </Button>
          )}
        </div>
      </div>
      {expanded && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 border-t border-red-200 pt-3 space-y-3">
          <div>
            <Label className="text-sm text-red-800">Reason for reactivation request *</Label>
            <Textarea
              className="mt-1 border-red-300 focus:border-red-400"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Please explain why your listing should be reactivated..."
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading || !reason.trim()} className="bg-red-600 hover:bg-red-700 text-white">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
