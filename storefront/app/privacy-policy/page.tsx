import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";

const TITLE = "Privacy Policy | Pickora";
const DESCRIPTION = "How Pickora collects, uses, and protects your information when you shop with us.";
const LAST_UPDATED = "September 11, 2026";
const SUPPORT_EMAIL = "hello@pickoraonline.com";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy-policy" },
  // Not linked in the header nav by design — this page exists for
  // legal/compliance and platform-verification purposes (e.g. Google's
  // OAuth verification), reachable from the footer only.
  openGraph: { title: TITLE, description: DESCRIPTION },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
          <p className="text-sm uppercase tracking-[0.2em] text-taupe-light">Legal</p>
          <h1 className="mt-3 type-headline-md text-ink">Privacy Policy</h1>
          <p className="mt-2 text-sm text-taupe-light">Last updated: {LAST_UPDATED}</p>

          <p className="mt-6 text-taupe">
            Pickora (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website pickoraonline.com
            (the &quot;Site&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you visit our Site or make a purchase from us.
          </p>
          <p className="mt-4 text-taupe">
            By using our Site, you agree to the collection and use of information in accordance with this
            policy.
          </p>

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="type-label-md text-ink">1. Information We Collect</h2>

              <h3 className="mt-5 text-sm font-medium text-ink">a) Information you provide to us</h3>
              <p className="mt-2 text-taupe">
                When you create an account, place an order, contact support, or sign up for our newsletter, we
                may collect:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-taupe">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Shipping and billing address</li>
                <li>Order history and preferences</li>
                <li>Any information you submit through contact forms or customer support chats</li>
              </ul>

              <h3 className="mt-5 text-sm font-medium text-ink">b) Payment information</h3>
              <p className="mt-2 text-taupe">
                Payments are processed through secure third-party payment gateways (e.g., card processors,
                Apple Pay, or similar providers). We do not store your full card number, CVV, or banking
                credentials on our own servers — these are handled directly by our payment processor in
                compliance with PCI-DSS standards.
              </p>

              <h3 className="mt-5 text-sm font-medium text-ink">c) Information collected automatically</h3>
              <p className="mt-2 text-taupe">
                When you browse our Site, we automatically collect certain technical information, including:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-taupe">
                <li>IP address</li>
                <li>Browser type and device information</li>
                <li>Pages viewed and time spent on the Site</li>
                <li>Referring website/URL</li>
                <li>Cookies and similar tracking technologies (see Section 4)</li>
              </ul>

              <h3 className="mt-5 text-sm font-medium text-ink">d) Information from third parties</h3>
              <p className="mt-2 text-taupe">We may receive information about you from:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-taupe">
                <li>Social login providers (e.g., if you sign in with Google)</li>
                <li>Marketing and advertising platforms (e.g., Meta/Facebook, Google Ads) when you interact with our ads</li>
              </ul>
            </section>

            <section>
              <h2 className="type-label-md text-ink">2. How We Use Your Information</h2>
              <p className="mt-2 text-taupe">We use the information we collect to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-taupe">
                <li>Process and fulfill your orders, including shipping and delivery</li>
                <li>Communicate with you about your order, account, or customer support requests</li>
                <li>Send you marketing communications, promotions, and updates (you can opt out at any time)</li>
                <li>Improve our Site, products, and customer experience</li>
                <li>Detect and prevent fraud, abuse, or security incidents</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="type-label-md text-ink">3. How We Share Your Information</h2>
              <p className="mt-2 text-taupe">
                We do not sell your personal information to third parties. We may share your information with:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-taupe">
                <li>Payment processors — to complete transactions securely</li>
                <li>Shipping and logistics partners — to deliver your orders</li>
                <li>Analytics and advertising providers (e.g., Google Analytics, Meta Pixel) — to understand Site usage and measure ad performance</li>
                <li>Service providers who help us operate the Site (e.g., hosting, email delivery)</li>
                <li>Legal authorities — if required by law, court order, or to protect our rights, property, or safety</li>
              </ul>
              <p className="mt-2 text-taupe">
                Each of these parties is only given the information necessary to perform their function and is
                expected to handle it securely.
              </p>
            </section>

            <section>
              <h2 className="type-label-md text-ink">4. Cookies and Tracking Technologies</h2>
              <p className="mt-2 text-taupe">We use cookies and similar technologies to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-taupe">
                <li>Keep you logged in and remember your cart</li>
                <li>Understand how visitors use our Site (analytics)</li>
                <li>Deliver relevant ads and measure their performance (advertising pixels)</li>
              </ul>
              <p className="mt-2 text-taupe">
                You can control or disable cookies through your browser settings. Disabling cookies may affect
                certain features of the Site, such as your ability to stay logged in or complete checkout.
              </p>
            </section>

            <section>
              <h2 className="type-label-md text-ink">5. Data Retention</h2>
              <p className="mt-2 text-taupe">
                We retain your personal information for as long as necessary to fulfill the purposes outlined
                in this policy, including to comply with legal, accounting, or reporting obligations. Order and
                transaction records may be retained for a longer period as required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="type-label-md text-ink">6. Your Rights</h2>
              <p className="mt-2 text-taupe">Depending on your location, you may have the right to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-taupe">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of marketing communications at any time (via the unsubscribe link in our emails or by contacting us)</li>
                <li>Object to or restrict certain processing of your information</li>
              </ul>
              <p className="mt-2 text-taupe">To exercise any of these rights, contact us using the details in Section 9.</p>
            </section>

            <section>
              <h2 className="type-label-md text-ink">7. Data Security</h2>
              <p className="mt-2 text-taupe">
                We implement reasonable technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction. However, no
                method of transmission over the internet or electronic storage is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="type-label-md text-ink">8. Children&apos;s Privacy</h2>
              <p className="mt-2 text-taupe">
                Our Site is not intended for individuals under the age of 18. We do not knowingly collect
                personal information from children. If we become aware that we have collected personal
                information from a child without parental consent, we will take steps to delete that
                information.
              </p>
            </section>

            <section>
              <h2 className="type-label-md text-ink">9. Contact Us</h2>
              <p className="mt-2 text-taupe">
                If you have any questions about this Privacy Policy or how we handle your information, please
                contact us at:
              </p>
              <p className="mt-3 text-ink">
                Pickora
                <br />
                Email:{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-2 hover:no-underline">
                  {SUPPORT_EMAIL}
                </a>
                <br />
                Website: https://pickoraonline.com
              </p>
            </section>

            <section>
              <h2 className="type-label-md text-ink">10. Changes to This Policy</h2>
              <p className="mt-2 text-taupe">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page
                with an updated &quot;Last updated&quot; date. We encourage you to review this policy
                periodically.
              </p>
            </section>
          </div>
        </div>
      </main>
      <MobileDock />
    </>
  );
}
