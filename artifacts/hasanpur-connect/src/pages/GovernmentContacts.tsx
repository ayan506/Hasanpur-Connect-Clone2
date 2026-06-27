import { useListGovernmentContacts } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { Landmark, Phone } from "lucide-react";

export default function GovernmentContactsPage() {
  const { data: contacts, isLoading } = useListGovernmentContacts();

  useMetaTags({
    title: "Government Contacts — Hasanpur Connect",
    description: "Important government office contacts for Hasanpur, Uttar Pradesh.",
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <Landmark className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Government Contacts</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Important contact numbers for government offices and public services in Hasanpur.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : !contacts?.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <Landmark className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No contacts listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map(contact => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{contact.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{contact.designation}</p>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-primary hover:underline text-sm font-medium flex-shrink-0"
                    >
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
