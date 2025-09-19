import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, Plus, Save, Edit3, Trash2, Send, 
  FileText, Copy, Mic, Square, Play 
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  milestones: Milestone[];
  therapistNotes?: string;
  status: 'active' | 'completed' | 'paused';
}

interface Milestone {
  id: string;
  description: string;
  completed: boolean;
  completedDate?: string;
}

interface TreatmentPlan {
  id: string;
  title: string;
  description: string;
  goals: Goal[];
  interventions: string[];
  exercises: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface TreatmentCreationProps {
  patientId: string;
  patientName: string;
}

const TreatmentCreation: React.FC<TreatmentCreationProps> = ({ 
  patientId, 
  patientName 
}) => {
  const { toast } = useToast();
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  
  // Form states
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    category: 'anxiety-management',
    priority: 'medium',
    milestones: []
  });
  const [newMilestone, setNewMilestone] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');

  useEffect(() => {
    loadTreatmentPlan();
  }, [patientId]);

  const loadTreatmentPlan = async () => {
    try {
      const response = await fetch(`/api/therapist/patient/${patientId}/treatment-plan`);
      if (response.ok) {
        const plan = await response.json();
        setTreatmentPlan(plan);
      }
    } catch (error) {
      console.error('Failed to load treatment plan:', error);
    }
  };

  const saveTreatmentPlan = async () => {
    if (!treatmentPlan) return;

    try {
      const response = await fetch(`/api/therapist/patient/${patientId}/treatment-plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentPlan)
      });

      if (response.ok) {
        toast({
          title: "Treatment Plan Saved",
          description: "The treatment plan has been updated successfully"
        });
        setIsEditing(false);
        loadTreatmentPlan();
      }
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save treatment plan",
        variant: "destructive"
      });
    }
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.description) {
      toast({
        title: "Missing Information",
        description: "Please provide goal title and description",
        variant: "destructive"
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title || '',
      description: newGoal.description || '',
      category: newGoal.category || 'anxiety-management',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: newGoal.priority || 'medium',
      milestones: newGoal.milestones || [],
      therapistNotes: personalNotes,
      status: 'active'
    };

    if (treatmentPlan) {
      setTreatmentPlan({
        ...treatmentPlan,
        goals: [...treatmentPlan.goals, goal]
      });
    } else {
      setTreatmentPlan({
        id: Date.now().toString(),
        title: `Treatment Plan for ${patientName}`,
        description: 'Comprehensive anxiety management treatment plan',
        goals: [goal],
        interventions: [],
        exercises: [],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Reset form
    setNewGoal({
      title: '',
      description: '',
      category: 'anxiety-management',
      priority: 'medium',
      milestones: []
    });
    setPersonalNotes('');
    
    toast({
      title: "Goal Added",
      description: "New goal has been added to the treatment plan"
    });
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;

    const milestone: Milestone = {
      id: Date.now().toString(),
      description: newMilestone,
      completed: false
    };

    setNewGoal(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), milestone]
    }));
    setNewMilestone('');
  };

  const sendTreatmentToPatient = async () => {
    if (!treatmentPlan) return;

    try {
      // Save treatment plan which also sends notification
      const response = await fetch(`/api/therapist/patient/${patientId}/treatment-plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentPlan)
      });

      if (response.ok) {
        toast({
          title: "Treatment Plan Sent",
          description: "Treatment plan has been emailed to the patient"
        });
      }
    } catch (error) {
      toast({
        title: "Send Error",
        description: "Failed to send treatment plan to patient",
        variant: "destructive"
      });
    }
  };

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setRecordingText(transcript);
      };

      recognition.start();
      setIsRecording(true);

      recognition.onend = () => {
        setIsRecording(false);
      };
    } else {
      toast({
        title: "Voice Recognition Unavailable",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900">Treatment Creation</h3>
        <p className="text-green-700">Creating treatment plan for: {patientName}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Goal Creation Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Create New Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="goal-title">Goal Title *</Label>
                <Input
                  id="goal-title"
                  value={newGoal.title || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Reduce driving anxiety"
                  data-testid="input-goal-title"
                />
              </div>

              <div>
                <Label htmlFor="goal-description">Description *</Label>
                <Textarea
                  id="goal-description"
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed goal description and context"
                  rows={3}
                  data-testid="textarea-goal-description"
                />
              </div>

              <div>
                <Label htmlFor="goal-category">Category</Label>
                <select
                  id="goal-category"
                  className="w-full p-2 border rounded-md"
                  value={newGoal.category || 'anxiety-management'}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                  data-testid="select-goal-category"
                >
                  <option value="anxiety-management">Anxiety Management</option>
                  <option value="coping-skills">Coping Skills</option>
                  <option value="exposure-therapy">Exposure Therapy</option>
                  <option value="social-skills">Social Skills</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="behavioral">Behavioral Changes</option>
                </select>
              </div>

              <div>
                <Label htmlFor="goal-priority">Priority</Label>
                <select
                  id="goal-priority"
                  className="w-full p-2 border rounded-md"
                  value={newGoal.priority || 'medium'}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                  data-testid="select-goal-priority"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              {/* Milestones */}
              <div>
                <Label>Milestones</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    placeholder="Add milestone..."
                    data-testid="input-milestone"
                  />
                  <Button
                    size="sm"
                    onClick={addMilestone}
                    data-testid="button-add-milestone"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {newGoal.milestones?.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>{milestone.description}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNewGoal(prev => ({
                            ...prev,
                            milestones: prev.milestones?.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Notes */}
              <div>
                <Label htmlFor="personal-notes">Therapist Notes</Label>
                <Textarea
                  id="personal-notes"
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="Personal notes about this goal (optional)"
                  rows={2}
                  data-testid="textarea-personal-notes"
                />
              </div>

              {/* Voice Recording */}
              <div className="border-t pt-4">
                <Label>Voice Notes</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isRecording ? () => setIsRecording(false) : startRecording}
                    data-testid={isRecording ? "button-stop-recording" : "button-start-recording"}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-1" />
                        Record
                      </>
                    )}
                  </Button>
                  {recordingText && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPersonalNotes(prev => prev + '\n' + recordingText)}
                      data-testid="button-add-recording"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Notes
                    </Button>
                  )}
                </div>
                
                {recordingText && (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {recordingText}
                  </div>
                )}
              </div>

              <Button
                onClick={addGoal}
                className="w-full"
                data-testid="button-add-goal"
              >
                <Target className="w-4 h-4 mr-2" />
                Add Goal to Treatment Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Treatment Plan Display */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Current Treatment Plan
                </span>
                <div className="flex gap-2">
                  {treatmentPlan && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={sendTreatmentToPatient}
                        data-testid="button-send-treatment"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send to Patient
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveTreatmentPlan}
                        data-testid="button-save-treatment"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save Plan
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {treatmentPlan ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">{treatmentPlan.title}</h3>
                    <p className="text-gray-600">{treatmentPlan.description}</p>
                  </div>

                  {/* Goals List */}
                  <div>
                    <h4 className="font-medium mb-4">Treatment Goals ({treatmentPlan.goals.length})</h4>
                    <div className="space-y-4">
                      {(treatmentPlan?.goals ?? []).map((goal) => (
                        <div key={goal.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium">{goal.title}</h5>
                                <Badge variant={
                                  goal.priority === 'high' ? 'destructive' :
                                  goal.priority === 'medium' ? 'default' : 'secondary'
                                }>
                                  {goal.priority}
                                </Badge>
                                <Badge variant="outline">{goal.category}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                              {goal.therapistNotes && (
                                <p className="text-sm text-blue-600 mb-2">
                                  <strong>Notes:</strong> {goal.therapistNotes}
                                </p>
                              )}
                            </div>
                          </div>

                          {goal.milestones.length > 0 && (
                            <div>
                              <h6 className="font-medium mb-2">Milestones</h6>
                              <div className="space-y-1">
                                {(goal.milestones ?? []).map((milestone) => (
                                  <div key={milestone.id} className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={milestone.completed}
                                      readOnly
                                      className="rounded"
                                    />
                                    <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                                      {milestone.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No treatment plan created yet</p>
                  <p className="text-sm">Add goals using the form on the left</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setNewGoal({
                  title: 'Reduce driving anxiety',
                  description: 'Gradual exposure therapy to reduce fear while driving, focusing on blind intersections and turning',
                  category: 'exposure-therapy',
                  priority: 'high',
                  milestones: [
                    { id: '1', description: 'Sit in parked car for 10 minutes', completed: false },
                    { id: '2', description: 'Drive in empty parking lot', completed: false },
                    { id: '3', description: 'Drive on quiet residential streets', completed: false }
                  ]
                });
              }}
              data-testid="button-template-driving"
            >
              <Copy className="w-4 h-4 mr-2" />
              Driving Anxiety Template
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setNewGoal({
                  title: 'Improve social interaction skills',
                  description: 'Develop confidence in social situations and communication with new people',
                  category: 'social-skills',
                  priority: 'medium',
                  milestones: [
                    { id: '1', description: 'Make eye contact during conversations', completed: false },
                    { id: '2', description: 'Initiate conversation with one new person weekly', completed: false }
                  ]
                });
              }}
              data-testid="button-template-social"
            >
              <Copy className="w-4 h-4 mr-2" />
              Social Skills Template
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setNewGoal({
                  title: 'Daily mindfulness practice',
                  description: 'Establish regular mindfulness and breathing exercises to manage anxiety',
                  category: 'mindfulness',
                  priority: 'medium',
                  milestones: [
                    { id: '1', description: 'Complete 5-minute breathing exercise daily', completed: false },
                    { id: '2', description: 'Use mindfulness app 3 times per week', completed: false }
                  ]
                });
              }}
              data-testid="button-template-mindfulness"
            >
              <Copy className="w-4 h-4 mr-2" />
              Mindfulness Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreatmentCreation;