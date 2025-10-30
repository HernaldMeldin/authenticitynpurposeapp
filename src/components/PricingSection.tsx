import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

const PricingSection: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      return;
    }

    setLoading(planName);
    try {
      // Get the current origin for redirect URLs
      const origin = window.location.origin;
      
      const { data, error } = await supabase.functions.invoke('stripe-payments', {
        body: { 
          action: 'create-checkout-session',
          priceId: priceId,
          successUrl: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/#pricing`
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setLoading(null);
    }
  };


  const plans = [
    {
      name: 'Monthly',
      price: '$3.99',
      period: '/month',
      priceId: 'price_1SKXHcGxEHNhQzpe7wO9ocYQ',
      description: 'Perfect for getting started',
      features: [
        'Unlimited goal tracking',
        'Progress analytics & insights',
        'Achievement badges & rewards',
        'Daily task management',
        'AI-powered recommendations',
        'Mobile app access',
        'Email & chat support',
        'Data export capabilities'
      ],
      popular: false,
      savings: null
    },
    {
      name: 'Annual',
      price: '$34.99',
      period: '/year',
      priceId: 'price_1SKXLuGxEHNhQzpeYpcIxuIH',
      description: 'Best value - Save 27%',
      features: [
        'Everything in Monthly plan',
        'Save $12.89 per year',
        'Priority customer support',
        'Advanced analytics dashboard',
        'Custom goal templates',
        'Early access to new features',
        'Personalized coaching tips',
        'Annual progress report'
      ],
      popular: true,
      savings: 'Save $12.89',
      icon: Sparkles
    }
  ];

  return (
    <section id="pricing" className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for you. Upgrade or cancel anytime.
          </p>
        </div>


        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative transform transition-all duration-200 hover:scale-105 ${
                plan.popular 
                  ? 'border-2 border-blue-500 shadow-xl bg-gradient-to-br from-blue-50 to-white' 
                  : 'border shadow-lg'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1">
                  BEST VALUE
                </Badge>
              )}
              
              <CardHeader className="text-center pb-8">
                {plan.icon && <plan.icon className="h-10 w-10 mx-auto mb-3 text-blue-600" />}
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-gray-800">{plan.price}</span>
                  <span className="text-gray-600 text-base ml-1">{plan.period}</span>
                </div>
                {plan.savings && (
                  <div className="mt-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {plan.savings} compared to monthly
                    </Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {user ? (
                  <Button
                    onClick={() => handleSubscribe(plan.priceId, plan.name)}
                    disabled={loading === plan.name}
                    className={`w-full py-6 text-base font-semibold ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {loading === plan.name ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}

                  </Button>
                ) : (
                  <AuthModal
                    trigger={
                      <Button 
                        className={`w-full py-6 text-base font-semibold ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                        size="lg"
                      >
                        Subscribe Now
                      </Button>

                    }
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 space-y-2">
          <p className="text-sm text-gray-600">
            ✓ Cancel anytime • ✓ No hidden fees • ✓ Instant access
          </p>
          <p className="text-xs text-gray-500">
            Prices shown in USD. Secure payment processing by Stripe.
          </p>
        </div>

      </div>
    </section>
  );
};

export default PricingSection;