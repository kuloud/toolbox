import { vscode } from "../vscode";

export const getImageUri = (uri: string): string => {
  if (vscode.isInVSCode()) {
    const initialData = (window as any).__INITIAL_DATA__ || {};
    const { resRootUri } = initialData;
    return `${resRootUri}/${uri}`;
  } else {
    return uri;
  }
};
