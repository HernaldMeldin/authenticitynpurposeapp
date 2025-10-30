import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import VisualProgressTimeline, { TaggedImage } from './VisualProgressTimeline';
import { analyzeProgressImage } from '@/lib/aiImageAnalysis';
import { AIMilestoneSuggestions } from './AIMilestoneSuggestions';
import { analyzeAndSuggestMilestones } from '@/lib/aiMilestoneSuggestions';



interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface Note {
  id: string;
  content: string;
  date: string;
}

interface ProgressHistory {
  date: string;
  progress: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  targetDate?: string;
  steps?: Step[];
  images?: string[];
}


interface DemoGoalDetailViewProps {
  goal: Goal;
  onBack: () => void;
  onUpdateGoal: (updatedGoal: Goal) => void;
}

export default function DemoGoalDetailView({ goal, onBack, onUpdateGoal }: DemoGoalDetailViewProps) {
  const [currentGoal, setCurrentGoal] = useState(goal);
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', content: 'Started working on this goal today!', date: new Date().toISOString() }
  ]);
  const [newNote, setNewNote] = useState('');
  
  // Initialize sample images with AI analysis
  const sampleImages: TaggedImage[] = [
    { 
      id: '1', 
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', 
      date: '2025-09-15', 
      progress: 0, 
      label: 'Before',
      aiAnalysis: analyzeProgressImage('', 0, goal.category, [])
    },
    { 
      id: '2', 
      url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', 
      date: '2025-09-25', 
      progress: 25, 
      label: 'Week 2',
      aiAnalysis: analyzeProgressImage('', 25, goal.category, [{ url: '', progress: 0 }])
    },
    { 
      id: '3', 
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', 
      date: '2025-10-02', 
      progress: 50, 
      label: 'Halfway!',
      aiAnalysis: analyzeProgressImage('', 50, goal.category, [{ url: '', progress: 0 }, { url: '', progress: 25 }])
    }
  ];
  
  const [taggedImages, setTaggedImages] = useState<TaggedImage[]>(sampleImages);
  const [progressHistory] = useState<ProgressHistory[]>([
    { date: '2025-10-01', progress: 20 },
    { date: '2025-10-02', progress: 35 },
    { date: '2025-10-03', progress: 50 },
    { date: '2025-10-04', progress: currentGoal.progress }
  ]);


  const handleAddImage = (image: TaggedImage) => {
    setTaggedImages([...taggedImages, image]);
  };

  const handleRemoveImage = (id: string) => {
    setTaggedImages(taggedImages.filter(img => img.id !== id));
  };

  const handleProgressUpdate = (value: number[]) => {
    const updated = { ...currentGoal, progress: value[0] };
    setCurrentGoal(updated);
    onUpdateGoal(updated);
  };

  const handleStepToggle = (stepId: string) => {
    const updatedSteps = currentGoal.steps?.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    const completed = updatedSteps?.filter(s => s.completed).length || 0;
    const total = updatedSteps?.length || 1;
    const newProgress = Math.round((completed / total) * 100);
    
    const updated = { ...currentGoal, steps: updatedSteps, progress: newProgress };
    setCurrentGoal(updated);
    onUpdateGoal(updated);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, { id: Date.now().toString(), content: newNote, date: new Date().toISOString() }]);
      setNewNote('');
    }
  };

  // Generate AI milestone analysis
  const goalStartDate = currentGoal.targetDate 
    ? new Date(new Date(currentGoal.targetDate).getTime() - 90 * 24 * 60 * 60 * 1000) 
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const aiAnalysis = analyzeAndSuggestMilestones(
    currentGoal.category,
    currentGoal.progress,
    100,
    goalStartDate,
    taggedImages
  );

  const handleAcceptMilestone = (milestoneId: string) => {
    console.log('Accepted milestone:', milestoneId);
    // In a real app, this would add the milestone to the goal's steps
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Goals
        </Button>

        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{currentGoal.title}</h1>
              <Badge className="mb-2">{currentGoal.category}</Badge>
              <p className="text-gray-600">{currentGoal.description}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-purple-600">{currentGoal.progress}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          
          {currentGoal.targetDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Calendar className="h-4 w-4" />
              Target: {new Date(currentGoal.targetDate).toLocaleDateString()}
            </div>
          )}
          
          <Progress value={currentGoal.progress} className="h-3" />
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Steps to Complete
            </h2>
            <div className="space-y-3">
              {currentGoal.steps?.map(step => (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <Checkbox
                    checked={step.completed}
                    onCheckedChange={() => handleStepToggle(step.id)}
                  />
                  <span className={step.completed ? 'line-through text-gray-500' : ''}>
                    {step.title}
                  </span>
                  {step.completed && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress History
            </h2>
            <div className="space-y-3">
              {progressHistory.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={entry.progress} className="w-24 h-2" />
                    <span className="text-sm font-medium">{entry.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Update Progress</h2>
          <div className="flex items-center gap-4">
            <Slider
              value={[currentGoal.progress]}
              onValueChange={handleProgressUpdate}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-2xl font-bold text-purple-600 w-16">{currentGoal.progress}%</span>
          </div>
        </Card>

        <div className="mb-6">
          <VisualProgressTimeline
            images={taggedImages}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
            currentProgress={currentGoal.progress}
            goalType={currentGoal.category}
          />
        </div>

        <div className="mb-6">
          <AIMilestoneSuggestions 
            analysis={aiAnalysis}
            onAcceptMilestone={handleAcceptMilestone}
          />
        </div>


        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Notes & Reflections</h2>
          <div className="space-y-4 mb-4">
            {notes.map(note => (
              <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(note.date).toLocaleString()}
                </div>
                <p>{note.content}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note about your progress..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddNote} className="w-full">Add Note</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
