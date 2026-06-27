import { useRef, useCallback } from "react";
// @ts-ignore - react-qr-code types not resolved via package exports
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Download, Share2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeWidgetProps {
  businessSlug: string;
  businessName: string;
  size?: number;
}

export function QRCodeWidget({ businessSlug, businessName, size = 160 }: QRCodeWidgetProps) {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  const profileUrl = `${window.location.origin}/business/${businessSlug}`;

  const handleDownload = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = size * 2;
    canvas.height = size * 2;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const link = document.createElement("a");
        link.download = `${businessSlug}-qr.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast({ title: "QR Code downloaded!" });
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [businessSlug, size, toast]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: `Check out ${businessName} on Hasanpur Connect`,
          url: profileUrl,
        });
      } catch {
        // ignore cancelled shares
      }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      toast({ title: "Link copied!", description: "Business profile link copied to clipboard." });
    }
  }, [businessName, profileUrl, toast]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={qrRef} className="p-3 bg-white rounded-xl border shadow-sm">
        <QRCode value={profileUrl} size={size} level="M" />
      </div>
      <p className="text-xs text-muted-foreground text-center">Scan to visit profile</p>
      <div className="flex gap-2 w-full">
        <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handleDownload}>
          <Download className="w-3.5 h-3.5" /> Download
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handleShare}>
          <Share2 className="w-3.5 h-3.5" /> Share
        </Button>
      </div>
    </div>
  );
}

interface QRIconButtonProps {
  businessSlug: string;
  businessName: string;
}

export function QRIconButton({ businessSlug, businessName }: QRIconButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() => {
        const url = `${window.location.origin}/business/${businessSlug}`;
        if (navigator.share) {
          navigator.share({ title: businessName, url });
        } else {
          navigator.clipboard.writeText(url);
        }
      }}
    >
      <QrCode className="w-4 h-4" /> QR
    </Button>
  );
}
