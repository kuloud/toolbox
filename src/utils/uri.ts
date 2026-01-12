import { Uri, Webview } from "vscode";

/**
 * A helper function which will get the webview URI of a given file or resource.
 *
 * @remarks This URI can be used within a webview's HTML as a link to the
 * given file/resource.
 *
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param pathList An array of strings representing the path to a file/resource
 * @returns A URI pointing to the file/resource
 */
export function getUri(
  webview: Webview,
  extensionUri: Uri,
  pathList: string[],
) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

/**
 * Returns a string URL for an image resource that can be used directly in
 * webview CSS or HTML (e.g. inside `url(...)`).
 *
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param pathList Path segments to the image file
 */
export function getImageUri(
  webview: Webview,
  extensionUri: Uri,
  pathList: string[],
) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList)).toString();
}
