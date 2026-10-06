import type { AllowedApp, ToolName } from "@shared/types";

export function toolsReply(text: string): { say: string; tool?: { name: ToolName; args: Record<string, unknown> } } {
  const t = text.trim();
  const lower = t.toLowerCase();

  const remember = t.match(/기억해\s*줘[.!]?\s*(.+)$/i) ?? t.match(/remember(?:\s+that)?[:\s]+(.+)/i);
  if (remember) return { say: "", tool: { name: "remember", args: { content: remember[1] } } };

  if (/계산기|calculator/.test(lower) && /(켜|열어|open|launch)/.test(lower)) {
    return { say: "계산기를 열게.", tool: { name: "open_application", args: { application: "calculator" satisfies AllowedApp } } };
  }
  if (/메모장|notepad/.test(lower) && /(켜|열어|open)/.test(lower)) {
    return { say: "메모장을 열게.", tool: { name: "open_application", args: { application: "notepad" } } };
  }
  if (/그림판|paint/.test(lower) && /(켜|열어|open)/.test(lower)) {
    return { say: "그림판을 열게.", tool: { name: "open_application", args: { application: "paint" } } };
  }
  if (/탐색기|explorer/.test(lower) && /(켜|열어|open)/.test(lower)) {
    return { say: "탐색기를 열게.", tool: { name: "open_application", args: { application: "explorer" } } };
  }

  const math = t.match(/^(?:계산|calc(?:ulate)?)[:\s]+(.+)$/i) ?? t.match(/^([\d.+\-*/() ]+)$/);
  if (math && /[\d]/.test(math[1]) && /[+\-*/]/.test(math[1])) {
    return { say: "", tool: { name: "calculator", args: { expression: math[1] } } };
  }

  if (/(컴퓨터|사양|ram|cpu|디스크|system)/i.test(t) && /(알려|얼마|뭐|how|spec)/i.test(t)) {
    return { say: "잠깐, 이 컴퓨터 정보를 볼게.", tool: { name: "system_info", args: {} } };
  }

  const find = t.match(/(?:파일\s*찾아|find file[s]?)\s+(.+)/i);
  if (find) return { say: "파일을 찾아볼게.", tool: { name: "search_files", args: { query: find[1] } } };

  const todo = t.match(/(?:할\s*일|todo)[:\s]+(.+)/i);
  if (todo) return { say: "할 일에 넣을게.", tool: { name: "create_todo", args: { title: todo[1] } } };
  if (/할\s*일.*(보여|목록)|list todos?/i.test(t)) return { say: "할 일 목록이야.", tool: { name: "list_todos", args: {} } };

  const search = t.match(/(?:검색|search)\s+(.+)/i);
  if (search) return { say: "검색창을 열게.", tool: { name: "search_web", args: { query: search[1] } } };

  if (/안녕|hello|hi\b/i.test(t)) return { say: "안녕. 나는 Blacky야. 뭐든 말해." };
  if (/누구|who are you/i.test(t)) return { say: "BlackSmile AI의 Blacky. 이 컴퓨터에 사는 비서야." };
  if (/고마워|thank/i.test(t)) return { say: "천만에." };

  return { say: "" };
}

export function toolsFallbackLine(choseTools: boolean, hasKey: boolean) {
  if (choseTools) {
    return "지금은 도구 모드야. 계산, 사양, 메모장, 할 일은 이 PC에서 바로 가능해. 대화형 추론은 클라우드가 필요해.";
  }
  if (!hasKey) {
    return "클라우드에 연결할 키가 없어. 지금은 이 컴퓨터에서 도구만 쓸 수 있어. 설정에서 API 키를 넣으면 대화를 이어갈게.";
  }
  return "지금은 이 컴퓨터에서 도구만 쓸 수 있어.";
}
