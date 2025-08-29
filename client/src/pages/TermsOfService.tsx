import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, AlertTriangle, Shield } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/settings')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                By accessing and using Tranquiloo ("the Service"), you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Important Notice</h4>
                <p className="text-blue-800">
                  These terms constitute a legally binding agreement between you and Tranquiloo. 
                  Please read them carefully before using our services.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Tranquiloo is a mental health support application that provides:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>AI-powered conversational therapy and support</li>
                <li>Anxiety level tracking and analysis</li>
                <li>Goal setting and progress monitoring</li>
                <li>Treatment outcome tracking</li>
                <li>Therapist connection and referral services</li>
                <li>Mental health resources and educational content</li>
              </ul>
              
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500 mt-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Medical Disclaimer</h4>
                <p className="text-yellow-800">
                  Tranquiloo is not a substitute for professional medical advice, diagnosis, or treatment. 
                  Always seek the advice of qualified health providers with any questions you may have 
                  regarding a medical condition.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">By using our service, you agree to:</h4>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Provide accurate and complete information when creating your account</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Use the service only for lawful purposes and in accordance with these terms</li>
                  <li>Not attempt to gain unauthorized access to our systems or other users' accounts</li>
                  <li>Not use the service to transmit harmful, threatening, or inappropriate content</li>
                  <li>Respect the intellectual property rights of Tranquiloo and third parties</li>
                  <li>Comply with all applicable local, state, and federal laws</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Emergency Situations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 mb-4">
                <h4 className="font-semibold text-red-900 mb-2">🚨 Crisis Support</h4>
                <p className="text-red-800 mb-2">
                  If you are experiencing a mental health emergency or having thoughts of self-harm, 
                  please contact emergency services immediately:
                </p>
                <div className="text-red-800 font-semibold">
                  <p>• Call 911 (Emergency Services)</p>
                  <p>• Call 988 (Suicide & Crisis Lifeline)</p>
                  <p>• Text "HELLO" to 741741 (Crisis Text Line)</p>
                </div>
              </div>
              
              <p className="text-gray-700">
                Tranquiloo is designed to provide support and resources, but it cannot replace 
                immediate professional intervention in crisis situations. Our AI system may detect 
                crisis indicators and provide appropriate resources, but users should always prioritize 
                professional emergency services when needed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Your privacy is paramount to us. Please refer to our Privacy Policy for detailed 
                information about how we collect, use, and protect your personal information.
              </p>
              
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-900 mb-2">🔒 Key Privacy Highlights</h4>
                <ul className="text-green-800 space-y-1">
                  <li>• HIPAA compliant data handling</li>
                  <li>• End-to-end encryption of sensitive information</li>
                  <li>• No sale or sharing of personal health data</li>
                  <li>• User control over data retention and deletion</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                All content, features, and functionality of Tranquiloo, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li>Software code and algorithms</li>
                <li>Text, graphics, logos, and images</li>
                <li>AI models and conversation patterns</li>
                <li>User interface and design elements</li>
              </ul>
              <p className="text-gray-700">
                Are owned by Tranquiloo and are protected by copyright, trademark, and other 
                intellectual property laws. Users are granted a limited, non-exclusive license 
                to use the service for personal, non-commercial purposes only.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  To the maximum extent permitted by law, Tranquiloo shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages, including 
                  but not limited to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Loss of profits, data, or other intangible losses</li>
                  <li>Service interruptions or technical malfunctions</li>
                  <li>Errors or inaccuracies in content or recommendations</li>
                  <li>Unauthorized access to or alteration of your data</li>
                </ul>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    <strong>Note:</strong> Some jurisdictions do not allow the exclusion of certain 
                    warranties or the limitation of liability for consequential damages. In such 
                    jurisdictions, our liability will be limited to the maximum extent permitted by law.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">User-Initiated Termination</h4>
                <p className="text-gray-700">
                  You may terminate your account at any time through the settings page or by 
                  contacting our support team. Upon termination, your access to the service 
                  will cease immediately.
                </p>
                
                <h4 className="font-semibold text-gray-900">Service-Initiated Termination</h4>
                <p className="text-gray-700">
                  We reserve the right to suspend or terminate accounts that violate these terms, 
                  engage in harmful behavior, or compromise the security and integrity of our service.
                </p>
                
                <h4 className="font-semibold text-gray-900">Data Retention After Termination</h4>
                <p className="text-gray-700">
                  Upon account termination, we will delete your personal data in accordance with 
                  our Privacy Policy and applicable legal requirements, typically within 30 days 
                  unless longer retention is required by law.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms of Service at any time. Changes will 
                be effective immediately upon posting the updated terms on our website. We will 
                notify users of material changes via email and in-app notifications.
              </p>
              
              <p className="text-gray-700">
                Your continued use of Tranquiloo after any such changes constitutes your acceptance 
                of the new Terms of Service. If you do not agree to the modified terms, you should 
                discontinue your use of the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  These Terms of Service shall be governed by and construed in accordance with the 
                  laws of the United States and the state in which our principal business operations 
                  are conducted, without regard to conflict of law principles.
                </p>
                
                <h4 className="font-semibold text-gray-900">Dispute Resolution Process</h4>
                <ol className="list-decimal pl-6 text-gray-700 space-y-1">
                  <li>Initial contact: Attempt to resolve disputes through direct communication</li>
                  <li>Mediation: If direct resolution fails, engage in mediation</li>
                  <li>Arbitration: Binding arbitration for unresolved disputes</li>
                  <li>Legal proceedings: Court action as a last resort</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">Legal Department</p>
                <p className="text-gray-700">Email: legal@tranquiloo-app.com</p>
                <p className="text-gray-700">Phone: +1-385-867-8804</p>
                <p className="text-gray-700">Response Time: Within 5 business days</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;