import type { WebviewApi } from "vscode-webview";

/**
 * A utility wrapper around the acquireVsCodeApi() function, which enables
 * message passing and state management between the webview and extension
 * contexts.
 *
 * This utility also enables webview code to be run in a web browser-based
 * dev server by using native web browser features that mock the functionality
 * enabled by acquireVsCodeApi.
 */
class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined;

  constructor() {
    // Check if the acquireVsCodeApi function exists in the current development
    // context (i.e. VS Code development window or web browser)
    if (typeof acquireVsCodeApi === "function") {
      this.vsCodeApi = acquireVsCodeApi();
    }
  }

  /**
   * Post a message (i.e. send arbitrary data) to the owner of the webview.
   *
   * @remarks When running webview code inside a web browser, postMessage will instead
   * log the given message to the console.
   *
   * @param message Abitrary data (must be JSON serializable) to send to the extension context.
   */
  public postMessage(message: unknown) {
    if (this.vsCodeApi) {
      this.vsCodeApi.postMessage(message);
    } else {
      console.log(message);
    }
  }

  /**
   * Get the persistent state stored for this webview.
   *
   * @remarks When running webview source code inside a web browser, getState will retrieve state
   * from local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
   *
   * @return The current state or `undefined` if no state has been set.
   */
  public getState(): unknown | undefined {
    if (this.vsCodeApi) {
      return this.vsCodeApi.getState();
    } else {
      const state = localStorage.getItem("vscodeState");
      return state ? JSON.parse(state) : undefined;
    }
  }

  /**
   * Set the persistent state stored for this webview.
   *
   * @remarks When running webview source code inside a web browser, setState will set the given
   * state using local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
   *
   * @param newState New persisted state. This must be a JSON serializable object. Can be retrieved
   * using {@link getState}.
   *
   * @return The new state.
   */
  public setState<T extends unknown | undefined>(newState: T): T {
    if (this.vsCodeApi) {
      return this.vsCodeApi.setState(newState);
    } else {
      localStorage.setItem("vscodeState", JSON.stringify(newState));
      return newState;
    }
  }

  public toast = {
    info: (message: string) => {
      vscode.postMessage({
        command: "showInformationMessage",
        text: message,
      });
    },
    success: (message: string) => {
      vscode.postMessage({
        command: "showInformationMessage",
        text: message,
      });
    },
    warning: (message: string) => {
      vscode.postMessage({
        command: "showWarningMessage",
        text: message,
      });
    },
    error: (message: string) => {
      vscode.postMessage({
        command: "showErrorMessage",
        text: message,
      });
    },
  };

  public isInVSCode(): boolean {
    return (
      typeof acquireVsCodeApi !== "undefined" ||
      (window.parent !== window &&
        document.referrer.includes("vscode-webview://"))
    );
  }
}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const vscode = new VSCodeAPIWrapper();

/**
 * Resolve an image `src` for use in the webview.
 *
 * - When running inside VS Code, prefer a CSS variable `--asset-root` injected
 *   by the extension (if present). The extension can set this to a webview
 *   asWebviewUri string so images are accessible.
 * - If the CSS variable isn't present, fall back to the legacy `vscode-resource:`
 *   scheme for paths that start with `/`.
 * - Otherwise return the original `src` (works for dev server/browser).
 */
export function getImageUri(src: string) {
  // If running inside VS Code webview
  if (vscode.isInVSCode()) {
    // Try an injected CSS variable that contains the asset root
    const assetRoot = getComputedStyle(document.documentElement)
      .getPropertyValue("--asset-root")
      ?.trim();
    console.log("---222---", assetRoot);
    if (assetRoot) {
      const cleaned = src.startsWith("/") ? src.slice(1) : src;
      // Ensure no duplicate slashes
      console.log(
        "---111---",
        assetRoot.replace(/\/+$/g, "") + "/" + cleaned.replace(/^\/+/, ""),
      );
      return assetRoot.replace(/\/+$/g, "") + "/" + cleaned.replace(/^\/+/, "");
    }

    // Fallback: legacy vscode-resource scheme for absolute paths
    if (src.startsWith("/")) {
      const cleanPath = src.slice(1);
      return `vscode-resource:${cleanPath}`;
    }
  }

  // Default: return as-is (dev server/public path)
  return src;
}
