import { getSiteSettings } from "@/lib/site-settings";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: import("next").Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const { siteName, logoUrl } = await getSiteSettings();
  return <LoginForm siteName={siteName} logoUrl={logoUrl} />;
}
