import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const settings = await getSiteSettings();
  // NOTE: contactNotifyEmail is NOT returned publicly — it's admin-only
  return NextResponse.json({
    siteName: settings.siteName,
    logoUrl: settings.logoUrl,
    contactOwnerName: settings.contactOwnerName,
    contactAddress: settings.contactAddress,
    contactPublicEmail: settings.contactPublicEmail,
    contactPhone: settings.contactPhone,
  });
}
