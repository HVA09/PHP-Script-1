import { useState } from "react";
import { Link } from "wouter";
import { ChevronRight, Mail, MessageSquare, Clock, CheckCircle, Send, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";

const topics = [
  "General Inquiry",
  "Product Recommendation",
  "Affiliate Partnership",
  "Report a Broken Link",
  "Press / Media",
  "Other",
];

export default function Contact() {
  useSEO({
    title: "Contact Us",
    description: "Get in touch with the DealHub team. We respond to all inquiries within 24 hours.",
    keywords: "contact dealhub, support, affiliate partnership, product feedback",
  });

  const [form, setForm] = useState({ name: "", email: "", topic: topics[0], message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Contact</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-accent text-accent-foreground py-16 text-center">
        <div className="container mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-accent-foreground/75 max-w-lg mx-auto">We'd love to hear from you. Whether it's a product question, partnership inquiry, or feedback — we respond to everything.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Info sidebar */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold mb-5">Contact Info</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "hello@dealhub.com" },
                  { icon: Phone, label: "Support", value: "support@dealhub.com" },
                  { icon: MapPin, label: "Location", value: "San Francisco, CA" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Response Times</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex justify-between"><span>General inquiries</span><span className="font-medium">24h</span></li>
                <li className="flex justify-between"><span>Partnership requests</span><span className="font-medium">48h</span></li>
                <li className="flex justify-between"><span>Broken link reports</span><span className="font-medium">4h</span></li>
                <li className="flex justify-between"><span>Press inquiries</span><span className="font-medium">48h</span></li>
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <h3 className="font-semibold mb-2">Affiliate Partners</h3>
              <p className="text-sm text-muted-foreground">Interested in having your products featured on DealHub? We review all partnership applications.</p>
              <button
                onClick={() => setForm((f) => ({ ...f, topic: "Affiliate Partnership" }))}
                className="mt-3 text-sm text-primary font-semibold hover:underline"
              >
                Apply as a partner →
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-16 bg-card border rounded-2xl px-8">
                <div className="w-20 h-20 rounded-full bg-green-100 text-green-500 flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Message sent!</h2>
                <p className="text-muted-foreground mb-6 max-w-sm">Thanks for reaching out, <strong>{form.name}</strong>. We'll get back to you at <strong>{form.email}</strong> within 24 hours.</p>
                <Button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", topic: topics[0], message: "" }); }}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-8 space-y-5">
                <h2 className="font-display text-2xl font-bold mb-2">Send us a message</h2>
                <p className="text-sm text-muted-foreground">All fields are required.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                    <Input
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Email Address</label>
                    <Input
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Topic</label>
                  <select
                    value={form.topic}
                    onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Message</label>
                  <textarea
                    rows={6}
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-12 font-semibold text-base gap-2" disabled={loading}>
                  {loading ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
