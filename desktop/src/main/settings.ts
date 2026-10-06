import { safeStorage } from "electron";
import { getDb } from "./db";

export function readSetting(key: string): string | null {
  const row = getDb().prepare("select value from settings where key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function writeSetting(key: string, value: string) {
  getDb()
    .prepare(
      "insert into settings (key, value) values (?, ?) on conflict(key) do update set value = excluded.value",
    )
    .run(key, value);
}

export function getApiKey(): string | null {
  const packed = readSetting("apiKey");
  if (!packed) return process.env.BLACKSMILE_API_KEY ?? process.env.OPENAI_API_KEY ?? null;
  if (!safeStorage.isEncryptionAvailable()) return packed;
  try {
    return safeStorage.decryptString(Buffer.from(packed, "base64"));
  } catch {
    return null;
  }
}

export function setApiKey(key: string | null) {
  if (!key) {
    getDb().prepare("delete from settings where key = ?").run("apiKey");
    return;
  }
  if (safeStorage.isEncryptionAvailable()) {
    writeSetting("apiKey", safeStorage.encryptString(key).toString("base64"));
  } else {
    writeSetting("apiKey", key);
  }
}

export function getSettingFlag(key: string, fallback = false) {
  const value = readSetting(key);
  if (value == null) return fallback;
  return value === "1";
}

export function setSettingFlag(key: string, value: boolean) {
  writeSetting(key, value ? "1" : "0");
}
