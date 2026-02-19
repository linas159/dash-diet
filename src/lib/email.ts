import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "DashDiet <noreply@trydashdiet.com>";
const SUPPORT_EMAIL = "support@trydashdiet.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://trydashdiet.com";

// ─── Welcome + Plan Link Email ───────────────────────────────────────────────
export async function sendWelcomeEmail(
  email: string,
  subscriptionId: string,
  planName?: string
) {
  const planUrl = `${APP_URL}/plan?subscription_id=${subscriptionId}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to DashDiet — Your Personalized Plan Is Ready!",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#1e3a5f;font-size:24px;margin:0;">DashDiet</h1>
    </div>

    <!-- Main Card -->
    <div style="background:#ffffff;border-radius:16px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;">
          ✓
        </div>
      </div>

      <h2 style="color:#111827;font-size:20px;text-align:center;margin:0 0 8px 0;">
        Welcome to Your DASH Journey!
      </h2>
      <p style="color:#6b7280;font-size:14px;text-align:center;margin:0 0 24px 0;line-height:1.6;">
        Your payment was successful${planName ? ` for the ${planName}` : ""}. Your personalized DASH diet plan has been created based on your quiz answers.
      </p>

      <!-- What's Included -->
      <div style="background:#eff6ff;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="color:#1e3a5f;font-size:13px;font-weight:600;margin:0 0 12px 0;">Your plan includes:</p>
        <div style="color:#374151;font-size:13px;line-height:2;">
          🍽️ Personalized daily meal plans<br>
          🏃 Custom exercise routines<br>
          🛒 Weekly shopping lists<br>
          🥗 Powerful food combinations<br>
          📊 Progress tracking tools
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:16px;">
        <a href="${planUrl}" style="display:inline-block;background:#1e3a5f;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px;">
          Access My Plan →
        </a>
      </div>

      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
        Bookmark this link — you can access your plan anytime.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;padding-top:16px;">
      <p style="color:#9ca3af;font-size:11px;margin:0 0 8px 0;">
        Questions? Reply to this email or contact us at ${SUPPORT_EMAIL}
      </p>
      <p style="color:#d1d5db;font-size:11px;margin:0;">
        © ${new Date().getFullYear()} DashDiet. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return { success: false, error };
    }

    console.log(`✅ Welcome email sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.error("Welcome email error:", err);
    return { success: false, error: err };
  }
}

// ─── Cancellation Confirmation Email ─────────────────────────────────────────
export async function sendCancellationEmail(
  email: string,
  cancelDate?: string
) {
  const formattedDate = cancelDate
    ? new Date(cancelDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Your DashDiet Subscription Has Been Cancelled",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#1e3a5f;font-size:24px;margin:0;">DashDiet</h1>
    </div>

    <!-- Main Card -->
    <div style="background:#ffffff;border-radius:16px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color:#111827;font-size:20px;text-align:center;margin:0 0 8px 0;">
        Subscription Cancelled
      </h2>
      <p style="color:#6b7280;font-size:14px;text-align:center;margin:0 0 24px 0;line-height:1.6;">
        We're sorry to see you go. Your subscription has been cancelled and you will not be charged again.
      </p>

      ${
        formattedDate
          ? `
      <div style="background:#fefce8;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="color:#854d0e;font-size:13px;text-align:center;margin:0;line-height:1.6;">
          <strong>You still have access</strong> to your plan until <strong>${formattedDate}</strong>. After that date, your plan will no longer be available.
        </p>
      </div>
      `
          : ""
      }

      <p style="color:#6b7280;font-size:14px;text-align:center;margin:0 0 24px 0;line-height:1.6;">
        If you change your mind, you can always resubscribe by taking the quiz again at our website.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;">
        <a href="${APP_URL}" style="display:inline-block;background:#1e3a5f;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px;">
          Visit DashDiet
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;padding-top:16px;">
      <p style="color:#9ca3af;font-size:11px;margin:0 0 8px 0;">
        Questions? Contact us at ${SUPPORT_EMAIL}
      </p>
      <p style="color:#d1d5db;font-size:11px;margin:0;">
        © ${new Date().getFullYear()} DashDiet. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Failed to send cancellation email:", error);
      return { success: false, error };
    }

    console.log(`✅ Cancellation email sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.error("Cancellation email error:", err);
    return { success: false, error: err };
  }
}
