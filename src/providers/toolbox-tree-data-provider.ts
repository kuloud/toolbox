import * as vscode from "vscode";
import { ToolItem } from "../types/tree-item";

export class ToolboxTreeDataProvider
  implements vscode.TreeDataProvider<ToolItem>
{
  private toolboxData: ToolItem[] = [];

  private _onDidChangeTreeData: vscode.EventEmitter<
    ToolItem | undefined | null | void
  > = new vscode.EventEmitter<ToolItem | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    ToolItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {
    this.loadToolboxData();
  }

  getTreeItem(element: ToolItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(
    element?: ToolItem | undefined
  ): vscode.ProviderResult<ToolItem[]> {
    if (element) {
      return Promise.resolve(element.children || []);
    } else {
      return Promise.resolve(this.toolboxData);
    }
  }
  getParent?(element: ToolItem): vscode.ProviderResult<ToolItem> {
    for (const category of this.toolboxData) {
      if (category.children?.some((child) => child.id === element.id)) {
        return category;
      }
    }
    return undefined;
  }
  resolveTreeItem?(
    item: vscode.TreeItem,
    element: ToolItem,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TreeItem> {
    return element;
  }

  private loadToolboxData() {
    this.toolboxData = [
      {
        id: "converters",
        label: "Converters",
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        contextValue: "category",
        children: [
          {
            id: "json-yaml",
            label: "JSON - YAML",
            // iconPath: new vscode.ThemeIcon("arrow-swap"),
            iconPath: this.getToolIconPath("horizontal-arrows-symbolic"),
            contextValue: "tool",
          },
        ],
      },
    ];
  }

  private getToolIconPath(iconName: string): vscode.IconPath | undefined {
    return this.getIconPath("tools", iconName);
  }

  private getIconPath(
    path: string,
    iconName: string
  ): vscode.IconPath | undefined {
    try {
      const fileName = iconName.endsWith(".svg") ? iconName : `${iconName}.svg`;
      const lightIconPath = vscode.Uri.joinPath(
        this.context.extensionUri,
        "media",
        "icons",
        path,
        "light",
        fileName
      );
      const darkIconPath = vscode.Uri.joinPath(
        this.context.extensionUri,
        "media",
        "icons",
        path,
        "dark",
        fileName
      );
      return {
        light: lightIconPath,
        dark: darkIconPath,
      };
    } catch (error) {
      console.warn(`Could not load icon ${iconName}:`, error);
      return undefined;
    }
  }
}
