import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 py-1 flex items-center gap-3 border-b border-gray-100">
        <Link href="/" className="flex items-center">
          <Image
            src="/dash-diet-logo.svg"
            alt="DashDiet"
            width={240}
            height={80}
            className="h-20 w-auto"
          />
        </Link>
      </header>

      <div className="px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="prose-sm text-gray-600 space-y-6">
          <p className="text-xs text-gray-400">Last updated: February 2026</p>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
            <p className="text-sm leading-relaxed">
              We collect information you provide directly, including your email address, health quiz answers
              (such as age, height, weight, dietary preferences, and health conditions), and payment information
              processed securely through Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <p className="text-sm leading-relaxed">We use your information to:</p>
            <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
              <li>Generate your personalized DASH diet meal plan</li>
              <li>Process your subscription payments</li>
              <li>Send you your meal plan and account updates</li>
              <li>Improve our services and user experience</li>
              <li>Respond to your support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. Data Storage & Security</h2>
            <p className="text-sm leading-relaxed">
              Your data is stored securely using Supabase (hosted on AWS) with row-level security enabled.
              Payment information is processed and stored by Stripe — we never store your full credit card
              details on our servers. All data transmission is encrypted using TLS/SSL.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
            <p className="text-sm leading-relaxed">We use the following third-party services:</p>
            <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
              <li><strong>Stripe</strong> — Payment processing</li>
              <li><strong>Supabase</strong> — Database and authentication</li>
              <li><strong>Google Gemini</strong> — AI-powered meal plan generation</li>
              <li><strong>Vercel</strong> — Website hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Cookies</h2>
            <p className="text-sm leading-relaxed">
              We use essential cookies to maintain your session and preferences. We do not use advertising
              or tracking cookies. See our{" "}
              <Link href="/cookies" className="text-dash-blue hover:underline">Cookie Policy</Link>{" "}
              for more details.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. Your Rights</h2>
            <p className="text-sm leading-relaxed">You have the right to:</p>
            <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p className="text-sm leading-relaxed mt-2">
              To exercise these rights, contact us at{" "}
              <Link href="/contact" className="text-dash-blue hover:underline">support@trydashdiet.com</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Data Retention</h2>
            <p className="text-sm leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide you services.
              If you cancel your subscription, we retain your data for up to 12 months to allow for easy
              reactivation, after which it is deleted.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">8. Children&apos;s Privacy</h2>
            <p className="text-sm leading-relaxed">
              Our service is not intended for individuals under the age of 16. We do not knowingly collect
              personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">9. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this policy from time to time. We will notify you of significant changes via
              email or through our website.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">10. Contact</h2>
            <p className="text-sm leading-relaxed">
              For privacy-related questions, contact us at{" "}
              <Link href="/contact" className="text-dash-blue hover:underline">support@trydashdiet.com</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
