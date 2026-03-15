import type { Metadata } from 'next'
import Link from 'next/link'
import { Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'DMCA Takedown Policy | Training Partner',
  description: 'DMCA takedown policy and procedures for Training Partner.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DMCAPage() {
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
          <h1 className="font-heading text-4xl text-white mb-8">DMCA TAKEDOWN POLICY</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
            <p>Last updated: March 14, 2026</p>

            <h2 className="text-white font-heading text-2xl">1. SAFE HARBOR STATEMENT</h2>
            <p>
              Training Partner respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (&ldquo;DMCA&rdquo;), specifically Section 512(c), Training Partner will respond expeditiously to claims of copyright infringement committed using our platform that are reported to our designated DMCA agent identified below.
            </p>
            <p>
              As a service provider, Training Partner qualifies for the safe harbor provisions of Section 512(c) of the DMCA. We do not monitor, screen, or pre-approve user-submitted content for copyright compliance, but we will act swiftly to remove or disable access to infringing material upon receipt of a valid DMCA notice.
            </p>

            <h2 className="text-white font-heading text-2xl">2. DESIGNATED DMCA AGENT</h2>
            <p>
              Our designated agent for receiving notifications of claimed copyright infringement (&ldquo;DMCA Agent&rdquo;) can be reached at:
            </p>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-white">
                <strong>DMCA Agent</strong><br />
                Training Partner<br />
                Email: <a href="mailto:safety@trainingpartner.app" className="text-primary hover:text-primary/80 underline">safety@trainingpartner.app</a>
              </p>
            </div>
            <p>
              Please direct all DMCA notices to the email address above. Notices sent to other email addresses may not be processed in a timely manner.
            </p>

            <h2 className="text-white font-heading text-2xl">3. FILING A DMCA NOTICE</h2>
            <p>
              If you believe that content on Training Partner infringes your copyright, you may submit a DMCA takedown notice to our designated agent. Under 17 U.S.C. &sect; 512(c)(3), your notice must include the following:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Physical or electronic signature</strong> of the copyright owner or a person authorized to act on their behalf.
              </li>
              <li>
                <strong>Identification of the copyrighted work</strong> claimed to have been infringed. If multiple copyrighted works are covered by a single notification, provide a representative list.
              </li>
              <li>
                <strong>Identification of the infringing material</strong> and information reasonably sufficient to permit Training Partner to locate it, including the specific URL(s) or description of where the material appears on our platform.
              </li>
              <li>
                <strong>Your contact information,</strong> including your name, mailing address, telephone number, and email address.
              </li>
              <li>
                <strong>A statement of good faith</strong> that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
              </li>
              <li>
                <strong>A statement of accuracy under penalty of perjury</strong> that the information in the notification is accurate, and that you are authorized to act on behalf of the copyright owner.
              </li>
            </ol>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-200 text-sm">
                <strong>Warning:</strong> Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material is infringing, or that material was removed or disabled by mistake, may be subject to liability for damages, including attorneys&rsquo; fees.
              </p>
            </div>

            <h2 className="text-white font-heading text-2xl">4. COUNTER-NOTIFICATION PROCEDURE</h2>
            <p>
              If you believe that your content was removed or disabled as a result of a mistake or misidentification, you may submit a counter-notification to our DMCA Agent. Your counter-notification must include:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                Your physical or electronic signature.
              </li>
              <li>
                Identification of the material that has been removed or to which access has been disabled, and the location at which the material appeared before it was removed or disabled.
              </li>
              <li>
                A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification.
              </li>
              <li>
                Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the federal district court for the judicial district in which your address is located (or, if outside the United States, any judicial district in which Training Partner may be found), and that you will accept service of process from the person who provided the original DMCA notification or an agent of such person.
              </li>
            </ol>
            <p>
              Upon receipt of a valid counter-notification, Training Partner will forward it to the party who submitted the original DMCA notice. If the original complainant does not file a court action seeking a restraining order against you within 10&ndash;14 business days, Training Partner will restore the removed content.
            </p>

            <h2 className="text-white font-heading text-2xl">5. REPEAT INFRINGER POLICY</h2>
            <p>
              Training Partner maintains a strict policy regarding repeat infringers in accordance with the DMCA:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>First offense:</strong> The infringing material is removed and the user is notified of the DMCA complaint.
              </li>
              <li>
                <strong>Second offense:</strong> The infringing material is removed. The user receives a formal warning that a third offense will result in account termination.
              </li>
              <li>
                <strong>Third offense:</strong> The user&rsquo;s account is permanently terminated and they are prohibited from creating new accounts on Training Partner.
              </li>
            </ul>
            <p>
              Training Partner reserves the right to terminate any user&rsquo;s account at any time for copyright infringement, even before the third strike, if circumstances warrant it.
            </p>

            <h2 className="text-white font-heading text-2xl">6. LIMITATIONS AND DISCLAIMERS</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                This DMCA policy applies only to content hosted on the Training Partner platform. We cannot process takedown requests for content hosted on third-party websites or services.
              </li>
              <li>
                Training Partner is not responsible for determining the merits of any copyright claim. We act as an intermediary and follow the procedures established by the DMCA.
              </li>
              <li>
                Training Partner reserves the right to modify this policy at any time. Changes will be posted on this page with an updated effective date.
              </li>
              <li>
                This policy does not constitute legal advice. If you are unsure whether content infringes your copyright, you should consult a qualified attorney before submitting a DMCA notice.
              </li>
            </ul>

            <h2 className="text-white font-heading text-2xl">7. CONTACT</h2>
            <p>
              For DMCA-related inquiries, contact our designated agent at{' '}
              <a href="mailto:safety@trainingpartner.app" className="text-primary hover:text-primary/80 underline">
                safety@trainingpartner.app
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
