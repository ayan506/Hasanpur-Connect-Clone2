import { useGetSettings } from "@workspace/api-client-react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UnderConstruction() {
  const { data: settings } = useGetSettings();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <style>{`
        @keyframes brickAppear {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes craneSwing {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
        }
        @keyframes barFill {
          0% { width: 0%; }
          70% { width: 90%; }
          100% { width: 0%; }
        }
        .brick { animation: brickAppear 0.4s ease-out forwards; opacity: 0; }
        .brick:nth-child(1) { animation-delay: 0s; }
        .brick:nth-child(2) { animation-delay: 0.15s; }
        .brick:nth-child(3) { animation-delay: 0.3s; }
        .brick:nth-child(4) { animation-delay: 0.45s; }
        .brick:nth-child(5) { animation-delay: 0.6s; }
        .brick:nth-child(6) { animation-delay: 0.75s; }
        .brick:nth-child(7) { animation-delay: 0.9s; }
        .brick:nth-child(8) { animation-delay: 1.05s; }
        .crane { animation: craneSwing 2.5s ease-in-out infinite; transform-origin: top center; }
        .progress-bar { animation: barFill 3s ease-in-out infinite; }
      `}</style>

      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <MapPin className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl text-primary">{settings?.siteName || "Hasanpur Connect"}</span>
        </div>

        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <g className="crane" transform="translate(130, 30)">
              <line x1="0" y1="0" x2="0" y2="80" stroke="#ea5c29" strokeWidth="4" strokeLinecap="round" />
              <line x1="-50" y1="10" x2="20" y2="10" stroke="#ea5c29" strokeWidth="4" strokeLinecap="round" />
              <line x1="0" y1="10" x2="0" y2="10" stroke="#ea5c29" strokeWidth="2" />
              <line x1="-10" y1="10" x2="-10" y2="30" stroke="#ea5c29" strokeWidth="2" strokeDasharray="3" />
              <rect x="-18" y="30" width="16" height="12" rx="2" fill="#ea5c29" opacity="0.8" />
            </g>
            <g transform="translate(20, 130)">
              <rect className="brick" x="0" y="0" width="32" height="14" rx="2" fill="#c4713a" />
              <rect className="brick" x="36" y="0" width="32" height="14" rx="2" fill="#c4713a" />
              <rect className="brick" x="72" y="0" width="32" height="14" rx="2" fill="#c4713a" />
              <rect className="brick" x="18" y="-18" width="32" height="14" rx="2" fill="#d4824b" />
              <rect className="brick" x="54" y="-18" width="32" height="14" rx="2" fill="#d4824b" />
              <rect className="brick" x="0" y="-36" width="32" height="14" rx="2" fill="#ea5c29" />
              <rect className="brick" x="36" y="-36" width="32" height="14" rx="2" fill="#ea5c29" />
              <rect className="brick" x="72" y="-36" width="32" height="14" rx="2" fill="#ea5c29" />
            </g>
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-2">We're building something awesome!</h1>
        <p className="text-primary font-medium text-lg mb-1">हम कुछ नया बना रहे हैं</p>
        <p className="text-muted-foreground max-w-md mx-auto text-sm mt-3">
          Our site is currently under maintenance. We'll be back shortly with improvements for you.
        </p>

        <div className="mt-8 w-64 mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="progress-bar h-full bg-primary rounded-full" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Work in progress...</p>
        </div>

        <div className="mt-10 max-w-sm mx-auto">
          <p className="text-sm text-muted-foreground mb-3">Notify me when we're back</p>
          <div className="flex gap-2">
            <Input type="email" placeholder="yourmail@gmail.com" className="flex-1" />
            <Button size="sm" className="shrink-0">Notify Me</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
