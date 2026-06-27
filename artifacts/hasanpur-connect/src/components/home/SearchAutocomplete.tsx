import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  logo: string | null;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchAutocomplete({ value, onChange, onSearch, placeholder = "Search businesses, services…", className = "" }: Props) {
  const [, setLocation] = useLocation();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE}/api/search/autocomplete?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setOpen(data.length > 0);
        }
      } catch { }
    }, 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (s: Suggestion) => {
    setOpen(false);
    setLocation(`${BASE}/business/${s.slug}`);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center bg-white rounded-xl shadow-lg border overflow-hidden">
        <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { setOpen(false); onSearch(); } }}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          className="flex-1 px-3 py-3.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
        {value && (
          <button onClick={() => { onChange(""); setSuggestions([]); setOpen(false); }} className="mr-2 text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => { setOpen(false); onSearch(); }}
          className="bg-primary text-white px-5 py-3.5 text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0">
          Search
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border shadow-xl overflow-hidden">
          {suggestions.map(s => (
            <button
              key={s.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors"
              onMouseDown={() => handleSelect(s)}
            >
              {s.logo ? (
                <img src={s.logo} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">{s.name.charAt(0)}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.categoryName}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
