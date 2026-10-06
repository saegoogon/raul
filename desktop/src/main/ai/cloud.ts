import { getApiKey, readSetting } from "../settings";
import { listMemories, listMessages } from "../chat";
import { TOOL_DEFS } from "../tools";
import type { AgentEvent, ToolName } from "@shared/types";

type Send = (event: AgentEvent) => void;

export async function streamCloud(
  conversationId: string,
  send: Send,
  shouldStop: () => boolean,
  runNamedTool: (name: ToolName, args: Record<string, unknown>) => Promise<string>,
) {
  const key = getApiKey();
  if (!key) return "";
  const base = (readSetting("apiBaseUrl") ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = readSetting("apiModel") ?? "gpt-4o-mini";
  const memories = listMemories()
    .slice(0, 20)
    .map((item) => item.content)
    .join("\n- ");
  const history = listMessages(conversationId).map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are Blacky, the BlackSmile AI companion living on this Windows PC. Speak Korean unless the user writes in another language. Be brief, warm, not childish. Never claim you can delete files, run arbitrary programs, or bypass permissions. Long-term memories:\n- ${memories || "(none)"}`,
        },
        ...history,
      ],
      tools: TOOL_DEFS.map((tool) => ({
        type: "function",
        function: { name: tool.name, description: tool.description, parameters: tool.parameters },
      })),
    }),
  });
  if (!response.ok || !response.body) {
    throw new Error("The AI service did not answer.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  const calls = new Map<number, { name: string; args: string }>();

  const flushLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const payload = trimmed.slice(5).trim();
    if (payload === "[DONE]") return;
    const json = JSON.parse(payload) as {
      choices?: {
        delta?: { content?: string; tool_calls?: { index: number; function?: { name?: string; arguments?: string } }[] };
      }[];
    };
    const delta = json.choices?.[0]?.delta;
    if (delta?.content) {
      text += delta.content;
      send({ type: "delta", text: delta.content });
    }
    for (const call of delta?.tool_calls ?? []) {
      const current = calls.get(call.index) ?? { name: "", args: "" };
      current.name += call.function?.name ?? "";
      current.args += call.function?.arguments ?? "";
      calls.set(call.index, current);
    }
  };

  while (!shouldStop()) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) flushLine(line);
  }

  if (calls.size) {
    send({ type: "state", state: "thinking" });
    const notes: string[] = [];
    for (const call of calls.values()) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.args || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      notes.push(await runNamedTool(call.name as ToolName, args));
    }
    text = [text.trim(), ...notes].filter(Boolean).join("\n");
    send({ type: "delta", text: text && notes.length ? `\n${notes.join("\n")}` : notes.join("\n") });
  }

  return text;
}
