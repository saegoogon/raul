import { app, ipcMain } from "electron";
import type { AppSettings } from "@shared/types";
import { answerPermission, runAgent, stopAgent } from "./agent";
import {
  addMemory,
  createConversation,
  deleteConversation,
  deleteMemory,
  listConversations,
  listMemories,
  listMessages,
} from "./chat";
import { getDb, id, now } from "./db";
import { getApiKey, getSettingFlag, readSetting, setApiKey, setSettingFlag, writeSetting } from "./settings";
import { isPaused } from "./tray";
import { closeOverlayWindow, createMainWindow, createOverlayWindow, getMainWindow, sendToUi } from "./windows";

function settings(): AppSettings {
  return {
    alwaysOnTop: getSettingFlag("alwaysOnTop"),
    launchAtLogin: getSettingFlag("launchAtLogin"),
    overlayMode: getSettingFlag("overlayMode"),
    voiceEnabled: getSettingFlag("voiceEnabled"),
    reduceMotion: getSettingFlag("reduceMotion"),
    aiMode: readSetting("aiMode") === "tools" ? "tools" : "cloud",
    apiBaseUrl: readSetting("apiBaseUrl") ?? "https://api.openai.com/v1",
    apiModel: readSetting("apiModel") ?? "gpt-4o-mini",
    hasApiKey: Boolean(getApiKey()),
  };
}

function applyWindowFlags() {
  const win = getMainWindow();
  win?.setAlwaysOnTop(getSettingFlag("alwaysOnTop"));
  app.setLoginItemSettings({ openAtLogin: getSettingFlag("launchAtLogin") });
  if (getSettingFlag("overlayMode")) createOverlayWindow();
  else closeOverlayWindow();
}

export function registerIpc() {
  ipcMain.handle("settings:get", () => settings());
  ipcMain.handle("settings:set", (_event, patch: Partial<AppSettings> & { apiKey?: string }) => {
    if (typeof patch.alwaysOnTop === "boolean") setSettingFlag("alwaysOnTop", patch.alwaysOnTop);
    if (typeof patch.launchAtLogin === "boolean") setSettingFlag("launchAtLogin", patch.launchAtLogin);
    if (typeof patch.overlayMode === "boolean") setSettingFlag("overlayMode", patch.overlayMode);
    if (typeof patch.voiceEnabled === "boolean") setSettingFlag("voiceEnabled", patch.voiceEnabled);
    if (typeof patch.reduceMotion === "boolean") setSettingFlag("reduceMotion", patch.reduceMotion);
    if (patch.aiMode === "cloud" || patch.aiMode === "tools") writeSetting("aiMode", patch.aiMode);
    if (typeof patch.apiBaseUrl === "string") writeSetting("apiBaseUrl", patch.apiBaseUrl);
    if (typeof patch.apiModel === "string") writeSetting("apiModel", patch.apiModel);
    if (typeof patch.apiKey === "string") setApiKey(patch.apiKey.trim() || null);
    applyWindowFlags();
    return settings();
  });

  ipcMain.handle("chat:list", () => listConversations());
  ipcMain.handle("chat:create", () => createConversation());
  ipcMain.handle("chat:delete", (_event, conversationId: string) => deleteConversation(conversationId));
  ipcMain.handle("chat:messages", (_event, conversationId: string) => listMessages(conversationId));
  ipcMain.handle("memory:list", () => listMemories());
  ipcMain.handle("memory:add", (_event, content: string) => addMemory(content));
  ipcMain.handle("memory:delete", (_event, memoryId: string) => deleteMemory(memoryId));
  ipcMain.handle("todos:list", () =>
    getDb().prepare("select id, title, done, created_at as createdAt from todos order by created_at desc").all(),
  );
  ipcMain.handle("todos:add", (_event, title: string) => {
    const trimmed = String(title ?? "").trim();
    if (!trimmed) throw new Error("empty");
    const item = { id: id(), title: trimmed, done: 0, createdAt: now() };
    getDb().prepare("insert into todos (id, title, done, created_at) values (?, ?, 0, ?)").run(item.id, item.title, item.createdAt);
    return item;
  });
  ipcMain.handle("todos:complete", (_event, todoId: string) => {
    getDb().prepare("update todos set done = 1 where id = ?").run(todoId);
  });

  ipcMain.handle("agent:send", async (_event, conversationId: string, text: string) => {
    if (isPaused()) return { ok: false as const, error: "Agent is paused." };
    const trimmed = text.trim();
    if (!trimmed) return { ok: false as const, error: "Type something first." };
    void runAgent(conversationId, trimmed, (payload) => {
      sendToUi("agent:event", payload);
    });
    return { ok: true as const };
  });
  ipcMain.handle("agent:stop", () => {
    stopAgent();
  });
  ipcMain.handle("agent:permission", (_event, requestId: string, allow: boolean) => {
    answerPermission(requestId, allow);
  });
  ipcMain.handle("window:ready", () => {
    applyWindowFlags();
    return settings();
  });
  ipcMain.handle("window:focus", () => {
    createMainWindow();
  });
}
