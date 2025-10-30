# Stripe Webhooks Setup Guide

## Overview
This guide shows you how to create and configure Stripe webhooks to automatically sync subscription status to your Supabase database in real-time.

⚠️ **IMPORTANT**: The webhook edge function needs to be created and deployed first before configuring Stripe.

## Part 1: Create the Webhook Edge Function

### Step 1: Create the Function File
Create the file `supabase/functions/stripe-webhooks/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log(`Processing event: ${event.type}`)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.user_id
        
        if (!userId) {
          console.error('No user_id in subscription metadata')
          return new Response('Missing user_id', { status: 400 })
        }

        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            id: subscription.id,
            user_id: userId,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            quantity: subscription.items.data[0].quantity,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_start: subscription.trial_start 
              ? new Date(subscription.trial_start * 1000).toISOString() 
              : null,
            trial_end: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000).toISOString() 
              : null,
          })

        if (error) throw error
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('id', subscription.id)

        if (error) throw error
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('id', invoice.subscription)

          if (error) throw error
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
```

### Step 2: Deploy the Edge Function
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref xphaqwuqfirixskqjhjr

# Deploy the webhook function
supabase functions deploy stripe-webhooks --no-verify-jwt
```

### Step 3: Set Environment Variables
In your Supabase Dashboard:
1. Go to **Settings** → **Edge Functions**
2. Add these secrets if not already set:
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Will be set after creating webhook in Stripe
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (already set)

## Part 2: Configure Webhook in Stripe Dashboard

### Step 1: Go to Webhooks
1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **Webhooks**
3. Click **Add endpoint**

### Step 2: Add Endpoint URL
- **Endpoint URL**: `https://xphaqwuqfirixskqjhjr.supabase.co/functions/v1/stripe-webhooks`
- **Description**: "Subscription sync to Supabase"

### Step 3: Select Events to Listen To
Select these events:
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `customer.subscription.trial_will_end`
- ✅ `invoice.payment_failed`

### Step 4: Save and Get Signing Secret
1. Click **Add endpoint**
2. Click on your new endpoint
3. Click **Reveal** under "Signing secret"
4. Copy the secret (starts with `whsec_`)

## Part 3: Add Webhook Secret to Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Edge Functions**
4. Add or update `STRIPE_WEBHOOK_SECRET`
5. Paste your webhook signing secret from Stripe

## Part 4: Test the Webhook

### Using Stripe CLI (Recommended)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Trigger a test event
stripe trigger customer.subscription.created
```

### Using Stripe Dashboard
1. Go to **Developers** → **Webhooks**
2. Click on your endpoint
3. Click **Send test webhook**
4. Select `customer.subscription.created`
5. Click **Send test webhook**

## Part 5: Verify Webhook is Working

### Check Stripe Dashboard
1. Go to your webhook endpoint in Stripe
2. Click the **Logs** tab
3. You should see successful responses (200 status)

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Edge Functions** → **stripe-webhooks**
3. Click **Logs**
4. Look for "Processing event:" messages

### Check Database
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
```

## Part 6: Important Notes

### Subscription Metadata Requirement
The stripe-payments function MUST include user_id in metadata:
```javascript
subscription_data: {
  metadata: {
    user_id: userId, // CRITICAL: Required for webhook to work
  },
}
```

Without `user_id` in metadata, the webhook can't link subscriptions to users!

## Troubleshooting

### Function Not Deployed
- Run `supabase functions list` to check deployment
- Redeploy with `supabase functions deploy stripe-webhooks --no-verify-jwt`

### Webhook Returns 400 Error
- Check that `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify the secret matches your Stripe dashboard

### Subscriptions Not Updating
- Verify webhook events are selected in Stripe
- Check that `user_id` is in subscription metadata
- Ensure subscriptions table exists in Supabase

### Signature Verification Failed
- Webhook secret is wrong or missing
- Update `STRIPE_WEBHOOK_SECRET` in Supabase
- Make sure you're using the signing secret, not API key

## Production Checklist

- [ ] Create stripe-webhooks edge function file
- [ ] Deploy edge function to Supabase
- [ ] Set STRIPE_SECRET_KEY in Supabase
- [ ] Add webhook endpoint in Stripe Dashboard
- [ ] Select all required events
- [ ] Copy webhook signing secret from Stripe
- [ ] Set STRIPE_WEBHOOK_SECRET in Supabase
- [ ] Send test webhook successfully
- [ ] Verify database records updating
- [ ] Check logs showing successful processing

## Need Help?

Common HTTP status codes:
- **200 OK**: Webhook processed successfully
- **400 Bad Request**: Check webhook secret or missing user_id
- **401 Unauthorized**: Check Supabase service role key
- **404 Not Found**: Function not deployed or wrong URL
- **500 Server Error**: Check Supabase logs for details

Your webhook system will automatically sync all subscription changes once properly configured! 🎉