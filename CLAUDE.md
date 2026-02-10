# CLAUDE.md - DASH Diet App

## Project Overview
A DASH diet SaaS web app with an interactive quiz, AI-powered meal plan generation, and Stripe subscription checkout. Mobile-first design (max-width 428px).

## Tech Stack
- **Framework:** Next.js 15.1 (App Router) + React 19 + TypeScript 5.7
- **Styling:** Tailwind CSS 3.4 with custom DASH color palette
- **State:** Zustand 5.0 (client-side quiz state)
- **Animations:** Framer Motion 11.15
- **Database:** Supabase (PostgreSQL with RLS)
- **Payments:** Stripe (subscriptions)
- **AI:** Google Gemini 2.0 Flash (optional, has comprehensive fallback)

## Commands
```bash
npm run dev      # Dev server on port 3000
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint
```

## Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts                    # Stripe checkout session
│   │   ├── generate-plan/route.ts               # Quick BMI/calorie calculation
│   │   ├── generate-personalized-plan/route.ts  # Post-purchase AI plan (Gemini)
│   │   ├── get-plan/route.ts                    # Retrieve personalized plan
│   │   └── webhook/route.ts                     # Stripe webhook + plan trigger
│   ├── checkout/
│   │   ├── page.tsx                # Redirect loading page
│   │   └── success/page.tsx        # Post-checkout confirmation
│   ├── quiz/page.tsx               # Multi-step quiz (20+ questions)
│   ├── results/page.tsx            # BMI results + pricing plans
│   ├── page.tsx                    # Marketing landing page
│   ├── layout.tsx                  # Root layout (Inter font)
│   └── globals.css                 # Tailwind layers + custom utilities
├── components/
│   ├── QuestionRenderer.tsx        # Dynamic form (9+ input types)
│   ├── QuizHeader.tsx              # Nav with back button
│   ├── ProgressBar.tsx             # Animated progress
│   ├── CountdownTimer.tsx          # Offer expiry timer
│   └── LoadingAnalysis.tsx         # Plan generation animation
├── data/questions.ts               # Quiz questions & branching logic
├── lib/
│   ├── store.ts                    # Zustand store (answers, plan, step)
│   ├── supabase.ts                 # Supabase client init
│   ├── stripe.ts                   # Stripe loader
│   └── utils.ts                    # BMI, calorie, projection calculations
└── types/quiz.ts                   # TypeScript interfaces
```

## Key Patterns
- **Path alias:** `@/*` maps to `./src/*`
- **Client components:** Quiz pages use `"use client"` with Zustand for state
- **API routes:** Server-side only, use `SUPABASE_SERVICE_ROLE_KEY` for DB writes
- **Calorie calculation:** Mifflin-St Jeor equation with activity multipliers
- **Plan generation:** Post-purchase via Gemini 2.0 Flash API (8000 tokens), comprehensive fallback if no API key
- **Styling:** Tailwind utilities + custom classes in globals.css (btn-primary, option-card, glass-card, gradient-text)
- **Custom colors:** dash-blue (#1e3a5f), dash-teal (#0d9488), dash-green (#16a34a)
- **Animations:** Framer Motion AnimatePresence for page/question transitions

## Database (Supabase)
- **quiz_results:** id, email, answers (JSONB), bmi, daily_calories, plan (JSONB) [legacy]
- **subscriptions:** id, stripe_session_id, stripe_customer_id, email, status, quiz_answers (JSONB), personalized_plan (JSONB) [primary storage]
- **personalized_plan structure:** mealPlan, exercisePlan, weeklyShoppingList, foodCombinations, progressTracking, tips, summary
- RLS enabled; anonymous insert for quiz, service role for full access

## Environment Variables
Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`
Server: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_QUARTERLY`, `STRIPE_PRICE_ANNUAL`, `GEMINI_API_KEY` (optional - recommended for AI-powered personalized plans)

## User Flow
1. Landing page → Start quiz
2. 20+ step quiz (Zustand state) → Email capture
3. POST /api/generate-plan → Quick BMI + calorie calculation only (no AI yet)
4. Results page with pricing (monthly $29.99 / quarterly $19.99/mo / annual $9.99/mo)
5. POST /api/checkout → Stripe hosted checkout
6. Stripe webhook → subscription stored + triggers POST /api/generate-personalized-plan
7. Gemini API generates comprehensive plan → saved to subscriptions.personalized_plan
8. User accesses plan at /plan?subscription_id=xxx → displays meals, exercises, shopping list, progress tracking, tips

## Testing
No test framework configured. No automated tests.

## Deployment
Deployed on Vercel. Config in vercel.json (build: npm run build, output: .next).
