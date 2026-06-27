import Layout from "@/components/layout/Layout";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { FileText } from "lucide-react";

export default function TermsPage() {
  useMetaTags({
    title: "Terms & Conditions — Hasanpur Connect",
    description: "Read the Terms and Conditions for using Hasanpur Connect.",
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground">Last updated: June 2025</p>
        </div>

        <div className="space-y-6 text-foreground">
          {[
            { title: "1. Acceptance of Terms", body: "By accessing and using Hasanpur Connect, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services." },
            { title: "2. Business Listings", body: "Business owners are responsible for the accuracy and legality of the information they submit. False, misleading, or fraudulent listings will be removed immediately." },
            { title: "3. Reviews and Content", body: "Users may submit reviews and other content. You are solely responsible for content you submit. We reserve the right to remove content that violates our guidelines." },
            { title: "4. Intellectual Property", body: "All content on Hasanpur Connect, including text, graphics, and logos, is our property or the property of our users. You may not use it without permission." },
            { title: "5. Limitation of Liability", body: "Hasanpur Connect is not responsible for the accuracy of business listings, the quality of services provided by listed businesses, or any transactions between users and businesses." },
            { title: "6. Termination", body: "We reserve the right to terminate or suspend accounts at our discretion, particularly for violations of these terms, fraudulent activity, or at user request." },
            { title: "7. Changes to Terms", body: "We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms." },
            { title: "8. Governing Law", body: "These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Uttar Pradesh." },
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
