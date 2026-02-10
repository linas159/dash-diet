import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-dash-blue to-dash-teal rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-lg text-dash-blue">DashDiet</span>
        </Link>
      </header>

      <div className="px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
        <div className="prose-sm text-gray-600 space-y-6">
          <p className="text-xs text-gray-400">Last updated: February 2026</p>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By accessing or using the DashDiet website and services, you agree to be bound by these Terms and Conditions.
              If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. Service Description</h2>
            <p className="text-sm leading-relaxed">
              DashDiet provides personalized DASH diet meal plans, exercise recommendations, and nutritional guidance
              based on user-provided health information. Our service is for informational purposes and does not
              constitute medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. Subscriptions & Billing</h2>
            <p className="text-sm leading-relaxed">
              Subscriptions are billed according to the plan selected during checkout. Introductory pricing applies
              for the initial period, after which standard pricing takes effect. All prices are shown at the time
              of purchase. You may cancel your subscription at any time through your account settings or by
              contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Refund Policy</h2>
            <p className="text-sm leading-relaxed">
              We offer a 30-day money-back guarantee. If you are not satisfied with our service within the first
              30 days of your subscription, contact us for a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Health Disclaimer</h2>
            <p className="text-sm leading-relaxed">
              DashDiet is not a substitute for professional medical advice, diagnosis, or treatment. Always consult
              your physician or qualified health provider before starting any diet or exercise program. The DASH diet
              plans we provide are general recommendations based on the information you share with us.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. User Accounts</h2>
            <p className="text-sm leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and for all activities that
              occur under your account. You must provide accurate and complete information during the registration process.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Intellectual Property</h2>
            <p className="text-sm leading-relaxed">
              All content, including meal plans, exercise routines, and other materials provided through DashDiet,
              are protected by copyright. You may use these materials for personal use only and may not redistribute
              or sell them.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">8. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed">
              DashDiet shall not be liable for any indirect, incidental, special, or consequential damages resulting
              from the use or inability to use our services. Our total liability shall not exceed the amount paid
              by you for the service in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">9. Changes to Terms</h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after changes
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">10. Contact</h2>
            <p className="text-sm leading-relaxed">
              For questions about these terms, please contact us at{" "}
              <Link href="/contact" className="text-dash-blue hover:underline">support@dashdiet.com</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
