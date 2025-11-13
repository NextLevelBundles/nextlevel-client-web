import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/app/(home)/components/sections/footer";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: January 29, 2025
          </p>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-sm">
              <strong>Quick Summary:</strong> We collect information to provide
              and improve our services. We never sell your personal data. You
              have full control over your information and can request deletion
              at any time. We use industry-standard security to protect your
              data.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Digiphile ("we," "our," or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our website,
              services, and platform (collectively, the "Service").
            </p>
            <p className="mt-3">
              By using our Service, you consent to the data practices described
              in this Privacy Policy. If you do not agree with the terms of this
              Privacy Policy, please do not access the Service.
            </p>
            <p className="mt-3">
              We reserve the right to make changes to this Privacy Policy at any
              time. We will notify you of any changes by updating the "Last
              updated" date and, for material changes, we will send you an email
              notification or display a prominent notice on our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold mb-2">
              2.1 Information You Provide Directly
            </h3>
            <p>We collect information you provide when you:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Create an Account:</strong> Username, email address,
                password, date of birth, country of residence
              </li>
              <li>
                <strong>Complete Your Profile:</strong> Avatar, bio, gaming
                preferences, favorite genres, platform accounts (Steam ID, etc.)
              </li>
              <li>
                <strong>Make Purchases:</strong> Billing name, billing address,
                payment method details (processed by secure third parties)
              </li>
              <li>
                <strong>Contact Support:</strong> Name, email, description of
                issue, any attachments you provide
              </li>
              <li>
                <strong>Participate in Community:</strong> Forum posts, reviews,
                ratings, comments, direct messages
              </li>
              <li>
                <strong>Enter Promotions:</strong> Contact information, survey
                responses, competition entries
              </li>
              <li>
                <strong>Subscribe to Newsletter:</strong> Email address, content
                preferences
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              2.2 Information Collected Automatically
            </h3>
            <p>When you use our Service, we automatically collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Device Information:</strong> IP address, browser type,
                operating system, device identifiers, mobile network information
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, time spent, click
                patterns, search queries, purchase history, wishlist items
              </li>
              <li>
                <strong>Cookies and Tracking:</strong> Session cookies,
                persistent cookies, web beacons, pixel tags
              </li>
              <li>
                <strong>Log Data:</strong> Access times, referring website
                addresses, browser language, crash reports
              </li>
              <li>
                <strong>Location Information:</strong> Approximate location
                based on IP address for regional pricing and content
              </li>
              <li>
                <strong>Game Activity:</strong> Games owned, playtime,
                achievements (when linked accounts permit)
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              2.3 Information from Third Parties
            </h3>
            <p>We may receive information from:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Social Media Platforms:</strong> When you log in using
                Facebook, Google, Twitter, Discord
              </li>
              <li>
                <strong>Gaming Platforms:</strong> Steam, Epic Games, GOG (with
                your permission)
              </li>
              <li>
                <strong>Payment Processors:</strong> Transaction confirmations,
                fraud prevention data
              </li>
              <li>
                <strong>Analytics Providers:</strong> Demographic data, interest
                categories
              </li>
              <li>
                <strong>Marketing Partners:</strong> Campaign effectiveness,
                referral sources
              </li>
              <li>
                <strong>Public Databases:</strong> For age verification and
                fraud prevention
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. How We Use Your Information
            </h2>
            <p>We use collected information for the following purposes:</p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              3.1 Service Provision and Improvement
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process transactions and deliver purchased products</li>
              <li>Maintain and improve our Service functionality</li>
              <li>Personalize your experience and recommendations</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send service-related notifications and updates</li>
              <li>Manage your account and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              3.2 Safety and Security
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Detect and prevent fraud, abuse, and illegal activities</li>
              <li>Verify identity and age requirements</li>
              <li>Enforce our Terms of Service and policies</li>
              <li>Protect the rights and safety of users and third parties</li>
              <li>Maintain the security and integrity of our systems</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              3.3 Communication and Marketing
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Send promotional emails about new products, sales, and events
                (with consent)
              </li>
              <li>Deliver targeted advertisements based on your interests</li>
              <li>Conduct surveys and collect feedback</li>
              <li>Notify you about changes to our Service or policies</li>
              <li>Send push notifications (with your permission)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              3.4 Legal and Compliance
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Comply with legal obligations and regulations</li>
              <li>Respond to legal requests and court orders</li>
              <li>Establish, exercise, or defend legal claims</li>
              <li>Comply with tax and financial reporting requirements</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              3.5 Analytics and Research
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Analyze usage patterns and trends</li>
              <li>Measure marketing campaign effectiveness</li>
              <li>Conduct market research and user studies</li>
              <li>Develop new features and services</li>
              <li>Create aggregated and anonymized statistics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. How We Share Your Information
            </h2>
            <p>
              We do not sell, trade, or rent your personal information. We may
              share your information in the following situations:
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              4.1 Service Providers
            </h3>
            <p>
              We share information with trusted third-party service providers
              who assist us in:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Payment processing (Stripe, PayPal, cryptocurrency processors)
              </li>
              <li>Email delivery (SendGrid, Mailchimp)</li>
              <li>Cloud storage and hosting (AWS, Google Cloud)</li>
              <li>Customer support (Zendesk, Intercom)</li>
              <li>Analytics (Google Analytics, Mixpanel)</li>
              <li>Content delivery networks (Cloudflare)</li>
              <li>Fraud prevention and security services</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              4.2 Business Partners
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Game developers and publishers (for key activation and support)
              </li>
              <li>Charitable organizations (for charity bundles)</li>
              <li>Co-marketing partners (with your consent)</li>
              <li>Platform providers (Steam, Epic Games) for integration</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              4.3 Legal Requirements
            </h3>
            <p>We may disclose information when required to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Comply with applicable laws and regulations</li>
              <li>Respond to subpoenas, court orders, or legal process</li>
              <li>Cooperate with law enforcement agencies</li>
              <li>Protect our rights, property, or safety</li>
              <li>Prevent fraud or cybersecurity threats</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              4.4 Business Transfers
            </h3>
            <p>
              In the event of a merger, acquisition, bankruptcy, or sale of
              assets, your information may be transferred to the successor
              entity. We will notify you via email and/or prominent notice on
              our Service of any change in ownership.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              4.5 With Your Consent
            </h3>
            <p>
              We may share your information for other purposes with your
              explicit consent.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              4.6 Aggregated and Anonymized Data
            </h3>
            <p>
              We may share aggregated or anonymized information that cannot
              identify you with third parties for marketing, research, or other
              purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. Cookies and Tracking Technologies
            </h2>

            <h3 className="text-xl font-semibold mb-2">
              5.1 Types of Cookies We Use
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for basic site
                functionality, authentication, and security
              </li>
              <li>
                <strong>Performance Cookies:</strong> Help us understand how
                visitors interact with our Service
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember your
                preferences and personalization settings
              </li>
              <li>
                <strong>Marketing Cookies:</strong> Track your activity to
                deliver relevant advertisements
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Collect anonymous data about
                site usage and performance
              </li>
              <li>
                <strong>Social Media Cookies:</strong> Enable social media
                features and sharing
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              5.2 Third-Party Cookies
            </h3>
            <p>
              Third parties may place cookies on your device for advertising,
              analytics, and other purposes. These include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Google Analytics and Google Ads</li>
              <li>Facebook Pixel</li>
              <li>Twitter Analytics</li>
              <li>YouTube embeds</li>
              <li>Payment processor cookies</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              5.3 Managing Cookies
            </h3>
            <p>You can control cookies through:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Our cookie consent banner and preference center</li>
              <li>Your browser settings (may impact Service functionality)</li>
              <li>
                Third-party opt-out tools (e.g., Google Ad Settings, Facebook Ad
                Preferences)
              </li>
              <li>Industry opt-out platforms (e.g., NAI, DAA, EDAA)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              5.4 Do Not Track
            </h3>
            <p>
              We currently do not respond to Do Not Track (DNT) browser signals.
              However, you can use our cookie preferences to control tracking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information:
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              6.1 Security Measures
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Secure password requirements and hashing (bcrypt)</li>
              <li>Two-factor authentication options</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and employee training</li>
              <li>PCI DSS compliance for payment processing</li>
              <li>Incident response and breach notification procedures</li>
              <li>Regular backups and disaster recovery plans</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              6.2 Your Security Responsibilities
            </h3>
            <p>You can help protect your account by:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Using a strong, unique password</li>
              <li>Enabling two-factor authentication</li>
              <li>Keeping your login credentials confidential</li>
              <li>Logging out from shared devices</li>
              <li>Promptly reporting suspicious activity</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              6.3 Data Breach Notification
            </h3>
            <p>
              In the event of a data breach affecting your personal information,
              we will notify you within 72 hours via email and provide
              information about the incident and steps to protect yourself.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide our
              Service and comply with legal obligations:
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              7.1 Retention Periods
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Account Information:</strong> Duration of account plus
                30 days after deletion
              </li>
              <li>
                <strong>Transaction Records:</strong> 7 years for tax and legal
                compliance
              </li>
              <li>
                <strong>Customer Support:</strong> 3 years from last interaction
              </li>
              <li>
                <strong>Marketing Communications:</strong> Until you unsubscribe
                plus 30 days
              </li>
              <li>
                <strong>Cookie Data:</strong> Up to 13 months or until deleted
              </li>
              <li>
                <strong>Server Logs:</strong> 90 days for security analysis
              </li>
              <li>
                <strong>User Content:</strong> Until deleted by user or account
                termination
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              7.2 Deletion Requests
            </h3>
            <p>
              You can request deletion of your personal information at any time.
              We will delete or anonymize your data within 30 days, except where
              we are required to retain it for legal purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Your Privacy Rights
            </h2>
            <p>
              Depending on your location, you may have the following rights
              regarding your personal information:
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              8.1 Universal Rights
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Access:</strong> Request a copy of your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Portability:</strong> Receive your data in a
                machine-readable format
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing
                communications
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Revoke previously given
                consent
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              8.2 GDPR Rights (EU/EEA/UK Residents)
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Right to object to processing</li>
              <li>Right to restrict processing</li>
              <li>Right not to be subject to automated decision-making</li>
              <li>Right to lodge a complaint with supervisory authorities</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              8.3 CCPA Rights (California Residents)
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if information is sold or disclosed</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
              <li>Right to authorized agent representation</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              8.4 Additional State Rights
            </h3>
            <p>
              Residents of Virginia, Colorado, Connecticut, and Utah have
              similar rights under their respective privacy laws.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              8.5 How to Exercise Your Rights
            </h3>
            <p>To exercise any of these rights, please:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Email us at privacy@digiphile.co</li>
              <li>Use the privacy settings in your account dashboard</li>
              <li>Call us at 1-800-XXX-XXXX (toll-free)</li>
              <li>Submit a request through our privacy portal</li>
            </ul>
            <p className="mt-2">
              We will respond to your request within 30 days (or 45 days for
              complex requests).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              9. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your country of residence, including the United States.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              9.1 Transfer Mechanisms
            </h3>
            <p>We ensure appropriate safeguards through:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Standard Contractual Clauses approved by the European Commission
              </li>
              <li>Data Processing Agreements with service providers</li>
              <li>Adequacy decisions where applicable</li>
              <li>Your explicit consent for specific transfers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              9.2 Data Localization
            </h3>
            <p>
              Where required by law, we store and process data locally in your
              jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              10. Children's Privacy
            </h2>
            <p>
              Our Service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              10.1 Age Verification
            </h3>
            <p>
              We use age verification mechanisms to prevent underage users from
              accessing age-inappropriate content or making purchases.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              10.2 Parental Rights
            </h3>
            <p>
              Parents or guardians who believe we have collected information
              from a child under 13 should contact us immediately at
              privacy@digiphile.co. We will promptly delete such information.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              10.3 Teen Privacy (13-17)
            </h3>
            <p>For users aged 13-17, we:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Limit data collection to necessary information</li>
              <li>Restrict certain community features</li>
              <li>Do not sell or share personal information</li>
              <li>Provide enhanced privacy controls</li>
              <li>Require parental consent for certain activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              11. Third-Party Links and Services
            </h2>
            <p>
              Our Service may contain links to third-party websites, games, and
              services. We are not responsible for the privacy practices of
              these third parties.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              11.1 External Links
            </h3>
            <p>
              When you click on external links, you leave our Service and are
              subject to the third party's privacy policy. We encourage you to
              review their policies before providing personal information.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              11.2 Integrated Services
            </h3>
            <p>
              Some third-party services are integrated into our platform (e.g.,
              Steam login, payment processors). These integrations are governed
              by both our Privacy Policy and the third party's policies.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              11.3 User-Generated Links
            </h3>
            <p>
              Users may post links in forums or reviews. We are not responsible
              for the content or privacy practices of linked sites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              12. Marketing and Communications
            </h2>

            <h3 className="text-xl font-semibold mb-2">
              12.1 Marketing Preferences
            </h3>
            <p>You can manage your communication preferences through:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Account settings dashboard</li>
              <li>Unsubscribe links in emails</li>
              <li>Reply STOP to SMS messages</li>
              <li>Browser push notification settings</li>
              <li>Mobile app notification settings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              12.2 Types of Communications
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Transactional:</strong> Purchase confirmations, account
                updates (cannot opt-out)
              </li>
              <li>
                <strong>Promotional:</strong> Sales, new products, events
                (opt-in/opt-out)
              </li>
              <li>
                <strong>Newsletter:</strong> Weekly/monthly updates
                (opt-in/opt-out)
              </li>
              <li>
                <strong>Recommendations:</strong> Personalized game suggestions
                (opt-in/opt-out)
              </li>
              <li>
                <strong>Community:</strong> Forum replies, friend requests
                (customizable)
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              12.3 Advertising
            </h3>
            <p>
              We may display targeted advertisements based on your interests.
              You can opt-out of personalized advertising through:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your account privacy settings</li>
              <li>Google Ad Settings</li>
              <li>Facebook Ad Preferences</li>
              <li>Industry opt-out tools (NAI, DAA)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              13. Legal Basis for Processing (GDPR)
            </h2>
            <p>
              For users in the EU/EEA/UK, we process personal data based on the
              following legal grounds:
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              13.1 Contract Performance
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Account creation and management</li>
              <li>Processing purchases and deliveries</li>
              <li>Providing customer support</li>
              <li>Sending transactional communications</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              13.2 Legitimate Interests
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Improving our Service and user experience</li>
              <li>Fraud prevention and security</li>
              <li>Direct marketing (with opt-out rights)</li>
              <li>Analytics and research</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">13.3 Consent</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Marketing communications</li>
              <li>Cookies and tracking technologies</li>
              <li>Processing sensitive data</li>
              <li>Third-party data sharing</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              13.4 Legal Obligations
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Tax and financial reporting</li>
              <li>Law enforcement requests</li>
              <li>Court orders and legal proceedings</li>
              <li>Regulatory compliance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              14. Automated Decision-Making
            </h2>
            <p>
              We use automated systems for certain decisions that may affect
              you:
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              14.1 Types of Automated Decisions
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Fraud detection and prevention</li>
              <li>Content recommendations</li>
              <li>Pricing and promotional offers</li>
              <li>Account security measures</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              14.2 Your Rights
            </h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Request human review of automated decisions</li>
              <li>Express your point of view</li>
              <li>Contest the decision</li>
              <li>Opt-out of profiling for marketing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              15. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, technology, legal requirements, or other
              factors.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              15.1 Notification of Changes
            </h3>
            <p>We will notify you of material changes through:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Email notification to registered users</li>
              <li>Prominent notice on our website</li>
              <li>In-app notifications</li>
              <li>Update to the "Last updated" date</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              15.2 Review Period
            </h3>
            <p>
              For material changes, we will provide at least 30 days' notice
              before the changes take effect, unless required sooner by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              16. Contact Information
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </p>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-3">Digiphile Privacy Team</p>

              <div className="space-y-2">
                <div>
                  <p className="font-semibold">Email:</p>
                  <p>Privacy Inquiries: privacy@digiphile.co</p>
                  <p>Data Requests: data-requests@digiphile.co</p>
                  <p>General Support: help@digiphile.co</p>
                </div>

                <div>
                  <p className="font-semibold">Phone:</p>
                  <p>1-800-XXX-XXXX (Toll-free)</p>
                  <p>International: +1-XXX-XXX-XXXX</p>
                </div>

                <div>
                  <p className="font-semibold">Mailing Address:</p>
                  <p>Digiphile Privacy Department</p>
                  <p>11060 Adoree St</p>
                  <p>Norwalk, CA 90650</p>
                  <p>United States</p>
                </div>

                <div>
                  <p className="font-semibold">Data Protection Officer:</p>
                  <p>dpo@digiphile.co</p>
                </div>

                <div>
                  <p className="font-semibold">EU Representative:</p>
                  <p>[EU Representative Name]</p>
                  <p>[EU Address]</p>
                  <p>eu-privacy@digiphile.co</p>
                </div>

                <div>
                  <p className="font-semibold">Response Time:</p>
                  <p>
                    We aim to respond to all privacy inquiries within 30 days
                  </p>
                  <p>24/7 Support Available</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              17. Supervisory Authorities
            </h2>
            <p>
              If you are not satisfied with our response to your privacy
              concerns, you have the right to lodge a complaint with your local
              data protection authority:
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              17.1 European Union
            </h3>
            <p>
              You can find your local Data Protection Authority at:{" "}
              <a
                href="https://edpb.europa.eu/about-edpb/board/members_en"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://edpb.europa.eu
              </a>
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              17.2 United Kingdom
            </h3>
            <p>
              Information Commissioner's Office (ICO):{" "}
              <a
                href="https://ico.org.uk"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ico.org.uk
              </a>
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">17.3 California</h3>
            <p>
              California Privacy Protection Agency (CPPA):{" "}
              <a
                href="https://cppa.ca.gov"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://cppa.ca.gov
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              18. Acknowledgment and Consent
            </h2>
            <p>
              By using our Service, you acknowledge that you have read and
              understood this Privacy Policy and consent to the collection, use,
              and disclosure of your information as described herein.
            </p>
            <p className="mt-3">
              If you do not agree with this Privacy Policy, please do not use
              our Service.
            </p>
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="font-semibold">Effective Date: January 29, 2025</p>
              <p className="text-sm mt-2">
                This Privacy Policy was last reviewed and updated on January 29,
                2025.
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
