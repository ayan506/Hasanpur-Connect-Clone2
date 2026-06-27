import { useGetSettings } from "@workspace/api-client-react";
import { X, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

export default function AnnouncementBar() {
  const { data: settings } = useGetSettings();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [settings?.announcementText]);

  if (!settings?.announcementEnabled || dismissed) return null;

  const now = new Date();
  if (settings.announcementStartDate) {
    const start = new Date(settings.announcementStartDate);
    if (now < start) return null;
  }
  if (settings.announcementEndDate) {
    const end = new Date(settings.announcementEndDate);
    if (now > end) return null;
  }

  const isBottom = settings.announcementPosition === "bottom";
  const bgColor = settings.announcementBgColor || "#1e40af";
  const textColor = settings.announcementTextColor || "#ffffff";
  const isImage = settings.announcementType === "image";

  const content = (
    <div
      className={`relative w-full z-50 ${isBottom ? "fixed bottom-0 left-0 right-0" : ""}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-3">
          {isImage && settings.announcementImage ? (
            <img
              src={settings.announcementImage}
              alt="Announcement"
              className="h-8 object-contain"
            />
          ) : (
            <p className="text-sm font-medium text-center" style={{ color: textColor }}>
              {settings.announcementText}
            </p>
          )}
          {settings.announcementLink && (
            <a
              href={settings.announcementLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs underline flex items-center gap-1 opacity-90 hover:opacity-100"
              style={{ color: textColor }}
            >
              Learn more <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: textColor }}
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return content;
}
