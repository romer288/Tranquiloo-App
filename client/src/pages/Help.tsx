
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Help = () => {
  const faqs = [
    {
      question: "How does the AI companion work?",
      answer: "The AI companion uses advanced natural language processing to provide personalized support for anxiety management. It can engage in conversations, offer coping strategies, and help you track your emotional well-being."
    },
    {
      question: "Is my data private and secure?",
      answer: "Yes, your privacy is our top priority. All conversations and personal data are encrypted and stored securely. We do not share your information with third parties, and you have full control over your data."
    },
    {
      question: "Can I use this app without a therapist?",
      answer: "While the app is designed to complement professional therapy, it can be used independently for daily anxiety management. However, we recommend consulting with a mental health professional for comprehensive care."
    },

  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
        </div>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-600">Find answers to common questions about using Anxiety Companion</p>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Support Section */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Support</h2>
              <p className="text-gray-600 mb-4">Can't find what you're looking for? Reach out to our support team.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-4">
                If you have questions that aren't answered in our FAQ, please contact our support team. We're here to help and typically respond within 24 hours.
              </p>
              <div className="flex items-center">
                <span className="font-medium text-gray-700">Email: </span>
                <a href="mailto:support@anxietycompanion.com" className="text-blue-600 hover:text-blue-800 ml-1">
                  support@anxietycompanion.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
