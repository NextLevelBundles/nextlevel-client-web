import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/app/(home)/components/sections/footer";

export default function CookiesPolicy() {
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
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: January 29, 2025
          </p>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8">
            <p className="text-sm">
              <strong>Quick Summary:</strong> We use cookies to make our website
              work properly, remember your preferences, understand how you use
              our service, and show you relevant content. You can control most
              cookies through your browser settings or our cookie preferences
              panel.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files that are placed on your computer or
              mobile device when you visit a website. They are widely used to
              make websites work more efficiently, provide a better user
              experience, and provide information to the owners of the site.
            </p>
            <p className="mt-3">
              Cookies do not typically contain any information that personally
              identifies you, but personal information that we store about you
              may be linked to the information stored in and obtained from
              cookies.
            </p>
            <p className="mt-3">
              We also use similar technologies like pixel tags, web beacons,
              clear GIFs, and local storage (including HTML5 localStorage and
              sessionStorage) which function similarly to cookies and are
              covered by this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Why Do We Use Cookies?
            </h2>
            <p>
              We use cookies and similar tracking technologies for several
              important reasons:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Essential Operations:</strong> To enable core
                functionality like user authentication, security features, and
                shopping cart management
              </li>
              <li>
                <strong>Performance and Analytics:</strong> To understand how
                visitors interact with our website and identify areas for
                improvement
              </li>
              <li>
                <strong>Functionality:</strong> To remember your preferences,
                settings, and choices for a more personalized experience
              </li>
              <li>
                <strong>Marketing and Advertising:</strong> To deliver relevant
                advertisements and measure their effectiveness
              </li>
              <li>
                <strong>Social Media:</strong> To enable social media features
                and sharing capabilities
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Types of Cookies We Use
            </h2>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              3.1 Essential Cookies
            </h3>
            <p className="mb-2">
              These cookies are necessary for the website to function and cannot
              be switched off in our systems. They are usually only set in
              response to actions made by you which amount to a request for
              services.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">session_id</td>
                    <td className="py-2">Maintains user session state</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">csrf_token</td>
                    <td className="py-2">
                      Security token to prevent CSRF attacks
                    </td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">auth_token</td>
                    <td className="py-2">User authentication</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">cart_id</td>
                    <td className="py-2">Shopping cart identifier</td>
                    <td className="py-2">7 days</td>
                  </tr>
                  <tr>
                    <td className="py-2">cookie_consent</td>
                    <td className="py-2">Stores cookie consent preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-2 mt-6">
              3.2 Performance and Analytics Cookies
            </h3>
            <p className="mb-2">
              These cookies allow us to count visits and traffic sources so we
              can measure and improve the performance of our site. They help us
              understand which pages are the most and least popular.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Provider</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">_ga</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">Distinguishes unique users</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">_gid</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">Distinguishes users</td>
                    <td className="py-2">24 hours</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">_gat</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">Throttles request rate</td>
                    <td className="py-2">1 minute</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">_hjid</td>
                    <td className="py-2">Hotjar</td>
                    <td className="py-2">User behavior tracking</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-2">mp_*</td>
                    <td className="py-2">Mixpanel</td>
                    <td className="py-2">Product analytics</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-2 mt-6">
              3.3 Functionality Cookies
            </h3>
            <p className="mb-2">
              These cookies enable the website to provide enhanced functionality
              and personalization. They may be set by us or by third-party
              providers whose services we have added to our pages.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">language</td>
                    <td className="py-2">Language preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">currency</td>
                    <td className="py-2">Currency preference</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">theme</td>
                    <td className="py-2">Light/dark mode preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">recently_viewed</td>
                    <td className="py-2">Recently viewed products</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr>
                    <td className="py-2">wishlist</td>
                    <td className="py-2">Saved wishlist items</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-2 mt-6">
              3.4 Marketing and Advertising Cookies
            </h3>
            <p className="mb-2">
              These cookies may be set through our site by our advertising
              partners. They may be used to build a profile of your interests
              and show you relevant adverts on other sites.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Provider</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">_fbp</td>
                    <td className="py-2">Facebook</td>
                    <td className="py-2">Facebook advertising</td>
                    <td className="py-2">3 months</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">fr</td>
                    <td className="py-2">Facebook</td>
                    <td className="py-2">Ad delivery and measurement</td>
                    <td className="py-2">3 months</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">IDE</td>
                    <td className="py-2">Google</td>
                    <td className="py-2">DoubleClick advertising</td>
                    <td className="py-2">13 months</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">NID</td>
                    <td className="py-2">Google</td>
                    <td className="py-2">Google ads preferences</td>
                    <td className="py-2">6 months</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">muc_ads</td>
                    <td className="py-2">Twitter</td>
                    <td className="py-2">Twitter advertising</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="py-2">personalization_id</td>
                    <td className="py-2">Twitter</td>
                    <td className="py-2">Twitter personalization</td>
                    <td className="py-2">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-2 mt-6">
              3.5 Social Media Cookies
            </h3>
            <p className="mb-2">
              These cookies are set by social media services that we have added
              to the site to enable you to share our content with your friends
              and networks.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2">Provider</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">More Information</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">Facebook</td>
                    <td className="py-2">Social sharing and login</td>
                    <td className="py-2">
                      <a
                        href="https://www.facebook.com/policies/cookies/"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Facebook Cookie Policy
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">Twitter</td>
                    <td className="py-2">Tweet embedding and sharing</td>
                    <td className="py-2">
                      <a
                        href="https://help.twitter.com/en/rules-and-policies/twitter-cookies"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Twitter Cookie Policy
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">Discord</td>
                    <td className="py-2">Discord login integration</td>
                    <td className="py-2">
                      <a
                        href="https://discord.com/privacy"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Discord Privacy Policy
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">YouTube</td>
                    <td className="py-2">Video embedding</td>
                    <td className="py-2">
                      <a
                        href="https://policies.google.com/technologies/cookies"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Google Cookie Policy
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Steam</td>
                    <td className="py-2">Steam login and integration</td>
                    <td className="py-2">
                      <a
                        href="https://store.steampowered.com/privacy_agreement/"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Steam Privacy Policy
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. First-Party vs Third-Party Cookies
            </h2>

            <h3 className="text-xl font-semibold mb-2">
              4.1 First-Party Cookies
            </h3>
            <p>
              These are cookies that we set directly on the Digiphile domain.
              They can only be read by our website and are primarily used for
              essential functions, remembering your preferences, and analyzing
              how you use our service.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              4.2 Third-Party Cookies
            </h3>
            <p>
              These are cookies set by domains other than Digiphile. They are
              primarily used for advertising, social media integration, and
              analytics. Third-party cookies can track you across multiple
              websites to build a profile of your interests.
            </p>
            <p className="mt-3">
              We carefully select our third-party partners and require them to
              comply with applicable privacy laws. However, we do not control
              these third-party cookies directly, and you should refer to the
              respective third party's cookie and privacy policies for more
              information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. Session vs Persistent Cookies
            </h2>

            <h3 className="text-xl font-semibold mb-2">5.1 Session Cookies</h3>
            <p>
              Session cookies are temporary cookies that remain in your
              browser's cookie file until you leave the site. We use session
              cookies to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Maintain your session state while browsing</li>
              <li>Remember items in your shopping cart</li>
              <li>Provide security during your session</li>
              <li>Track temporary preferences during your visit</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              5.2 Persistent Cookies
            </h3>
            <p>
              Persistent cookies remain in your browser's cookie file for the
              duration specified in the cookie. We use persistent cookies to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Remember your login details (if you choose)</li>
              <li>Store your preferences and settings</li>
              <li>Track your activity over time for analytics</li>
              <li>Provide personalized content and recommendations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              6. How to Manage Cookies
            </h2>

            <h3 className="text-xl font-semibold mb-2">
              6.1 Cookie Consent Tool
            </h3>
            <p>
              When you first visit our website, you'll see a cookie consent
              banner that allows you to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Accept all cookies</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your cookie preferences by category</li>
            </ul>
            <p className="mt-3">
              You can change your cookie preferences at any time by clicking the
              "Cookie Settings" link in the footer of our website.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              6.2 Browser Settings
            </h3>
            <p>
              Most web browsers allow you to control cookies through their
              settings. You can:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>View what cookies are stored on your device</li>
              <li>Delete some or all cookies</li>
              <li>Block all cookies or third-party cookies</li>
              <li>Set preferences for specific websites</li>
            </ul>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold mb-2">
                How to manage cookies in popular browsers:
              </p>
              <ul className="text-sm space-y-1">
                <li>
                  •{" "}
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  •{" "}
                  <a
                    href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  •{" "}
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  •{" "}
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Microsoft Edge
                  </a>
                </li>
                <li>
                  •{" "}
                  <a
                    href="https://help.opera.com/en/latest/web-preferences/#cookies"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Opera
                  </a>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              6.3 Mobile Device Settings
            </h3>
            <p>
              For mobile devices, you can manage cookies and tracking through:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>iOS:</strong> Settings &gt; Safari &gt; Block Cookies or
                Settings &gt; Privacy &gt; Tracking
              </li>
              <li>
                <strong>Android:</strong> Chrome app &gt; Settings &gt; Site
                Settings &gt; Cookies
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              6.4 Opt-Out Tools
            </h3>
            <p>
              You can opt-out of targeted advertising from many providers
              through:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <a
                  href="http://www.aboutads.info/choices/"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Digital Advertising Alliance (DAA)
                </a>
              </li>
              <li>
                <a
                  href="http://www.networkadvertising.org/choices/"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Network Advertising Initiative (NAI)
                </a>
              </li>
              <li>
                <a
                  href="http://www.youronlinechoices.eu/"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  European Digital Advertising Alliance (EDAA)
                </a>
              </li>
              <li>
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Analytics Opt-Out Browser Add-on
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              7. Impact of Disabling Cookies
            </h2>
            <p>If you choose to disable or block cookies, please note that:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Essential Features:</strong> Some parts of our website
                may not function properly or at all
              </li>
              <li>
                <strong>Personalization:</strong> We won't be able to remember
                your preferences or customize your experience
              </li>
              <li>
                <strong>Shopping Cart:</strong> Your shopping cart may not
                persist between sessions
              </li>
              <li>
                <strong>Account Access:</strong> You may need to log in more
                frequently
              </li>
              <li>
                <strong>Analytics:</strong> We won't be able to improve our
                service based on usage patterns
              </li>
              <li>
                <strong>Advertising:</strong> You may still see ads, but they
                won't be personalized to your interests
              </li>
            </ul>
            <p className="mt-3">
              We recommend allowing at least essential cookies to ensure the
              best experience on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Other Tracking Technologies
            </h2>

            <h3 className="text-xl font-semibold mb-2">
              8.1 Pixel Tags / Web Beacons
            </h3>
            <p>
              These are tiny graphics with a unique identifier that function
              similarly to cookies. We use them to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Track email open rates and engagement</li>
              <li>Understand user behavior on our website</li>
              <li>Measure advertising campaign effectiveness</li>
              <li>Detect if an email has been forwarded</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              8.2 Local Storage
            </h3>
            <p>We use HTML5 local storage and session storage to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Store temporary application state</li>
              <li>Improve page load performance</li>
              <li>Remember form progress</li>
              <li>Cache frequently accessed data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              8.3 Device Fingerprinting
            </h3>
            <p>
              We may collect information about your device (such as browser
              type, operating system, installed plugins) to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Detect and prevent fraud</li>
              <li>Ensure account security</li>
              <li>Provide technical support</li>
              <li>Comply with legal requirements</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">8.4 ETags</h3>
            <p>
              Entity tags (ETags) are used to determine whether a component in
              your browser cache matches the one on our server. They help us:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Reduce bandwidth usage</li>
              <li>Improve page load times</li>
              <li>Track unique visitors</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Cookie Security</h2>
            <p>
              We implement various security measures to protect cookies and the
              data they contain:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Secure Flag:</strong> Sensitive cookies are marked as
                "Secure" and only transmitted over HTTPS
              </li>
              <li>
                <strong>HttpOnly Flag:</strong> Authentication cookies are
                marked as "HttpOnly" to prevent access via JavaScript
              </li>
              <li>
                <strong>SameSite Attribute:</strong> We use SameSite attributes
                to prevent CSRF attacks
              </li>
              <li>
                <strong>Encryption:</strong> Sensitive data within cookies is
                encrypted
              </li>
              <li>
                <strong>Regular Audits:</strong> We regularly review and audit
                our cookie usage
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              10. International Users
            </h2>

            <h3 className="text-xl font-semibold mb-2">
              10.1 EU/EEA/UK Users (GDPR)
            </h3>
            <p>Under the General Data Protection Regulation (GDPR), we:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Request explicit consent before setting non-essential cookies
              </li>
              <li>Provide detailed information about each cookie's purpose</li>
              <li>Allow granular control over cookie categories</li>
              <li>Respect your right to withdraw consent at any time</li>
              <li>Do not use pre-ticked boxes for consent</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              10.2 California Users (CCPA)
            </h3>
            <p>
              Under the California Consumer Privacy Act (CCPA), California
              residents have the right to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Know what personal information is collected through cookies
              </li>
              <li>Opt-out of the "sale" of personal information via cookies</li>
              <li>
                Not be discriminated against for exercising privacy rights
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              10.3 Other Jurisdictions
            </h3>
            <p>
              We comply with applicable cookie laws in all jurisdictions where
              we operate, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>ePrivacy Directive requirements in the EU</li>
              <li>PIPEDA requirements in Canada</li>
              <li>Privacy Act requirements in Australia</li>
              <li>
                State privacy laws in Virginia, Colorado, Connecticut, and Utah
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              11. Children and Cookies
            </h2>
            <p>
              Our website is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13 through cookies or other tracking technologies.
            </p>
            <p className="mt-3">For users aged 13-17, we:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Limit the use of tracking cookies</li>
              <li>Do not use behavioral advertising cookies</li>
              <li>Require parental consent where applicable</li>
              <li>Provide age-appropriate privacy controls</li>
            </ul>
            <p className="mt-3">
              Parents can contact us at privacy@digiphile.co to request
              information about or deletion of any data collected from their
              children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              12. Updates to This Cookie Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time to reflect
              changes in our practices, technology, legal requirements, or for
              other operational reasons.
            </p>
            <p className="mt-3">
              When we make material changes to this policy, we will:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Update the "Last updated" date at the top of this policy</li>
              <li>Notify you through a prominent notice on our website</li>
              <li>Request fresh consent where required by law</li>
              <li>Provide a summary of key changes</li>
            </ul>
            <p className="mt-3">
              We encourage you to review this Cookie Policy periodically to stay
              informed about how we use cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Cookie Glossary</h2>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <dl className="space-y-3">
                <div>
                  <dt className="font-semibold">Cookie</dt>
                  <dd className="text-sm mt-1">
                    A small text file stored on your device by a website
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">First-party cookie</dt>
                  <dd className="text-sm mt-1">
                    A cookie set by the website you're visiting
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Third-party cookie</dt>
                  <dd className="text-sm mt-1">
                    A cookie set by a domain other than the one you're visiting
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Session cookie</dt>
                  <dd className="text-sm mt-1">
                    A temporary cookie that expires when you close your browser
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Persistent cookie</dt>
                  <dd className="text-sm mt-1">
                    A cookie that remains on your device for a set period
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Pixel tag</dt>
                  <dd className="text-sm mt-1">
                    A transparent image used to track user behavior
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Local storage</dt>
                  <dd className="text-sm mt-1">
                    A web storage method that stores data locally in your
                    browser
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Device fingerprinting</dt>
                  <dd className="text-sm mt-1">
                    Collecting device information to create a unique identifier
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p>
              If you have any questions or concerns about our use of cookies or
              this Cookie Policy, please contact us:
            </p>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-3">Digiphile Cookie Support</p>

              <div className="space-y-2">
                <div>
                  <p className="font-semibold">Email:</p>
                  <p>Cookie Inquiries: cookies@digiphile.co</p>
                  <p>Privacy Team: privacy@digiphile.co</p>
                  <p>General Support: help@digiphile.co</p>
                </div>

                <div>
                  <p className="font-semibold">Mailing Address:</p>
                  <p>Digiphile - Cookie Policy</p>
                  <p>11060 Adoree St</p>
                  <p>Norwalk, CA 90650</p>
                  <p>United States</p>
                </div>

                <div>
                  <p className="font-semibold">Data Protection Officer:</p>
                  <p>dpo@digiphile.co</p>
                </div>

                <div>
                  <p className="font-semibold">Support Hours:</p>
                  <p>24/7 Support Available</p>
                  <p>We aim to respond within 48 hours</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Your Cookie Preferences</h3>
              <p className="text-sm mb-3">
                You can update your cookie preferences at any time using the
                button below:
              </p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Manage Cookie Settings
              </button>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
