import { toast as t } from "sonner";
import { vscode } from "./vscode";

export const success = (message: string) => {
  if (vscode.isInVSCode()) {
    vscode.toast.success(message);
  } else {
    t.success(message);
  }
};

export const info = (message: string) => {
  if (vscode.isInVSCode()) {
    vscode.toast.info(message);
  } else {
    t.info(message);
  }
};

export const warning = (message: string) => {
  if (vscode.isInVSCode()) {
    vscode.toast.warning(message);
  } else {
    t.warning(message);
  }
};

export const error = (message: string) => {
  if (vscode.isInVSCode()) {
    vscode.toast.error(message);
  } else {
    t.error(message);
  }
};
export default {
  success,
  info,
  warning,
  error,
};
