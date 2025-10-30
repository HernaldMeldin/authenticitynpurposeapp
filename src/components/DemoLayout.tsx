import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { Sparkles, Target, CheckCircle2, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import DemoGoalDialog from '@/components/DemoGoalDialog';
import DemoGoalDetailView from '@/components/DemoGoalDetailView';


const DemoLayout: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [demoGoals, setDemoGoals] = useState([
    { 
      id: '1', 
      title: 'Create Purpose-Driven Initiative', 
      description: 'Launch community impact project', 
      progress: 95, 
      category: 'Purpose', 
      targetDate: '2025-12-31',
      steps: [
        { id: 's1', title: 'Research community needs', completed: true },
        { id: 's2', title: 'Create project plan', completed: true },
        { id: 's3', title: 'Build team', completed: true },
        { id: 's4', title: 'Launch initiative', completed: false }
      ]
    },
    { 
      id: '2', 
      title: 'Run Marathon', 
      description: 'Complete 26.2 mile race', 
      progress: 88, 
      category: 'Health', 
      targetDate: '2026-04-15',
      steps: [
        { id: 's1', title: 'Build base mileage', completed: true },
        { id: 's2', title: 'Follow training plan', completed: true },
        { id: 's3', title: 'Complete long runs', completed: true },
        { id: 's4', title: 'Race day preparation', completed: false }
      ]
    },
    { 
      id: '3', 
      title: 'Build a New Home', 
      description: 'Complete construction of dream house', 
      progress: 78, 
      category: 'Personal', 
      targetDate: '2027-10-01',
      steps: [
        { id: 's1', title: 'Purchase land', completed: true },
        { id: 's2', title: 'Design plans', completed: true },
        { id: 's3', title: 'Foundation work', completed: true },
        { id: 's4', title: 'Frame and finish', completed: false }
      ]
    },
    { 
      id: '4', 
      title: 'Launch Side Business', 
      description: 'Start profitable online venture', 
      progress: 92, 
      category: 'Business', 
      targetDate: '2025-06-30',
      steps: [
        { id: 's1', title: 'Market research', completed: true },
        { id: 's2', title: 'Build product', completed: true },
        { id: 's3', title: 'Launch marketing', completed: true },
        { id: 's4', title: 'Scale operations', completed: false }
      ]
    },
    { 
      id: '5', 
      title: 'Learn Spanish Fluently', 
      description: 'Achieve conversational fluency', 
      progress: 85, 
      category: 'Education', 
      targetDate: '2026-10-01',
      steps: [
        { id: 's1', title: 'Complete beginner course', completed: true },
        { id: 's2', title: 'Practice daily', completed: true },
        { id: 's3', title: 'Conversation practice', completed: true },
        { id: 's4', title: 'Fluency certification', completed: false }
      ]
    },
    { 
      id: '6', 
      title: 'Write a Book', 
      description: 'Complete and publish first novel', 
      progress: 70, 
      category: 'Creative', 
      targetDate: '2026-06-15',
      steps: [
        { id: 's1', title: 'Outline story', completed: true },
        { id: 's2', title: 'Write first draft', completed: true },
        { id: 's3', title: 'Edit and revise', completed: false },
        { id: 's4', title: 'Publish', completed: false }
      ]
    },
    { 
      id: '7', 
      title: 'Financial Freedom Fund', 
      description: 'Save $50,000 emergency fund', 
      progress: 82, 
      category: 'Finance', 
      targetDate: '2027-10-01',
      steps: [
        { id: 's1', title: 'Create budget plan', completed: true },
        { id: 's2', title: 'Save $25k', completed: true },
        { id: 's3', title: 'Save $40k', completed: true },
        { id: 's4', title: 'Reach $50k goal', completed: false }
      ]
    },
    { 
      id: '8', 
      title: 'Continue Spiritual Journey', 
      description: 'Achieve advanced yoga certification', 
      progress: 75, 
      category: 'Wellness', 
      targetDate: '2026-10-01',
      steps: [
        { id: 's1', title: 'Complete 200-hour training', completed: true },
        { id: 's2', title: 'Daily practice routine', completed: true },
        { id: 's3', title: 'Advanced poses mastery', completed: true },
        { id: 's4', title: 'Certification exam', completed: false }
      ]
    }

  ]);

  const handleAddGoal = (newGoal: any) => {
    setDemoGoals([...demoGoals, newGoal]);
  };

  const handleUpdateGoal = (updatedGoal: any) => {
    setDemoGoals(demoGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };



  const [demoTasks, setDemoTasks] = useState([
    { id: '1', title: 'Update LinkedIn profile', completed: true },
    { id: '2', title: 'Research competitors', completed: true },
    { id: '3', title: 'Schedule networking call', completed: true },
    { id: '4', title: 'Complete morning workout', completed: true },
    { id: '5', title: 'Review financial budget', completed: true },
    { id: '6', title: 'Practice Spanish for 30 min', completed: true },
    { id: '7', title: 'Write 1000 words', completed: true },
    { id: '8', title: 'Meditate for 15 minutes', completed: true },
    { id: '9', title: 'Send client proposals', completed: true },
    { id: '10', title: 'Read industry articles', completed: true },
    { id: '11', title: 'Plan tomorrow\'s tasks', completed: false },
    { id: '12', title: 'Evening reflection journal', completed: false }
  ]);


  // Show detailed view if a goal is selected
  if (selectedGoal) {
    return (
      <DemoGoalDetailView 
        goal={selectedGoal} 
        onBack={() => setSelectedGoal(null)}
        onUpdateGoal={handleUpdateGoal}
      />
    );
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-4 px-4 text-center shadow-lg">
        <p className="font-semibold flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5" />
          🌟 DEMO MODE - Experience the full power of goal manifestation
          <Sparkles className="h-5 w-5" />
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            See Your <span className="text-green-300">Progress</span>
          </h1>
          <p className="text-xl md:text-2xl mb-6 opacity-95">
            Interactive demo showing real goal tracking in action
          </p>
          <AuthModal 
            defaultMode="signup"
            trigger={
              <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100">
                Start Your Journey
              </Button>
            }
          />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 px-4 bg-white shadow-md">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">{demoGoals.length}</div>
            <div className="text-gray-600 font-medium">Active Goals</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{demoTasks.filter(t => t.completed).length}</div>
            <div className="text-gray-600 font-medium">Tasks Completed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {Math.round(demoGoals.reduce((acc, g) => acc + g.progress, 0) / demoGoals.length)}%
            </div>
            <div className="text-gray-600 font-medium">Avg Progress</div>
          </div>
        </div>
      </section>


      {/* Demo Dashboard */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Goals Grid */}

          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-800">Your Goals</h2>
              </div>
              <DemoGoalDialog
                trigger={
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Goal
                  </Button>
                }
                onGoalAdd={handleAddGoal}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoGoals.map(goal => (
                <Card 
                  key={goal.id} 
                  className="p-6 cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedGoal(goal)}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{goal.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                  <Progress value={goal.progress} className="mb-2" />
                  <p className="text-sm text-gray-500">{goal.progress}% complete</p>
                  <Button variant="ghost" size="sm" className="mt-3 w-full">View Details</Button>
                </Card>
              ))}
            </div>
          </div>



          {/* Tasks Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="h-7 w-7 text-blue-600" />
              <h3 className="text-2xl font-semibold text-gray-800">Daily Tasks</h3>
            </div>
            <div className="space-y-3">
              {demoTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => setDemoTasks(demoTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                    className="w-5 h-5 text-blue-500 rounded"
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose DEPO?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="font-semibold text-lg mb-2">Visual Progress</h4>
                <p className="text-gray-600 text-sm">Track goals with images and see your journey unfold</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-4xl mb-3">📊</div>
                <h4 className="font-semibold text-lg mb-2">Smart Analytics</h4>
                <p className="text-gray-600 text-sm">Get insights on your progress and productivity</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="font-semibold text-lg mb-2">Achievements</h4>
                <p className="text-gray-600 text-sm">Earn badges and celebrate milestones</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Achieve Your Goals?</h3>
            <p className="text-xl mb-6 opacity-90">Start your free trial today - no credit card required</p>
            <AuthModal 
              defaultMode="signup"
              trigger={
                <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100">
                  Get Started Free
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-300">&copy; 2024 DEPO Goal Tracker. Transform your dreams into reality.</p>
        </div>
      </footer>
    </div>
  );
};

export default DemoLayout;
