
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const { toast } = useToast();

  const moods = [
    { value: 1, emoji: '😢', label: 'Very Low', color: 'from-red-400 to-red-500' },
    { value: 2, emoji: '😔', label: 'Low', color: 'from-orange-400 to-orange-500' },
    { value: 3, emoji: '😐', label: 'Neutral', color: 'from-yellow-400 to-yellow-500' },
    { value: 4, emoji: '😊', label: 'Good', color: 'from-green-400 to-green-500' },
    { value: 5, emoji: '😄', label: 'Great', color: 'from-blue-400 to-blue-500' },
  ];

  const saveMoodEntry = () => {
    if (selectedMood === null) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling right now",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would save to a database
    const entry = {
      mood: selectedMood,
      note,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Mood entry saved:', entry);
    
    toast({
      title: "Mood logged successfully!",
      description: "Keep tracking to see your patterns over time",
    });

    setSelectedMood(null);
    setNote('');
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">How are you feeling?</h2>
      
      <div className="grid grid-cols-5 gap-3 mb-6">
        {(moods ?? []).map((mood) => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood.value)}
            className={`p-4 rounded-lg text-center transition-all duration-200 ${
              selectedMood === mood.value
                ? `bg-gradient-to-br ${mood.color} text-white scale-105 shadow-lg`
                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">{mood.emoji}</div>
            <div className="text-xs font-medium">{mood.label}</div>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add a note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      <Button 
        onClick={saveMoodEntry}
        className="w-full bg-green-500 hover:bg-green-600"
      >
        Log Mood
      </Button>
    </Card>
  );
};

export default MoodTracker;
