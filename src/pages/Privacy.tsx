import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-8 font-body space-y-6">
      <h1 className="font-display text-4xl font-bold text-on-surface">Privacy Policy</h1>
      <p className="text-on-surface-variant">Last updated: {new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</p>
      
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">1. Information We Collect</h2>
        <p className="text-on-surface-variant">
          When you use our application, particularly the Google integration features, we may collect and securely store necessary authentication tokens to provide you with the email services. We only request the minimum required scopes to send and read emails on your behalf within the context of the application.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">2. Use of Information</h2>
        <p className="text-on-surface-variant">
          The information collected is used solely to facilitate communication within the school network (e.g., sending newsletters, viewing messages). We do not use your data for advertising, nor do we sell your data to third parties.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">3. Google User Data</h2>
        <p className="text-on-surface-variant">
          Our application's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">4. Contact Us</h2>
        <p className="text-on-surface-variant">
          If you have any questions or concerns about this Privacy Policy, please contact the school administration.
        </p>
      </section>
    </div>
  );
}
