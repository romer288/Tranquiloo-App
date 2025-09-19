import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MessageSquare, Clock, Heart, AlertTriangle } from 'lucide-react';

interface CrisisResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisResourcesModal: React.FC<CrisisResourcesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const crisisResources = [
    {
      name: '988 Suicide & Crisis Lifeline',
      phone: '988',
      description: '24/7 crisis support and suicide prevention',
      icon: Phone,
      action: () => window.open('tel:988'),
    },
    {
      name: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: '24/7 crisis support via text messaging',
      icon: MessageSquare,
      action: () => window.open('sms:741741?body=HOME'),
    },
    {
      name: 'National Domestic Violence Hotline',
      phone: '1-800-799-7233',
      description: '24/7 support for domestic violence situations',
      icon: Heart,
      action: () => window.open('tel:18007997233'),
    },
    {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      description: '24/7 treatment referral and information service',
      icon: Clock,
      action: () => window.open('tel:18006624357'),
    },
  ];

  const immediateCopingStrategies = [
    {
      title: '5-4-3-2-1 Grounding',
      description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
    },
    {
      title: '4-4-6 Breathing',
      description: 'Breathe in for 4 counts, hold for 4, breathe out for 6. Repeat 10 times.',
    },
    {
      title: 'Cold Water Reset',
      description: 'Splash cold water on your face or hold ice cubes to reset your nervous system',
    },
    {
      title: 'Physical Movement',
      description: 'Do jumping jacks, push-ups, or go for a walk to release tension',
    },
    {
      title: 'Safe Person',
      description: 'Call or text one person who makes you feel safe and supported',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <span>Crisis Support Resources</span>
          </DialogTitle>
          <DialogDescription>
            Available 24/7 when you need immediate support
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Crisis Hotlines */}
          <div>
            <h3 className="text-lg font-semibold mb-3">24/7 Crisis Hotlines</h3>
            <div className="grid gap-3">
              {crisisResources.map((resource, index) => {
                const IconComponent = resource.icon;
                return (
                  <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={resource.action}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center space-x-3 text-base">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <div>
                          <div>{resource.name}</div>
                          <div className="text-sm font-normal text-muted-foreground">
                            {resource.phone}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Immediate Coping Strategies */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Right Now: Things You Can Do</h3>
            <div className="grid gap-3">
              {immediateCopingStrategies.map((strategy, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{strategy.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Safety Reminder */}
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong>Remember:</strong> If you're in immediate danger, call 911 or go to your nearest emergency room. 
                These intense feelings will pass - you've survived difficult moments before, and you can get through this one too.
                You matter, and there are people who want to help you.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};