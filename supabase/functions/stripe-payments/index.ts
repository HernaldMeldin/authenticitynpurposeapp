import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const { action, priceId, successUrl, cancelUrl, subscriptionId, userEmail } = await req.json();

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (action === 'create-checkout-session') {
      if (!token) {
        throw new Error('User not authenticated');
      }

      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) throw new Error('User not authenticated');

      // Check for existing customer
      const { data: existingCustomer } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      let customerId = existingCustomer?.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id }
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { user_id: user.id }
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'sync-subscriptions') {
      if (!token) {
        throw new Error('User not authenticated');
      }

      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) {
        throw new Error('User not authenticated');
      }

      const emailToLookup = (userEmail || user.email)?.toLowerCase();
      if (!emailToLookup) {
        throw new Error('User email is required');
      }

      if (user.email && user.email.toLowerCase() !== emailToLookup) {
        throw new Error('User email does not match authenticated user');
      }

      const sanitizedEmail = emailToLookup.replace(/'/g, "\\'");

      const customers = await stripe.customers.search({
        query: `email:'${sanitizedEmail}'`,
        limit: 10,
      });

      const subscriptions = [];



      const productCache = new Map<string, Stripe.Product>();

codex/find-deployment-steps-for-vercel-vz83zf
      for (const customer of customers.data) {
        const subscriptionList = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',

          expand: ['data.items.data.price.product'],

          expand: ['data.items.data.price'],
codex/find-deployment-steps-for-vercel-vz83zf
          limit: 100,
        });

        for (const subscription of subscriptionList.data) {
          const price = subscription.items.data[0]?.price as Stripe.Price & {
            product?: Stripe.Product | string;
          };


          const product =
            price?.product && typeof price.product !== 'string'
              ? price.product
              : undefined;

          let product: Stripe.Product | undefined;

          if (price?.product && typeof price.product !== 'string') {
            product = price.product;
          } else if (price?.product && typeof price.product === 'string') {
            const productId = price.product;
            if (!productCache.has(productId)) {
              const fetchedProduct = await stripe.products.retrieve(productId);
              productCache.set(productId, fetchedProduct);
            }
            product = productCache.get(productId);
          }
codex/find-deployment-steps-for-vercel-vz83zf

          subscriptions.push({
            stripe_customer_id: customer.id,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: price?.id ?? null,
            plan_id: price?.id ?? null,
            plan_name: product?.name ?? price?.nickname ?? null,
            plan_amount: price?.unit_amount ?? null,
            plan_currency: price?.currency ?? null,
            plan_interval: price?.recurring?.interval ?? null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_start: subscription.trial_start
              ? new Date(subscription.trial_start * 1000).toISOString()
              : null,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end ?? false,
            created_at: new Date(subscription.created * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            tier: subscription.metadata?.tier ?? null,
            features: subscription.metadata?.features ?? null,
            limits: subscription.metadata?.limits ?? null,
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          synced: subscriptions.length,
          subscriptions,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    if (action === 'cancel-subscription') {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      return new Response(JSON.stringify({ success: true, subscription }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Stripe function error:', error);
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Unknown error';

    return new Response(JSON.stringify({ error: message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
