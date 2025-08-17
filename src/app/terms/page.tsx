
import { EdengramLogo } from "@/components/edengram-logo";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 border-b border-border">
        <div className="container mx-auto flex items-center gap-4">
            <EdengramLogo className="h-10 w-10" />
            <h1 className="text-3xl font-logo font-bold">Edengram</h1>
        </div>
      </header>
      <main className="container mx-auto py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight text-primary mb-8">Terms of Service</h2>
          <div className="space-y-6 text-muted-foreground">
            <p>Last Updated: August 17, 2025</p>

            <p>
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Edengram application (the "Service") operated by us.
            </p>

            <h3 className="text-2xl font-semibold text-foreground pt-4">1. Accounts</h3>
            <p>
              When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>

            <h3 className="text-2xl font-semibold text-foreground pt-4">2. Content</h3>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness. You retain any and all of your rights to any Content you submit.
            </p>

            <h3 className="text-2xl font-semibold text-foreground pt-4">3. Prohibited Uses</h3>
            <p>
                You may use the Service only for lawful purposes. You may not use the Service:
            </p>
            <ul className="list-disc list-inside space-y-2">
                <li>In any way that violates any applicable national or international law or regulation.</li>
                <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
            </ul>

            <h3 className="text-2xl font-semibold text-foreground pt-4">4. Termination</h3>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h3 className="text-2xl font-semibold text-foreground pt-4">5. Governing Law</h3>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is based, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-2xl font-semibold text-foreground pt-4">Changes to This Agreement</h3>
            <p>
                We reserve the right to modify these terms of service at any time. We do so by posting and drawing attention to the updated terms on the Site. Your decision to continue to visit and make use of the Site after such changes have been made constitutes your formal acceptance of the new Terms of Service.
            </p>

            <h3 className="text-2xl font-semibold text-foreground pt-4">Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at: risein98@gmail.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
