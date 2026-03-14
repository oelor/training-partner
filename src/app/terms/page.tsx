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
              <p className="text-white text-sm font-medium">In plain English: Training Partner is a CONNECTION platform only &mdash; not a gym, coach, or training provider. We do not supervise, control, or oversee your training sessions. Combat sports are inherently dangerous and can result in serious injury. You are responsible for your own safety, medical clearance, and verifying who you train with. We are not liable for injuries, damages, or losses that occur during training.</p>
            </div>
            <p>
              Training Partner is a CONNECTION PLATFORM ONLY. We are not a training provider, gym, coaching service, or sports organization. We do not employ, supervise, control, arrange, or oversee training sessions. By using this service, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Combat sports training &mdash; including but not limited to wrestling, Brazilian Jiu-Jitsu (BJJ), mixed martial arts (MMA), boxing, Muay Thai, judo, and other martial arts &mdash; involves inherent and significant risks of serious bodily injury, including but not limited to: concussions and traumatic brain injury, broken bones and fractures, torn ligaments, sprains and strains, joint dislocations, spinal injuries, dental injuries, lacerations, and in rare cases, permanent disability or death</li>
              <li>Training Partner bears NO responsibility for any injuries, damages, losses, medical expenses, or any other costs sustained during or arising from training activities with partners found through this platform</li>
              <li>All users must obtain appropriate medical clearance before engaging in combat sports training</li>
              <li>Users are solely responsible for verifying the qualifications, experience, and identity of any training partners they meet through the platform</li>
              <li>Users must sign gym liability waivers before participating in gym sessions</li>
              <li>Training Partner makes no representations or warranties regarding the safety, skill level, character, or intentions of any user on the platform</li>
              <li>Users agree to hold Training Partner, its owners, officers, directors, employees, agents, and affiliates completely harmless from any and all claims, demands, damages, losses, costs, expenses (including attorney&rsquo;s fees), and legal proceedings of any kind arising from or related to training activities, interactions with other users, or any other use of the platform</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">5. ASSUMPTION OF RISK</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Combat sports can cause serious injuries including broken bones, concussions, and worse. By using this platform to find training partners, you voluntarily accept ALL risks of injury and agree not to hold Training Partner responsible for anything that happens during training.</p>
            </div>
            <p>
              BY USING THIS PLATFORM, YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT:
            </p>
            <p>
              You understand that participating in combat sports and using this platform to find training partners involves inherent and significant risks including, but not limited to: physical injury, strains, sprains, fractures, concussions, traumatic brain injury, joint injuries, spinal injuries, dental injuries, lacerations, and other injuries that may occur during training, sparring, or competition. These risks exist regardless of the precautions taken by you, your training partner, or any gym facility.
            </p>
            <p>
              You VOLUNTARILY ASSUME ALL SUCH RISKS, both known and unknown, and hereby RELEASE AND FOREVER DISCHARGE Training Partner, its owners, officers, directors, employees, agents, and affiliates from any and all liability, claims, demands, actions, or causes of action related to training activities, injuries, damages, or losses of any kind arising from or connected to your use of this platform. This release applies regardless of whether such injuries or damages are caused by negligence or any other cause.
            </p>
            <p>
              You further agree that this assumption of risk and release of liability shall be binding upon you, your heirs, executors, administrators, and assigns.
            </p>

            <h2 className="text-white font-heading text-2xl">6. SAFETY GUIDELINES</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: We strongly recommend meeting training partners at established gyms, not private locations. Communicate clearly about intensity and skill level, bring your own safety gear, and stop immediately if anything feels wrong. These are guidelines &mdash; your safety is your responsibility.</p>
            </div>
            <p>
              Training Partner strongly recommends that all users follow these safety guidelines when meeting and training with partners found through the platform. While these are recommendations and not obligations of Training Partner, failure to follow reasonable safety practices increases your risk:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Train at established facilities:</strong> Always meet training partners at established gyms, martial arts academies, or recognized training facilities. DO NOT meet at private residences, secluded locations, or unsupervised spaces for initial sessions.</li>
              <li><strong>Verify experience levels:</strong> Before training, independently verify your training partner&rsquo;s claimed experience level, belt rank, or competitive history. Ask for references or gym affiliations when possible.</li>
              <li><strong>Communicate intensity preferences:</strong> Before every session, clearly discuss and agree upon training intensity, techniques to be used, and any off-limits areas. Establish a clear &ldquo;tap&rdquo; or stop signal.</li>
              <li><strong>Bring appropriate safety equipment:</strong> Users are responsible for their own safety equipment including but not limited to: mouthguards, headgear, shin guards, groin protection, and any other protective gear appropriate for their chosen discipline.</li>
              <li><strong>Stop if unsafe:</strong> Immediately stop training if either party feels unsafe, is injured, or if the agreed-upon intensity or technique boundaries are being exceeded. No user should ever feel pressured to continue training.</li>
              <li><strong>Inform others:</strong> Tell a friend, family member, or gym staff when and where you are meeting a new training partner.</li>
              <li><strong>Trust your instincts:</strong> If something feels wrong about a training partner or situation, leave immediately. Report concerning behavior through the platform.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">7. MEDICAL DISCLAIMER</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: We are not doctors. Consult a physician before doing combat sports. If you have medical conditions that increase your injury risk, tell your training partners. We do not provide medical advice.</p>
            </div>
            <p>
              Training Partner does not provide medical advice, diagnosis, or treatment of any kind. Nothing on this platform should be construed as medical advice.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users should consult a licensed physician before engaging in any combat sports training, especially if they have pre-existing medical conditions, prior injuries, or have been sedentary.</li>
              <li>Users with known medical conditions that may increase their risk of injury &mdash; including but not limited to: heart conditions, seizure disorders, bleeding disorders, prior concussions, joint instability, or spinal conditions &mdash; MUST disclose these conditions to their training partners before each session.</li>
              <li>Failure to disclose relevant medical conditions to a training partner may constitute negligence and is a violation of these Terms.</li>
              <li>Training Partner is not responsible for any medical emergencies, injuries, or health complications that arise during or after training sessions.</li>
              <li>Users should ensure they have adequate health insurance coverage before participating in combat sports activities.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">8. GYM PARTNERS</h2>
            <p>
              Partner gyms listed on Training Partner are independent entities. Training Partner does not endorse, guarantee, or warrant the quality, safety, or qualifications of any gym. Users are responsible for independently verifying gym credentials, insurance coverage, and safety standards before participating in any gym activities. Gym partners agree to separate Gym Partner agreements with mutual indemnification provisions.
            </p>

            <h2 className="text-white font-heading text-2xl">9. SUBSCRIPTION AND PAYMENT</h2>
            <p>
              Premium subscriptions are billed monthly. Users may cancel at any time. Refunds are provided at the sole discretion of Training Partner.
            </p>
            <p>
              For marketplace transactions: Training Partner facilitates transactions between users but is not a party to those transactions. Platform service fees are non-refundable. Refund disputes between buyers and sellers are the responsibility of the transacting parties. Tax obligations, including compliance with 1099-K reporting thresholds, are the sole responsibility of the user.
            </p>

            <h2 className="text-white font-heading text-2xl">10. PRIVACY</h2>
            <p>
              We collect and use personal information as described in our <Link href="/privacy" className="text-primary hover:text-primary/80 underline">Privacy Policy</Link>. By using Training Partner, you consent to the collection and use of your information as outlined therein.
            </p>

            <h2 className="text-white font-heading text-2xl">11. TERMINATION</h2>
            <p>
              Training Partner reserves the right to terminate or suspend your account at any time for violation of these terms or for any other reason at our sole discretion.
            </p>

            <h2 className="text-white font-heading text-2xl">12. PLATFORM STATUS AND SECTION 230 PROTECTION</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Training Partner is a platform, not a gym or coaching service. We connect people but do not employ, screen, or supervise anyone on the platform. We are not responsible for what users post, say, or do.</p>
            </div>
            <p>
              Training Partner is a platform, not a training provider, gym, or coaching service. We do not employ, endorse, screen, or supervise any user. We facilitate connections between users &mdash; we do not arrange, supervise, or guarantee training sessions, events, or transactions.
            </p>
            <p>
              Under Section 230 of the Communications Decency Act, Training Partner is not liable for content posted by users, including but not limited to messages, profiles, reviews, ratings, community posts, and event listings.
            </p>

            <h2 className="text-white font-heading text-2xl">13. IDENTITY VERIFICATION</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Identity verification is optional. A &ldquo;Verified&rdquo; badge means someone submitted a government ID and it was reviewed &mdash; it does NOT mean we vouch for their character, skills, or safety. You are still responsible for your own safety decisions. Your ID photos are deleted 90 days after approval.</p>
            </div>
            <p>
              Identity verification is voluntary. Verification indicates that a user submitted government-issued identification that was reviewed and approved. It does NOT guarantee the accuracy of a user&rsquo;s identity, qualifications, character, or fitness for training. A &ldquo;Verified&rdquo; badge means the user completed the verification process, not that Training Partner vouches for them.
            </p>
            <p>
              Users remain responsible for their own safety decisions regardless of another user&rsquo;s verification status. Government ID data is retained for 90 days after approval and then permanently deleted. Users can delete their verification data at any time through their account settings.
            </p>

            <h2 className="text-white font-heading text-2xl">14. USER CONDUCT AND CONTENT POLICY</h2>
            <p>Training Partner maintains zero tolerance for the following:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harassment, threats, or intimidation</li>
              <li>Sexual harassment or inappropriate sexual behavior, including unwanted physical contact, sexual comments, or using the platform for romantic or sexual solicitation</li>
              <li>Hate speech or discriminatory language</li>
              <li>Discrimination based on gender, race, ethnicity, religion, sexual orientation, disability, age, or any other protected characteristic</li>
              <li>Sexually explicit content</li>
              <li>Doxxing or sharing others&rsquo; personal information without consent</li>
              <li>Creating fake profiles or impersonation</li>
              <li>Using the platform for illegal activities</li>
            </ul>
            <p><strong>Combat Sports-Specific Conduct:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>No intentional harm beyond agreed parameters:</strong> Users must not intentionally injure a training partner beyond the mutually agreed-upon training intensity and techniques. Deliberately applying excessive force, using banned techniques, or continuing after a tap/stop signal is strictly prohibited.</li>
              <li><strong>Accurate skill representation:</strong> Users must accurately represent their skill level, experience, belt rank, and competitive history. Misrepresenting your experience level puts training partners at risk and is grounds for account termination.</li>
              <li><strong>Respect boundaries:</strong> Users must respect weight class, intensity, and technique boundaries agreed upon before training. Escalating intensity without consent is prohibited.</li>
              <li><strong>Dangerous behavior reports:</strong> Users who receive multiple reports of dangerous, reckless, or unsafe training behavior may be immediately suspended or permanently banned from the platform at Training Partner&rsquo;s sole discretion.</li>
            </ul>
            <p>
              Content moderation: We review reported content within 48 hours. Three content policy violations result in account suspension. Users may appeal suspensions by contacting support@trainingpartner.app.
            </p>

            <h2 className="text-white font-heading text-2xl">15. RATING SYSTEM</h2>
            <p>
              Ratings reflect individual user experiences and are not endorsements by Training Partner. Ratings require proof of co-located training via mutual check-in or confirmed session.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Anti-retaliation:</strong> Threatening or harassing a user over a negative rating is grounds for immediate account suspension.</li>
              <li><strong>No manipulation:</strong> Coordinated positive or negative ratings campaigns are prohibited.</li>
              <li><strong>Defamation:</strong> Training Partner is not liable for defamation claims arising from user-generated ratings.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">16. MARKETPLACE TRANSACTIONS</h2>
            <p>
              Training Partner facilitates transactions between users (events, services, donations) via Stripe. Training Partner is not a party to these transactions. Users are responsible for fulfilling their obligations in any transaction.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Platform service fees are clearly disclosed before checkout and are non-refundable.</li>
              <li>Tax reporting obligations are the sole responsibility of the user.</li>
              <li>Dispute resolution between transacting parties is their responsibility; Training Partner may mediate but is not obligated to do so.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">17. AGE REQUIREMENTS</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: You must be 18 or older to use Training Partner. If you are 16 or 17, a parent or guardian must create and supervise your account. Under 16 is not allowed.</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>18+ for full access:</strong> Users must be at least 18 years old to create an account and use Training Partner independently. This includes all platform features: partner matching, messaging, marketplace transactions, identity verification, and gym access.</li>
              <li><strong>16&ndash;17 with parental supervision:</strong> Users aged 16&ndash;17 may only use the platform if a parent or legal guardian creates the account on their behalf, provides verifiable consent, and actively supervises the minor&rsquo;s use of the platform. Parental accounts for minors have restricted features (no marketplace transactions, no identity verification, no unsupervised messaging). The parent or guardian assumes all liability for the minor&rsquo;s activities on the platform.</li>
              <li><strong>Under 16 prohibited:</strong> Users under the age of 16 are strictly prohibited from using Training Partner. We do not knowingly collect personal information from anyone under 16. If we learn we have collected information from a user under 16, we will delete it immediately and terminate the account.</li>
              <li>Given the physical risks inherent in combat sports, these age restrictions exist to protect minors and are strictly enforced. Misrepresenting your age is grounds for immediate account termination.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">18. ANTI-DISCRIMINATION POLICY</h2>
            <p>
              Training Partner does not tolerate discrimination based on race, ethnicity, religion, gender identity, sexual orientation, disability, or any other protected characteristic. Matching criteria based on sport, skill level, weight class, and location serve legitimate training purposes and are not discriminatory. Users who engage in discriminatory behavior will have their accounts terminated.
            </p>

            <h2 className="text-white font-heading text-2xl">19. INSURANCE RECOMMENDATION</h2>
            <p>
              Training Partner strongly recommends that users verify their training gym&rsquo;s insurance coverage and consider obtaining personal liability insurance before participating in combat sports activities. Training Partner does not provide insurance coverage of any kind.
            </p>

            <h2 className="text-white font-heading text-2xl">20. INDEMNIFICATION</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: If someone sues us because of something you did on the platform or during training, you agree to cover our legal costs and any damages.</p>
            </div>
            <p>
              You agree to indemnify, defend, and hold harmless Training Partner, its owners, officers, directors, employees, agents, affiliates, successors, and assigns (collectively, the &ldquo;Indemnified Parties&rdquo;) from and against any and all claims, demands, actions, causes of action, damages, losses, liabilities, costs, and expenses (including reasonable attorney&rsquo;s fees and court costs) arising out of or related to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use of the Training Partner platform</li>
              <li>Any training activities, sparring sessions, or physical interactions with other users found through the platform</li>
              <li>Any injury, damage, or loss caused by you to another user or third party during training</li>
              <li>Your violation of these Terms of Service</li>
              <li>Your violation of any applicable law, regulation, or third-party right</li>
              <li>Any content you post, upload, or transmit through the platform</li>
              <li>Any dispute between you and another user</li>
              <li>Any misrepresentation of your skill level, experience, medical condition, or identity</li>
            </ul>
            <p>
              This indemnification obligation shall survive the termination of your account and these Terms of Service.
            </p>

            <h2 className="text-white font-heading text-2xl">21. DISPUTE RESOLUTION AND MANDATORY ARBITRATION</h2>
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

            <h2 className="text-white font-heading text-2xl">22. CONTACT</h2>
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
