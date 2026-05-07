import { getSiteSettings } from "@/lib/site-settings";
import LoginForm from "@/components/admin/LoginForm";

export default async function LoginPage() {
  const { siteName, logoUrl } = await getSiteSettings();
  return <LoginForm siteName={siteName} logoUrl={logoUrl} />;
}
