import type { Metadata } from 'next'
import Link from 'next/link'
import { Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Training Partner',
  description: 'Terms and conditions for using Training Partner, the combat sports training platform.',
}

export default function TermsPage() {
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
          <h1 className="font-heading text-4xl text-white mb-8">TERMS OF SERVICE</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
            <p>Last updated: February 28, 2026</p>

            <h2 className="text-white font-heading text-2xl">1. ACCEPTANCE OF TERMS</h2>
            <p>
              By accessing and using Training Partner ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>

            <h2 className="text-white font-heading text-2xl">2. DESCRIPTION OF SERVICE</h2>
            <p>
              Training Partner is a platform that connects combat sports athletes with compatible training partners and provides access to partner gym facilities. The service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Partner matching based on skill level, weight class, and training goals</li>
              <li>Access to partner gym facilities and open mat hours</li>
              <li>User profiles and messaging capabilities</li>
              <li>Subscription-based premium features</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">3. USER RESPONSIBILITIES</h2>
            <p>As a user of Training Partner, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the service in a lawful and respectful manner</li>
              <li>Not engage in harassment, discrimination, or violent behavior</li>
              <li>Report any suspicious or inappropriate activity</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">4. LIABILITY WAIVER</h2>
            <p>
              Training Partner is a platform that connects users but does not supervise or control training sessions. By using this service, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Combat sports training involves inherent risks of injury</li>
              <li>Training Partner is not responsible for injuries sustained during training</li>
              <li>All users should obtain appropriate medical clearance before training</li>
              <li>Users should verify the qualifications and experience of training partners</li>
              <li>Users must sign liability waivers before participating in gym sessions</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">5. ASSUMPTION OF RISK</h2>
            <p>
              You understand that participating in combat sports and using this platform involves inherent risks including, but not limited to: physical injury, strains, sprains, fractures, concussions, and other injuries that may occur during training or competition. You voluntarily assume all such risks and hereby release Training Partner from any liability.
            </p>

            <h2 className="text-white font-heading text-2xl">6. GYM PARTNERS</h2>
            <p>
              Partner gyms listed on Training Partner are independent entities. Training Partner does not endorse, guarantee, or warrant the quality, safety, or qualifications of any gym. Users are responsible for verifying gym credentials, insurance coverage, and safety standards before participating in any gym activities.
            </p>

            <h2 className="text-white font-heading text-2xl">7. SUBSCRIPTION AND PAYMENT</h2>
            <p>
              Premium subscriptions are billed monthly. Users may cancel at any time. Refunds are provided at the sole discretion of Training Partner. Subscription fees are used to maintain the platform and provide customer support.
            </p>

            <h2 className="text-white font-heading text-2xl">8. PRIVACY</h2>
            <p>
              We collect and use personal information as described in our Privacy Policy. By using Training Partner, you consent to the collection and use of your information as outlined therein.
            </p>

            <h2 className="text-white font-heading text-2xl">9. TERMINATION</h2>
            <p>
              Training Partner reserves the right to terminate or suspend your account at any time for violation of these terms or for any other reason at our sole discretion.
            </p>

            <h2 className="text-white font-heading text-2xl">10. CONTACT</h2>
            <p>
              For questions about these Terms of Service, please contact us at support@trainingpartner.app
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
