import { useListCommunityPartners } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { Users, ExternalLink } from "lucide-react";

export default function CommunityPartnersPage() {
  const { data: partners, isLoading } = useListCommunityPartners();

  useMetaTags({
    title: "Community Partners — Hasanpur Connect",
    description: "Meet the community partners who help grow the Hasanpur Connect network.",
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Community Partners</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            These dedicated individuals help spread the word about Hasanpur Connect in our community.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : !partners?.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No partners listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map(partner => {
              let socialLinks: Record<string, string> = {};
              try { socialLinks = JSON.parse(partner.socialLinksJson || "{}"); } catch {}
              return (
                <Card key={partner.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {partner.photoUrl ? (
                        <img src={partner.photoUrl} alt={partner.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-primary/20" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-foreground">{partner.name}</h3>
                          {partner.badge && (
                            <Badge variant="secondary" className="text-xs">{partner.badge}</Badge>
                          )}
                        </div>
                        {partner.about && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{partner.about}</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          {partner.totalReferrals > 0 && (
                            <span>{partner.totalReferrals} referrals</span>
                          )}
                          {partner.totalVisitorsSent > 0 && (
                            <span>{partner.totalVisitorsSent} visitors sent</span>
                          )}
                        </div>
                        {Object.keys(socialLinks).length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {Object.entries(socialLinks).map(([platform, url]) => (
                              <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-0.5">
                                <ExternalLink className="w-3 h-3" />
                                {platform}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
