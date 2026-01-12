import * as vscode from "vscode";

export function getToolIconPath(
  context: vscode.ExtensionContext,
  iconName: string,
): vscode.IconPath | undefined {
  return getIconPath(context, "tools", iconName);
}

export function getIconPath(
  context: vscode.ExtensionContext,
  path: string,
  iconName: string,
): vscode.IconPath | undefined {
  try {
    const fileName = iconName.endsWith(".svg") ? iconName : `${iconName}.svg`;
    const lightIconPath = vscode.Uri.joinPath(
      context.extensionUri,
      "media",
      "icons",
      path,
      "light",
      fileName,
    );
    const darkIconPath = vscode.Uri.joinPath(
      context.extensionUri,
      "media",
      "icons",
      path,
      "dark",
      fileName,
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
