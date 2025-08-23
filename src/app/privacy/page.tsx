

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <header className="py-6 px-4 md:px-8 border-b border-border">
          <div className="container mx-auto">
              <h1 className="text-3xl font-logo font-bold">Edengram</h1>
          </div>
        </header>
        <main className="container mx-auto py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight text-primary mb-8">Privacy Policy</h2>
            <div className="space-y-6 text-muted-foreground">
              <p>Last Updated: August 17, 2025</p>

              <p>
                Welcome to Edengram ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application, including our social media platform and blog. By using Edengram, you agree to the collection and use of information in accordance with this policy.
              </p>

              <h3 className="text-2xl font-semibold text-foreground pt-4">1. Information We Collect</h3>
              <p>
                We may collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2">
                  <li><strong>Personal Data:</strong> When you register for an account, we ask for your email address and a password. You may also voluntarily provide a name and a profile picture.</li>
                  <li><strong>User-Generated Content:</strong> We collect the content you create, including the emojis you design, their settings (colors, shapes, etc.), captions, and any content you post as a "mood" (story).</li>
                  <li><strong>Usage and Social Data:</strong> We automatically collect information on how you interact with the service, such as your posts, likes, the users you support (follow), and who supports you. This helps us create your feed and provide the core social features of the app.</li>
                  <li><strong>Blog Interaction:</strong> We do not require personal information to read our blog. We may use analytics to understand which posts are popular, but this data is aggregated and does not identify individual readers.</li>
                  <li><strong>Technical Data:</strong> We may collect technical data such as your IP address, browser type, and device information to ensure the security and functionality of our service.</li>
              </ul>


              <h3 className="text-2xl font-semibold text-foreground pt-4">2. How We Use Your Information</h3>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Create and manage your account.</li>
                <li>Provide, operate, and maintain our services, including social features like feeds, moods, and notifications.</li>
                <li>Display your profile and creations to other users according to your privacy settings.</li>
                <li>Improve, personalize, and expand our services based on user activity.</li>
                <li>Communicate with you for customer service and to provide updates about the application.</li>
                <li>Protect the security of our platform and users.</li>
              </ul>

              <h3 className="text-2xl font-semibold text-foreground pt-4">3. Sharing Your Information</h3>
              <p>
                Your public profile information and public creations are visible to other users of the service. If your account is private, your information is only visible to supporters you approve. We do not sell your personal data. We may share information with third-party service providers (like our database and authentication provider, Supabase) only to the extent necessary to provide and maintain the service.
              </p>
              
              <h3 className="text-2xl font-semibold text-foreground pt-4">4. Data Security & Retention</h3>
              <p>
                We use industry-standard security measures to protect your personal information. We retain your data as long as your account is active. If you choose to delete your account, your personal data and creations will be permanently removed from our active databases according to the process described in the app.
              </p>

              <h3 className="text-2xl font-semibold text-foreground pt-4">5. Your Privacy Rights</h3>
              <p>
                You have the right to access, update, or delete your information at any time. You can manage your profile information and privacy settings directly within the app. To permanently delete your account and all associated data, you can use the "Delete Account" option in the menu.
              </p>

              <h3 className="text-2xl font-semibold text-foreground pt-4">Contact Us</h3>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at: risein98@gmail.com
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
