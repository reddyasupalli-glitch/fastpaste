import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
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
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 13, 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                Welcome to FastPaste, a real-time code and message sharing platform developed by TRIONE SOLUTIONS PVT LTD. 
                We are committed to protecting your privacy and ensuring transparency about how we handle your information. 
                This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
              </p>
              <p>
                By using FastPaste, you agree to the collection and use of information in accordance with this policy. 
                We encourage you to read this document carefully to understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Username:</strong> When you use FastPaste, you create a temporary username that identifies you within chat rooms. This username is stored locally in your browser and is not linked to any personal identity.</li>
                <li><strong>Messages and Code Snippets:</strong> Any text, code, or files you share through our platform are temporarily stored to enable real-time collaboration with other users in the same room.</li>
                <li><strong>Feedback:</strong> If you choose to provide feedback, you may share your thoughts and ratings with us.</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Usage Data:</strong> We collect anonymous usage statistics to improve our service, including page views, feature usage, and general interaction patterns.</li>
                <li><strong>Device Information:</strong> Basic device information such as browser type, operating system, and screen resolution may be collected for optimization purposes.</li>
                <li><strong>Cookies:</strong> We use essential cookies to maintain your session and preferences. These cookies do not track you across other websites.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Service Delivery:</strong> To provide and maintain our real-time code sharing and messaging functionality.</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve user experience, performance, and features.</li>
                <li><strong>Communication:</strong> To respond to your inquiries, feedback, or support requests.</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues, abuse, or unauthorized access.</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Retention and Deletion</h2>
              <p>
                FastPaste is designed with privacy in mind. We implement automatic data cleanup mechanisms:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Temporary Rooms:</strong> Chat rooms and their contents are automatically deleted after a period of inactivity (typically 24 hours).</li>
                <li><strong>No Permanent Storage:</strong> We do not permanently store your messages, code snippets, or shared files beyond what is necessary for the service to function.</li>
                <li><strong>Local Data:</strong> Your username preference is stored in your browser's local storage, which you can clear at any time through your browser settings.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Third Parties</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Service Providers:</strong> We use trusted third-party services (such as Supabase for database hosting) that help us operate our platform. These providers are bound by strict data protection agreements.</li>
                <li><strong>Analytics:</strong> We use Google Analytics to understand how users interact with our service. This data is anonymized and aggregated.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or governmental regulation.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your information against unauthorized access, 
                alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encrypted data transmission using HTTPS/TLS protocols</li>
                <li>Secure database hosting with regular security audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security updates and vulnerability assessments</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
              <p>Depending on your location, you may have the following rights regarding your data:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Access:</strong> Request information about the data we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements).</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format.</li>
                <li><strong>Objection:</strong> Object to certain processing of your data.</li>
              </ul>
              <p>To exercise any of these rights, please contact us using the information provided below.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
              <p>
                FastPaste is not intended for children under the age of 13. We do not knowingly collect personal information 
                from children under 13. If you are a parent or guardian and believe your child has provided us with personal 
                information, please contact us immediately. If we discover that a child under 13 has provided us with personal 
                information, we will promptly delete such information from our servers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. 
                These countries may have data protection laws that differ from your country. By using FastPaste, you consent 
                to the transfer of your information to these countries. We ensure appropriate safeguards are in place to 
                protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
                legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this 
                page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
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

export default PrivacyPolicy;
