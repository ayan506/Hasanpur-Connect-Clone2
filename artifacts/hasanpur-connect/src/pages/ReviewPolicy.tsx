import Layout from "@/components/layout/Layout";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { Star } from "lucide-react";

export default function ReviewPolicyPage() {
  useMetaTags({
    title: "Review Policy — Hasanpur Connect",
    description: "Learn how reviews are moderated and managed on Hasanpur Connect.",
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Review Policy</h1>
          <p className="text-muted-foreground">Our commitment to honest, genuine reviews.</p>
        </div>

        <div className="space-y-8 text-foreground">
          <section className="p-6 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold mb-3 text-green-700 dark:text-green-400">✅ Accepted Reviews</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Based on a genuine experience with the business</li>
              <li>Provide specific, constructive feedback</li>
              <li>Written in a respectful tone</li>
              <li>Relevant to the products or services offered</li>
              <li>Written by a real person with a valid contact</li>
            </ul>
          </section>

          <section className="p-6 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
            <h2 className="text-xl font-semibold mb-3 text-red-700 dark:text-red-400">❌ Not Accepted</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Fake, spam, or bot-generated reviews</li>
              <li>Reviews by business owners about their own business</li>
              <li>Reviews containing profanity, hate speech, or threats</li>
              <li>Reviews that violate any person's privacy</li>
              <li>Reviews in exchange for incentives (paid reviews)</li>
              <li>Competitor reviews designed to harm another business</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Moderation Process</h2>
            <p className="text-muted-foreground">All submitted reviews are reviewed by our team before being published. This process typically takes 24–48 hours. We reserve the right to reject or remove any review that violates this policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Reporting a Review</h2>
            <p className="text-muted-foreground">If you believe a review violates our policy, please use the 'Report' button on the review or contact us. We will investigate and take appropriate action.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Business Response</h2>
            <p className="text-muted-foreground">Business owners may respond to reviews posted about their business through their dashboard. Responses should be professional and constructive.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
