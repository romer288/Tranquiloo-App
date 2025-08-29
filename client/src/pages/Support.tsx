import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageCircle, HelpCircle, Clock, Shield } from 'lucide-react';

const Support = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-600">Get help with Tranquiloo and mental health resources</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Contact Our Support Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Our dedicated support team is here to help you with any questions, technical issues, 
                or concerns about using Tranquiloo. We strive to provide timely, helpful responses 
                to ensure you have the best possible experience.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Email Support</h3>
                  </div>
                  <p className="text-blue-800 mb-3">
                    Send us a detailed message and we'll get back to you within 24 hours.
                  </p>
                  <div className="bg-white p-3 rounded">
                    <p className="font-semibold text-gray-900">support@tranquiloo-app.com</p>
                    <p className="text-sm text-gray-600">Response time: Within 24 hours</p>
                  </div>
                  <Button 
                    className="mt-3 w-full" 
                    onClick={() => window.location.href = 'mailto:support@tranquiloo-app.com'}
                  >
                    Send Email
                  </Button>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-3 mb-4">
                    <Phone className="w-6 h-6 text-green-600" />
                    <h3 className="font-semibold text-green-900">Phone Support</h3>
                  </div>
                  <p className="text-green-800 mb-3">
                    Speak directly with our support team for immediate assistance.
                  </p>
                  <div className="bg-white p-3 rounded">
                    <p className="font-semibold text-gray-900">+1-385-867-8804</p>
                    <p className="text-sm text-gray-600">Mon-Fri: 9AM-6PM MST</p>
                  </div>
                  <Button 
                    className="mt-3 w-full bg-green-600 hover:bg-green-700" 
                    onClick={() => window.location.href = 'tel:+13858678804'}
                  >
                    Call Now
                  </Button>
                </div>
              </div>

              <div className="mt-6 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Text Message Support</h4>
                </div>
                <p className="text-purple-800 mb-2">
                  Send us a text message for quick questions or non-urgent issues.
                </p>
                <p className="font-semibold text-gray-900">+1-385-867-8804</p>
                <p className="text-sm text-gray-600">Available 24/7 for non-emergency support</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Crisis Support & Emergency Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 mb-4">
                <h4 className="font-semibold text-red-900 mb-2">🚨 If you're in crisis or having thoughts of self-harm:</h4>
                <div className="text-red-800 space-y-1">
                  <p><strong>Call 911</strong> - Emergency Services</p>
                  <p><strong>Call 988</strong> - Suicide & Crisis Lifeline (24/7)</p>
                  <p><strong>Text "HELLO" to 741741</strong> - Crisis Text Line (24/7)</p>
                  <p><strong>Call 1-800-366-8288</strong> - Self-Injury Outreach & Support</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                While Tranquiloo provides valuable mental health support, we want to ensure you have 
                access to immediate professional help when needed. These resources are available 24/7 
                and staffed by trained crisis counselors.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">National Resources</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• SAMHSA National Helpline: 1-800-662-4357</li>
                    <li>• National Alliance on Mental Illness: 1-800-950-6264</li>
                    <li>• Crisis Text Line: Text HOME to 741741</li>
                    <li>• Veterans Crisis Line: 1-800-273-8255</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Online Resources</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• suicidepreventionlifeline.org</li>
                    <li>• crisistextline.org</li>
                    <li>• nami.org (Support groups & resources)</li>
                    <li>• mentalhealth.gov</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange-600" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How do I reset my password?</h4>
                  <p className="text-gray-700">
                    Go to the login page and click "Forgot Password". Enter your email address and 
                    we'll send you a secure link to reset your password.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Is my data secure and private?</h4>
                  <p className="text-gray-700">
                    Yes, absolutely. We are HIPAA compliant and use industry-standard encryption to 
                    protect your personal health information. See our Privacy Policy for full details.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Can I export my conversation history?</h4>
                  <p className="text-gray-700">
                    Yes, you can download your conversation summaries and analytics data from the 
                    Analytics and Treatment Resources pages in the app.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How accurate is the AI anxiety analysis?</h4>
                  <p className="text-gray-700">
                    Our AI is trained on clinical anxiety assessment frameworks, but it's designed to 
                    complement, not replace, professional mental health care. Always consult with 
                    qualified healthcare providers for clinical decisions.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Can I use Tranquiloo with my therapist?</h4>
                  <p className="text-gray-700">
                    Absolutely! You can share your analytics and progress reports with your therapist. 
                    Use the "Share with Therapist" feature in the Analytics section.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How can my therapist access my progress data?</h4>
                  <p className="text-gray-700 mb-3">
                    Your therapist can view your real-time analytics and receive weekly progress reports. 
                    After connecting your therapist in the app, they can access their dedicated portal.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg mb-3">
                    <p className="font-semibold text-blue-900 mb-2">For Therapists:</p>
                    <div className="space-y-2">
                      <div>
                        <a 
                          href="/therapist-info" 
                          className="text-blue-600 hover:text-blue-800 font-medium block"
                        >
                          📋 Learn about the Therapist Portal →
                        </a>
                      </div>
                      <div>
                        <a 
                          href="/therapist-portal" 
                          className="text-blue-600 hover:text-blue-800 font-medium block"
                        >
                          🔐 Access Patient Dashboard →
                        </a>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Therapists log in with their email address to see connected patients' analytics and receive weekly reports automatically.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Is there a cost to use Tranquiloo?</h4>
                  <p className="text-gray-700">
                    Tranquiloo offers both free and premium features. Basic anxiety tracking and 
                    conversations are free. Premium features include advanced analytics and 
                    therapist connection services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Support Hours & Response Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Business Hours</h4>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM MST</p>
                    <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM MST</p>
                    <p><strong>Sunday:</strong> Closed</p>
                    <p className="text-sm text-gray-600 mt-2">
                      *Emergency resources are available 24/7 through the crisis hotlines listed above
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Response Times</h4>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Phone:</strong> Immediate during business hours</p>
                    <p><strong>Email:</strong> Within 24 hours</p>
                    <p><strong>Text:</strong> Within 4 hours</p>
                    <p><strong>Critical Issues:</strong> Within 2 hours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback & Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We're constantly working to improve Tranquiloo based on user feedback. If you have 
                suggestions for new features, improvements, or general feedback about your experience, 
                we'd love to hear from you.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Share Your Ideas</h4>
                <p className="text-blue-800 mb-3">
                  Send your feedback to: <strong>feedback@tranquiloo-app.com</strong>
                </p>
                <p className="text-sm text-blue-700">
                  We review all feedback and prioritize features based on user needs and clinical value.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;