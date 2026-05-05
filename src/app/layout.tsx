import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: { default: "Tejbir Tunnel Expert", template: "%s | Tejbir Tunnel Expert" },
  description: "Insights on Tunnel ELV, ITS, Traffic Management & Road Automation by Tejbir",
  keywords: ["tunnel ELV", "ITS", "traffic management", "road automation", "SCADA"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-tunnel-950 text-gray-100 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111620",
              color: "#e5e7eb",
              border: "1px solid #2e3e52",
            },
            success: { iconTheme: { primary: "#f59e0b", secondary: "#050708" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#050708" } },
          }}
        />
      </body>
    </html>
  );
}
