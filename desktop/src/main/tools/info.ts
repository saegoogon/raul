import { app } from "electron";
import { cpus, freemem, hostname, release, totalmem, type } from "node:os";
import { execFileSync } from "node:child_process";
import type { SystemInfo } from "@shared/types";

function diskInfo() {
  try {
    const raw = execFileSync("wmic", ["logicaldisk", "get", "caption,freespace,size"], {
      encoding: "utf8",
      windowsHide: true,
      timeout: 4000,
    });
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^[A-Z]:/.test(line))
      .map((line) => {
        const parts = line.split(/\s+/);
        const fs = parts[0];
        const free = Number(parts[1]);
        const size = Number(parts[2]);
        return {
          fs,
          sizeGb: Math.round(size / 1024 ** 3),
          freeGb: Math.round(free / 1024 ** 3),
        };
      })
      .filter((disk) => disk.sizeGb > 0);
  } catch {
    return [];
  }
}

export function systemInfo(): SystemInfo {
  const cpu = cpus()[0]?.model?.trim() || "Unknown CPU";
  return {
    platform: `${type()} ${release()}`,
    release: release(),
    hostname: hostname(),
    cpu,
    ramGb: Math.round(totalmem() / 1024 ** 3),
    freeRamGb: Math.round(freemem() / 1024 ** 3),
    disks: diskInfo(),
    appVersion: app.getVersion(),
  };
}
