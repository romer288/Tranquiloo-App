
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, FileText, Users } from 'lucide-react';

const Privacy = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                HIPAA Compliance & Privacy Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Tranquiloo is committed to protecting your privacy and maintaining the highest standards 
                of data security. We are fully compliant with the Health Insurance Portability and 
                Accountability Act (HIPAA) and all applicable state and federal privacy laws throughout 
                the United States.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">🏥 HIPAA Compliance Statement</h4>
                <p className="text-blue-800">
                  This application is designed and operated in full compliance with HIPAA regulations. 
                  All Protected Health Information (PHI) is encrypted, secured, and handled according 
                  to the strictest medical privacy standards.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Email address for account creation and authentication</li>
                    <li>Phone number if provided for two-factor authentication</li>
                    <li>Profile information you choose to share</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Health-Related Information</h4>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Anxiety levels and mood tracking data</li>
                    <li>Conversation transcripts with our AI therapist</li>
                    <li>Goal setting and progress tracking information</li>
                    <li>Treatment outcomes and intervention summaries</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Technical Information</h4>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Device information and browser type</li>
                    <li>Usage analytics (only if explicitly consented)</li>
                    <li>Security logs for fraud prevention</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                How We Protect Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🔐 Encryption</h4>
                    <p className="text-sm text-gray-700">
                      All data is encrypted both in transit (TLS 1.3) and at rest (AES-256) using industry-standard encryption protocols.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🏢 Secure Infrastructure</h4>
                    <p className="text-sm text-gray-700">
                      Our servers are hosted on HIPAA-compliant cloud infrastructure with regular security audits and monitoring.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">👥 Access Controls</h4>
                    <p className="text-sm text-gray-700">
                      Strict access controls ensure only authorized personnel can access your data, and all access is logged.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🔍 Regular Audits</h4>
                    <p className="text-sm text-gray-700">
                      We conduct regular security audits and penetration testing to ensure the highest level of protection.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Under HIPAA and State Privacy Laws, you have the right to:</h4>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Access:</strong> Request copies of your personal health information</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                  <li><strong>Restriction:</strong> Request limitation of processing of your data</li>
                  <li><strong>Objection:</strong> Object to certain types of data processing</li>
                  <li><strong>Breach Notification:</strong> Be notified of any data breaches within 72 hours</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>State-Specific Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We comply with all applicable state privacy laws including but not limited to:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>California Consumer Privacy Act (CCPA)</li>
                  <li>California Privacy Rights Act (CPRA)</li>
                  <li>Virginia Consumer Data Protection Act (VCDPA)</li>
                  <li>Colorado Privacy Act (CPA)</li>
                </ul>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Connecticut Data Privacy Act (CTDPA)</li>
                  <li>Utah Consumer Privacy Act (UCPA)</li>
                  <li>Illinois Genetic Information Privacy Act</li>
                  <li>Texas Identity Theft Enforcement and Protection Act</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sharing and Third Parties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Our Commitment</h4>
                <p className="text-green-800">
                  We never sell, rent, or share your personal health information with third parties 
                  for marketing purposes. Your data is yours and yours alone.
                </p>
              </div>
              
              <p className="text-gray-700 mb-4">
                We may only share your information in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>With your explicit written consent</li>
                <li>When required by law or legal process</li>
                <li>To prevent serious harm to you or others</li>
                <li>For emergency medical treatment</li>
                <li>With HIPAA-compliant service providers who assist in providing our services</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, 
                please contact our Privacy Officer:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">Privacy Officer</p>
                <p className="text-gray-700">Email: privacy@tranquiloo-app.com</p>
                <p className="text-gray-700">Phone: +1-385-867-8804</p>
                <p className="text-gray-700">Response Time: Within 30 days as required by law</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time to reflect changes in our practices 
                or applicable laws. We will notify you of any material changes by email and by posting 
                the updated policy on our website. Your continued use of our services after such 
                modifications constitutes acceptance of the updated Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
