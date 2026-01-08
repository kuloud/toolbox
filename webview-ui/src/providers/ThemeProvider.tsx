import React, { createContext, useContext } from "react";
import { useVSCodeTheme, Theme } from "../hooks/useVSCodeTheme";
import { ErrorBoundary } from "./ErrorBoundary";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useVSCodeTheme();

  // debug: expose theme in window and log
  (window as any).__THEME_DEBUG__ = theme;
  console.log("ThemeProvider render", theme);

  return (
    <ThemeContext.Provider value={theme}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
