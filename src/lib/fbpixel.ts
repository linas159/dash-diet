// Facebook Pixel tracking utility
// Pixel ID is read from NEXT_PUBLIC_FB_PIXEL_ID environment variable

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "";

// Declare fbq on window for TypeScript
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: (...args: unknown[]) => void;
  }
}

function isPixelReady(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cookie-consent") === "accepted";
}

// ─── Standard Events ───────────────────────────────────────────

export function trackPageView() {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("track", "PageView");
}

/** Landing page loaded — maps to FB standard ViewContent */
export function trackLandingPageView() {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("track", "ViewContent", {
    content_name: "Landing Page",
    content_category: "landing",
  });
}

/** Results page with BMI/plan — maps to FB standard ViewContent */
export function trackContentView(params: {
  bmi: number;
  dailyCalories: number;
  goal: string;
}) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("track", "ViewContent", {
    content_name: "Quiz Results",
    content_category: "results",
    content_type: "product",
    contents: [{ id: "dash_diet_plan", quantity: 1 }],
    ...params,
  });
}

/** Email captured after quiz completion — FB standard Lead */
export function trackLead(email: string) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("track", "Lead", {
    content_name: "Quiz Email Capture",
    content_category: "quiz",
    currency: "USD",
    value: 0,
  });
}

/** Checkout page loaded — FB standard InitiateCheckout */
export function trackInitiateCheckout(params: {
  planId: string;
  value: number;
  currency?: string;
}) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("track", "InitiateCheckout", {
    content_name: `DASH Diet ${params.planId} Plan`,
    content_category: "subscription",
    content_ids: [params.planId],
    num_items: 1,
    value: params.value,
    currency: params.currency || "USD",
  });
}

/** Successful purchase — FB standard Purchase */
export function trackPurchase(params: {
  planId: string;
  value: number;
  currency?: string;
  subscriptionId?: string;
}) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("track", "Purchase", {
    content_name: `DASH Diet ${params.planId} Plan`,
    content_category: "subscription",
    content_ids: [params.planId],
    content_type: "product",
    num_items: 1,
    value: params.value,
    currency: params.currency || "USD",
  });
}

// ─── Custom Events ─────────────────────────────────────────────

/** User clicks "Start Free Quiz" CTA on landing page */
export function trackQuizStartClick() {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "QuizStartClick", {
    source: "landing_page",
  });
}

/** Quiz page loaded — first question displayed */
export function trackQuizStart() {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "QuizStart", {
    total_questions: 25,
  });
}

/** Individual question answered — deep behavioral tracking */
export function trackQuestionAnswered(params: {
  questionId: string;
  questionIndex: number;
  section: string;
  totalQuestions: number;
}) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "QuestionAnswered", {
    question_id: params.questionId,
    question_number: params.questionIndex + 1,
    section: params.section,
    total_questions: params.totalQuestions,
    progress_pct: Math.round(
      ((params.questionIndex + 1) / params.totalQuestions) * 100
    ),
  });
}

/** Quiz section completed (About You, Goals, etc.) */
export function trackSectionCompleted(params: {
  section: string;
  sectionIndex: number;
}) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "QuizSectionCompleted", {
    section: params.section,
    section_index: params.sectionIndex,
  });
}

/** Email capture modal displayed */
export function trackEmailModalShown() {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "EmailModalShown", {
    source: "quiz_completion",
  });
}

/** Quiz fully completed (all questions answered + email) */
export function trackQuizCompleted(params: {
  totalQuestions: number;
  email?: string;
}) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "QuizCompleted", {
    total_questions: params.totalQuestions,
  });
}

/** User selects a pricing plan on results page */
export function trackPlanSelected(params: {
  planId: string;
  planName: string;
  price: number;
}) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "PlanSelected", {
    plan_id: params.planId,
    plan_name: params.planName,
    value: params.price,
    currency: "USD",
  });
}

/** User clicks "GET MY PLAN" CTA on results page */
export function trackCheckoutCTAClick(params: {
  planId: string;
  value: number;
}) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "CheckoutCTAClick", {
    plan_id: params.planId,
    value: params.value,
    currency: "USD",
  });
}

/** Payment form submitted (before Stripe confirms) */
export function trackPaymentSubmitted(params: {
  planId: string;
  value: number;
}) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "PaymentSubmitted", {
    plan_id: params.planId,
    value: params.value,
    currency: "USD",
  });
}

/** Payment failed — track drop-off reason */
export function trackPaymentFailed(params: {
  planId: string;
  errorMessage: string;
}) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "PaymentFailed", {
    plan_id: params.planId,
    error: params.errorMessage,
  });
}

/** User accesses their personalized plan post-purchase */
export function trackPlanAccessed(subscriptionId: string) {
  if (!isPixelReady() || !hasConsent()) return;
  window.fbq("trackCustom", "PlanAccessed", {
    subscription_id: subscriptionId,
  });
}
