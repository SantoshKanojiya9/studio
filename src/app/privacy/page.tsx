
import { EdengramLogo } from "@/components/edengram-logo";

export default function PrivacyPolicyPage() {
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
          <h2 className="text-4xl font-bold tracking-tight text-primary mb-8">Privacy Policy</h2>
          <div className="space-y-6 text-muted-foreground">
            <p>Last Updated: August 17, 2025</p>

            <p>
              Welcome to Edengram ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>

            <h3 className="text-2xl font-semibold text-foreground pt-4">1. Information We Collect</h3>
            <p>
              We may collect personal information that you provide to us directly, such as your name, email address, and profile picture when you register for an account. We also collect user-generated content, such as the emojis you create and the posts you make.
            </p>

            <h3 className="text-2xl font-semibold text-foreground pt-4">2. How We Use Your Information</h3>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Create and manage your account.</li>
              <li>Provide, operate, and maintain our services.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the app.</li>
              <li>Process your transactions and manage your orders.</li>
            </ul>

            <h3 className="text-2xl font-semibold text-foreground pt-4">3. Sharing Your Information</h3>
            <p>
              We do not share your personal information with third parties except as described in this Privacy Policy. We may share your information with third-party vendors and service providers that perform services for us or on our behalf.
            </p>
            
            <h3 className="text-2xl font-semibold text-foreground pt-4">4. Data Security</h3>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>

            <h3 className="text-2xl font-semibold text-foreground pt-4">5. Your Privacy Rights</h3>
            <p>
              You may review, change, or terminate your account at any time. If you would like to review or change your information, you can do so in your profile settings. To terminate your account, please use the "Delete Account" option in the menu.
            </p>

            <h3 className="text-2xl font-semibold text-foreground pt-4">Contact Us</h3>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: risein98@gmail.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
