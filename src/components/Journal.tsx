import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, BarChart3, Calendar, Target } from 'lucide-react';
import JournalEntry from './JournalEntry';
import JournalList from './JournalList';
import MoodTracker from './MoodTracker';
import JournalCalendar from './JournalCalendar';

interface JournalEntryType {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [activeTab, setActiveTab] = useState('entries');
  const [editingEntry, setEditingEntry] = useState<JournalEntryType | null>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = (entry: JournalEntryType) => {
    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
      setEditingEntry(null);
    } else {
      setEntries(prev => [...prev, entry]);
      setShowNewEntry(false);
    }
  };

  const handleEditEntry = (entry: JournalEntryType) => {
    setEditingEntry(entry);
    setActiveTab('write');
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setShowNewEntry(false);
    if (entries.length > 0) {
      setActiveTab('entries');
    }
  };

  const getJournalStats = () => {
    const totalEntries = entries.length;
    const thisMonth = entries.filter(e => {
      const entryDate = new Date(e.date);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    }).length;
    
    const currentStreak = getCurrentStreak();
    const allTags = entries.flatMap(e => e.tags);
    const uniqueTags = [...new Set(allTags)].length;

    return { totalEntries, thisMonth, currentStreak, uniqueTags };
  };

  const getCurrentStreak = () => {
    if (entries.length === 0) return 0;
    
    const sortedDates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let streak = 0;
    let currentDate = new Date();
    
    for (const dateStr of sortedDates) {
      const entryDate = new Date(dateStr);
      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const stats = getJournalStats();

  // Show write tab if no entries exist or if creating new entry
  if (entries.length === 0 || showNewEntry || editingEntry) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Journal</h2>
          </div>
          {entries.length > 0 && (
            <Button variant="outline" onClick={handleCancelEdit}>
              Back to Entries
            </Button>
          )}
        </div>
        
        <JournalEntry
          entry={editingEntry || undefined}
          onSave={handleSaveEntry}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Journal</h2>
        </div>
        <Button onClick={() => setShowNewEntry(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
            <div className="text-sm text-gray-600">This Month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.uniqueTags}</div>
            <div className="text-sm text-gray-600">Unique Tags</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entries">
            <Calendar className="h-4 w-4 mr-2" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="mood">
            <BarChart3 className="h-4 w-4 mr-2" />
            Mood
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Target className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>


        <TabsContent value="entries" className="space-y-6">
          <JournalList
            entries={entries}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <JournalCalendar entries={entries.map(e => ({ id: e.id, date: e.date, mood: e.mood }))} />
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <MoodTracker entries={entries.map(e => ({ date: e.date, mood: e.mood }))} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Writing Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Insights and analytics coming soon! Keep writing to unlock patterns in your journaling journey.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Journal;