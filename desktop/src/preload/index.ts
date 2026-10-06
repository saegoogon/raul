import { contextBridge, ipcRenderer } from "electron";
import type { AgentEvent, AppSettings, ChatMessage, Conversation, MemoryItem, TodoItem } from "@shared/types";

const api = {
  ready: () => ipcRenderer.invoke("window:ready") as Promise<AppSettings>,
  focus: () => ipcRenderer.invoke("window:focus") as Promise<void>,
  getSettings: () => ipcRenderer.invoke("settings:get") as Promise<AppSettings>,
  setSettings: (patch: Partial<AppSettings> & { apiKey?: string }) =>
    ipcRenderer.invoke("settings:set", patch) as Promise<AppSettings>,
  listChats: () => ipcRenderer.invoke("chat:list") as Promise<Conversation[]>,
  createChat: () => ipcRenderer.invoke("chat:create") as Promise<Conversation>,
  deleteChat: (id: string) => ipcRenderer.invoke("chat:delete", id) as Promise<void>,
  messages: (id: string) => ipcRenderer.invoke("chat:messages", id) as Promise<ChatMessage[]>,
  memories: () => ipcRenderer.invoke("memory:list") as Promise<MemoryItem[]>,
  addMemory: (content: string) => ipcRenderer.invoke("memory:add", content) as Promise<MemoryItem>,
  deleteMemory: (id: string) => ipcRenderer.invoke("memory:delete", id) as Promise<void>,
  todos: () => ipcRenderer.invoke("todos:list") as Promise<TodoItem[]>,
  addTodo: (title: string) => ipcRenderer.invoke("todos:add", title) as Promise<TodoItem>,
  completeTodo: (id: string) => ipcRenderer.invoke("todos:complete", id) as Promise<void>,
  send: (conversationId: string, text: string) =>
    ipcRenderer.invoke("agent:send", conversationId, text) as Promise<{ ok: true } | { ok: false; error: string }>,
  stop: () => ipcRenderer.invoke("agent:stop") as Promise<void>,
  permission: (id: string, allow: boolean) => ipcRenderer.invoke("agent:permission", id, allow) as Promise<void>,
  onAgent: (fn: (event: AgentEvent) => void) => {
    const listen = (_event: unknown, payload: AgentEvent) => fn(payload);
    ipcRenderer.on("agent:event", listen);
    return () => ipcRenderer.removeListener("agent:event", listen);
  },
  onPaused: (fn: (paused: boolean) => void) => {
    const listen = (_event: unknown, paused: boolean) => fn(paused);
    ipcRenderer.on("agent:paused", listen);
    return () => ipcRenderer.removeListener("agent:paused", listen);
  },
  onOpenSettings: (fn: () => void) => {
    const listen = () => fn();
    ipcRenderer.on("ui:open-settings", listen);
    return () => ipcRenderer.removeListener("ui:open-settings", listen);
  },
};

export type BlackSmileAPI = typeof api;

contextBridge.exposeInMainWorld("blacksmile", api);
