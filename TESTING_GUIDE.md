# Testing Guide - Personalized Plan Generation

## Pre-Testing Setup

### 1. Run Database Migration
Execute the SQL migration in your Supabase dashboard:
```sql
-- Copy and paste from: supabase/migrations/add_personalized_plan.sql
-- This will drop and recreate the subscriptions table (safe for testing)
```

Or via Supabase CLI:
```bash
supabase db reset  # Resets local database
# Then run the migration file
```

### 2. Environment Variables
Make sure these are set in your `.env.local`:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional but recommended for testing
GEMINI_API_KEY=your_gemini_api_key
```

Get Gemini API key: https://aistudio.google.com/app/apikey (free tier available)

### 3. Install Dependencies
```bash
npm install
```

## Testing Flow

### Option 1: Local Testing with Stripe CLI (Recommended)

**Step 1: Start your dev server**
```bash
npm run dev
```

**Step 2: Start Stripe webhook forwarding** (in a new terminal)
```bash
# Install Stripe CLI if not already installed
# https://stripe.com/docs/stripe-cli

stripe login
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the webhook secret shown (starts with `whsec_`) and update your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Restart your dev server after updating the secret.

**Step 3: Complete the quiz**
1. Go to http://localhost:3000
2. Click "Start Your Journey"
3. Complete all quiz questions
4. Note: The plan generation at the end is just BMI/calories (no AI yet) ✅

**Step 4: Trigger a test payment**

In another terminal:
```bash
stripe trigger checkout.session.completed
```

**Step 5: Check the results**

Monitor the console output - you should see:
1. Webhook received ✅
2. Subscription inserted into Supabase ✅
3. Plan generation triggered ✅
4. Gemini API call (or fallback) ✅
5. Plan saved to database ✅

**Step 6: Verify in Supabase Dashboard**
1. Open Supabase dashboard → Table Editor → subscriptions
2. Check the latest row
3. Expand `personalized_plan` column - should contain:
   - mealPlan (7 days)
   - exercisePlan (7 days)
   - weeklyShoppingList (categorized items)
   - progressTracking (goals, measurements, milestones)
   - foodCombinations
   - tips
   - summary

**Step 7: View the plan in browser**
Get the `stripe_session_id` from the subscriptions table, then:
```
http://localhost:3000/plan?subscription_id=sub_xxxxx
```

You should see:
- ✅ 5 tabs: Meals, Exercise, Shopping List, Progress, Tips
- ✅ 7-day meal plan with detailed recipes
- ✅ Exercise routines with instructions
- ✅ Categorized shopping list with checkboxes
- ✅ Progress tracking interface
- ✅ DASH diet tips

### Option 2: Manual Testing with Real Checkout

**Step 1: Use Stripe test mode**
Make sure you're using test API keys (starts with `pk_test_` and `sk_test_`)

**Step 2: Complete quiz and purchase**
1. Complete the quiz
2. On results page, select a plan
3. Use test card: `4242 4242 4242 4242`
4. Any future expiry date
5. Any CVC

**Step 3: Check webhook logs**
- Stripe Dashboard → Developers → Webhooks → Your webhook
- Should see `checkout.session.completed` event

**Step 4: Verify same as Option 1, steps 5-7**

## Troubleshooting

### Issue: No plan generated
**Check:**
1. Webhook secret is correct in `.env.local`
2. `NEXT_PUBLIC_APP_URL` is set correctly
3. Console logs for errors in plan generation
4. Supabase service role key has proper permissions

### Issue: Plan generation takes too long
**Solution:**
- Gemini API can take 3-5 seconds
- Check network tab for the API call
- Fallback plan should generate instantly if API fails

### Issue: Shopping list or progress tracking not showing
**Check:**
1. Browser console for any React errors
2. Verify `personalized_plan` structure in Supabase
3. Check if fallback plan was used (should still include these features)

### Issue: Webhook not receiving events
**Check:**
1. Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhook`
2. Port 3000 is correct (match your dev server)
3. Firewall isn't blocking the connection

## Testing Checklist

- [ ] Database migration executed successfully
- [ ] Environment variables all set
- [ ] Dev server running on port 3000
- [ ] Stripe CLI forwarding webhooks
- [ ] Quiz completes and shows results page
- [ ] Test payment triggers webhook
- [ ] Subscription created in Supabase
- [ ] `personalized_plan` column populated
- [ ] Plan page loads at `/plan?subscription_id=xxx`
- [ ] All 5 tabs visible and working
- [ ] Shopping list shows categorized items
- [ ] Progress tracking shows goals and milestones
- [ ] Meals show with recipes and macros
- [ ] Exercise routines show with instructions

## Performance Testing

### Test Gemini API
```bash
# Check if API key is working
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Test Fallback Plan
1. Temporarily remove or rename `GEMINI_API_KEY` from `.env.local`
2. Trigger a test payment
3. Verify fallback plan is generated
4. Should still include all features (shopping list, progress tracking, etc.)

## Next Steps After Testing

Once everything works:
1. ✅ Keep all changes in development
2. ✅ Test edge cases (no quiz answers, invalid data, etc.)
3. ✅ Set `GEMINI_API_KEY` in production environment
4. ✅ Update Stripe webhook URL to production in Stripe Dashboard
5. ✅ Deploy to Vercel/production
6. ✅ Test one real transaction in production
7. ✅ Monitor logs for any issues

## Cleanup

If you need to reset and start over:

```sql
-- In Supabase SQL Editor
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;

-- Then re-run the migration
```

Or with Supabase CLI:
```bash
supabase db reset
```
