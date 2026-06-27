import Layout from "@/components/layout/Layout";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerPage() {
  useMetaTags({
    title: "Disclaimer — Hasanpur Connect",
    description: "Read our disclaimer regarding business listings and information on Hasanpur Connect.",
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Disclaimer</h1>
          <p className="text-muted-foreground">Last updated: June 2025</p>
        </div>

        <div className="space-y-6 text-foreground">
          {[
            { title: "Accuracy of Information", body: "The information on Hasanpur Connect is provided by business owners and users. While we strive to keep information accurate, we cannot guarantee the completeness, reliability, or accuracy of any listing." },
            { title: "Business Relationships", body: "Hasanpur Connect does not endorse, recommend, or have any affiliation with the businesses listed on this platform. Any transactions or interactions between users and businesses are solely between those parties." },
            { title: "External Links", body: "Our platform may contain links to external websites. We have no control over the content of those sites and accept no responsibility for them." },
            { title: "Professional Advice", body: "Information on this platform should not be considered as professional legal, financial, medical, or other expert advice. Always consult a qualified professional for specific guidance." },
            { title: "Service Availability", body: "We do not guarantee that our service will be available at all times. We may perform maintenance, updates, or experience technical issues that temporarily affect availability." },
            { title: "Limitation of Liability", body: "To the fullest extent permitted by law, Hasanpur Connect shall not be liable for any indirect, incidental, or consequential damages arising from your use of this platform." },
          ].map(section => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold mb-3">{section.title}</h2>
              <p className="text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
