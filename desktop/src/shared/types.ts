export type CharacterState =
  | "idle"
  | "thinking"
  | "listening"
  | "typing"
  | "talking"
  | "happy"
  | "confused"
  | "surprised"
  | "error"
  | "sleeping";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: Exclude<ChatRole, "system">;
  content: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type MemoryItem = {
  id: string;
  content: string;
  createdAt: number;
};

export type ToolName =
  | "calculator"
  | "system_info"
  | "open_application"
  | "open_url"
  | "search_files"
  | "create_todo"
  | "list_todos"
  | "complete_todo"
  | "remember"
  | "search_web";

export type AllowedApp = "notepad" | "calculator" | "paint" | "explorer" | "browser";

export type TodoItem = {
  id: string;
  title: string;
  done: number;
  createdAt: number;
};

export type PermissionRequest = {
  id: string;
  tool: ToolName;
  summary: string;
  args: Record<string, unknown>;
};

export type AgentEvent =
  | { type: "state"; state: CharacterState }
  | { type: "delta"; text: string }
  | { type: "done"; message: ChatMessage }
  | { type: "error"; message: string }
  | { type: "permission"; request: PermissionRequest }
  | { type: "tool"; name: ToolName; status: "running" | "ok" | "denied" | "failed"; detail?: string };

export type AiMode = "cloud" | "tools";

export type AppSettings = {
  alwaysOnTop: boolean;
  launchAtLogin: boolean;
  overlayMode: boolean;
  voiceEnabled: boolean;
  reduceMotion: boolean;
  aiMode: AiMode;
  apiBaseUrl: string;
  apiModel: string;
  hasApiKey: boolean;
};

export type SystemInfo = {
  platform: string;
  release: string;
  hostname: string;
  cpu: string;
  ramGb: number;
  freeRamGb: number;
  disks: { fs: string; sizeGb: number; freeGb: number }[];
  appVersion: string;
};
