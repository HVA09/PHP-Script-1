import { Link } from "wouter";
import { ChevronRight, FileText } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using DealHub ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Service. We reserve the right to modify these terms at any time; your continued use constitutes acceptance of any changes.`,
  },
  {
    title: "2. Description of Service",
    content: `DealHub is an affiliate marketplace that curates and recommends products from third-party retailers. We earn commissions from these retailers when purchases are made through our links. We do not sell products directly, process payments, or handle shipping. All transactions occur on third-party retailer websites.`,
  },
  {
    title: "3. Affiliate Relationships",
    content: `DealHub participates in affiliate marketing programs. We are compensated for referring traffic and purchases to partner retailers. This compensation may influence which products we feature, but we maintain editorial independence and only recommend products we believe offer genuine value. All affiliate relationships are disclosed in accordance with FTC guidelines.`,
  },
  {
    title: "4. Pricing and Availability",
    content: `Product prices, availability, and deals are subject to change without notice. We strive to keep our listings current, but we cannot guarantee that prices shown on DealHub match the current prices at the retailer's website. Always verify the current price before completing a purchase on the retailer's site.`,
  },
  {
    title: "5. User Conduct",
    content: `You agree not to: use the Service for any unlawful purpose; attempt to gain unauthorized access to any portion of the Service; interfere with the proper operation of the Service; scrape, crawl, or index any page of the Service without authorization; or use the Service in a way that could damage, disable, or impair it.`,
  },
  {
    title: "6. Intellectual Property",
    content: `All content on DealHub, including text, graphics, logos, images, and software, is the property of DealHub or its content suppliers and is protected by copyright law. You may not reproduce, distribute, modify, or create derivative works without our express written permission.`,
  },
  {
    title: "7. Disclaimers",
    content: `THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE. We are not responsible for the quality, safety, or legality of products listed, the accuracy of retailer listings, or any transactions you complete with third-party retailers.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `TO THE FULLEST EXTENT PERMITTED BY LAW, DEALHUB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE OR ANY PRODUCTS PURCHASED THROUGH OUR AFFILIATE LINKS. Our total liability for any claim shall not exceed $100.`,
  },
  {
    title: "9. Third-Party Links",
    content: `Our Service contains links to third-party websites. These links are provided for convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them. When you leave our website, our Terms and Privacy Policy no longer apply.`,
  },
  {
    title: "10. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in San Francisco County, California.`,
  },
  {
    title: "11. Changes to Terms",
    content: `We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on this page. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.`,
  },
  {
    title: "12. Contact Information",
    content: `If you have questions about these Terms and Conditions, please contact us at legal@dealhub.com or through our Contact page.`,
  },
];

export default function Terms() {
  useSEO({
    title: "Terms & Conditions",
    description: "DealHub Terms and Conditions — the rules governing use of our affiliate marketplace.",
  });

  return (
    <div className="pb-20">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Terms & Conditions</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-start gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">Terms & Conditions</h1>
            <p className="text-muted-foreground text-sm">Last updated: July 12, 2026</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Important:</strong> DealHub is an affiliate marketplace. We do not sell products directly. All purchases are made on third-party retailer websites. Please read these terms carefully before using our service.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="border-b pb-8 last:border-0">
              <h2 className="font-display text-xl font-bold mb-3">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-card border rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">Questions about our terms?</p>
          <Link href="/contact" className="text-primary font-semibold hover:underline">Contact our legal team →</Link>
        </div>
      </div>
    </div>
  );
}
