// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ToolboxTreeDataProvider } from "./providers/toolbox-tree-data-provider";
import { ToolboxPanel } from "./panels/toolbox-panel";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "toolbox" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "toolbox.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from toolbox!");
      ToolboxPanel.render(context.extensionUri);
    },
  );

  // Command to open a specific tool in the webview and navigate to its route
  const openToolDisposable = vscode.commands.registerCommand(
    "toolbox.open",
    (toolId: string) => {
      if (!toolId) {
        return;
      }
      const route = `/view/${toolId}`;
      ToolboxPanel.render(context.extensionUri, route);
    }
  );

  const treeDataProvider = new ToolboxTreeDataProvider(context);

  const treeView = vscode.window.createTreeView("toolbox-view", {
    treeDataProvider,
    showCollapseAll: true,
  });

  context.subscriptions.push(treeView, disposable, openToolDisposable);}

// This method is called when your extension is deactivated
export function deactivate() {}
