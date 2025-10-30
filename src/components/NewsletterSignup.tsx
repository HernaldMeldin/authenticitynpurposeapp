import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('newsletter-signup', {
        body: { email: email.trim() }
      });

      if (error) {
        throw error;
      }

      setStatus('success');
      setMessage('Welcome! Check your email for a special 20% off offer + weekly tips.');

      setEmail('');
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get Weekly Goal-Setting Tips
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of achievers who receive our weekly newsletter with proven strategies, 
            motivation, and actionable tips to reach your goals faster.
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  disabled={status === 'loading'}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Get Free Tips'
                )}
              </Button>

              {status === 'success' && (
                <div className="flex items-center justify-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {message}
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center justify-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {message}
                </div>
              )}
            </form>

            <div className="mt-4 text-xs text-gray-500">
              <p>✓ Weekly goal-setting strategies</p>
              <p>✓ Motivation and success stories</p>
              <p>✓ Exclusive tips from productivity experts</p>
              <p className="mt-2">No spam. Unsubscribe anytime.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};