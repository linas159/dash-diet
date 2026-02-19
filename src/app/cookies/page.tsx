import Link from "next/link";
import Image from "next/image";

export default function CookiePolicyPage() {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        <div className="prose-sm text-gray-600 space-y-6">
          <p className="text-xs text-gray-400">Last updated: February 2026</p>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">What Are Cookies?</h2>
            <p className="text-sm leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They help the website
              remember your preferences and improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Cookies We Use</h2>
            <div className="space-y-4 mt-3">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 text-sm">Essential Cookies</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Required for the website to function. These maintain your session and enable core features
                  like the quiz and checkout process. Cannot be disabled.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 text-sm">Functional Cookies</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Remember your preferences such as quiz progress and selected plan. These improve your
                  experience but are not strictly necessary.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 text-sm">Payment Cookies</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Set by Stripe to process payments securely and prevent fraud. These are necessary for
                  completing purchases.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">We Do Not Use</h2>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Advertising or retargeting cookies</li>
              <li>Third-party tracking cookies</li>
              <li>Social media tracking cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Managing Cookies</h2>
            <p className="text-sm leading-relaxed">
              You can control cookies through your browser settings. Note that disabling essential cookies
              may prevent parts of the website from functioning correctly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Contact</h2>
            <p className="text-sm leading-relaxed">
              For questions about our cookie policy, contact us at{" "}
              <Link href="/contact" className="text-dash-blue hover:underline">support@trydashdiet.com</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
