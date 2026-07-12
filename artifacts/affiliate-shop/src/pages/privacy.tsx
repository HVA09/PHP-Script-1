import { Link } from "wouter";
import { ChevronRight, Shield } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us when you subscribe to our newsletter, contact us, or interact with our services. This includes your name, email address, and any messages you send us. We also automatically collect certain information about how you interact with our website, including browser type, pages visited, time spent on pages, and referring URLs. We use cookies and similar tracking technologies to improve your experience.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to: provide, maintain, and improve our services; send you newsletters and promotional communications (with your consent); respond to your comments and questions; analyze usage trends; and comply with legal obligations. We do not sell your personal information to third parties.`,
  },
  {
    title: "3. Affiliate Disclosure",
    content: `DealHub participates in affiliate marketing programs. When you click on a product link and make a purchase, we may earn a commission from the retailer at no additional cost to you. This affiliate relationship does not influence our editorial recommendations — we only feature products we genuinely believe offer value to our readers. All affiliate links are clearly identified.`,
  },
  {
    title: "4. Cookies and Tracking",
    content: `We use cookies to: remember your preferences, analyze site traffic, and improve our services. We also use third-party analytics services (such as Google Analytics) that may set cookies. You can control cookies through your browser settings. Disabling cookies may affect some features of our website. We also use localStorage to save your wishlist and comparison selections locally on your device.`,
  },
  {
    title: "5. Data Sharing",
    content: `We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except: service providers who assist in our operations (under strict confidentiality agreements), when required by law, or to protect our rights. Aggregate, anonymized data may be shared with partners for analytical purposes.`,
  },
  {
    title: "6. Data Retention",
    content: `We retain your information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Newsletter subscribers can unsubscribe at any time. Contact form data is retained for 12 months.`,
  },
  {
    title: "7. Your Rights",
    content: `Depending on your location, you may have the right to: access the personal information we hold about you, request correction of inaccurate data, request deletion of your data, object to processing, and data portability. To exercise these rights, contact us at privacy@dealhub.com. EU residents have additional rights under GDPR.`,
  },
  {
    title: "8. Security",
    content: `We implement appropriate technical and organizational measures to protect your information. However, no internet transmission is completely secure, and we cannot guarantee absolute security. We encourage you to use strong passwords and to be careful about what information you share online.`,
  },
  {
    title: "9. Children's Privacy",
    content: `Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services after such changes constitutes your acceptance of the new policy.`,
  },
  {
    title: "11. Contact Us",
    content: `If you have questions about this Privacy Policy, please contact us at privacy@dealhub.com or visit our Contact page.`,
  },
];

export default function Privacy() {
  useSEO({
    title: "Privacy Policy",
    description: "DealHub's Privacy Policy — how we collect, use, and protect your personal information.",
  });

  return (
    <div className="pb-20">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Privacy Policy</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-start gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm">Last updated: July 12, 2026</p>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-10">
          <p className="text-sm leading-relaxed">
            <strong>Summary:</strong> DealHub is an affiliate marketplace. We collect minimal data, never sell your information, and use cookies only to improve your experience. We earn commissions from retailers when you buy through our links — this never influences our editorial recommendations.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="border-b pb-8 last:border-0">
              <h2 className="font-display text-xl font-bold mb-3">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-card border rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">Questions about your privacy?</p>
          <Link href="/contact" className="text-primary font-semibold hover:underline">Contact our privacy team →</Link>
        </div>
      </div>
    </div>
  );
}
