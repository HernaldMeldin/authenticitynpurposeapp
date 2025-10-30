# Complete Stripe Payment Setup Guide

## Overview
This guide walks you through connecting Stripe payments to your Goal Tracker app with 2 subscription plans: Monthly and Annual.

---

## Part 1: Create Stripe Products (10 minutes)

### Step 1: Create Stripe Account
1. Go to https://stripe.com and sign up
2. Complete business verification
3. Switch to **Test Mode** (toggle in top-right)

### Step 2: Create Products & Prices

**Product 1: Monthly Plan**
1. Dashboard → Products → Add Product
2. Name: `Goal Tracker - Monthly`
3. Description: `Monthly subscription with unlimited goal tracking`
4. Pricing: Recurring → $3.99/month
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_...`)

**Product 2: Annual Plan**
1. Add Product → Name: `Goal Tracker - Annual`
2. Description: `Annual subscription - Save $12.89/year (28% off)`
3. Pricing: Recurring → $34.99/year
4. Save and copy **Price ID**

### Step 3: Add Free Trial (Optional)
For each product:
1. Click product → Pricing → Edit
2. Add trial period: 30 days
3. Save changes

---

## Part 2: Get Stripe API Keys (2 minutes)

1. Dashboard → Developers → API keys
2. Copy **Publishable key** (starts with `pk_test_...`)
3. Copy **Secret key** (starts with `sk_test_...`)
4. Keep these secure!

---

## Part 3: Configure Supabase Edge Functions (20 minutes)

### Step 1: Create Edge Function Files

**File: supabase/functions/stripe-payments/index.ts**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const { action, priceId, subscriptionId } = await req.json()
  const origin = req.headers.get('origin') || 'http://localhost:5173'

  if (action === 'create-checkout-session') {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      subscription_data: { trial_period_days: 30 }
    })
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (action === 'cancel-subscription') {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
    return new Response(JSON.stringify({ success: true }))
  }

  return new Response('Invalid action', { status: 400 })
})
```

### Step 2: Deploy Edge Function
```bash
supabase functions deploy stripe-payments --no-verify-jwt
```

### Step 3: Set Stripe Secret in Supabase
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
```

---

## Part 4: Update Frontend Code (5 minutes)

**File: src/components/PricingSection.tsx**

Replace lines 44 and 60 with your real Stripe Price IDs:

```typescript
priceId: 'price_1ABC123...',  // Your Monthly price ID (line 44)
priceId: 'price_1DEF456...',  // Your Annual price ID (line 60)
```

---

## Part 5: Test Payment Flow (10 minutes)

### Test Checkout
1. Run app: `npm run dev`
2. Click "Start Free Trial" on either plan
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Complete checkout

### Verify in Stripe Dashboard
1. Customers → See new customer
2. Subscriptions → See active subscription
3. Check trial end date

### Test Cancellation
1. Go to app settings/subscription page
2. Click "Cancel Subscription"
3. Verify in Stripe: subscription set to cancel at period end

---

## Part 6: Go Live (Production)

### Switch to Live Mode
1. Stripe Dashboard → Toggle **Live Mode**
2. Create same 2 products with live prices:
   - Monthly: $3.99/month
   - Annual: $34.99/year
3. Get live API keys (pk_live_... and sk_live_...)
4. Update Supabase secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_your_key
   ```
5. Update frontend with live price IDs
6. Deploy to production

---

## Pricing Structure Summary

| Plan | Price | Billing | Savings |
|------|-------|---------|---------|
| Monthly | $3.99 | Per month | - |
| Annual | $34.99 | Per year | Save $12.89/year (28% off) |

**Total if paid monthly:** $47.88/year  
**Annual plan price:** $34.99/year  
**Customer saves:** $12.89/year with annual plan

---

## Troubleshooting

**"Invalid API Key"**
- Check secret is set: `supabase secrets list`
- Verify key starts with `sk_test_` or `sk_live_`

**"Price not found"**
- Confirm price ID copied correctly
- Check you're in correct mode (test/live)

**Checkout not opening**
- Check browser console for errors
- Verify edge function deployed
- Check CORS settings

**Subscription not saving**
- Set up webhook handler (see Part 7)

**Latest code not running**
- Re-deploy the Edge Function after making changes: `supabase functions deploy stripe-payments`
- Confirm the deployment finished under Supabase → **Edge Functions → Deployments**

---

## Part 5b: Verify Stripe → Supabase Sync (10 minutes)

Use this optional smoke test to confirm the `sync-subscriptions` Edge Function can pull active subscriptions from Stripe into your Supabase table.

1. **Seed a test customer in Stripe**
   - Complete the checkout flow above or create a subscription manually in the Stripe dashboard using the same email address as your Supabase user.
   - Ensure the customer has at least one active or trialing subscription so it appears in Stripe search results.
2. **Sign in to the troubleshooting page**
   - Run the app locally (`npm run dev`) or open your deployed environment.
   - Log in with the Supabase user that matches the Stripe customer email.
   - Navigate to `/test-subscriptions` (the "Test Subscriptions" helper page).
3. **Trigger a sync from the browser**
   - Click **"Sync from Stripe"**.
   - The page calls the `stripe-payments` Edge Function with `action: 'sync-subscriptions'` and includes your session token automatically.
   - A successful sync shows a toast such as "Synced 1 subscription(s) from Stripe" and refreshes the subscription card.
4. **Inspect Supabase data**
   - Open the Supabase dashboard → **Table editor → subscriptions**.
   - You should see an entry whose `stripe_subscription_id`, `status`, and billing details match the Stripe record.
5. **Troubleshoot failures**
   - Check the browser console/network tab for the JSON error returned by the function.
   - Visit Supabase → **Edge Functions → stripe-payments → Logs** for detailed stack traces if the function responded with a non-2xx status.
   - Confirm the secrets `STRIPE_SECRET_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are present under **Settings → Edge Functions → Manage Secrets**.

---

## Part 7: Webhook Setup (Advanced)

Create `supabase/functions/stripe-webhooks/index.ts` to handle subscription updates automatically.

This syncs Stripe subscription status to your database in real-time.

---

## Support
- Stripe Docs: https://stripe.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
