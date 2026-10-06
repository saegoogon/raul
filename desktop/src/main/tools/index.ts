import { getDb, id, now } from "../db";
import { systemInfo } from "./info";
import { calc, openAllowedApp, openSafeUrl, searchFiles } from "./system";
import type { AllowedApp, ToolName } from "@shared/types";

export const TOOL_DEFS = [
  {
    name: "calculator",
    description: "Evaluate a simple arithmetic expression.",
    danger: false,
    parameters: { type: "object", properties: { expression: { type: "string" } }, required: ["expression"] },
  },
  {
    name: "system_info",
    description: "Read safe PC specs: OS, CPU, RAM, disk space, app version.",
    danger: false,
    parameters: { type: "object", properties: {} },
  },
  {
    name: "open_application",
    description: "Open a whitelisted Windows app: notepad, calculator, paint, explorer, or browser.",
    danger: true,
    parameters: {
      type: "object",
      properties: { application: { type: "string", enum: ["notepad", "calculator", "paint", "explorer", "browser"] } },
      required: ["application"],
    },
  },
  {
    name: "open_url",
    description: "Open an http(s) URL in the default browser.",
    danger: true,
    parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
  },
  {
    name: "search_files",
    description: "Search Desktop, Documents, and Downloads by file name.",
    danger: false,
    parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  },
  {
    name: "create_todo",
    description: "Add a to-do item.",
    danger: false,
    parameters: { type: "object", properties: { title: { type: "string" } }, required: ["title"] },
  },
  {
    name: "list_todos",
    description: "List to-do items.",
    danger: false,
    parameters: { type: "object", properties: {} },
  },
  {
    name: "complete_todo",
    description: "Mark a to-do as done by id.",
    danger: false,
    parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "remember",
    description: "Save a long-term memory the user asked to keep.",
    danger: false,
    parameters: { type: "object", properties: { content: { type: "string" } }, required: ["content"] },
  },
  {
    name: "search_web",
    description: "Open a web search for a query in the default browser.",
    danger: true,
    parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  },
] as const;

export function summarizeTool(name: ToolName, args: Record<string, unknown>) {
  switch (name) {
    case "open_application":
      return `Open ${String(args.application)}`;
    case "open_url":
      return `Open ${String(args.url)}`;
    case "search_web":
      return `Search the web for “${String(args.query)}”`;
    case "search_files":
      return `Search files named like “${String(args.query)}”`;
    default:
      return `Run ${name}`;
  }
}

export function isDangerous(name: ToolName) {
  return TOOL_DEFS.some((tool) => tool.name === name && tool.danger);
}

export function runTool(name: ToolName, args: Record<string, unknown>): string {
  switch (name) {
    case "calculator":
      return String(calc(String(args.expression ?? "")));
    case "system_info":
      return JSON.stringify(systemInfo());
    case "open_application":
      openAllowedApp(String(args.application) as AllowedApp);
      return `Opened ${String(args.application)}.`;
    case "open_url":
      void openSafeUrl(String(args.url));
      return `Opened ${String(args.url)}.`;
    case "search_files": {
      const hits = searchFiles(String(args.query ?? ""));
      return hits.length ? hits.map((hit) => `${hit.name} — ${hit.path}`).join("\n") : "No matching files.";
    }
    case "create_todo": {
      const item = { id: id(), title: String(args.title ?? "").slice(0, 200), done: 0, createdAt: now() };
      if (!item.title) throw new Error("Need a to-do title.");
      getDb().prepare("insert into todos (id, title, done, created_at) values (?, ?, 0, ?)").run(
        item.id,
        item.title,
        item.createdAt,
      );
      return `Added: ${item.title}`;
    }
    case "list_todos": {
      const rows = getDb().prepare("select id, title, done from todos order by created_at desc limit 20").all() as {
        id: string;
        title: string;
        done: number;
      }[];
      if (!rows.length) return "No to-dos yet.";
      return rows.map((row) => `${row.done ? "[x]" : "[ ]"} ${row.title} (${row.id.slice(0, 8)})`).join("\n");
    }
    case "complete_todo": {
      const result = getDb().prepare("update todos set done = 1 where id = ?").run(String(args.id));
      return result.changes ? "Marked as done." : "I could not find that to-do.";
    }
    case "remember": {
      const content = String(args.content ?? "").trim().slice(0, 500);
      if (!content) throw new Error("Nothing to remember.");
      getDb().prepare("insert into memories (id, content, created_at) values (?, ?, ?)").run(id(), content, now());
      return `I'll remember: ${content}`;
    }
    case "search_web": {
      const query = String(args.query ?? "").trim();
      if (!query) throw new Error("Need a search query.");
      void openSafeUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
      return `Opened a search for “${query}”.`;
    }
    default:
      throw new Error("Unknown tool.");
  }
}
