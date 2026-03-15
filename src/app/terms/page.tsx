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
          <h1 className="font-heading text-4xl text-white mb-4">TERMS OF SERVICE</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
            <p><strong>Effective Date:</strong> March 14, 2026</p>
            <p><strong>Last Updated:</strong> March 15, 2026</p>

            <h2 className="text-white font-heading text-2xl">1. ACCEPTANCE OF TERMS</h2>
            <p>
              By accessing and using Training Partner (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>

            <h2 className="text-white font-heading text-2xl">2. DESCRIPTION OF SERVICE</h2>
            <p>
              Training Partner is a <strong>platform and directory</strong> that connects combat sports athletes with compatible training partners, coaches, gyms, and events. Training Partner is <strong>not</strong> a gym, coaching service, employment agency, payment processor, or sports organization. The service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Partner matching based on skill level, weight class, and training goals</li>
              <li>Gym discovery, listings, and access to partner gym facilities and open mat hours</li>
              <li>Coaching marketplace &mdash; a directory where coaches list private lessons, students can contact and book them, with optional in-app payment processing via Stripe Connect</li>
              <li>Promoted events &mdash; event organizers can pay to boost event visibility</li>
              <li>Check-in system for tracking training sessions</li>
              <li>User profiles, messaging, reviews, and community features</li>
              <li>Gear recommendations with affiliate links</li>
              <li>Subscription-based premium features</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">3. PLATFORM STATUS &mdash; WHAT WE ARE AND WHAT WE ARE NOT</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Training Partner is a directory and connection platform. We are not a gym, coach, employer, payment processor, or safety guarantor. We connect people &mdash; what happens between them is between them.</p>
            </div>
            <p>
              <strong>Training Partner IS:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A platform and directory that helps users discover training partners, coaches, gyms, and events</li>
              <li>A technology service that facilitates connections between independent users</li>
              <li>An advertising platform where gyms and event organizers can purchase promotional placement</li>
            </ul>
            <p>
              <strong>Training Partner IS NOT:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>An employer, staffing agency, or employment agency &mdash; all coaches, athletes, and gym operators on the platform are <strong>independent parties</strong>, not employees, contractors, or agents of Training Partner</li>
              <li>A guarantor of off-platform payments &mdash; while we facilitate in-app payments through Stripe Connect for coaching sessions, we do not process, hold, escrow, guarantee, or mediate payments made outside of our payment system (Venmo, Zelle, cash, etc.)</li>
              <li>A training provider, gym, coaching service, or sports organization</li>
              <li>A guarantor of the quality, safety, accuracy, or legality of any service, listing, or user on the platform</li>
              <li>A party to any transaction, agreement, or arrangement between users</li>
            </ul>
            <p>
              Under Section 230 of the Communications Decency Act, Training Partner is not liable for content posted by users, including but not limited to messages, profiles, reviews, ratings, community posts, and event listings.
            </p>

            <h2 className="text-white font-heading text-2xl">4. COACHING MARKETPLACE AND PAYMENTS</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Coaches on Training Partner are independent. We offer two payment paths: (1) Pay through the app via Stripe Connect, which gives you dispute resolution and TOS protection, or (2) pay off-platform (Venmo, cash, Zelle), which is entirely at your own risk and outside our TOS protection. We strongly recommend paying through the app.</p>
            </div>
            <p>
              The Training Partner coaching marketplace allows coaches to list their services and allows students to discover, contact, and pay them. By using the coaching marketplace, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Coaches are independent service providers.</strong> They are not employees, contractors, or agents of Training Partner. We do not set their rates, schedules, curricula, or methods.</li>
              <li><strong>We do not verify coaching quality or credentials.</strong> Unless a coach holds a verified or champion badge (see Section 15), Training Partner has not independently verified any coach&rsquo;s certifications, experience, teaching ability, insurance coverage, or safety practices. Even verified badges have limitations (see Section 15).</li>
              <li><strong>We are not responsible for coaching outcomes.</strong> Training Partner makes no representations or warranties regarding the quality, safety, effectiveness, or suitability of any coaching services listed on the platform.</li>
              <li><strong>Users engage coaching services at their own risk.</strong> You are solely responsible for evaluating any coach&rsquo;s qualifications, verifying their credentials, ensuring their insurance coverage, and determining whether their services are appropriate for your skill level and goals.</li>
            </ul>

            <h3 className="text-white font-heading text-xl mt-6">4A. IN-APP PAYMENTS (STRIPE CONNECT)</h3>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">Payments processed through Training Partner&rsquo;s in-app payment system are subject to these Terms and provide dispute resolution protections.</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li>Coaching payments processed through Training Partner use <strong>Stripe Connect</strong> and are subject to Stripe&rsquo;s terms of service in addition to these Terms.</li>
              <li>Training Partner facilitates payment processing and charges a <strong>15% platform fee</strong> on each transaction. The remaining 85% is transferred to the coach.</li>
              <li>Disputes for in-app payments may be submitted through our reporting system. Training Partner may, at its sole discretion, investigate and take action on disputed transactions.</li>
              <li><strong>Refund policy:</strong> Coaches set their own refund policy, which should be communicated to students before booking. Training Partner does not guarantee refunds but may facilitate the refund process for in-app transactions.</li>
              <li>Coaches who receive payments through the app are responsible for their own tax obligations, including compliance with 1099-K reporting thresholds.</li>
            </ul>

            <h3 className="text-white font-heading text-xl mt-6">4B. OFF-PLATFORM PAYMENTS</h3>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-bold">WARNING: Off-platform payments are ENTIRELY AT YOUR OWN RISK and are OUTSIDE the scope of these Terms of Service.</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Users who arrange payment outside of Training Partner&rsquo;s payment system do so ENTIRELY AT THEIR OWN RISK.</strong> This includes payments via Venmo, Zelle, cash, PayPal, or any other method not processed through our in-app system.</li>
              <li><strong>Off-platform payments are expressly OUTSIDE the scope of these Terms of Service.</strong> The protections, dispute resolution mechanisms, and obligations described in these Terms do not apply to off-platform transactions.</li>
              <li><strong>Training Partner has NO visibility into, control over, or responsibility for off-platform transactions.</strong> We do not know the amounts, timing, or terms of off-platform payments.</li>
              <li><strong>Training Partner CANNOT and WILL NOT mediate, investigate, or resolve disputes arising from off-platform payments.</strong> This includes disputes about payment amounts, refunds, non-payment, fraud, or any other issue related to off-platform transactions.</li>
              <li><strong>Users acknowledge that choosing off-platform payment waives their right to seek any remedy from Training Partner regarding that transaction.</strong> You expressly release Training Partner from any liability related to off-platform payments.</li>
              <li><strong>We STRONGLY RECOMMEND using our in-app payment system</strong> for the protection of both coaches and students. In-app payments provide transaction records, dispute resolution, and Terms of Service coverage that off-platform payments do not.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">5. USER RESPONSIBILITIES</h2>
            <p>As a user of Training Partner, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the service in a lawful and respectful manner</li>
              <li>Not engage in harassment, discrimination, or violent behavior</li>
              <li>Report any suspicious or inappropriate activity</li>
              <li>Use the rating system honestly and in good faith &mdash; no retaliation ratings and no coordinated ratings manipulation</li>
              <li>Comply with all gym rules and partner gym policies when visiting facilities</li>
              <li><strong>Independently verify</strong> the identity, credentials, skill level, and safety practices of anyone you train with, hire as a coach, or otherwise engage through the platform</li>
              <li>Accept personal responsibility for your decision to train with, spar with, or hire any user on the platform</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">6. USER CONDUCT AND CONTENT POLICY</h2>
            <p>Training Partner maintains zero tolerance for the following:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harassment, threats, or intimidation</li>
              <li>Sexual harassment or inappropriate sexual behavior, including unwanted physical contact, sexual comments, or using the platform for romantic or sexual solicitation</li>
              <li>Hate speech or discriminatory language</li>
              <li>Discrimination based on gender, race, ethnicity, religion, sexual orientation, disability, age, or any other protected characteristic</li>
              <li>Sexually explicit content</li>
              <li>Doxxing or sharing others&rsquo; personal information without consent</li>
              <li><strong>Creating fake profiles, impersonation, or misrepresenting your identity</strong></li>
              <li><strong>Misrepresenting credentials, certifications, belt ranks, or competitive records</strong></li>
              <li>Using the platform for illegal activities</li>
              <li><strong>Posting fraudulent reviews, fake endorsements, or misleading testimonials</strong></li>
              <li><strong>Spam, unsolicited commercial messages, or unauthorized advertising</strong></li>
            </ul>
            <p><strong>Combat Sports-Specific Conduct:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>No intentional harm beyond agreed parameters:</strong> Users must not intentionally injure a training partner beyond the mutually agreed-upon training intensity and techniques. Deliberately applying excessive force, using banned techniques, or continuing after a tap/stop signal is strictly prohibited.</li>
              <li><strong>Accurate skill representation:</strong> Users must accurately represent their skill level, experience, belt rank, and competitive history. Misrepresenting your experience level puts training partners at risk and is grounds for account termination.</li>
              <li><strong>Respect boundaries:</strong> Users must respect weight class, intensity, and technique boundaries agreed upon before training. Escalating intensity without consent is prohibited.</li>
              <li><strong>Dangerous behavior reports:</strong> Users who receive multiple reports of dangerous, reckless, or unsafe training behavior may be immediately suspended or permanently banned from the platform at Training Partner&rsquo;s sole discretion.</li>
            </ul>
            <p>
              <strong>User-generated content</strong> (including reviews, messages, profiles, photos, and community posts) is the sole responsibility of the user who created it. Training Partner does not endorse, verify, or assume liability for any user-generated content. We reserve the right to remove content and suspend or terminate accounts that violate these Terms at our sole discretion.
            </p>
            <p>
              Content moderation: We review reported content within 48 hours. Three content policy violations result in account suspension. Users may appeal suspensions by contacting support@trainingpartner.app.
            </p>

            <h2 className="text-white font-heading text-2xl">7. LIABILITY WAIVER AND COMBAT SPORTS RISK ACKNOWLEDGMENT</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Training Partner is a connection platform only &mdash; not a gym, coach, or training provider. We do not supervise, control, or oversee your training sessions. Combat sports are inherently dangerous and can result in serious injury or death. You are responsible for your own safety, medical clearance, and verifying who you train with. We are not liable for injuries, damages, or losses that occur during training.</p>
            </div>
            <p>
              Training Partner is a <strong>CONNECTION PLATFORM ONLY</strong>. We are not a training provider, gym, coaching service, or sports organization. We do not employ, supervise, control, arrange, or oversee training sessions. By using this service, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Combat sports carry inherent risk of serious injury or death.</strong> Combat sports training &mdash; including but not limited to wrestling, Brazilian Jiu-Jitsu (BJJ), mixed martial arts (MMA), boxing, Muay Thai, judo, and other martial arts &mdash; involves inherent and significant risks of serious bodily injury, including but not limited to: concussions and traumatic brain injury, broken bones and fractures, torn ligaments, sprains and strains, joint dislocations, spinal injuries, dental injuries, lacerations, and <strong>in rare cases, permanent disability or death</strong></li>
              <li><strong>You assume all risk of physical injury</strong> from training, sparring, competition, or any other physical activity arranged, discovered, or facilitated through this platform</li>
              <li>Training Partner bears <strong>NO responsibility</strong> for any injuries, damages, losses, medical expenses, or any other costs sustained during or arising from training activities with partners, coaches, or other users found through this platform</li>
              <li>Training Partner is <strong>not responsible for injuries sustained during activities arranged through the platform</strong>, whether those activities occur at a gym, park, private residence, competition venue, or any other location</li>
              <li>All users must obtain appropriate medical clearance before engaging in combat sports training</li>
              <li>Users are solely responsible for verifying the qualifications, experience, credentials, and identity of any training partners or coaches they engage through the platform</li>
              <li><strong>We do not verify the skill level, credentials, or safety practices of any user</strong> unless specifically noted through our verification badge program (see Section 15), and even verified badges have significant limitations</li>
              <li>Users must sign gym liability waivers before participating in gym sessions</li>
              <li>Training Partner makes no representations or warranties regarding the safety, skill level, character, or intentions of any user on the platform</li>
              <li><strong>You hereby release and waive all claims against Training Partner</strong>, its owners, officers, directors, employees, agents, and affiliates for any and all injuries, damages, losses, costs, expenses (including attorney&rsquo;s fees), and legal proceedings of any kind arising from or related to training activities, coaching services, interactions with other users, or any other use of the platform</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">8. ASSUMPTION OF RISK</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Combat sports can cause serious injuries including broken bones, concussions, and worse. By using this platform to find training partners or coaches, you voluntarily accept ALL risks of injury and agree not to hold Training Partner responsible for anything that happens during training.</p>
            </div>
            <p>
              BY USING THIS PLATFORM, YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT:
            </p>
            <p>
              You understand that participating in combat sports and using this platform to find training partners, coaches, gyms, or events involves inherent and significant risks including, but not limited to: physical injury, strains, sprains, fractures, concussions, traumatic brain injury, joint injuries, spinal injuries, dental injuries, lacerations, and other injuries that may occur during training, sparring, or competition. These risks exist regardless of the precautions taken by you, your training partner, your coach, or any gym facility.
            </p>
            <p>
              You <strong>VOLUNTARILY ASSUME ALL SUCH RISKS</strong>, both known and unknown, and hereby <strong>RELEASE AND FOREVER DISCHARGE</strong> Training Partner, its owners, officers, directors, employees, agents, and affiliates from any and all liability, claims, demands, actions, or causes of action related to training activities, coaching services, injuries, damages, or losses of any kind arising from or connected to your use of this platform. This release applies regardless of whether such injuries or damages are caused by negligence or any other cause.
            </p>
            <p>
              You further agree that this assumption of risk and release of liability shall be binding upon you, your heirs, executors, administrators, and assigns.
            </p>

            <h2 className="text-white font-heading text-2xl">9. SAFETY GUIDELINES</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: We strongly recommend meeting training partners at established gyms, not private locations. Communicate clearly about intensity and skill level, bring your own safety gear, and stop immediately if anything feels wrong. These are guidelines &mdash; your safety is your responsibility.</p>
            </div>
            <p>
              Training Partner strongly recommends that all users follow these safety guidelines when meeting and training with partners or coaches found through the platform. While these are recommendations and not obligations of Training Partner, failure to follow reasonable safety practices increases your risk:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Train at established facilities:</strong> Always meet training partners and coaches at established gyms, martial arts academies, or recognized training facilities. DO NOT meet at private residences, secluded locations, or unsupervised spaces for initial sessions.</li>
              <li><strong>Verify experience levels:</strong> Before training, independently verify your training partner&rsquo;s or coach&rsquo;s claimed experience level, belt rank, certifications, or competitive history. Ask for references or gym affiliations when possible.</li>
              <li><strong>Communicate intensity preferences:</strong> Before every session, clearly discuss and agree upon training intensity, techniques to be used, and any off-limits areas. Establish a clear &ldquo;tap&rdquo; or stop signal.</li>
              <li><strong>Bring appropriate safety equipment:</strong> Users are responsible for their own safety equipment including but not limited to: mouthguards, headgear, shin guards, groin protection, and any other protective gear appropriate for their chosen discipline.</li>
              <li><strong>Stop if unsafe:</strong> Immediately stop training if either party feels unsafe, is injured, or if the agreed-upon intensity or technique boundaries are being exceeded. No user should ever feel pressured to continue training.</li>
              <li><strong>Inform others:</strong> Tell a friend, family member, or gym staff when and where you are meeting a new training partner or coach.</li>
              <li><strong>Trust your instincts:</strong> If something feels wrong about a training partner, coach, or situation, leave immediately. Report concerning behavior through the platform.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">10. MEDICAL DISCLAIMER</h2>
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

            <h2 className="text-white font-heading text-2xl">11. GYM LISTINGS AND PARTNERSHIPS</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Gym information on Training Partner is provided &ldquo;as is.&rdquo; We do not guarantee that gym details, hours, pricing, or facilities are accurate. Paying for premium placement does not mean we endorse a gym&rsquo;s quality or safety. Always verify gym details yourself before visiting.</p>
            </div>
            <p>
              Training Partner provides gym listings as an informational directory. By using gym listing features, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Gym information is provided &ldquo;as is.&rdquo;</strong> Training Partner does not guarantee the accuracy, completeness, or timeliness of gym details including hours, pricing, class schedules, available disciplines, facility amenities, or contact information.</li>
              <li><strong>Claimed and verified gym listings</strong> represent the gym owner&rsquo;s or operator&rsquo;s assertions about their facility, not assertions by Training Partner. We do not independently verify claimed gym information unless specifically noted.</li>
              <li><strong>Training Partner is not responsible for experiences at listed gyms</strong>, including but not limited to: injuries, facility conditions, instructor quality, hygiene standards, equipment safety, or interpersonal interactions.</li>
              <li><strong>Partnership tiers and premium placement are advertising placements, not endorsements.</strong> A gym&rsquo;s premium listing, featured placement, or partnership tier indicates a paid advertising relationship with Training Partner. It does not constitute an endorsement, recommendation, or guarantee of that gym&rsquo;s quality, safety, credentials, insurance coverage, or suitability for any user.</li>
              <li>Partner gyms listed on Training Partner are independent entities. Users are responsible for independently verifying gym credentials, insurance coverage, and safety standards before participating in any gym activities.</li>
              <li>Gym partners agree to separate Gym Partner agreements with mutual indemnification provisions.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">12. PROMOTED EVENTS</h2>
            <p>
              Event organizers may pay Training Partner to boost the visibility of their events. <strong>Promoted event placement is advertising, not endorsement.</strong> Training Partner does not organize, supervise, insure, or guarantee the safety, quality, or legitimacy of any event listed on the platform, whether promoted or not. Users attend events at their own risk and should independently verify event details, organizer credentials, safety measures, and insurance coverage before participating.
            </p>

            <h2 className="text-white font-heading text-2xl">13. AFFILIATE LINKS AND GEAR RECOMMENDATIONS</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: Some product links on Training Partner are affiliate links. If you buy something through one of these links, we may earn a commission at no extra cost to you. This does not affect our recommendations.</p>
            </div>
            <p>
              In accordance with the Federal Trade Commission&rsquo;s 16 CFR Part 255 (&ldquo;Guides Concerning the Use of Endorsements and Testimonials in Advertising&rdquo;):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Training Partner uses affiliate links.</strong> Some links to products, gear, equipment, and other items on this platform are affiliate links. When you make a purchase through an affiliate link, Training Partner may earn a commission at no additional cost to you.</li>
              <li><strong>Affiliate relationships do not influence our editorial content.</strong> Our gear recommendations, product reviews, and editorial content are based on our independent assessment. Affiliate relationships do not determine what products we recommend or how we rank them.</li>
              <li><strong>Affiliate links are clearly identified.</strong> Products and links that are part of our affiliate program will be disclosed as such.</li>
              <li>Training Partner does not guarantee the quality, safety, accuracy of product descriptions, or suitability of any products linked through affiliate links. Product purchases are transactions between you and the third-party retailer, subject to that retailer&rsquo;s terms and return policies.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">14. SUBSCRIPTION, PAYMENT, AND MARKETPLACE TRANSACTIONS</h2>
            <p>
              <strong>Premium subscriptions</strong> are billed monthly. Users may cancel at any time. Refunds are provided at the sole discretion of Training Partner.
            </p>
            <p>
              <strong>Gym partnership payments and promoted event payments</strong> are transactions between Training Partner and the paying gym or event organizer, subject to separate partnership agreements.
            </p>
            <p>
              <strong>Coaching marketplace payments</strong> can be made through two paths: (1) <strong>In-app payments via Stripe Connect</strong>, which are subject to these Terms, carry a 15% platform fee, and provide dispute resolution protections (see Section 4A); or (2) <strong>Off-platform payments</strong> (Venmo, Zelle, cash, etc.), which are entirely outside the scope of these Terms and at the user&rsquo;s own risk (see Section 4B). <strong>We strongly recommend using in-app payments.</strong>
            </p>
            <p>
              For any on-platform marketplace transactions (events, services, donations): Training Partner facilitates transactions between users but is not a party to those transactions. Platform service fees are non-refundable. Refund disputes between buyers and sellers are the responsibility of the transacting parties. Tax obligations, including compliance with 1099-K reporting thresholds, are the sole responsibility of the user.
            </p>

            <h2 className="text-white font-heading text-2xl">15. VERIFICATION BADGES AND CREDENTIALS</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: A &ldquo;Verified&rdquo; badge means someone submitted a government ID or credential documentation and it was reviewed &mdash; it does NOT mean we vouch for their character, skills, coaching ability, or safety. You are still responsible for your own safety decisions.</p>
            </div>
            <p>
              Training Partner offers optional verification badges. By using the platform, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Verification badges indicate our review of submitted evidence.</strong> A badge means the user submitted documentation (such as a government-issued ID, competition results, or certification documents) and that documentation was reviewed and approved.</li>
              <li><strong>Badges do not constitute a guarantee</strong> of credentials, skill level, coaching competence, athletic ability, character, safety, or fitness for training.</li>
              <li><strong>We verify identity and documentation, not ability.</strong> Training Partner verifies that submitted documents appear authentic. We do not independently test, evaluate, or certify any user&rsquo;s athletic ability, coaching competence, or safety practices.</li>
              <li><strong>Users should independently verify credentials</strong> before engaging in training, hiring a coach, or entering any arrangement with another user, regardless of their badge status.</li>
              <li>Government ID data is retained for 90 days after approval and then permanently deleted. Users can delete their verification data at any time through their account settings.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">16. DISPUTES BETWEEN USERS</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: If you have a dispute with another user &mdash; whether about coaching, payments, training, or anything else &mdash; that is between you and them. We may provide reporting tools and may take action on accounts, but we are not obligated to resolve your disputes.</p>
            </div>
            <p>
              <strong>Disputes between users are between those users.</strong> Training Partner is not a party to any agreement, arrangement, or transaction between users and is not responsible for resolving disputes between them. This includes but is not limited to disputes involving:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Coaching quality, cancellations, no-shows, or refunds</li>
              <li>Payments made off-platform (Venmo, Zelle, cash, etc.) &mdash; these are expressly outside the scope of these Terms</li>
              <li>Training partner conduct, injuries, or safety concerns</li>
              <li>Reviews, ratings, or profile content</li>
              <li>Event attendance, quality, or refunds</li>
              <li>Any other disagreement between users</li>
            </ul>
            <p>
              Training Partner provides in-app reporting tools for users to flag concerning behavior. We may, <strong>at our sole discretion</strong>, investigate reports and take action on accounts including warnings, suspensions, or terminations. However, we are <strong>not obligated</strong> to investigate, mediate, arbitrate, or resolve any dispute between users.
            </p>
            <p>
              For disputes involving <strong>in-app payments</strong> (Stripe Connect), users may submit reports through our reporting system. Training Partner may, at its sole discretion, investigate and facilitate resolution.
            </p>
            <p>
              For disputes involving <strong>off-platform payments</strong>, users must resolve those disputes directly with each other or through the payment provider used. Training Partner has <strong>no ability and no obligation</strong> to process refunds, chargebacks, or reversals for off-platform payments. Users who chose off-platform payment expressly waived their right to seek remedy from Training Partner (see Section 4B).
            </p>

            <h2 className="text-white font-heading text-2xl">17. RATING SYSTEM</h2>
            <p>
              Ratings reflect individual user experiences and are not endorsements by Training Partner. Ratings require proof of co-located training via mutual check-in or confirmed session.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Anti-retaliation:</strong> Threatening or harassing a user over a negative rating is grounds for immediate account suspension.</li>
              <li><strong>No manipulation:</strong> Coordinated positive or negative ratings campaigns are prohibited.</li>
              <li><strong>Defamation:</strong> Training Partner is not liable for defamation claims arising from user-generated ratings.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">18. AGE REQUIREMENTS AND PARENTAL CONSENT</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: You must be 18 or older to use Training Partner. If you are 16 or 17, a parent or guardian must create and supervise your account and accepts all liability. Under 16 is not allowed.</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>18+ for full access:</strong> Users must be at least 18 years old to create an account and use Training Partner independently. This includes all platform features: partner matching, messaging, coaching marketplace, marketplace transactions, identity verification, and gym access.</li>
              <li><strong>16&ndash;17 with parental supervision:</strong> Users aged 16&ndash;17 may only use the platform if a parent or legal guardian creates the account on their behalf, provides verifiable consent, and actively supervises the minor&rsquo;s use of the platform. Parental accounts for minors have restricted features (no marketplace transactions, no identity verification, no unsupervised messaging, no coaching marketplace access). <strong>The parent or guardian assumes all liability</strong> for the minor&rsquo;s activities on the platform, including all risks described in Sections 7 and 8, and agrees to be bound by these Terms on behalf of the minor.</li>
              <li><strong>Under 16 prohibited:</strong> Users under the age of 16 are strictly prohibited from using Training Partner. We do not knowingly collect personal information from anyone under 16. If we learn we have collected information from a user under 16, we will delete it immediately and terminate the account.</li>
              <li>Given the physical risks inherent in combat sports, these age restrictions exist to protect minors and are strictly enforced. Misrepresenting your age is grounds for immediate account termination.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">19. ANTI-DISCRIMINATION POLICY</h2>
            <p>
              Training Partner does not tolerate discrimination based on race, ethnicity, religion, gender identity, sexual orientation, disability, or any other protected characteristic. Matching criteria based on sport, skill level, weight class, and location serve legitimate training purposes and are not discriminatory. Users who engage in discriminatory behavior will have their accounts terminated.
            </p>

            <h2 className="text-white font-heading text-2xl">20. INSURANCE RECOMMENDATION</h2>
            <p>
              Training Partner strongly recommends that users verify their training gym&rsquo;s insurance coverage and consider obtaining personal liability insurance before participating in combat sports activities. Training Partner does not provide insurance coverage of any kind. Coaches listing services on the coaching marketplace are strongly encouraged to carry their own professional liability insurance.
            </p>

            <h2 className="text-white font-heading text-2xl">21. PRIVACY AND DATA</h2>
            <p>
              We collect and use personal information as described in our <Link href="/privacy" className="text-primary hover:text-primary/80 underline">Privacy Policy</Link>. By using Training Partner, you consent to the collection and use of your information as outlined therein.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Profile visibility settings</strong> control what other users can see on your profile. However, Training Partner retains access to all account data regardless of your visibility settings for purposes of platform operation, safety, compliance, and legal obligations.</li>
              <li><strong>Data export</strong> is available to users upon request in compliance with GDPR (for EU residents) and CCPA (for California residents). To request a data export, contact support@trainingpartner.app.</li>
              <li>For full details on data collection, use, sharing, retention, and your rights, see our <Link href="/privacy" className="text-primary hover:text-primary/80 underline">Privacy Policy</Link>.</li>
            </ul>

            <h2 className="text-white font-heading text-2xl">22. INDEMNIFICATION</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: If someone sues us because of something you did on the platform, during training, in a coaching arrangement, or in a dispute with another user, you agree to cover our legal costs and any damages.</p>
            </div>
            <p>
              You agree to indemnify, defend, and hold harmless Training Partner, its owners, officers, directors, employees, agents, affiliates, successors, and assigns (collectively, the &ldquo;Indemnified Parties&rdquo;) from and against any and all claims, demands, actions, causes of action, damages, losses, liabilities, costs, and expenses (including reasonable attorney&rsquo;s fees and court costs) arising out of or related to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use of the Training Partner platform</li>
              <li>Any training activities, sparring sessions, or physical interactions with other users found through the platform</li>
              <li><strong>Your use of the coaching marketplace</strong>, whether as a coach or student, including any coaching services provided or received</li>
              <li><strong>Any payments or financial transactions between you and another user</strong>, whether on-platform or off-platform</li>
              <li>Any injury, damage, or loss caused by you to another user or third party during training or coaching</li>
              <li><strong>Physical activities arranged, discovered, or facilitated through the platform</strong></li>
              <li>Your violation of these Terms of Service</li>
              <li>Your violation of any applicable law, regulation, or third-party right</li>
              <li>Any content you post, upload, or transmit through the platform, including reviews, messages, and profile information</li>
              <li><strong>Any dispute between you and another user</strong>, including disputes about coaching, payments, training, or any other matter</li>
              <li>Any misrepresentation of your skill level, experience, credentials, certifications, medical condition, or identity</li>
              <li><strong>Your content and profile information</strong>, including claims of defamation, intellectual property infringement, or privacy violations arising from content you posted</li>
            </ul>
            <p>
              This indemnification obligation shall survive the termination of your account and these Terms of Service.
            </p>

            <h2 className="text-white font-heading text-2xl">23. LIMITATION OF LIABILITY</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: If we are ever found liable to you for anything, the most we will pay is whatever you paid us in the last 12 months. We are not liable for physical injuries, coaching quality, payment disputes between users, data accuracy, or indirect damages of any kind.</p>
            </div>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Training Partner&rsquo;s total aggregate liability</strong> to you for any and all claims arising out of or related to these Terms or your use of the platform shall not exceed the total amount you paid to Training Partner in the <strong>twelve (12) months</strong> immediately preceding the event giving rise to the claim. If you have not paid Training Partner anything, our maximum liability to you is <strong>zero dollars ($0)</strong>.</li>
              <li><strong>Training Partner shall not be liable</strong> for any indirect, incidental, special, consequential, exemplary, or punitive damages, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses, regardless of whether Training Partner has been advised of the possibility of such damages.</li>
              <li><strong>Training Partner specifically excludes liability for:</strong>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Physical injuries, bodily harm, or death arising from training, sparring, coaching, competition, or any other physical activity</li>
                  <li>The quality, safety, effectiveness, or suitability of coaching services listed on the platform</li>
                  <li>Payment disputes between users for transactions conducted off-platform</li>
                  <li>The accuracy of gym listings, coach profiles, user profiles, event details, or any other information on the platform</li>
                  <li>The conduct, actions, or omissions of any user, coach, gym, event organizer, or other third party</li>
                  <li>Products purchased through affiliate links</li>
                  <li>Loss of data, unauthorized access, or security breaches caused by third parties</li>
                </ul>
              </li>
            </ul>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability shall be limited to the greatest extent permitted by law.
            </p>

            <h2 className="text-white font-heading text-2xl">24. TERMINATION</h2>
            <p>
              Training Partner reserves the right to terminate or suspend your account at any time for violation of these terms or for any other reason at our sole discretion, with or without notice. Upon termination, your right to use the platform ceases immediately. Sections 7, 8, 22, 23, 25, and 27 survive termination of these Terms and your account.
            </p>

            <h2 className="text-white font-heading text-2xl">25. DISPUTE RESOLUTION AND MANDATORY ARBITRATION</h2>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm font-medium">In plain English: If you have a dispute with us (not with another user &mdash; see Section 16), we resolve it through arbitration (a private process), not court. First, contact us and we will try to work it out within 30 days. If that fails, it goes to binding arbitration. You cannot join a class action lawsuit against us. You have 30 days after signing up to opt out of this arbitration clause.</p>
            </div>
            <p>
              This section governs disputes between <strong>you and Training Partner</strong> (not disputes between users &mdash; see Section 16). Any dispute, claim, or controversy arising out of or relating to these Terms or the use of Training Partner shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its then-current rules.
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

            <h2 className="text-white font-heading text-2xl">26. GOVERNING LAW</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-white font-heading text-2xl">27. SEVERABILITY</h2>
            <p>
              If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable, while preserving the original intent of the provision to the greatest extent possible.
            </p>

            <h2 className="text-white font-heading text-2xl">28. ENTIRE AGREEMENT</h2>
            <p>
              These Terms of Service, together with our <Link href="/privacy" className="text-primary hover:text-primary/80 underline">Privacy Policy</Link> and any applicable Gym Partner agreements or other agreements referenced herein, constitute the entire agreement between you and Training Partner regarding your use of the platform. These Terms supersede all prior agreements, understandings, and communications between you and Training Partner, whether oral or written.
            </p>

            <h2 className="text-white font-heading text-2xl">29. CHANGES TO TERMS</h2>
            <p>
              Training Partner reserves the right to modify these Terms at any time. Material changes will be communicated via email or in-app notification at least 30 days before they take effect. Your continued use of the platform after the effective date of any changes constitutes acceptance of the updated Terms. If you do not agree with the updated Terms, you must stop using the platform and close your account.
            </p>

            <h2 className="text-white font-heading text-2xl">30. CONTACT</h2>
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
