import * as vscode from "vscode";
import { ToolItem } from "../types/tree-item";
import { getToolIconPath } from "../utils/icon";

export class ToolboxTreeDataProvider implements vscode.TreeDataProvider<ToolItem> {
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
    element?: ToolItem | undefined,
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
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.TreeItem> {
    return element || item;
  }

  private loadToolboxData() {
    this.toolboxData = [
      {
        id: "converters",
        label: "Converters",
        contextValue: "category",
        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        children: [
          {
            id: "json-yaml",
            label: "JSON - YAML",
            iconPath: getToolIconPath(
              this.context,
              "horizontal-arrows-symbolic",
            ),
            contextValue: "tool",
            command: {
              command: "toolbox.open",
              title: "JSON - YAML",
              arguments: ["json-yaml"],
            },
          },
          {
            id: "timestamp",
            label: "Timestamp",
            iconPath: getToolIconPath(this.context, "calendar-symbolic"),
            contextValue: "tool",
            command: {
              command: "toolbox.open",
              title: "Timestamp",
              arguments: ["timestamp"],
            },
          },
        ],
      },
      {
        id: "graphics",
        label: "Graphics",
        contextValue: "category",
        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        children: [
          {
            id: "graphics-color-converter",
            label: "Color",
            iconPath: getToolIconPath(this.context, "color-symbolic"),
            contextValue: "tool",
            command: {
              command: "toolbox.open",
              title: "Color",
              arguments: ["graphics-color-converter"],
            },
          },
          {
            id: "image-converter",
            label: "Image Format Converter",
            iconPath: getToolIconPath(this.context, "image-symbolic"),
            contextValue: "tool",
            command: {
              command: "toolbox.open",
              title: "JSON - YAML",
              arguments: ["image-converter"],
            },
          },
        ],
      },
      {
        id: "generators",
        label: "Generators",
        contextValue: "category",
        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        children: [
          {
            id: "generators-uuid",
            label: "UUID",
            iconPath: getToolIconPath(this.context, "fingerprint"),
            contextValue: "tool",
            command: {
              command: "toolbox.open",
              title: "UUID",
              arguments: ["generators-uuid"],
            },
          },
        ],
      },
    ];
  }
}
