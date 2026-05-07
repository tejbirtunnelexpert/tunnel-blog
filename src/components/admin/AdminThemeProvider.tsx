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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme") as AdminTheme | null;
    if (saved && ["night-ops", "daylight", "amethyst"].includes(saved)) {
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  function setTheme(t: AdminTheme) {
    setThemeState(t);
    localStorage.setItem("admin-theme", t);
  }

  // Avoid flash: render with default theme before hydration
  if (!mounted) {
    return (
      <div data-admin-theme="night-ops" className="flex min-h-screen admin-theme-root">
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-admin-theme={theme} className="flex min-h-screen admin-theme-root">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
