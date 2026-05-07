"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type AdminTheme = "night-ops" | "daylight" | "amethyst";

interface ThemeContextType {
  theme: AdminTheme;
  setTheme: (t: AdminTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "night-ops",
  setTheme: () => {},
});

export function useAdminTheme() {
  return useContext(ThemeContext);
}

export default function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>("night-ops");

  useEffect(() => {
    // Read the current theme from the html element (set server-side via cookie)
    const current = document.documentElement.dataset.siteTheme as AdminTheme;
    if (current && ["night-ops", "daylight", "amethyst"].includes(current)) {
      setThemeState(current);
    }
  }, []);

  async function setTheme(t: AdminTheme) {
    setThemeState(t);
    // Instantly update html attribute so entire page (admin + public previews) updates
    document.documentElement.dataset.siteTheme = t;
    // Persist via cookie so SSR picks it up on next load
    await fetch("/api/admin/set-theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: t }),
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
