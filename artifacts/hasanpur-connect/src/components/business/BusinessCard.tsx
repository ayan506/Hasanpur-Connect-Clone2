import { Link } from "wouter";
import { Star, MapPin, Phone, MessageCircle, ShieldCheck, Crown, Bookmark } from "lucide-react";
import { Business } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpenNowBadge } from "@/components/business/BusinessHoursDisplay";

interface BusinessCardProps {
  business: Business;
}

function getFirstCoverImage(coverImage?: string | null): string {
  if (!coverImage) return "";
  if (coverImage.startsWith("[")) {
    try {
      const parsed = JSON.parse(coverImage);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    } catch {
      // ignore
    }
  }
  return coverImage;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const primaryImage = getFirstCoverImage(business.coverImage) || business.logo;
  return (
    <Card className="overflow-hidden flex flex-col h-full hover-elevate transition-all duration-300">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {primaryImage ? (
          <img 
            src={primaryImage} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/10">
            <span className="text-secondary font-medium text-lg">{business.name.charAt(0)}</span>
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {(business as any).isFeatured && (
            <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-none flex items-center gap-1 shadow-md">
              <Bookmark className="w-3 h-3" /> Featured
            </Badge>
          )}
          {business.isPremium && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none flex items-center gap-1 shadow-md">
              <Crown className="w-3 h-3" /> Premium
            </Badge>
          )}
          {business.isVerified && (
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-3 h-3" /> Verified
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <OpenNowBadge hours={(business as any).businessHours} />
        </div>
        
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur text-foreground border-none">
            {business.categoryName}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 flex-grow flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {business.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium ml-1">{business.averageRating?.toFixed(1) || "New"}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({business.reviewCount || 0} reviews)
            </span>
          </div>
        </div>
        
        <div className="space-y-2 mt-auto">
          {business.address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
              <span className="line-clamp-2">{business.address}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2">
        <Link href={`/business/${business.slug}`} className="flex-1">
          <Button variant="outline" className="w-full font-medium">
            View Details
          </Button>
        </Link>
        {business.whatsapp && business.isPremium && (
          <Button 
            size="icon" 
            className="bg-[#25D366] hover:bg-[#20BD5A] text-white shrink-0"
            onClick={() => window.open(`https://wa.me/${business.whatsapp?.replace(/\D/g, '')}`, '_blank')}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        )}
        {business.phone && (
          <Button 
            size="icon" 
            variant="secondary"
            className="shrink-0"
            onClick={() => window.location.href = `tel:${business.phone}`}
          >
            <Phone className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
