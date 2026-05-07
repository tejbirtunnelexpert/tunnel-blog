import { getSiteSettings } from "@/lib/site-settings";
import ContactForm from "@/components/contact/ContactForm";
import { MapPin, Mail, Phone } from "lucide-react";

export const metadata: import("next").Metadata = {
  title: "Contact Us",
  description: "Get in touch with Tejbir Singh Dhillon — Tunnel ELV & Automation specialist.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { contactOwnerName, contactAddress, contactPublicEmail, contactPhone } = settings;

  const hasContactInfo = contactOwnerName || contactAddress || contactPublicEmail || contactPhone;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Page heading */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="w-1 h-8 bg-signal-amber rounded-full inline-block" />
          Contact Us
        </h1>
        <p className="text-gray-400 mt-2 ml-4">
          Get in touch — we&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column — contact info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="tunnel-card p-6 space-y-5">
            {hasContactInfo ? (
              <>
                {contactOwnerName && (
                  <div>
                    <h2 className="text-lg font-semibold text-white">{contactOwnerName}</h2>
                  </div>
                )}

                {contactAddress && (
                  <div className="flex items-start gap-3 text-gray-400">
                    <MapPin className="w-4 h-4 text-signal-amber shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed whitespace-pre-line">{contactAddress}</p>
                  </div>
                )}

                {contactPublicEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-signal-amber shrink-0" />
                    <a
                      href={`mailto:${contactPublicEmail}`}
                      className="text-sm text-gray-400 hover:text-signal-amber transition-colors"
                    >
                      {contactPublicEmail}
                    </a>
                  </div>
                )}

                {contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-signal-amber shrink-0" />
                    <a
                      href={`tel:${contactPhone}`}
                      className="text-sm text-gray-400 hover:text-signal-amber transition-colors"
                    >
                      {contactPhone}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Contact information will be added soon.</p>
            )}
          </div>
        </div>

        {/* Right column — contact form */}
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
