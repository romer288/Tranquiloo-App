
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Users, Zap, RefreshCw } from 'lucide-react';

const CopingStrategies = () => {
  const [currentStrategy, setCurrentStrategy] = useState(0);

  const strategies = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "5-4-3-2-1 Grounding",
      description: "Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
      color: "from-pink-100 to-rose-100",
      borderColor: "border-pink-200"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Thought Challenging",
      description: "Ask yourself: Is this thought helpful? Is it realistic? What would I tell a friend in this situation?",
      color: "from-purple-100 to-indigo-100",
      borderColor: "border-purple-200"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Reach Out",
      description: "Connect with a trusted friend, family member, or mental health professional. You don't have to face this alone.",
      color: "from-blue-100 to-cyan-100",
      borderColor: "border-blue-200"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Physical Movement",
      description: "Take a walk, do jumping jacks, or stretch. Physical activity can help reduce anxiety and improve mood.",
      color: "from-yellow-100 to-orange-100",
      borderColor: "border-yellow-200"
    }
  ];

  const nextStrategy = () => {
    setCurrentStrategy((prev) => (prev + 1) % strategies.length);
  };

  const strategy = strategies[currentStrategy];

  return (
    <Card className={`p-6 bg-gradient-to-br ${strategy.color} ${strategy.borderColor}`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            {strategy.icon}
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {strategy.title}
        </h2>
        
        <p className="text-gray-700 mb-6 leading-relaxed">
          {strategy.description}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {strategies.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStrategy ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <Button onClick={nextStrategy} variant="outline" className="bg-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Next Strategy
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CopingStrategies;
