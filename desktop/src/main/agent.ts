import type { AgentEvent, PermissionRequest, ToolName } from "@shared/types";
import { addMessage } from "./chat";
import { streamCloud } from "./ai/cloud";
import { resolveAiRuntime } from "./ai/resolve";
import { toolsFallbackLine, toolsReply } from "./ai/tools-fallback";
import { isDangerous, runTool, summarizeTool } from "./tools";

type Send = (event: AgentEvent) => void;

const pending = new Map<string, { resolve: (ok: boolean) => void }>();
let stopFlag = false;

export function stopAgent() {
  stopFlag = true;
}

export function answerPermission(requestId: string, allow: boolean) {
  pending.get(requestId)?.resolve(allow);
  pending.delete(requestId);
}

function waitForPermission(request: PermissionRequest, send: Send) {
  send({ type: "permission", request });
  return new Promise<boolean>((resolve) => {
    pending.set(request.id, { resolve });
  });
}

async function useTool(name: ToolName, args: Record<string, unknown>, send: Send) {
  if (isDangerous(name)) {
    const request: PermissionRequest = {
      id: crypto.randomUUID(),
      tool: name,
      summary: summarizeTool(name, args),
      args,
    };
    const ok = await waitForPermission(request, send);
    if (!ok) {
      send({ type: "tool", name, status: "denied" });
      return "The user denied this action.";
    }
  }
  send({ type: "tool", name, status: "running" });
  try {
    const detail = runTool(name, args);
    send({ type: "tool", name, status: "ok", detail });
    return detail;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool failed.";
    send({ type: "tool", name, status: "failed", detail: message });
    return message;
  }
}

export async function runAgent(conversationId: string, userText: string, send: Send) {
  stopFlag = false;
  addMessage(conversationId, "user", userText);
  send({ type: "state", state: "thinking" });

  try {
    let content = "";
    const { runtime, choseTools, hasKey } = resolveAiRuntime();

    if (runtime === "cloud") {
      send({ type: "state", state: "typing" });
      content = (await streamCloud(conversationId, send, () => stopFlag, (name, args) => useTool(name, args, send))) || "";
    } else {
      const local = toolsReply(userText);
      if (local.say) {
        send({ type: "state", state: "talking" });
        send({ type: "delta", text: local.say });
        content = local.say;
      }
      if (local.tool) {
        const result = await useTool(local.tool.name, local.tool.args, send);
        const extra = result.startsWith("{") ? formatInfo(result) : result;
        send({ type: "state", state: "talking" });
        send({ type: "delta", text: content ? `\n${extra}` : extra });
        content = content ? `${content}\n${extra}` : extra;
      }
      if (!content) {
        content = toolsFallbackLine(choseTools, hasKey);
        send({ type: "state", state: "talking" });
        send({ type: "delta", text: content });
      }
    }

    if (!content) content = "음… 잘 모르겠어.";
    const message = addMessage(conversationId, "assistant", content);
    send({ type: "state", state: "happy" });
    send({ type: "done", message });
  } catch (error) {
    send({ type: "state", state: "error" });
    send({ type: "error", message: error instanceof Error ? error.message : "Something went wrong." });
  }
}

function formatInfo(json: string) {
  try {
    const info = JSON.parse(json) as {
      cpu: string;
      ramGb: number;
      freeRamGb: number;
      platform: string;
      disks: { fs: string; sizeGb: number; freeGb: number }[];
    };
    const disks = info.disks.map((disk) => `${disk.fs} ${disk.freeGb}/${disk.sizeGb} GB`).join(", ");
    return `${info.platform}\nCPU: ${info.cpu}\nRAM: ${info.freeRamGb} GB free / ${info.ramGb} GB\nDisk: ${disks || "unknown"}`;
  } catch {
    return json;
  }
}
