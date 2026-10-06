import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { app, shell } from "electron";
import type { AllowedApp } from "@shared/types";

const win = process.env.SystemRoot ?? "C:\\Windows";

const APPS: Record<Exclude<AllowedApp, "browser">, string> = {
  notepad: join(win, "System32", "notepad.exe"),
  calculator: join(win, "System32", "calc.exe"),
  paint: join(win, "System32", "mspaint.exe"),
  explorer: join(win, "explorer.exe"),
};

export function openAllowedApp(name: AllowedApp) {
  if (name === "browser") {
    return shell.openExternal("https://www.google.com");
  }
  const path = APPS[name];
  if (!path || !existsSync(path)) throw new Error("That app is not available.");
  spawn(path, [], { detached: true, stdio: "ignore" }).unref();
}

export function openSafeUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http(s) links can be opened.");
  }
  return shell.openExternal(url.toString());
}

const SKIP = new Set(["node_modules", ".git", "AppData", "Windows"]);

export function searchFiles(query: string, limit = 20) {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  const roots = [join(homedir(), "Desktop"), join(homedir(), "Documents"), app.getPath("downloads")];
  const hits: { name: string; path: string }[] = [];
  const walk = (dir: string, depth: number) => {
    if (hits.length >= limit || depth > 4) return;
    let entries: import("node:fs").Dirent[] = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (hits.length >= limit) return;
      if (SKIP.has(entry.name) || entry.name.startsWith(".")) continue;
      const full = join(dir, entry.name);
      if (entry.name.toLowerCase().includes(needle)) hits.push({ name: entry.name, path: full });
      if (entry.isDirectory()) walk(full, depth + 1);
    }
  };
  for (const root of roots) walk(root, 0);
  return hits;
}

export function calc(expression: string) {
  const cleaned = expression.replace(/\s/g, "");
  if (!/^[-+*/().\d]+$/.test(cleaned)) throw new Error("I can only calculate numbers.");
  const result = Function(`"use strict"; return (${cleaned})`)();
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("That did not compute.");
  return result;
}
