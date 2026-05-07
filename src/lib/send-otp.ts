/**
 * OTP sending utilities.
 *
 * EMAIL — Gmail SMTP (recommended, no domain needed):
 *   1. Go to myaccount.google.com → Security → 2-Step Verification (enable it)
 *   2. Then go to myaccount.google.com → Security → App Passwords
 *   3. Create an app password for "Mail"
 *   4. Add to Vercel env vars:
 *        GMAIL_USER=yourgmail@gmail.com
 *        GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  (the 16-char app password)
 *
 * SMS (India) — Fast2SMS (free):
 *   1. Sign up at fast2sms.com
 *   2. Get API key from dashboard
 *   3. Add to Vercel env vars:
 *        FAST2SMS_API_KEY=your_key_here
 *
 * Without keys: OTPs are shown on screen for manual entry (current behaviour).
 */

import nodemailer from "nodemailer";

export async function sendEmailOTP(
  email: string,
  otp: string,
  name: string
): Promise<{ ok: boolean; dev?: boolean }> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.log(`[EMAIL OTP] To: ${email} | OTP: ${otp}`);
    return { ok: true, dev: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"Tejbir Tunnel Expert" <${gmailUser}>`,
      to: email,
      subject: "Your Membership OTP – Tejbir Tunnel Expert",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f1623;color:#fff;padding:32px;border-radius:12px;border:1px solid #2a3444">
          <div style="font-size:20px;font-weight:bold;margin-bottom:8px">
            Tejbir <span style="color:#f59e0b">Tunnel Expert</span>
          </div>
          <hr style="border-color:#2a3444;margin:16px 0"/>
          <p style="color:#94a3b8;margin:0 0 8px">Hi <strong style="color:#fff">${name}</strong>,</p>
          <p style="color:#94a3b8;margin:0 0 20px">Your email verification OTP is:</p>
          <div style="font-size:48px;font-weight:bold;letter-spacing:16px;color:#f59e0b;margin:0 0 24px;text-align:center;background:#111827;padding:20px;border-radius:8px">
            ${otp}
          </div>
          <p style="color:#64748b;font-size:13px;margin:0">This OTP expires in 15 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    return { ok: true };
  } catch (e) {
    console.error("Gmail OTP send failed:", e);
    return { ok: false };
  }
}

export async function sendSMSOTP(
  mobile: string,
  otp: string
): Promise<{ ok: boolean; dev?: boolean; error?: string }> {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    console.log(`[SMS OTP] To: ${mobile} | OTP: ${otp}`);
    return { ok: true, dev: true };
  }

  try {
    // Strip country code if present (+91 or 91 prefix), remove spaces/dashes
    const number = mobile.replace(/^\+?91/, "").replace(/[\s\-]/g, "");
    console.log(`[Fast2SMS] Sending OTP ${otp} to ${number}`);

    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${otp}&flash=0&numbers=${number}`;
    const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
    const body = await res.json();

    console.log("[Fast2SMS] Response:", JSON.stringify(body));

    if (!body.return) {
      console.error("Fast2SMS error:", body);
      // Return error message so it can be surfaced to user
      return { ok: false, error: body.message?.join?.(", ") || JSON.stringify(body) };
    }
    return { ok: true };
  } catch (e) {
    console.error("SMS OTP send failed:", e);
    return { ok: false, error: String(e) };
  }
}
