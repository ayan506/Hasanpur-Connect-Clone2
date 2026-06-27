import { Clock } from "lucide-react";

export type DayHours = {
  open: string;
  close: string;
  closed: boolean;
  open24: boolean;
};

export type BusinessHours = Record<string, DayHours>;

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};
const DAY_FULL: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

function getJsDayName(d: number): string {
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][d];
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function getOpenStatus(hours: BusinessHours): { open: boolean; label: string } {
  const now = new Date();
  const todayKey = getJsDayName(now.getDay());
  const todayHours = hours[todayKey];

  if (!todayHours) return { open: false, label: "Hours not available" };
  if (todayHours.closed) return { open: false, label: "Closed today" };
  if (todayHours.open24) return { open: true, label: "Open 24 hours" };

  const current = now.getHours() * 60 + now.getMinutes();
  const openMins = timeToMinutes(todayHours.open || "09:00");
  const closeMins = timeToMinutes(todayHours.close || "18:00");
  const isOpen = current >= openMins && current < closeMins;

  if (isOpen) {
    return { open: true, label: `Closes at ${todayHours.close}` };
  } else if (current < openMins) {
    return { open: false, label: `Opens at ${todayHours.open}` };
  } else {
    return { open: false, label: `Closed · Opens ${DAY_FULL[getJsDayName((now.getDay() + 1) % 7)]} at ${todayHours.open}` };
  }
}

interface Props {
  hours: BusinessHours;
  compact?: boolean;
}

export function BusinessHoursDisplay({ hours, compact = false }: Props) {
  const status = getOpenStatus(hours);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className={`text-sm font-semibold ${status.open ? "text-green-600" : "text-red-500"}`}>
          {status.open ? "🟢 Open Now" : "🔴 Closed Now"}
        </span>
        <span className="text-sm text-muted-foreground">· {status.label}</span>
      </div>

      {!compact && (
        <div className="grid grid-cols-1 gap-1">
          {DAYS.map(day => {
            const h = hours[day];
            if (!h) return null;
            const todayKey = getJsDayName(new Date().getDay());
            const isToday = day === todayKey;
            return (
              <div
                key={day}
                className={`flex items-center justify-between py-1 px-2 rounded text-sm ${isToday ? "bg-primary/5 font-semibold" : ""}`}
              >
                <span className={`w-10 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {DAY_LABELS[day]}
                </span>
                <span className={h.closed ? "text-red-500" : "text-foreground"}>
                  {h.closed ? "Closed" : h.open24 ? "Open 24 Hours" : `${h.open} – ${h.close}`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface OpenNowBadgeProps {
  hours: BusinessHours | null | undefined;
}

export function OpenNowBadge({ hours }: OpenNowBadgeProps) {
  if (!hours) return null;
  const status = getOpenStatus(hours);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
      status.open
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    }`}>
      {status.open ? "🟢 Open" : "🔴 Closed"}
    </span>
  );
}
