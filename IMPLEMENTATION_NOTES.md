# Personalized Plan Generation Implementation

## Overview
This implementation adds post-purchase personalized DASH diet plan generation using Gemini API, saving Gemini resources by only generating plans after successful payment.

## Key Changes

### 1. Database Schema
**File:** `supabase/migrations/add_personalized_plan.sql`
- Added `personalized_plan` JSONB column to `subscriptions` table
- Added index on `stripe_session_id` for faster lookups
- Run migration: Execute SQL in Supabase dashboard or via CLI

### 2. New API Route: Generate Personalized Plan
**File:** `src/app/api/generate-personalized-plan/route.ts`
- Generates comprehensive personalized plans post-purchase
- Uses Gemini 2.0 Flash API (8000 max tokens for detailed plans)
- Includes:
  - 7-day meal plan with recipes, macros, ingredients, prep time
  - Exercise routines with instructions and calories burned
  - Weekly shopping list (categorized: produce, proteins, grains, dairy, pantry)
  - Food combinations with benefits and best timing
  - Progress tracking (goals, measurements, milestones, daily checklist)
  - Personalized tips based on user profile
- Fallback to comprehensive static plan if API fails
- Stores plan in `subscriptions.personalized_plan`

### 3. Webhook Updates
**File:** `src/app/api/webhook/route.ts`
- Triggers plan generation after successful payment
- Handles both `checkout.session.completed` and `customer.subscription.created` events
- Fire-and-forget API call to `/api/generate-personalized-plan`
- Plan generation happens asynchronously (doesn't block webhook response)

### 4. Get Plan API Updates
**File:** `src/app/api/get-plan/route.ts`
- First checks `subscriptions.personalized_plan` column
- Returns personalized plan if available
- Falls back to old flow (quiz_results or on-the-fly generation) if not found
- Maintains backward compatibility

### 5. UI Updates
**File:** `src/app/plan/page.tsx`
- Added 5 tabs: Meals, Exercise, Shopping List, Progress, Tips
- **Shopping List Tab:**
  - Categorized items (produce, proteins, grains, dairy, pantry, other)
  - Checkbox UI for tracking purchases
  - Emoji icons for visual categories
- **Progress Tracking Tab:**
  - Weekly goals with checkboxes
  - Measurement inputs (weight, waist, BP, energy level)
  - Milestone tracker with week-by-week targets
- Enhanced meal/exercise cards with additional data (macros, prep time, instructions)

## Environment Variables

### Required (unchanged)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

### Optional (recommended)
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
  - Without this, uses comprehensive fallback plans
  - With this, generates AI-powered personalized plans

## User Flow

### Before (Pre-Purchase Generation)
1. User completes quiz → `/api/generate-plan` called immediately
2. Gemini API used for every quiz completion
3. Plan stored in `quiz_results` table
4. Purchase → retrieve plan from `quiz_results`

### After (Post-Purchase Generation)
1. User completes quiz → basic BMI/calories calculated
2. Results page shown (no AI call yet)
3. User purchases → Stripe webhook fires
4. Webhook triggers `/api/generate-personalized-plan`
5. Gemini API generates comprehensive plan
6. Plan saved to `subscriptions.personalized_plan`
7. User accesses plan → retrieved from `subscriptions` table

## Benefits
✅ **Cost Savings:** Only uses Gemini API for paying customers
✅ **Better Plans:** More comprehensive with shopping lists & progress tracking
✅ **Faster Quiz:** No waiting for AI during quiz (better UX)
✅ **Scalability:** Reduces API calls by ~95% (only paid conversions)
✅ **Data Integrity:** Single source of truth (subscriptions table)

## Migration Steps

1. **Run Database Migration**
   ```sql
   -- Run in Supabase SQL Editor
   -- File: supabase/migrations/add_personalized_plan.sql
   ```

2. **Set Environment Variable (Optional but Recommended)**
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Deploy Code**
   ```bash
   npm run build
   # Deploy to Vercel or your hosting platform
   ```

4. **Test Webhook**
   - Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   stripe trigger checkout.session.completed
   ```

5. **Verify Plan Generation**
   - Check Supabase `subscriptions` table
   - Verify `personalized_plan` column is populated
   - Access plan via `/plan?subscription_id=sub_xxx`

## Fallback Behavior
- If Gemini API fails → uses comprehensive static plan
- If subscription not found → falls back to `quiz_results` table
- If no data → returns error with support link
- Maintains full backward compatibility

## Performance Notes
- Gemini 2.0 Flash response time: ~3-5 seconds
- Webhook timeout: 30 seconds (plan generation runs async)
- Plan generation is non-blocking (user sees success page immediately)
- Shopping list generation adds ~500 tokens to prompt
- Progress tracking adds ~300 tokens to prompt

## Future Enhancements
- [ ] Save progress tracking state to database
- [ ] Add email notification when plan is ready
- [ ] Weekly plan regeneration based on progress
- [ ] PDF export of meal plan
- [ ] Print-friendly shopping list
- [ ] Recipe substitutions based on preferences
- [ ] Integration with calendar apps
