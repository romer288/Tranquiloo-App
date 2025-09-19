
import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

const WelcomeHero = () => {
  return (
    <div className="text-center py-12 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="p-4 bg-white rounded-full shadow-lg">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Your Anxiety Companion
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          A safe space to breathe, reflect, and find calm. You're not alone in this journey.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span className="px-3 py-1 bg-white rounded-full shadow-sm">✨ Breathing Exercises</span>
          <span className="px-3 py-1 bg-white rounded-full shadow-sm">📝 Mood Tracking</span>
          <span className="px-3 py-1 bg-white rounded-full shadow-sm">🧠 Coping Strategies</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHero;
