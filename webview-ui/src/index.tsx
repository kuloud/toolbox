import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./providers/ThemeProvider";

// If the extension injects an initial route or viewType, use it to set the initial hash route
const initialData = (window as any).__INITIAL_DATA__ || {};
const initialRoute =
  initialData.route ||
  (initialData.viewType ? `/view/${initialData.viewType}` : undefined);
if (initialRoute && !location.hash) {
  location.hash = initialRoute;
}

// Listen for messages from the extension (e.g., navigation requests)
window.addEventListener("message", (event: MessageEvent) => {
  const message = event.data;
  if (message?.command === "navigate" && message.route) {
    location.hash = message.route;
  }
});

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
