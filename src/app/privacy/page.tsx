import type { Metadata } from 'next'
import Link from 'next/link'
import { Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Training Partner',
  description: 'How Training Partner collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background bg-pattern py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors">
          &larr; Back to Home
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading text-2xl text-white">TRAINING PARTNER</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8">
          <h1 className="font-heading text-4xl text-white mb-8">PRIVACY POLICY</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
            <p>Last updated: March 14, 2026</p>

            <h2 className="text-white font-heading text-2xl">1. INTRODUCTION</h2>
            <p>
              At Training Partner, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully.
            </p>

            <h2 className="text-white font-heading text-2xl">2. INFORMATION WE COLLECT</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password, date of birth</li>
              <li><strong>Profile Information:</strong> Sport preferences, skill level, weight class, training goals, location, availability</li>
              <li><strong>Communications:</strong> Messages sent through our platform</li>
              <li><strong>Usage Data:</strong> How you interact with our service, including pages visited, features used, and session duration</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">3. HOW WE USE YOUR INFORMATION</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Match you with compatible training partners</li>
              <li>Connect you with partner gyms</li>
              <li>Send you important updates and notifications</li>
              <li>Improve and optimize our services</li>
              <li>Comply with legal obligations</li>
              <li>Process transactions and manage subscriptions</li>
              <li>Facilitate identity verification</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">4. INFORMATION SHARING</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Other Users:</strong> Your profile information is visible to other users of the platform</li>
              <li><strong>Partner Gyms:</strong> Information necessary for gym access and bookings</li>
              <li><strong>Service Providers:</strong> Stripe for payment processing, email service providers for communications</li>
              <li><strong>Legal Requirements:</strong> When required by law or in response to valid legal requests</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">5. DATA SECURITY</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information, including encryption at rest for sensitive data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-white font-heading text-2xl">6. YOUR RIGHTS</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of certain data collection</li>
              <li>Export your data in a portable format</li>
              <li>Delete identity verification data at any time</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">7. COOKIES AND TRACKING</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience and collect usage data. You can control cookies through your browser settings. Disabling cookies may affect certain features of the platform.
            </p>

            <h2 className="text-white font-heading text-2xl">8. CHILDREN&rsquo;S PRIVACY</h2>
            <p>
              Our service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. For users aged 13&ndash;17, we apply limited data collection practices and parents/guardians have the right to access, modify, or delete their child&rsquo;s data.
            </p>

            <h2 className="text-white font-heading text-2xl">9. THIRD-PARTY LINKS</h2>
            <p>
              Our service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>

            <h2 className="text-white font-heading text-2xl">10. CHANGES TO THIS POLICY</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. For material changes that significantly affect how we handle your data, we will provide email notification.
            </p>

            <h2 className="text-white font-heading text-2xl">11. CONTACT US</h2>
            <p>
              For questions about this Privacy Policy, please contact us at <a href="mailto:privacy@trainingpartner.app" className="text-primary hover:text-primary/80 underline">privacy@trainingpartner.app</a>.
            </p>

            <h2 className="text-white font-heading text-2xl">12. GOVERNMENT ID AND BIOMETRIC DATA</h2>
            <p>
              For users who opt into identity verification, we collect the following:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>What we collect:</strong> A photo of your government-issued ID and a selfie photograph.</li>
              <li><strong>Purpose:</strong> Voluntary identity verification to increase trust between users on the platform.</li>
              <li><strong>Storage:</strong> Encrypted at rest within our database.</li>
              <li><strong>Retention:</strong> 90 days after verification approval, then permanently and irreversibly deleted. Only your verification status (verified yes/no) persists after deletion.</li>
              <li><strong>Your rights:</strong> You may delete your verification data at any time via your account Settings.</li>
              <li><strong>Access:</strong> Only you and authorized administrators can access your ID data.</li>
            </ul>
            <p className="mt-4">
              <strong>State-Specific Disclosures:</strong> In compliance with the Illinois Biometric Information Privacy Act (BIPA), the Texas Capture or Use of Biometric Identifier (CUBI) Act, and the Washington Biometric Identifiers law, we disclose that we collect biometric-adjacent data (facial photographs) solely for the purpose of identity verification. We do not sell, lease, or trade this data to any third party.
            </p>

            <h2 className="text-white font-heading text-2xl">13. LOCATION DATA</h2>
            <p>
              Location data is collected during gym check-ins and when you use geo-discovery features to find nearby gyms. We do not continuously track your location. Location sharing is user-initiated &mdash; you choose when to check in or enable location-based discovery.
            </p>
            <p>Location data is used to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Find nearby gyms and training partners</li>
              <li>Verify check-ins for the reputation system</li>
              <li>Calculate training statistics</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">14. FINANCIAL TRANSACTION DATA</h2>
            <p>
              Payment processing is handled by Stripe. We do not store credit card numbers, bank account details, or other payment credentials on our servers.
            </p>
            <p>We store:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Transaction records (amount, date, description)</li>
              <li>Subscription status</li>
              <li>Payout history for service providers</li>
            </ul>
            <p>
              Stripe&rsquo;s privacy policy governs their handling of your payment information.
            </p>

            <h2 className="text-white font-heading text-2xl">15. DATA BREACH RESPONSE</h2>
            <p>
              In the event of a data breach affecting personal information, we commit to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Notifying affected users within 72 hours of discovering the breach</li>
              <li>Providing details of what data was affected</li>
              <li>Describing remedial actions taken</li>
              <li>Reporting to relevant authorities as required by law</li>
            </ul>
            <p>
              Users will be notified via email and in-app notification.
            </p>

            <h2 className="text-white font-heading text-2xl">16. DATA RETENTION SCHEDULE</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 text-white font-medium">Data Type</th>
                    <th className="py-3 text-white font-medium">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 pr-4">Account data (name, email, profile)</td>
                    <td className="py-3">Retained until account deletion</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Identity verification photos</td>
                    <td className="py-3">90 days after approval, then deleted</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Messages</td>
                    <td className="py-3">Retained until account deletion</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Check-in history</td>
                    <td className="py-3">Retained until account deletion</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Training ratings</td>
                    <td className="py-3">Retained until account deletion (anonymized if account deleted)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Financial transaction records</td>
                    <td className="py-3">7 years (legal/tax requirement)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Usage/analytics data</td>
                    <td className="py-3">2 years</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Reported content under review</td>
                    <td className="py-3">Retained until resolution + 1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-white font-heading text-2xl">17. MINOR USERS (13&ndash;17)</h2>
            <p>
              For users between the ages of 13 and 17, the following applies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Limited data collection practices are applied</li>
              <li>No identity verification (ID upload) is available for minors</li>
              <li>No financial transaction data is collected (marketplace features are restricted)</li>
            </ul>
            <p>Parents and guardians have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access their child&rsquo;s data</li>
              <li>Request modification of their child&rsquo;s data</li>
              <li>Request deletion of their child&rsquo;s account and all associated data</li>
            </ul>
            <p>
              To exercise these rights, contact us at <a href="mailto:privacy@trainingpartner.app" className="text-primary hover:text-primary/80 underline">privacy@trainingpartner.app</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
