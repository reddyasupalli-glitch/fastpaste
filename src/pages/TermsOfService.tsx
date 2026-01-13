import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 13, 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                Welcome to FastPaste, a real-time code and message sharing platform operated by TRIONE SOLUTIONS PVT LTD 
                ("Company," "we," "us," or "our"). By accessing or using our service, you ("User," "you," or "your") agree 
                to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our service.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and the Company regarding your use of FastPaste. 
                We reserve the right to modify these Terms at any time, and such modifications will be effective immediately 
                upon posting. Your continued use of the service following any changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p>
                FastPaste is a web-based platform that enables users to share code snippets, text messages, and files in real-time 
                within temporary collaborative rooms. Our service includes, but is not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Real-time text and code sharing with syntax highlighting</li>
                <li>Temporary chat rooms with unique room codes</li>
                <li>Password-protected private rooms</li>
                <li>File sharing capabilities</li>
                <li>AI-assisted features for code help and suggestions</li>
                <li>Cross-device synchronization</li>
              </ul>
              <p>
                The service is provided "as is" and we reserve the right to modify, suspend, or discontinue any aspect of the 
                service at any time without prior notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
              <p>
                FastPaste does not require formal user registration. Users create temporary usernames that exist only within 
                their browser session. You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Choosing an appropriate, non-offensive username</li>
                <li>Maintaining the confidentiality of room codes and passwords you create</li>
                <li>All activities that occur under your username within a room</li>
                <li>Ensuring your use complies with all applicable laws and these Terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
              <p>You agree to use FastPaste only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Share malicious code, viruses, malware, or harmful software</li>
                <li>Transmit spam, chain letters, or unsolicited promotional materials</li>
                <li>Harass, abuse, threaten, or intimidate other users</li>
                <li>Share content that is defamatory, obscene, pornographic, or offensive</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Attempt to gain unauthorized access to our systems or other users' data</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use automated scripts, bots, or scrapers without permission</li>
                <li>Impersonate any person or entity</li>
                <li>Share personal information of others without their consent</li>
              </ul>
              <p>
                Violation of these rules may result in immediate termination of your access to the service and may be reported 
                to appropriate law enforcement authorities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-medium mb-3">5.1 Your Content</h3>
              <p>
                You retain ownership of any content you share through FastPaste. By sharing content, you grant us a limited, 
                non-exclusive license to temporarily store and transmit your content solely for the purpose of providing the service.
              </p>

              <h3 className="text-xl font-medium mb-3">5.2 Our Intellectual Property</h3>
              <p>
                The FastPaste platform, including its design, features, code, and branding, is owned by TRIONE SOLUTIONS PVT LTD 
                and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, 
                or create derivative works based on our platform without explicit written permission.
              </p>

              <h3 className="text-xl font-medium mb-3">5.3 Content Responsibility</h3>
              <p>
                You are solely responsible for the content you share. We do not actively monitor user content but reserve the 
                right to remove any content that violates these Terms or is deemed harmful or inappropriate.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Privacy</h2>
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
                which is incorporated into these Terms by reference. By using FastPaste, you consent to our data practices as 
                described in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
              <p>
                FASTPASTE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
                OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Implied warranties of merchantability and fitness for a particular purpose</li>
                <li>Warranties of non-infringement</li>
                <li>Warranties that the service will be uninterrupted, error-free, or secure</li>
                <li>Warranties regarding the accuracy or reliability of any content</li>
              </ul>
              <p>
                We do not warrant that the service will meet your requirements or that any defects will be corrected. 
                You use the service at your own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRIONE SOLUTIONS PVT LTD AND ITS OFFICERS, DIRECTORS, EMPLOYEES, 
                AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Loss of profits, revenue, or data</li>
                <li>Business interruption</li>
                <li>Loss of goodwill or reputation</li>
                <li>Cost of substitute services</li>
              </ul>
              <p>
                Our total liability for any claims arising from your use of the service shall not exceed the amount you paid 
                us (if any) during the twelve months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless TRIONE SOLUTIONS PVT LTD and its officers, directors, 
                employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, or 
                expenses (including reasonable attorneys' fees) arising out of or related to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Your use of the service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Any content you share through the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your access to FastPaste at any time, without prior notice or 
                liability, for any reason, including but not limited to a breach of these Terms. Upon termination, your 
                right to use the service will immediately cease.
              </p>
              <p>
                All provisions of these Terms which by their nature should survive termination shall survive, including 
                ownership provisions, warranty disclaimers, indemnification, and limitations of liability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law and Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to 
                its conflict of law provisions. Any disputes arising from these Terms or your use of the service shall 
                be resolved through binding arbitration in accordance with applicable arbitration rules.
              </p>
              <p>
                Before initiating any legal proceedings, you agree to first attempt to resolve any dispute informally 
                by contacting us. Most disputes can be resolved quickly and amicably through direct communication.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, 
                that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions 
                shall continue in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and TRIONE SOLUTIONS 
                PVT LTD regarding your use of FastPaste and supersede all prior agreements, understandings, and communications, 
                whether written or oral.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
              <p>If you have any questions or concerns about these Terms of Service, please contact us:</p>
              <ul className="list-none pl-0 mt-4">
                <li><strong>Company:</strong> TRIONE SOLUTIONS PVT LTD</li>
                <li><strong>Email:</strong> asaborniketan@gmail.com</li>
                <li><strong>Instagram:</strong> @trione.solutions</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
