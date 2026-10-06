import { getApiKey, readSetting } from "../settings";

export type AiRuntime = "cloud" | "tools";

export function resolveAiRuntime(): { runtime: AiRuntime; choseTools: boolean; hasKey: boolean } {
  const hasKey = Boolean(getApiKey());
  const mode = readSetting("aiMode") ?? "cloud";
  const choseTools = mode === "tools";
  if (choseTools) return { runtime: "tools", choseTools, hasKey };
  if (hasKey) return { runtime: "cloud", choseTools: false, hasKey };
  return { runtime: "tools", choseTools: false, hasKey };
}
