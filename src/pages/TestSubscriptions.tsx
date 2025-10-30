import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, CreditCard, RefreshCw, Copy, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { AuthModal } from '@/components/auth/AuthModal';

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  plan_id: string;
  plan_name: string;
  plan_amount: number;
  plan_currency: string;
  plan_interval: string;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  tier?: string;
  features?: any;
  limits?: any;
}


export default function TestSubscriptions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingSubscription, setFetchingSubscription] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);


  // IMPORTANT: Replace these with your actual Stripe price IDs
  const PRICE_IDS = {
    monthly: 'price_1SKXHcGxEHNhQzpe7wO9ocYQ', // Replace with your Monthly price ID from Stripe
    annual: 'price_1SKXLuGxEHNhQzpeYpcIxuIH'    // Replace with your Annual price ID from Stripe
  };

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setFetchingSubscription(false);
      setSubscription(null);
    }
  }, [user]);


  const fetchSubscription = async () => {
    if (!user) {
      setSubscriptionError('Please log in to view subscription status');
      setFetchingSubscription(false);
      return;
    }

    console.log('Fetching subscription for user:', user.id);
    setFetchingSubscription(true);
    setSubscriptionError(null);

    try {
      const { data, error, status, statusText } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      console.log('Subscription query response:', { data, error, status, statusText });
      
      setFetchingSubscription(false);

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscriptionError(`${error.message} (Status: ${status})`);
        toast.error(`Failed to fetch subscription: ${error.message}`);
      } else if (data) {
        console.log('Subscription found:', data);
        setSubscription(data);
        toast.success('Subscription loaded successfully');
      } else {
        console.log('No subscription found for user');
        setSubscription(null);
      }
    } catch (err: any) {
      console.error('Exception fetching subscription:', err);
      setSubscriptionError(err.message || 'Unknown error');
      setFetchingSubscription(false);
    }
  };

  const handleSyncFromStripe = async () => {
    if (!user?.email) {
      toast.error('Please log in to sync subscriptions');
      return;
    }

    console.log('Starting sync with email:', user.email);
    setSyncing(true);
    
    try {
      console.log('Invoking stripe-payments function with:', {
        action: 'sync-subscriptions',
        userEmail: user.email
      });
      
      const { data: response, error } = await supabase.functions.invoke('stripe-payments', {
        body: {
          action: 'sync-subscriptions',
          userEmail: user.email
        }
      });

      console.log('Function response data:', response);
      console.log('Function response error:', error);
      
      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Failed to sync subscriptions');
      }

      if (response?.error) {
        console.error('Response contains error:', response.error);
        console.error('Error details:', response.details);
        throw new Error(response.error);
      }

      if (response?.success && response?.subscriptions) {
        console.log(`Found ${response.subscriptions.length} subscriptions to save`);
        
        // Save the subscriptions to the database
        for (const sub of response.subscriptions) {
          console.log('Saving subscription:', sub.stripe_subscription_id);
          
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              ...sub,
              user_id: user.id, // Add the user_id
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'stripe_subscription_id'
            });
          
          if (error) {
            console.error('Error saving subscription:', error);
          } else {
            console.log('Successfully saved subscription:', sub.stripe_subscription_id);
          }
        }
        
        toast.success(`Synced ${response.synced} subscription(s) from Stripe`);
        await fetchSubscription();
      } else {
        console.log('No subscriptions found in response');
        toast.info('No subscriptions found in Stripe for this email');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };





  const handleSubscribe = async (plan: string, priceId: string) => {
    if (!user?.email) {
      toast.error('Please log in to subscribe');
      return;
    }
    
    setLoading(true);
    setProcessingPlan(plan);
    try {
      const origin = window.location.origin;
      const response = await supabase.functions.invoke('stripe-payments', {
        body: {
          action: 'create-checkout-session',
          priceId,
          userEmail: user.email,
          successUrl: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/test-subscriptions`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create checkout session');
      }

      if (response.data?.url) {
        // Force top-level redirect to avoid iframe issues
        window.top!.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received from Stripe');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to start subscription process';
      toast.error(`Subscription Error: ${errorMessage}`);
      
      if (errorMessage.includes('STRIPE_SECRET_KEY') || errorMessage.includes('configuration')) {
        toast.error('Please ensure Stripe is properly configured in your Supabase project');
      }
    } finally {
      setLoading(false);
      setProcessingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('stripe-payments', {
        body: {
          action: 'cancel-subscription',
          subscriptionId: subscription.stripe_subscription_id
        }
      });

      if (response.data?.success) {
        toast.success('Subscription cancelled successfully');
        await fetchSubscription();
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const testCards = [
    { number: '4242 4242 4242 4242', description: 'Successful payment' },

    { number: '4242 4242 4242 4242', description: 'Successful payment' },
    { number: '4000 0000 0000 3220', description: '3D Secure authentication' },
    { number: '4000 0000 0000 9995', description: 'Declined payment' }
  ];

  return (
    <>
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Testing Dashboard</h1>
          <p className="text-muted-foreground">Test the complete Stripe subscription flow</p>
          {!user && (
            <Button onClick={() => setShowAuthModal(true)} className="mt-4">
              <LogIn className="h-4 w-4 mr-2" />
              Log In to Test Subscriptions
            </Button>
          )}
        </div>

        {user && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription>
              Replace the price IDs in this file with your actual Stripe price IDs from your Stripe Dashboard.
              Current placeholders: {PRICE_IDS.monthly} (monthly) and {PRICE_IDS.annual} (annual)
            </AlertDescription>
          </Alert>
        )}

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="plans">Test Plans</TabsTrigger>
          <TabsTrigger value="test-cards">Test Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription Status</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              {fetchingSubscription ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading subscription status...</p>
                </div>
              ) : !user ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not Logged In</AlertTitle>
                  <AlertDescription>
                    Please log in to view your subscription status.
                  </AlertDescription>
                </Alert>
              ) : subscriptionError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error Loading Subscription</AlertTitle>
                  <AlertDescription>
                    {subscriptionError}
                    <Button 
                      onClick={() => fetchSubscription()} 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : subscription ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                        {subscription.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Plan</p>
                      <p className="font-medium">
                        {subscription.plan_name || subscription.plan_id || 'N/A'}
                        {subscription.plan_amount && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ${(subscription.plan_amount / 100).toFixed(2)}/{subscription.plan_interval}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer ID</p>
                      <p className="font-mono text-sm">{subscription.stripe_customer_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subscription ID</p>
                      <p className="font-mono text-sm">{subscription.stripe_subscription_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Period End</p>
                      <p className="font-medium">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(subscription.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCancelSubscription} 
                      variant="destructive"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        'Cancel Subscription'
                      )}
                    </Button>
                    <Button 
                      onClick={() => fetchSubscription()} 
                      variant="outline"
                      disabled={fetchingSubscription}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No active subscription found in database</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have an active subscription in Stripe, click "Sync from Stripe" to import it.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleSyncFromStripe} disabled={syncing} variant="default">
                      {syncing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync from Stripe
                        </>
                      )}
                    </Button>
                    <Button onClick={() => fetchSubscription()} variant="outline" disabled={fetchingSubscription}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Status
                    </Button>
                  </div>
                </div>

              )}
            </CardContent>

          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(PRICE_IDS).map(([plan, priceId]) => (
              <Card key={plan}>
                <CardHeader>
                  <CardTitle className="capitalize">{plan} Plan</CardTitle>
                  <CardDescription>
                    {plan === 'monthly' ? 'Billed monthly' : 'Billed annually (save 28%)'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold mb-2">
                    ${plan === 'monthly' ? '3.99' : '34.99'}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{plan === 'monthly' ? 'month' : 'year'}
                    </span>
                  </p>
                  <p className="text-xs font-mono mb-4 text-muted-foreground">{priceId}</p>
                  <Button 
                    onClick={() => handleSubscribe(plan, priceId)}
                    disabled={loading || processingPlan === plan}
                    className="w-full"
                  >
                    {processingPlan === plan ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Subscribe to {plan}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="test-cards" className="space-y-4">
          <Alert>
            <AlertDescription>
              Use these test card numbers in Stripe's test mode. Use any future expiry date and any 3-digit CVC.
            </AlertDescription>
          </Alert>
          
          {testCards.map((card) => (
            <Card key={card.number}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-lg">{card.number}</p>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(card.number.replace(/\s/g, ''))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}