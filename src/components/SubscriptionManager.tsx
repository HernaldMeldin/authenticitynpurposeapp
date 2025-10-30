import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CreditCard, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import FamilyGroupManager from './FamilyGroupManager';

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  price_id: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      // Fetch subscription from database
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-payments', {
        body: { 
          action: 'cancel-subscription',
          subscriptionId: subscription.stripe_subscription_id
        }
      });

      if (error) throw error;
      
      setSubscription({ ...subscription, status: 'canceled' });
      alert('Subscription cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>You don't have an active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Subscribe to unlock all premium features and start achieving your goals.
          </p>
          <Button onClick={() => window.location.href = '/#pricing'}>
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default' as const, icon: CheckCircle },
      canceled: { label: 'Canceled', variant: 'secondary' as const, icon: AlertCircle },
      past_due: { label: 'Past Due', variant: 'destructive' as const, icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPlanName = (priceId: string) => {
    const plans: Record<string, string> = {
      'price_1QN5LvBQOJ0tBAEZCLCBJFrE': 'Basic',
      'price_1QN5M8BQOJ0tBAEZvQhOCqfR': 'Pro',
      'price_1QN5MHBQOJ0tBAEZJCJnqBCE': 'Team'
    };
    return plans[priceId] || 'Unknown';
  };

  const getPlanPrice = (priceId: string) => {
    const prices: Record<string, string> = {
      'price_1QN5LvBQOJ0tBAEZCLCBJFrE': '$9/mo',
      'price_1QN5M8BQOJ0tBAEZvQhOCqfR': '$19/mo',
      'price_1QN5MHBQOJ0tBAEZJCJnqBCE': '$39/mo'
    };
    return prices[priceId] || 'Custom';
  };

  return (
    <Tabs defaultValue="subscription" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="subscription">
          <CreditCard className="h-4 w-4 mr-2" />
          Subscription
        </TabsTrigger>
        <TabsTrigger value="family" disabled={getPlanName(subscription.price_id) !== 'Team'}>
          <Users className="h-4 w-4 mr-2" />
          Family Group
        </TabsTrigger>
      </TabsList>

      <TabsContent value="subscription">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Details
            </CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status</span>
              {getStatusBadge(subscription.status)}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Plan</span>
                <p className="font-medium">
                  {getPlanName(subscription.price_id)} - {getPlanPrice(subscription.price_id)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Next billing</span>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(subscription.current_period_end)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-sm text-gray-600">Customer ID</span>
              <p className="text-sm font-mono">{subscription.stripe_customer_id}</p>
            </div>

            {subscription.status === 'active' && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="family">
        <FamilyGroupManager />
      </TabsContent>
    </Tabs>
  );

};

export default SubscriptionManager;