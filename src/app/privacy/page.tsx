'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background bg-pattern py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors">
          ← Back to Home
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
            <p>Last updated: February 28, 2026</p>

            <h2 className="text-white font-heading text-2xl">1. INTRODUCTION</h2>
            <p>
              At Training Partner, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully.
            </p>

            <h2 className="text-white font-heading text-2xl">2. INFORMATION WE COLLECT</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password</li>
              <li><strong>Profile Information:</strong> Sport preferences, skill level, weight class, training goals, location, availability</li>
              <li><strong>Communications:</strong> Messages sent through our platform</li>
              <li><strong>Usage Data:</strong> How you interact with our service</li>
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
            </ul>

            <h2 className="text-white font-heading text-2xl">4. INFORMATION SHARING</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Other Users:</strong> Your profile information is visible to other users of the platform</li>
              <li><strong>Partner Gyms:</strong> Information necessary for gym access and bookings</li>
              <li><strong>Service Providers:</strong> Third parties who help us operate our services</li>
              <li><strong>Legal Requirements:</strong> When required by law or in response to valid requests</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">5. DATA SECURITY</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-white font-heading text-2xl">6. YOUR RIGHTS</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of certain data collection</li>
              <li>Export your data</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">7. COOKIES AND TRACKING</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience. You can control cookies through your browser settings.
            </p>

            <h2 className="text-white font-heading text-2xl">8. CHILDREN'S PRIVACY</h2>
            <p>
              Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18.
            </p>

            <h2 className="text-white font-heading text-2xl">9. THIRD-PARTY LINKS</h2>
            <p>
              Our service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.
            </p>

            <h2 className="text-white font-heading text-2xl">10. CHANGES TO THIS POLICY</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h2 className="text-white font-heading text-2xl">11. CONTACT US</h2>
            <p>
              For questions about this Privacy Policy, please contact us at privacy@trainingpartner.app
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
