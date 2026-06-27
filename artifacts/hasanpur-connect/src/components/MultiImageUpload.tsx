import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image, Loader2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface MultiImageUploadProps {
  value?: string; // Serialized JSON array of strings
  onChange: (serialized: string) => void;
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({ value, onChange, label, maxImages = 5 }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse current list of images safely
  let images: string[] = [];
  if (value) {
    if (value.startsWith("[")) {
      try {
        images = JSON.parse(value);
      } catch {
        images = [value];
      }
    } else {
      images = [value];
    }
  }

  const handleFile = async (file: File) => {
    if (images.length >= maxImages) {
      setError(`Maximum of ${maxImages} images allowed.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${BASE}/api/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      const updated = [...images, data.url];
      onChange(JSON.stringify(updated));
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? JSON.stringify(updated) : "");
  };

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium">{label} <span className="text-xs text-muted-foreground font-normal">({images.length}/{maxImages} uploaded)</span></p>}
      
      <input 
        ref={inputRef} 
        type="file" 
        accept="image/*" 
        className="hidden"
        onChange={e => { 
          const f = e.target.files?.[0]; 
          if (f) handleFile(f); 
          e.target.value = ""; 
        }} 
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {images.map((imgUrl, idx) => (
          <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border bg-secondary/10">
            <img src={imgUrl} alt={`Group view ${idx + 1}`} className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={() => removeImage(idx)}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-destructive hover:bg-destructive/95 text-white rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
              Image {idx + 1}
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-primary/60 transition-colors aspect-square bg-muted/5 min-h-[100px]"
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { 
              e.preventDefault(); 
              const f = e.dataTransfer.files[0]; 
              if (f) handleFile(f); 
            }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-1.5 p-2">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-[10px] text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 p-1">
                <Image className="w-6 h-6 text-muted-foreground mb-1" />
                <p className="text-[10px] text-muted-foreground font-medium">Add Image</p>
                <Button type="button" variant="outline" size="sm" className="text-[10px] h-6 mt-1 px-2 py-0">
                  <Upload className="w-2.5 h-2.5 mr-1" /> Upload
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
