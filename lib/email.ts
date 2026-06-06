/**
 * Sends a notification email via Resend (https://resend.com) using a plain
 * fetch — no SDK dependency. No-ops quietly if the env vars aren't set, so the
 * forms still work without email configured.
 *
 * Env:
 *   RESEND_API_KEY  — from resend.com (free tier)
 *   NOTIFY_EMAIL    — where notifications are sent
 *   NOTIFY_FROM     — optional "from" (defaults to Resend's onboarding sender,
 *                     which can only send to the Resend account owner's email)
 */
export async function sendNotification(
  subject: string,
  text: string,
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return; // email not configured — skip silently

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? "Sea Isle Eats <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
      }),
    });
  } catch {
    // Never let an email failure break the form submission.
  }
}
