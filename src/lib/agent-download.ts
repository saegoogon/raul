import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

export const INSTALLER_FILE = "BlackSmile-AI-Setup.exe";
export const INSTALLER_PUBLIC_PATH = `/downloads/${INSTALLER_FILE}`;

export function installerFilePath() {
  return join(process.cwd(), "public", "downloads", INSTALLER_FILE);
}

export function installerInfo() {
  const file = installerFilePath();
  if (!existsSync(file)) return null;
  const bytes = statSync(file).size;
  const mb = bytes / (1024 * 1024);
  return {
    href: INSTALLER_PUBLIC_PATH,
    sizeLabel: mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`,
  };
}

export function remoteInstallerUrl() {
  return process.env.AGENT_DOWNLOAD_URL ?? process.env.NEXT_PUBLIC_AGENT_DOWNLOAD_URL ?? null;
}
