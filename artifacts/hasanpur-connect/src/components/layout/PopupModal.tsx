import { useListActivePopups } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const POPUP_STORAGE_KEY = "hc_popup_dismissed";

export default function PopupModal() {
  const { data: popups } = useListActivePopups();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const popup = popups?.[0];

  useEffect(() => {
    if (!popup) return;
    const wasDismissed = sessionStorage.getItem(`${POPUP_STORAGE_KEY}_${popup.id}`);
    if (!wasDismissed) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [popup?.id]);

  if (!popup || !visible || dismissed) return null;

  const handleClose = () => {
    setDismissed(true);
    sessionStorage.setItem(`${POPUP_STORAGE_KEY}_${popup.id}`, "1");
  };

  const typeLabels: Record<string, string> = {
    promotional: "Special Offer",
    offer: "Offer",
    business_registration: "Register Your Business",
    webdev: "Web Development",
    announcement: "Announcement",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{ backgroundColor: popup.bgColor || "#ffffff" }}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          aria-label="Close popup"
        >
          <X className="w-4 h-4" />
        </button>

        {popup.imageUrl && (
          <div className="w-full aspect-[16/9] overflow-hidden">
            <img src={popup.imageUrl} alt={popup.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary opacity-70">
            {typeLabels[popup.type] || popup.type}
          </span>
          <h2 className="text-xl font-bold mt-1 mb-2">{popup.title}</h2>
          {popup.description && (
            <p className="text-sm text-muted-foreground mb-4">{popup.description}</p>
          )}
          <div className="flex gap-3">
            {popup.buttonText && popup.buttonUrl && (
              <Button
                className="flex-1"
                onClick={() => {
                  window.open(popup.buttonUrl!, "_blank");
                  handleClose();
                }}
              >
                {popup.buttonText}
              </Button>
            )}
            <Button variant="outline" onClick={handleClose} className={popup.buttonText ? "shrink-0" : "w-full"}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
