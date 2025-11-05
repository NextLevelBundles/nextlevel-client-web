import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/app/(home)/components/sections/footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: January 29, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Digiphile ("we," "our," or "the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
            </p>
            <p className="mt-3">
              These Terms apply to all visitors, users, and others who access or use the Service. By using our Service, you represent and warrant that you have the legal capacity to enter into these Terms. If you are accessing or using the Service on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms.
            </p>
            <p className="mt-3">
              We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date. You are advised to review these Terms periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              Digiphile is a collaborative content discovery platform that offers curated gaming bundles, exclusive promotions, and community features. We provide:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Digital game bundles and Steam keys at competitive prices</li>
              <li>Curated content recommendations across games, music, films, and digital media</li>
              <li>Community engagement features including reviews, ratings, and discussions</li>
              <li>Charitable gaming initiatives supporting various causes</li>
              <li>Developer partnership programs and indie game showcases</li>
              <li>Seasonal promotions and flash sales</li>
              <li>Loyalty rewards and achievement systems</li>
              <li>Personalized discovery algorithms based on your preferences</li>
            </ul>
            <p className="mt-3">
              Our Service operates primarily through web-based platforms, with potential mobile applications in development. We continuously evolve our offerings based on community feedback and market trends. Some features may be in beta or experimental phases, which will be clearly marked.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold mb-2">3.1 Account Creation</h3>
            <p>
              To access certain features of our Service, you may need to create an account. You must provide accurate, complete, and current information during registration. Required information includes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Valid email address</li>
              <li>Username (must be unique and appropriate)</li>
              <li>Secure password meeting our minimum requirements</li>
              <li>Country of residence (for regional pricing and content availability)</li>
              <li>Date of birth (for age verification)</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-4">3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We recommend:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Using two-factor authentication when available</li>
              <li>Choosing a strong, unique password</li>
              <li>Not sharing your account credentials with others</li>
              <li>Logging out from shared devices</li>
              <li>Regularly reviewing your account activity</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.3 Age Requirements</h3>
            <p>
              You must be at least 13 years old to use our Service. If you are under 18, you must have parental or guardian consent to use the Service and make purchases. Users between 13-17 years old may have restricted access to certain features, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Mature-rated content</li>
              <li>Community chat features</li>
              <li>Direct messaging with other users</li>
              <li>Purchase limits and payment methods</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.4 Account Types</h3>
            <p>
              We offer different account types with varying features:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Free Account:</strong> Access to basic features, limited bundles, and community participation</li>
              <li><strong>Premium Account:</strong> Early access to sales, exclusive bundles, enhanced support</li>
              <li><strong>Developer Account:</strong> Tools for game submission, analytics, and promotional features</li>
              <li><strong>Creator Account:</strong> Content creation tools, revenue sharing, and audience insights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Purchases and Payments</h2>
            <h3 className="text-xl font-semibold mb-2">4.1 Digital Products</h3>
            <p>
              All purchases of digital products (including game bundles and Steam keys) are final and non-refundable, except as required by law or as explicitly stated in our refund policy. Digital products include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Individual game keys for various platforms (Steam, Epic, GOG, etc.)</li>
              <li>Bundle packages containing multiple games or content</li>
              <li>DLC (Downloadable Content) and expansion packs</li>
              <li>In-game currency and virtual items</li>
              <li>Subscription services and membership upgrades</li>
              <li>Digital gift cards and vouchers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Pricing</h3>
            <p>
              We reserve the right to change prices for our products at any time. Price changes will not affect orders that have already been placed. Pricing considerations include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Regional pricing adjustments based on local purchasing power</li>
              <li>Currency conversion at current exchange rates</li>
              <li>Applicable taxes and VAT in your jurisdiction</li>
              <li>Promotional discounts and time-limited offers</li>
              <li>Bundle savings and volume discounts</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Payment Processing</h3>
            <p>
              Payment processing is handled by secure third-party payment processors. We do not store your payment card details on our servers. Accepted payment methods include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Credit and debit cards (Visa, Mastercard, American Express)</li>
              <li>PayPal and other digital wallets</li>
              <li>Cryptocurrency (Bitcoin, Ethereum, and select others)</li>
              <li>Bank transfers for large purchases</li>
              <li>Platform-specific payment methods (Apple Pay, Google Pay)</li>
              <li>Digiphile gift cards and store credit</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.4 Refund Policy</h3>
            <p>
              While digital purchases are generally final, we may offer refunds in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Technical issues preventing product activation</li>
              <li>Duplicate purchases made in error</li>
              <li>Products not as described or significantly defective</li>
              <li>Within 14 days if the product key has not been revealed/redeemed</li>
              <li>As required by local consumer protection laws</li>
            </ul>
            <p className="mt-2">
              Refund requests must be submitted through our support system with proof of purchase and detailed explanation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>
            <h3 className="text-xl font-semibold mb-2">5.1 User Content</h3>
            <p>
              You retain ownership of any content you submit to our Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection with the Service.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.2 Our Content</h3>
            <p>
              All content on Digiphile, including text, graphics, logos, and software, is the property of Digiphile or its content suppliers and is protected by intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.3 Third-Party Content</h3>
            <p>
              Game titles, artwork, and other third-party content remain the property of their respective owners. We operate under license agreements with content providers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Engage in any form of automated data collection without our permission</li>
              <li>Impersonate any person or entity</li>
              <li>Sell, trade, or transfer your account to another person</li>
              <li>Use the Service to distribute spam or malware</li>
              <li>Engage in any activity that could damage our reputation</li>
              <li>Manipulate or exploit pricing errors or system glitches</li>
              <li>Use bots, scripts, or automated tools to make purchases</li>
              <li>Resell keys or products purchased through our platform without authorization</li>
              <li>Circumvent regional restrictions or geo-blocking measures</li>
              <li>Create multiple accounts to abuse promotions or rewards</li>
              <li>Share or distribute copyrighted content without permission</li>
              <li>Engage in fraudulent activities or payment disputes</li>
              <li>Reverse engineer or attempt to extract source code from our platform</li>
              <li>Use the Service to launder money or finance illegal activities</li>
              <li>Violate any third-party rights, including privacy and publicity rights</li>
            </ul>
            <p className="mt-3">
              Violation of these prohibited uses may result in immediate account termination, forfeiture of purchased products, and potential legal action.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Community Guidelines</h2>
            <p>
              When participating in our community features, you must:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Be respectful to other users and maintain civil discourse</li>
              <li>Not post offensive, harmful, or inappropriate content</li>
              <li>Not engage in harassment, bullying, or targeted attacks</li>
              <li>Respect others' privacy and intellectual property rights</li>
              <li>Use appropriate language free from profanity and hate speech</li>
              <li>Not share personal information of others without consent</li>
              <li>Report violations and suspicious activities to moderators</li>
              <li>Not spam or flood forums with repetitive content</li>
              <li>Provide constructive feedback and honest reviews</li>
              <li>Not organize or participate in brigading or vote manipulation</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-4">7.1 Content Moderation</h3>
            <p>
              We reserve the right to moderate, edit, or remove any user-generated content that violates our guidelines. This includes but is not limited to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Reviews that are fraudulent or misleading</li>
              <li>Comments containing personal attacks or discrimination</li>
              <li>Content promoting illegal activities or substances</li>
              <li>Sexually explicit or graphic violent content</li>
              <li>Commercial spam or unauthorized advertising</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">7.2 Enforcement Actions</h3>
            <p>
              Violations of community guidelines may result in:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Warning notifications</li>
              <li>Temporary suspension of community privileges</li>
              <li>Permanent ban from community features</li>
              <li>Full account termination in severe cases</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Charitable Initiatives</h2>
            <p>
              Some of our bundles support charitable causes. We will clearly indicate which portion of your purchase goes to charity. We are not responsible for how charitable organizations use donated funds.
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-4">8.1 Charity Partnerships</h3>
            <p>
              We partner with verified charitable organizations and foundations. For each charity bundle:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The charity beneficiary will be clearly identified</li>
              <li>The percentage or amount going to charity will be displayed</li>
              <li>Tax-deductible receipt availability will be indicated</li>
              <li>Regular transparency reports will be published</li>
              <li>100% of designated charity funds will be forwarded</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">8.2 Tax Considerations</h3>
            <p>
              Charitable contributions through bundle purchases may have tax implications:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Consult your tax advisor regarding deductibility</li>
              <li>We provide documentation for qualifying donations</li>
              <li>Tax treatment varies by jurisdiction</li>
              <li>Bundle purchases are not pure donations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitation of Liability</h2>
            <h3 className="text-xl font-semibold mb-2">9.1 Service Availability</h3>
            <p>
              We strive to maintain Service availability but do not guarantee uninterrupted access. The Service is provided "as is" without warranties of any kind. Specifically:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>We do not guarantee 100% uptime or availability</li>
              <li>Scheduled maintenance will be announced in advance when possible</li>
              <li>Emergency maintenance may occur without notice</li>
              <li>Service may be temporarily unavailable due to technical issues</li>
              <li>Features may be modified or discontinued at our discretion</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">9.2 Third-Party Services</h3>
            <p>
              We are not responsible for third-party services, including Steam, payment processors, or game developers' platforms. This includes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Platform availability and key activation issues</li>
              <li>Game performance, bugs, or compatibility</li>
              <li>Third-party account suspensions or bans</li>
              <li>Payment processor errors or delays</li>
              <li>External website content or policies</li>
              <li>Developer or publisher business decisions</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">9.3 Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, Digiphile shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Lost profits or revenue</li>
              <li>Loss of data or game progress</li>
              <li>Cost of substitute goods or services</li>
              <li>Personal injury or emotional distress</li>
              <li>Errors or omissions in content</li>
            </ul>
            <p className="mt-2">
              Our total liability shall not exceed the amount paid by you for the specific product or service in question during the 12 months preceding the claim.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">9.4 No Warranty</h3>
            <p>
              We expressly disclaim all warranties, whether express or implied, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Merchantability and fitness for a particular purpose</li>
              <li>Accuracy, reliability, or completeness of content</li>
              <li>Security or privacy of data transmission</li>
              <li>Compatibility with your hardware or software</li>
              <li>Freedom from viruses or harmful components</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Digiphile, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Privacy</h2>
            <p>
              Your use of our Service is also governed by our Privacy Policy. Please review our Privacy Policy, which explains how we collect, use, and protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Dispute Resolution</h2>
            <h3 className="text-xl font-semibold mb-2">14.1 Arbitration</h3>
            <p>
              Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration, except where prohibited by law.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">14.2 Class Action Waiver</h3>
            <p>
              You agree to resolve disputes with us on an individual basis and waive your right to participate in a class action lawsuit or class-wide arbitration.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Digiphile operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">17. Entire Agreement</h2>
            <p>
              These Terms constitute the entire agreement between you and Digiphile regarding the use of the Service, superseding any prior agreements between you and Digiphile relating to the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">18. Data Protection and GDPR</h2>
            <h3 className="text-xl font-semibold mb-2">18.1 GDPR Compliance</h3>
            <p>
              For users in the European Union, we comply with the General Data Protection Regulation (GDPR). You have the right to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">18.2 California Privacy Rights</h3>
            <p>
              California residents have additional rights under the California Consumer Privacy Act (CCPA), including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">19. Digital Services Act Compliance</h2>
            <p>
              In accordance with the EU Digital Services Act, we provide:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Clear information about content moderation practices</li>
              <li>Transparent recommendation systems</li>
              <li>Easy-to-use reporting mechanisms</li>
              <li>Appeals process for content decisions</li>
              <li>Regular transparency reports</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">20. Accessibility</h2>
            <p>
              We are committed to making our Service accessible to all users, including those with disabilities. We strive to comply with:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</li>
              <li>Americans with Disabilities Act (ADA) requirements</li>
              <li>European Accessibility Act standards</li>
            </ul>
            <p className="mt-2">
              If you encounter accessibility issues, please contact our support team for assistance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">21. Export Controls</h2>
            <p>
              You agree to comply with all applicable export and re-export control laws and regulations, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>U.S. Export Administration Regulations</li>
              <li>International Traffic in Arms Regulations</li>
              <li>Economic sanctions programs administered by OFAC</li>
            </ul>
            <p className="mt-2">
              You may not use or access the Service if you are located in a country embargoed by the United States or if you are on any U.S. government list of prohibited or restricted parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">22. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-semibold">Digiphile Support</p>
              <p>Email: legal@digiphile.co</p>
              <p>Support: support@digiphile.co</p>
              <p>Privacy: privacy@digiphile.co</p>
              <p>Business Inquiries: business@digiphile.co</p>
              <p>Press: press@digiphile.co</p>
              <div className="mt-3">
                <p className="font-semibold">Mailing Address:</p>
                <p>11060 Adoree St</p>
                <p>Norwalk, CA 90650</p>
                <p>United States</p>
              </div>
              <div className="mt-3">
                <p className="font-semibold">Business Hours:</p>
                <p>24/7 Support Available</p>
                <p>We're here to help anytime</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">23. Acknowledgment</h2>
            <p>
              By using Digiphile, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. You further acknowledge that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You have the legal capacity to enter into this agreement</li>
              <li>You will comply with all applicable laws and regulations</li>
              <li>You understand the risks associated with digital purchases</li>
              <li>You accept our policies regarding refunds and disputes</li>
              <li>You will respect the intellectual property rights of others</li>
              <li>You understand that violations may result in account termination</li>
            </ul>
            <p className="mt-4 font-semibold">
              Last reviewed and accepted: Upon account creation or first use of Service
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}