import { vscode } from "@/lib/vscode";
import { useState, useEffect, useCallback } from "react";

export type Theme = "light" | "dark";

interface ThemeContext {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

export function useVSCodeTheme(): ThemeContext {
  const [theme, setTheme] = useState<Theme>(() => {
    const initialTheme = (window as any).__INITIAL_DATA__?.initialTheme;
    console.log("[useVSCodeTheme]", { initialTheme });
    return initialTheme || "light";
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "themeChanged") {
        handleSetTheme(message.theme);
      }
    };

    window.addEventListener("message", handleMessage);

    vscode.postMessage({ command: "getTheme" });

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleSetTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    setTheme: handleSetTheme,
  };
}
