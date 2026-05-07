/*
 * SQL to create the contact_messages table — run manually in Supabase SQL editor:
 *
 * CREATE TABLE contact_messages (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   name text NOT NULL,
 *   email text NOT NULL,
 *   subject text,
 *   message text NOT NULL,
 *   created_at timestamptz DEFAULT now(),
 *   read boolean DEFAULT false
 * );
 * ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Admin can do everything" ON contact_messages
 *   USING (auth.role() = 'authenticated')
 *   WITH CHECK (auth.role() = 'authenticated');
 * CREATE POLICY "Anyone can insert" ON contact_messages FOR INSERT
 *   WITH CHECK (true);
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

// Simple in-memory rate limiter: 1 submission per IP per 60 seconds
const rateLimitMap = new Map<string, number>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < 60_000) return true;
  rateLimitMap.set(ip, now);
  // Clean up old entries occasionally
  if (rateLimitMap.size > 500) {
    for (const [key, ts] of rateLimitMap.entries()) {
      if (now - ts > 60_000) rateLimitMap.delete(key);
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before trying again." },
      { status: 429 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  // Validation
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanSubject = (subject || "").trim();
  const cleanMessage = message.trim();

  const supabase = await createClient();

  // Save to contact_messages table
  try {
    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject || null,
      message: cleanMessage,
    });

    if (insertError) {
      console.error("contact_messages insert error:", insertError);
      return NextResponse.json({ error: "Failed to save your message. Please try again." }, { status: 500 });
    }
  } catch (err) {
    console.error("contact_messages insert exception:", err);
    return NextResponse.json({ error: "Failed to save your message. Please try again." }, { status: 500 });
  }

  // Fetch notify email from site_settings
  try {
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "contact_notify_email")
      .single();

    const notifyEmail = settingsData?.value;

    if (notifyEmail) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Contact Form <onboarding@resend.dev>",
        to: [notifyEmail],
        subject: `New Contact Form Message: ${cleanSubject || "(no subject)"}`,
        html: `
          <h2>New message from your website contact form</h2>
          <p><strong>From:</strong> ${cleanName} (${cleanEmail})</p>
          <p><strong>Subject:</strong> ${cleanSubject || "—"}</p>
          <hr/>
          <p>${cleanMessage.replace(/\n/g, "<br/>")}</p>
          <hr/>
          <p style="color:#888;font-size:12px">Sent from your website contact form</p>
        `,
        replyTo: cleanEmail,
      });
    }
  } catch (err) {
    // Email failure should not block the success response — message is already saved
    console.error("Failed to send notification email:", err);
  }

  return NextResponse.json({ ok: true });
}
