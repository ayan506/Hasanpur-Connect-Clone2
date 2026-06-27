import { useGetSettings } from "@workspace/api-client-react";

const speedMap: Record<string, string> = {
  slow: "40s",
  normal: "20s",
  fast: "10s",
};

export default function MarqueeBar() {
  const { data: settings } = useGetSettings();

  if (!settings?.marqueeEnabled || !settings.marqueeText) return null;

  const duration = speedMap[settings.marqueeSpeed || "normal"] || "20s";
  const text = settings.marqueeText;

  return (
    <div className="bg-primary/10 border-b border-primary/20 overflow-hidden py-1.5">
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .marquee-inner {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-scroll ${duration} linear infinite;
        }
        .marquee-inner:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="overflow-hidden">
        <span className="marquee-inner text-sm font-medium text-primary px-8">
          🔔 {text} 🔔 {text} 🔔 {text}
        </span>
      </div>
    </div>
  );
}
