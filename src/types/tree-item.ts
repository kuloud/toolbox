import * as vscode from "vscode";

export interface ToolItem extends vscode.TreeItem {
  children?: ToolItem[];
}
