/**
 * OTP sending utilities.
 *
 * Email: Set RESEND_API_KEY + RESEND_FROM_EMAIL in Vercel env vars
 *   → Sign up free at resend.com
 *
 * SMS (India): Set FAST2SMS_API_KEY in Vercel env vars
 *   → Sign up free at fast2sms.com
 *
 * Without keys: OTPs are logged to console and returned in API response
 * so you can test immediately without external setup.
 */

export async function sendEmailOTP(email: string, otp: string, name: string): Promise<{ ok: boolean; dev?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[EMAIL OTP] To: ${email} | OTP: ${otp}`);
    return { ok: true, dev: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: email,
        subject: "Your Membership OTP – Tejbir Tunnel Expert",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f1623;color:#fff;padding:32px;border-radius:12px">
            <div style="font-size:20px;font-weight:bold;margin-bottom:8px">
              Tejbir <span style="color:#f59e0b">Tunnel Expert</span>
            </div>
            <hr style="border-color:#2a3444;margin:16px 0"/>
            <p style="color:#94a3b8">Hi <strong style="color:#fff">${name}</strong>,</p>
            <p style="color:#94a3b8">Your email verification OTP is:</p>
            <div style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#f59e0b;margin:24px 0;text-align:center">${otp}</div>
            <p style="color:#64748b;font-size:13px">This OTP expires in 15 minutes. Do not share it with anyone.</p>
          </div>
        `,
      }),
    });
    return { ok: res.ok };
  } catch (e) {
    console.error("Email OTP send failed:", e);
    return { ok: false };
  }
}

export async function sendSMSOTP(mobile: string, otp: string): Promise<{ ok: boolean; dev?: boolean }> {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    console.log(`[SMS OTP] To: ${mobile} | OTP: ${otp}`);
    return { ok: true, dev: true };
  }

  try {
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${otp}&flash=0&numbers=${mobile}`;
    const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
    return { ok: res.ok };
  } catch (e) {
    console.error("SMS OTP send failed:", e);
    return { ok: false };
  }
}
