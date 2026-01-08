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
    console.log("", { initialTheme });
    return initialTheme || "light";
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "themeChanged") {
        console.log("handleMessage---->", event);
        setTheme(message.theme);

        // 更新 HTML 属性
        document.documentElement.setAttribute("data-theme", message.theme);

        // 更新 Tailwind 的 dark 类
        if (message.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    if (typeof acquireVsCodeApi !== "undefined") {
      const vscode = acquireVsCodeApi();
      vscode.postMessage({ command: "getTheme" });
    }

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
