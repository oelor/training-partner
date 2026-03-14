import type { Metadata } from 'next'
import Link from 'next/link'
import { Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Training Partner',
  description: 'Terms and conditions for using Training Partner, the combat sports training platform.',
  alternates: {
    canonical: 'https://trainingpartner.app/terms',
  },
}

export default function TermsPage() {
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
          <h1 className="font-heading text-4xl text-white mb-8">TERMS OF SERVICE</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
            <p>Last updated: March 14, 2026</p>

            <h2 className="text-white font-heading text-2xl">1. ACCEPTANCE OF TERMS</h2>
            <p>
              By accessing and using Training Partner (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>

            <h2 className="text-white font-heading text-2xl">2. DESCRIPTION OF SERVICE</h2>
            <p>
              Training Partner is a platform that connects combat sports athletes with compatible training partners and provides access to partner gym facilities. The service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Partner matching based on skill level, weight class, and training goals</li>
              <li>Gym discovery and access to partner gym facilities and open mat hours</li>
              <li>Check-in system for tracking training sessions</li>
              <li>User profiles and messaging capabilities</li>
              <li>Community features and social interactions</li>
              <li>Marketplace for events, individual services, and fundraisers</li>
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
              <li>Use the rating system honestly and in good faith &mdash; no retaliation ratings and no coordinated ratings manipulation</li>
              <li>Comply with all gym rules and partner gym policies when visiting facilities</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">4. LIABILITY WAIVER</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Training Partner is a platform that connects people. We do not supervise, control, or oversee your training sessions. Combat sports are inherently dangerous. You are responsible for your own safety, medical clearance, and verifying who you train with. We are not liable for injuries that happen during training.</p>
            </div>
            <p>
              Training Partner is a platform that connects users but does not supervise, control, arrange, or oversee training sessions. By using this service, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Combat sports training involves inherent risks of injury</li>
              <li>Training Partner bears no responsibility for injuries, damages, or losses sustained during training activities</li>
              <li>All users should obtain appropriate medical clearance before training</li>
              <li>Users are responsible for verifying the qualifications and experience of training partners</li>
              <li>Users must sign gym liability waivers before participating in gym sessions</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">5. ASSUMPTION OF RISK</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Combat sports can cause serious injuries including broken bones and concussions. By using this platform, you accept those risks voluntarily and agree not to hold Training Partner responsible for any training-related injuries.</p>
            </div>
            <p>
              You understand that participating in combat sports and using this platform involves inherent risks including, but not limited to: physical injury, strains, sprains, fractures, concussions, and other injuries that may occur during training or competition. You VOLUNTARILY assume all such risks and hereby release Training Partner, its officers, directors, employees, agents, and affiliates from any and all liability related to training activities arranged or facilitated through the platform.
            </p>

            <h2 className="text-white font-heading text-2xl">6. GYM PARTNERS</h2>
            <p>
              Partner gyms listed on Training Partner are independent entities. Training Partner does not endorse, guarantee, or warrant the quality, safety, or qualifications of any gym. Users are responsible for independently verifying gym credentials, insurance coverage, and safety standards before participating in any gym activities. Gym partners agree to separate Gym Partner agreements with mutual indemnification provisions.
            </p>

            <h2 className="text-white font-heading text-2xl">7. SUBSCRIPTION AND PAYMENT</h2>
            <p>
              Premium subscriptions are billed monthly. Users may cancel at any time. Refunds are provided at the sole discretion of Training Partner.
            </p>
            <p>
              For marketplace transactions: Training Partner facilitates transactions between users but is not a party to those transactions. Platform service fees are non-refundable. Refund disputes between buyers and sellers are the responsibility of the transacting parties. Tax obligations, including compliance with 1099-K reporting thresholds, are the sole responsibility of the user.
            </p>

            <h2 className="text-white font-heading text-2xl">8. PRIVACY</h2>
            <p>
              We collect and use personal information as described in our <Link href="/privacy" className="text-primary hover:text-primary/80 underline">Privacy Policy</Link>. By using Training Partner, you consent to the collection and use of your information as outlined therein.
            </p>

            <h2 className="text-white font-heading text-2xl">9. TERMINATION</h2>
            <p>
              Training Partner reserves the right to terminate or suspend your account at any time for violation of these terms or for any other reason at our sole discretion.
            </p>

            <h2 className="text-white font-heading text-2xl">10. PLATFORM STATUS AND SECTION 230 PROTECTION</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Training Partner is a platform, not a gym or coaching service. We connect people but do not employ, screen, or supervise anyone on the platform. We are not responsible for what users post, say, or do.</p>
            </div>
            <p>
              Training Partner is a platform, not a training provider, gym, or coaching service. We do not employ, endorse, screen, or supervise any user. We facilitate connections between users &mdash; we do not arrange, supervise, or guarantee training sessions, events, or transactions.
            </p>
            <p>
              Under Section 230 of the Communications Decency Act, Training Partner is not liable for content posted by users, including but not limited to messages, profiles, reviews, ratings, community posts, and event listings.
            </p>

            <h2 className="text-white font-heading text-2xl">11. IDENTITY VERIFICATION</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Identity verification is optional. A &ldquo;Verified&rdquo; badge means someone submitted a government ID and it was reviewed &mdash; it does NOT mean we vouch for their character, skills, or safety. You are still responsible for your own safety decisions. Your ID photos are deleted 90 days after approval.</p>
            </div>
            <p>
              Identity verification is voluntary. Verification indicates that a user submitted government-issued identification that was reviewed and approved. It does NOT guarantee the accuracy of a user&rsquo;s identity, qualifications, character, or fitness for training. A &ldquo;Verified&rdquo; badge means the user completed the verification process, not that Training Partner vouches for them.
            </p>
            <p>
              Users remain responsible for their own safety decisions regardless of another user&rsquo;s verification status. Government ID data is retained for 90 days after approval and then permanently deleted. Users can delete their verification data at any time through their account settings.
            </p>

            <h2 className="text-white font-heading text-2xl">12. USER CONDUCT AND CONTENT POLICY</h2>
            <p>Training Partner maintains zero tolerance for the following:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harassment, threats, or intimidation</li>
              <li>Hate speech or discriminatory language</li>
              <li>Sexually explicit content</li>
              <li>Doxxing or sharing others&rsquo; personal information without consent</li>
              <li>Creating fake profiles or impersonation</li>
              <li>Using the platform for illegal activities</li>
            </ul>
            <p>
              Content moderation: We review reported content within 48 hours. Three content policy violations result in account suspension. Users may appeal suspensions by contacting support@trainingpartner.app.
            </p>

            <h2 className="text-white font-heading text-2xl">13. RATING SYSTEM</h2>
            <p>
              Ratings reflect individual user experiences and are not endorsements by Training Partner. Ratings require proof of co-located training via mutual check-in or confirmed session.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Anti-retaliation:</strong> Threatening or harassing a user over a negative rating is grounds for immediate account suspension.</li>
              <li><strong>No manipulation:</strong> Coordinated positive or negative ratings campaigns are prohibited.</li>
              <li><strong>Defamation:</strong> Training Partner is not liable for defamation claims arising from user-generated ratings.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">14. MARKETPLACE TRANSACTIONS</h2>
            <p>
              Training Partner facilitates transactions between users (events, services, donations) via Stripe. Training Partner is not a party to these transactions. Users are responsible for fulfilling their obligations in any transaction.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Platform service fees are clearly disclosed before checkout and are non-refundable.</li>
              <li>Tax reporting obligations are the sole responsibility of the user.</li>
              <li>Dispute resolution between transacting parties is their responsibility; Training Partner may mediate but is not obligated to do so.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">15. AGE REQUIREMENTS</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users must be at least 13 years old to create an account.</li>
              <li>Users between 13&ndash;17 must have parental or guardian consent and have limited platform features (no marketplace transactions, no identity verification).</li>
              <li>Users must be 18 or older for full platform access including identity verification and marketplace features.</li>
              <li>We do not knowingly collect personal information from children under 13. If we learn we have collected information from a child under 13, we will delete it immediately.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">16. ANTI-DISCRIMINATION POLICY</h2>
            <p>
              Training Partner does not tolerate discrimination based on race, ethnicity, religion, gender identity, sexual orientation, disability, or any other protected characteristic. Matching criteria based on sport, skill level, weight class, and location serve legitimate training purposes and are not discriminatory. Users who engage in discriminatory behavior will have their accounts terminated.
            </p>

            <h2 className="text-white font-heading text-2xl">17. INSURANCE RECOMMENDATION</h2>
            <p>
              Training Partner strongly recommends that users verify their training gym&rsquo;s insurance coverage and consider obtaining personal liability insurance before participating in combat sports activities. Training Partner does not provide insurance coverage of any kind.
            </p>

            <h2 className="text-white font-heading text-2xl">18. DISPUTE RESOLUTION AND MANDATORY ARBITRATION</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: If you have a dispute with us, we resolve it through arbitration (a private process), not court. First, contact us and we will try to work it out within 30 days. If that fails, it goes to binding arbitration. You cannot join a class action lawsuit against us. You have 30 days after signing up to opt out of this arbitration clause by emailing legal@trainingpartner.app.</p>
            </div>
            <p>
              Any dispute, claim, or controversy arising out of or relating to these Terms or the use of Training Partner shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its then-current rules.
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact us at legal@trainingpartner.app to attempt informal resolution within 30 days.</li>
              <li>If unresolved, submit to binding arbitration under AAA Commercial Arbitration Rules.</li>
              <li>Arbitration is conducted on an individual basis &mdash; class actions and class arbitrations are waived.</li>
            </ol>
            <p>
              <strong>Exception:</strong> Either party may bring claims in small claims court if the dispute falls within its jurisdictional limits.
            </p>
            <p>
              <strong>Opt-out:</strong> You have 30 days after creating your account to opt out of this arbitration provision by sending written notice to legal@trainingpartner.app.
            </p>

            <h2 className="text-white font-heading text-2xl">19. CONTACT</h2>
            <p>
              For questions about these Terms of Service: <a href="mailto:support@trainingpartner.app" className="text-primary hover:text-primary/80 underline">support@trainingpartner.app</a>
            </p>
            <p>
              For legal inquiries: <a href="mailto:legal@trainingpartner.app" className="text-primary hover:text-primary/80 underline">legal@trainingpartner.app</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
