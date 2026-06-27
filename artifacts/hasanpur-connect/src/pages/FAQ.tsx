import Layout from "@/components/layout/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { HelpCircle } from "lucide-react";

const faqs = [
  { q: "What is Hasanpur Connect?", a: "Hasanpur Connect is a local business directory for Hasanpur, Uttar Pradesh. We help residents discover trusted local businesses, services, and professionals." },
  { q: "How do I list my business?", a: "Click on 'Register Business' in the navigation. Fill in your business details and submit. Your listing will be reviewed and approved by our team within 24–48 hours." },
  { q: "Is listing my business free?", a: "Yes, basic listings are completely free. We also offer premium featured listings for businesses that want extra visibility." },
  { q: "How do I update my business information?", a: "Log in to your business dashboard at /dashboard. From there you can manage your listing, add products, and view enquiries." },
  { q: "How are reviews moderated?", a: "All reviews go through a moderation process before being published. We remove fake, spam, or inappropriate reviews to maintain quality." },
  { q: "Can I report an incorrect business listing?", a: "Yes, you can report any listing using the 'Report' button on the business profile page. Our team will review it promptly." },
  { q: "How do I contact a business?", a: "Click on any business listing to view its full profile, where you can find their phone number, email, WhatsApp, and a contact form." },
  { q: "Is my data safe on Hasanpur Connect?", a: "Yes, we take data privacy seriously. Please read our Privacy Policy for full details on how we collect and use your information." },
  { q: "How do I delete my account or listing?", a: "Please contact us at our Contact page and we will process your request within 3 business days." },
  { q: "Can I list multiple businesses?", a: "Yes, each business owner can list multiple businesses using the same account." },
];

export default function FAQPage() {
  useMetaTags({
    title: "FAQ — Hasanpur Connect",
    description: "Frequently asked questions about Hasanpur Connect — the local business directory for Hasanpur, UP.",
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Everything you need to know about Hasanpur Connect.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border rounded-xl px-4">
              <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
}
