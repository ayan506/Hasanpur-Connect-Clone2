import Layout from "@/components/layout/Layout";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  useMetaTags({
    title: "Privacy Policy — Hasanpur Connect",
    description: "Read the Hasanpur Connect privacy policy to understand how we collect and use your data.",
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: June 2025</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">We collect information you provide directly to us, such as when you register a business, submit a review, or contact us. This includes your name, email address, phone number, and business details.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use the information we collect to operate and improve our services, send transactional emails, respond to your enquiries, and display your business listing to the public.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
            <p className="text-muted-foreground">We do not sell, trade, or rent your personal information to third parties. Business listing information (name, address, phone, etc.) is publicly visible by design.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Cookies</h2>
            <p className="text-muted-foreground">We use cookies to improve your browsing experience. You can control cookie settings through your browser. Essential cookies are required for the site to function properly.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
            <p className="text-muted-foreground">We take reasonable precautions to protect your information. Passwords are stored using industry-standard hashing algorithms and are never stored in plain text.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground">You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us through our Contact page.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Contact</h2>
            <p className="text-muted-foreground">For any privacy-related queries, please reach out to us via the Contact page.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
