import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Calendar, Download, Receipt, Loader2, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const BillingView: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [stripeSubscription, setStripeSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (user) fetchBillingData();
  }, [user]);

  const fetchBillingData = async () => {
    try {
      const { data: subData } = await supabase.from('subscriptions').select('*').eq('user_id', user?.id).single();
      if (subData) {
        setSubscription(subData);
        
        // Only fetch Stripe data if we have valid IDs
        if (subData.stripe_subscription_id) {
          const { data: stripeData } = await supabase.functions.invoke('stripe-payments', {
            body: { action: 'get-subscription-details', subscriptionId: subData.stripe_subscription_id }
          });
          if (stripeData?.subscription) setStripeSubscription(stripeData.subscription);
        }
        
        if (subData.stripe_customer_id) {
          const { data: invoiceData } = await supabase.functions.invoke('stripe-payments', {
            body: { action: 'get-invoices', customerId: subData.stripe_customer_id }
          });
          if (invoiceData?.invoices) setInvoices(invoiceData.invoices);
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSubscribe = async (priceId: string, planName: string) => {
    setSubscribing(planName);
    try {
      const { data } = await supabase.functions.invoke('stripe-payments', {
        body: { 
          action: 'create-checkout-session', 
          priceId,
          userEmail: user?.email 
        }
      });
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to start subscription', variant: 'destructive' });
    } finally {
      setSubscribing(null);
    }
  };


  const handleManagePayment = async () => {
    try {
      const { data } = await supabase.functions.invoke('stripe-payments', {
        body: { action: 'create-portal-session', customerId: subscription.stripe_customer_id }
      });
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to open portal', variant: 'destructive' });
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Cancel subscription? Access continues until period end.')) return;
    setCanceling(true);
    try {
      await supabase.functions.invoke('stripe-payments', {
        body: { action: 'cancel-subscription', subscriptionId: subscription.stripe_subscription_id }
      });
      toast({ title: 'Success', description: 'Subscription will cancel at period end' });
      fetchBillingData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to cancel', variant: 'destructive' });
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  if (!subscription) {
    const plans = [
      { name: 'Monthly', price: '$3.99', period: '/month', priceId: 'price_1SKXHcGxEHNhQzpe7wO9ocYQ', features: ['Unlimited goals', 'Analytics', 'AI recommendations', 'Mobile access'] },
      { name: 'Annual', price: '$34.99', period: '/year', priceId: 'price_1SKXLuGxEHNhQzpeYpcIxuIH', features: ['Everything in Monthly', 'Save $12.89/year', 'Priority support', 'Early access'], popular: true }
    ];

    return (
      <div className="space-y-6">
        <Card><CardHeader><CardTitle>Choose Your Plan</CardTitle><CardDescription>Subscribe to unlock premium features</CardDescription></CardHeader></Card>
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map(plan => (
            <Card key={plan.name} className={plan.popular ? 'border-2 border-blue-500 relative' : 'relative'}>
              {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">BEST VALUE</Badge>}
              <CardHeader className="text-center"><CardTitle>{plan.name}</CardTitle><div className="mt-4"><span className="text-4xl font-bold">{plan.price}</span><span className="text-gray-600">{plan.period}</span></div></CardHeader>
              <CardContent><ul className="space-y-2 mb-6">{plan.features.map((f, i) => <li key={i} className="flex gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /><span className="text-sm">{f}</span></li>)}</ul>
                <Button onClick={() => handleSubscribe(plan.priceId, plan.name)} disabled={!!subscribing} className="w-full">{subscribing === plan.name ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : 'Subscribe Now'}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const price = stripeSubscription?.items?.data[0]?.price;
  const paymentMethod = stripeSubscription?.default_payment_method;
  const nextBilling = stripeSubscription?.current_period_end;
  const cancelAtPeriodEnd = stripeSubscription?.cancel_at_period_end;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Subscription Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status</span>
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>{subscription.status}</Badge>
          </div>
          {cancelAtPeriodEnd && (
            <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Subscription will cancel on {new Date(nextBilling * 1000).toLocaleDateString()}</AlertDescription></Alert>
          )}
          {price && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Plan</span>
              <span className="font-medium">${(price.unit_amount / 100).toFixed(2)} / {price.recurring.interval}</span>
            </div>
          )}
          {nextBilling && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Next Billing</span>
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(nextBilling * 1000).toLocaleDateString()}</span>
            </div>
          )}
          {paymentMethod?.card && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="flex items-center gap-2"><CreditCard className="h-4 w-4" />{paymentMethod.card.brand.toUpperCase()} •••• {paymentMethod.card.last4}</span>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleManagePayment} variant="outline" className="flex-1"><ExternalLink className="h-4 w-4 mr-2" />Manage Payment</Button>
            {!cancelAtPeriodEnd && <Button onClick={handleCancelSubscription} disabled={canceling} variant="destructive" className="flex-1">{canceling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel'}</Button>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />Billing History</CardTitle></CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center py-8 text-gray-600">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {invoices.map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">${(inv.amount_paid / 100).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{new Date(inv.created * 1000).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => window.open(inv.invoice_pdf, '_blank')}><Download className="h-4 w-4 mr-2" />Download</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingView;