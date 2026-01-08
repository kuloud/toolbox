// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ToolboxPanel } from "./panels/toolbox-panel";
import { ToolboxTreeDataProvider } from "./providers/toolbox-tree-data-provider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "toolbox" is now active!');

  // Command to open a specific tool in the webview and navigate to its route
  const openToolDisposable = vscode.commands.registerCommand(
    "toolbox.open",
    (toolId: string) => {
      console.log("[openTool]", { toolId });
      if (!toolId) {
        ToolboxPanel.render(context.extensionUri, "/");
        return;
      }
      const route = `/view/${toolId}`;
      ToolboxPanel.render(context.extensionUri, route);
    },
  );

  const treeDataProvider = new ToolboxTreeDataProvider(context);

  const treeView = vscode.window.createTreeView("toolbox-view", {
    treeDataProvider,
    showCollapseAll: true,
  });

  context.subscriptions.push(treeView, openToolDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
