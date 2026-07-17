import React from "react";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-8 font-body space-y-6">
      <h1 className="font-display text-4xl font-bold text-on-surface">Terms of Service</h1>
      <p className="text-on-surface-variant">Last updated: {new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</p>
      
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">1. Acceptance of Terms</h2>
        <p className="text-on-surface-variant">
          By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. 
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">2. Description of Service</h2>
        <p className="text-on-surface-variant">
          We provide a school management and communication portal. The service allows authorized personnel to integrate their Google accounts for the purpose of official school communications.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">3. User Conduct</h2>
        <p className="text-on-surface-variant">
          You agree to use the communication tools responsibly and solely for school-related activities. Spamming, harassment, or unauthorized sharing of sensitive data is strictly prohibited.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">4. Modifications to Service</h2>
        <p className="text-on-surface-variant">
          We reserve the right at any time to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice.
        </p>
      </section>
    </div>
  );
}
