# Quick Test Checklist ✅

## Before You Start
- [ ] Run the SQL migration in Supabase dashboard (`supabase/migrations/add_personalized_plan.sql`)
- [ ] Set `GEMINI_API_KEY` in `.env.local` (optional but recommended)
- [ ] Verify `NEXT_PUBLIC_APP_URL=http://localhost:3000` in `.env.local`

## Start Testing (5 minutes)

### Terminal 1: Dev Server
```bash
npm run dev
```

### Terminal 2: Stripe Webhook Listener
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook
# Copy the webhook secret (whsec_xxx) and add to .env.local as STRIPE_WEBHOOK_SECRET
# Restart dev server if you update the secret
```

### Terminal 3: Test Commands
```bash
# Trigger a test checkout
stripe trigger checkout.session.completed
```

## Verify Results

### 1. Check Console Output
Look for these logs in Terminal 1:
- ✅ "Webhook received: checkout.session.completed"
- ✅ "Subscription created in Supabase"
- ✅ "Triggering plan generation"
- ✅ "Plan generated successfully" (or "Using fallback plan")

### 2. Check Supabase Dashboard
1. Go to Supabase → Table Editor → subscriptions
2. You should see a new row
3. Click to expand `personalized_plan` column
4. Verify it contains:
   - ✅ mealPlan (array with 7 days)
   - ✅ exercisePlan (array with 7 days)
   - ✅ weeklyShoppingList (object with categories)
   - ✅ progressTracking (object with goals/measurements/milestones)
   - ✅ foodCombinations (array)
   - ✅ tips (array)
   - ✅ summary (string)

### 3. View Plan in Browser
1. Copy the `stripe_session_id` from the subscriptions table
2. Go to: `http://localhost:3000/plan?subscription_id=YOUR_SESSION_ID`
3. Verify all tabs work:
   - ✅ **Meals tab**: Shows 7 days, click through days
   - ✅ **Exercise tab**: Shows routines, click through days
   - ✅ **Shopping List tab**: Shows categorized items with checkboxes
   - ✅ **Progress tab**: Shows goals, measurements, milestones
   - ✅ **Tips tab**: Shows DASH diet tips and food combos

## Test With Real Quiz Flow

### Optional: Full End-to-End Test
1. ✅ Go to http://localhost:3000
2. ✅ Click "Start Your Journey"
3. ✅ Complete the quiz (fill out all questions)
4. ✅ On results page, note that it shows BMI/calories quickly (no waiting)
5. ✅ Click a pricing plan
6. ✅ Use test card: `4242 4242 4242 4242`, any future date, any CVC
7. ✅ Complete checkout
8. ✅ Get redirected to success page
9. ✅ Click "Access My Plan"
10. ✅ Verify all 5 tabs work with personalized data

## Common Issues

### ❌ "No personalized plan found"
**Fix:** Wait 5-10 seconds after payment, then refresh. Plan generation is async.

### ❌ "Internal server error"
**Fix:** Check Terminal 1 for error logs. Common causes:
- Missing `SUPABASE_SERVICE_ROLE_KEY`
- Invalid `GEMINI_API_KEY` (check or remove to use fallback)
- Webhook secret mismatch

### ❌ Shopping list tab is empty
**Fix:** Check if `weeklyShoppingList` exists in Supabase data. Should be present in both AI and fallback plans.

### ❌ Webhook not being called
**Fix:**
- Verify Stripe CLI is running: `stripe listen...`
- Check port 3000 matches dev server
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly

## Success Criteria ✨

You're ready to deploy when:
- [x] Database migration completed
- [x] Test payment creates subscription
- [x] Personalized plan generates (AI or fallback)
- [x] Plan page displays all 5 tabs correctly
- [x] Shopping list shows ~50+ items in categories
- [x] Progress tracking shows 6 goals + milestones
- [x] No console errors
- [x] Plan loads in under 2 seconds

## Ready for Production?

Once all tests pass:
1. Set `GEMINI_API_KEY` in Vercel/production environment
2. Update Stripe webhook endpoint to your production URL
3. Deploy via `git push` (Vercel will auto-deploy)
4. Test one transaction in production with test mode
5. Switch to live mode when confident

---

**Need help?** Check `TESTING_GUIDE.md` for detailed troubleshooting.
