import {
  ColorThemeKind,
  Disposable,
  Uri,
  ViewColumn,
  Webview,
  WebviewPanel,
  window,
} from "vscode";
import { getNonce } from "../utils/nonce";
import { getUri } from "../utils/uri";

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class ToolboxPanel {
  public static currentPanel: ToolboxPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  /**
   * The HelloWorldPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(
    panel: WebviewPanel,
    extensionUri: Uri,
    initialRoute?: string,
  ) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._updateTheme();

    // Set the HTML content for the webview panel (including initial route if provided)
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri,
      initialRoute,
    );

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);

    this._registerThemeListener();
  }

  private _registerThemeListener() {
    const themeDisposable = window.onDidChangeActiveColorTheme(() => {
      this._updateTheme();
    });
    this._disposables.push(themeDisposable);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri, initialRoute?: string) {
    if (ToolboxPanel.currentPanel) {
      // If the webview panel already exists reveal it
      ToolboxPanel.currentPanel._panel.reveal(ViewColumn.One);

      // If an initial route is provided, instruct the webview to navigate to it
      if (initialRoute) {
        ToolboxPanel.currentPanel._panel.webview.postMessage({
          command: "navigate",
          route: initialRoute,
        });
      }
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "open",
        // Panel title
        "Dev Toolbox",
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          localResourceRoots: [Uri.joinPath(extensionUri, "out")],
        },
      );

      ToolboxPanel.currentPanel = new ToolboxPanel(
        panel,
        extensionUri,
        initialRoute,
      );
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    ToolboxPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel?.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables?.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable?.dispose();
      }
    }
  }

  private _updateTheme() {
    if (!this._panel) {
      return;
    }

    const theme = window.activeColorTheme.kind;
    const themeName = this._getThemeName(theme);

    this._panel.webview.postMessage({
      command: "themeChanged",
      theme: themeName,
      themeKind: theme,
    });
  }

  private _getThemeName(themeKind: ColorThemeKind): string {
    switch (themeKind) {
      case ColorThemeKind.Light:
        return "light";
      case ColorThemeKind.Dark:
        return "dark";
      case ColorThemeKind.HighContrast:
        return "dark";
      case ColorThemeKind.HighContrastLight:
        return "light";
      default:
        return "dark";
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(
    webview: Webview,
    extensionUri: Uri,
    initialRoute?: string,
  ) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, [
      "out",
      "assets",
      "index.css",
    ]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "out",
      "assets",
      "index.js",
    ]);

    const nonce = getNonce();

    const currentTheme = this._getThemeName(window.activeColorTheme.kind);

    console.log("[_getWebviewContent]", {
      __INITIAL_DATA__: JSON.stringify({
        route: initialRoute,
        viewType: this._panel.viewType,
        initialTheme: currentTheme,
      }),
    });

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Dev Toolbox</title>
        </head>
        <body>
          <div id="root"></div>
          <script nonce="${nonce}">window.__INITIAL_DATA__ = ${JSON.stringify({ route: initialRoute, viewType: this._panel.viewType, initialTheme: currentTheme })};</script>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        console.log("[onDidReceiveMessage]", { message });
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "showInformationMessage":
            window.showInformationMessage(text);
            break;
          case "showWarningMessage":
            window.showWarningMessage(text);
            break;
          case "showErrorMessage":
            window.showErrorMessage(text);
            break;
          case "getTheme":
            this._updateTheme();
            break;
        }
      },
      undefined,
      this._disposables,
    );
  }
}
