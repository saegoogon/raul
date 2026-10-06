import { useEffect, useMemo, useRef, useState } from "react";
import { BlackyViewport } from "./character/BlackyViewport";
import type { AgentEvent, AppSettings, CharacterState, ChatMessage, Conversation, MemoryItem, PermissionRequest, TodoItem } from "@shared/types";

type Tab = "chat" | "tasks" | "memory" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "chat", label: "대화" },
  { id: "tasks", label: "할 일" },
  { id: "memory", label: "기억" },
  { id: "settings", label: "설정" },
];

export function App() {
  const overlay = window.location.hash === "#overlay";
  const [state, setState] = useState<CharacterState>("idle");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [chats, setChats] = useState<Conversation[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [stream, setStream] = useState("");
  const [tab, setTab] = useState<Tab>("chat");
  const [busy, setBusy] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionRequest | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [memoryDraft, setMemoryDraft] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [todoDraft, setTodoDraft] = useState("");
  const [osReduce, setOsReduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const scroller = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<number | null>(null);

  const api = window.blacksmile;

  const bumpIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setState("sleeping"), 90_000);
  };

  useEffect(() => {
    if (!api) return;
    void api.ready().then(setSettings);
    const offAgent = api.onAgent((event: AgentEvent) => {
      bumpIdle();
      if (event.type === "state") setState(event.state);
      if (event.type === "delta") setStream((text) => text + event.text);
      if (event.type === "done") {
        setMessages((list) => [...list, event.message]);
        setStream("");
        setBusy(false);
        window.setTimeout(() => setState("idle"), 1200);
      }
      if (event.type === "error") {
        setError(event.message);
        setBusy(false);
        setStream("");
      }
      if (event.type === "permission") setPermission(event.request);
    });
    const offPaused = api.onPaused(setPaused);
    const offSettings = api.onOpenSettings(() => setTab("settings"));
    return () => {
      offAgent();
      offPaused();
      offSettings();
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    void api.listChats().then(async (list) => {
      if (!list.length) {
        const created = await api.createChat();
        setChats([created]);
        setActive(created.id);
        return;
      }
      setChats(list);
      setActive(list[0].id);
    });
    bumpIdle();
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [api]);

  useEffect(() => {
    if (!api || !active) return;
    void api.messages(active).then(setMessages);
    setStream("");
  }, [api, active]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, stream]);

  useEffect(() => {
    if (tab === "memory" && api) void api.memories().then(setMemories);
    if (tab === "tasks" && api) void api.todos().then(setTodos);
  }, [api, tab]);

  useEffect(() => {
    if (!overlay) return;
    const nodes = [document.documentElement, document.body, document.getElementById("root")];
    for (const node of nodes) if (node) node.style.background = "transparent";
    return () => {
      for (const node of nodes) if (node) node.style.background = "";
    };
  }, [overlay]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setOsReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const reduceMotion = Boolean(settings?.reduceMotion) || osReduce;

  const send = async () => {
    if (!active || !draft.trim() || busy || !api) return;
    const text = draft.trim();
    setDraft("");
    setError(null);
    setBusy(true);
    setState("thinking");
    setMessages((list) => [
      ...list,
      { id: crypto.randomUUID(), conversationId: active, role: "user", content: text, createdAt: Date.now() },
    ]);
    const result = await api.send(active, text);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      setState("error");
    }
  };

  const listen = () => {
    const Speech = (window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec })
      .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
    if (!Speech) {
      setError("이 환경에서는 마이크를 쓸 수 없어.");
      setState("confused");
      return;
    }
    const rec = new Speech();
    rec.lang = "ko-KR";
    rec.onstart = () => setState("listening");
    rec.onerror = () => setState("confused");
    rec.onresult = (event) => {
      const said = event.results[0]?.[0]?.transcript ?? "";
      setDraft(said);
      setState("idle");
    };
    rec.start();
  };

  const speak = (text: string) => {
    if (!settings?.voiceEnabled || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.onstart = () => setState("talking");
    utter.onend = () => setState("idle");
    window.speechSynthesis.speak(utter);
  };

  const lastAssistant = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant")?.content ?? "",
    [messages],
  );

  useEffect(() => {
    if (lastAssistant && settings?.voiceEnabled) speak(lastAssistant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAssistant]);

  const line = stageLine({
    tab,
    state,
    paused,
    error,
    emptyChat: messages.length === 0 && !stream && !busy,
    emptyMemory: tab === "memory" && memories.length === 0,
    emptyTasks: tab === "tasks" && todos.length === 0,
  });

  if (overlay) {
    return (
      <button type="button" className="flex h-full w-full items-end justify-center bg-transparent" onClick={() => void api?.focus()} title="Blacky">
        <BlackyViewport state={state} reduceMotion={reduceMotion} compact />
      </button>
    );
  }

  return (
    <div className="shell">
      <nav className="rail" aria-label="Blacky">
        <div className="rail-mark" aria-hidden>
          <SmileMark />
        </div>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`rail-item${tab === item.id ? " is-on" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="main">
        <div className={`stage${tab === "chat" ? "" : " is-mini"}`}>
          <BlackyViewport state={state} reduceMotion={reduceMotion} fill silent />
        </div>
        <p className="voice">{line ?? fallbackLine(state)}</p>

        {tab === "chat" ? (
          <>
            {chats.length ? (
              <div className="chats">
                {chats.length > 1
                  ? chats.map((chat) => (
                      <button
                        key={chat.id}
                        type="button"
                        className={active === chat.id ? "is-on" : "ghost"}
                        onClick={() => setActive(chat.id)}
                      >
                        {chatLabel(chat.title)}
                      </button>
                    ))
                  : null}
                <button
                  type="button"
                  className="ghost"
                  onClick={async () => {
                    const chat = await api.createChat();
                    setChats((list) => [chat, ...list]);
                    setActive(chat.id);
                  }}
                >
                  새로
                </button>
                {active && chats.length > 1 ? (
                  <button
                    type="button"
                    className="ghost"
                    onClick={async () => {
                      await api.deleteChat(active);
                      const list = await api.listChats();
                      if (!list.length) {
                        const chat = await api.createChat();
                        setChats([chat]);
                        setActive(chat.id);
                        return;
                      }
                      setChats(list);
                      setActive(list[0].id);
                    }}
                  >
                    지우기
                  </button>
                ) : null}
              </div>
            ) : null}

            <div ref={scroller} className="transcript">
              {messages.map((message) => (
                <p key={message.id} className={`line ${message.role === "user" ? "me" : "you"}`}>
                  {message.content}
                </p>
              ))}
              {stream ? <p className="line you">{stream}</p> : null}
            </div>

            {error ? (
              <div className="warn">
                {blackyError(error)}
                <p className="tech">{error}</p>
              </div>
            ) : null}

            {permission ? (
              <div className="ask">
                <p>이걸 해도 될까?</p>
                <p className="why">{permission.summary}</p>
                <div className="ask-actions">
                  <button
                    type="button"
                    onClick={() => {
                      void api.permission(permission.id, true);
                      setPermission(null);
                    }}
                  >
                    허용
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      void api.permission(permission.id, false);
                      setPermission(null);
                    }}
                  >
                    거절
                  </button>
                </div>
              </div>
            ) : null}

            <form
              className="composer"
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
            >
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder={paused ? "지금은 쉬고 있어." : "아무거나 말해."}
                className="field"
              />
              <button type="button" className="ghost" onClick={listen}>
                말
              </button>
              {busy ? (
                <button type="button" className="ghost" onClick={() => void api.stop()}>
                  그만
                </button>
              ) : (
                <button type="submit" className="solid" disabled={!draft.trim()}>
                  보내기
                </button>
              )}
            </form>
          </>
        ) : null}

        {tab === "tasks" ? (
          <div className="panel">
            <p className="panel-note">내가 받아 적은 일만 여기 있어.</p>
            <form
              className="composer"
              style={{ padding: 0, border: 0 }}
              onSubmit={async (event) => {
                event.preventDefault();
                if (!todoDraft.trim()) return;
                const item = await api.addTodo(todoDraft.trim());
                setTodos((list) => [item, ...list]);
                setTodoDraft("");
              }}
            >
              <input value={todoDraft} onChange={(event) => setTodoDraft(event.target.value)} className="field" placeholder="할 일" />
              <button type="submit" className="ghost">
                적기
              </button>
            </form>
            <div>
              {todos.map((item) => (
                <div key={item.id} className="row">
                  <span className={item.done ? "done" : undefined}>{item.title}</span>
                  {item.done ? null : (
                    <button
                      type="button"
                      className="ghost"
                      onClick={async () => {
                        await api.completeTodo(item.id);
                        setTodos((list) => list.map((row) => (row.id === item.id ? { ...row, done: 1 } : row)));
                      }}
                    >
                      했어
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "memory" ? (
          <div className="panel">
            <p className="panel-note">기억하라고 한 것만 남아.</p>
            <form
              className="composer"
              style={{ padding: 0, border: 0 }}
              onSubmit={async (event) => {
                event.preventDefault();
                if (!memoryDraft.trim()) return;
                const item = await api.addMemory(memoryDraft.trim());
                setMemories((list) => [item, ...list]);
                setMemoryDraft("");
              }}
            >
              <input value={memoryDraft} onChange={(event) => setMemoryDraft(event.target.value)} className="field" placeholder="기억할 내용" />
              <button type="submit" className="ghost">
                남기기
              </button>
            </form>
            <div>
              {memories.map((item) => (
                <div key={item.id} className="row">
                  <span>{item.content}</span>
                  <button
                    type="button"
                    className="ghost"
                    onClick={async () => {
                      await api.deleteMemory(item.id);
                      setMemories((list) => list.filter((row) => row.id !== item.id));
                    }}
                  >
                    잊기
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "settings" && settings ? (
          <Settings settings={settings} onSave={async (patch) => setSettings(await api.setSettings(patch))} />
        ) : null}
      </div>
    </div>
  );
}

function Settings({
  settings,
  onSave,
}: {
  settings: AppSettings;
  onSave: (patch: Partial<AppSettings> & { apiKey?: string }) => Promise<void>;
}) {
  const [apiKey, setApiKey] = useState("");
  const [base, setBase] = useState(settings.apiBaseUrl);
  const [model, setModel] = useState(settings.apiModel);

  return (
    <div className="panel" style={{ overflowY: "auto" }}>
      <section className="block" style={{ marginTop: 0 }}>
        <h2>화면</h2>
        <label className="check">
          항상 위에
          <input type="checkbox" checked={settings.alwaysOnTop} onChange={(event) => void onSave({ alwaysOnTop: event.target.checked })} />
        </label>
        <label className="check">
          바탕화면 캐릭터
          <input type="checkbox" checked={settings.overlayMode} onChange={(event) => void onSave({ overlayMode: event.target.checked })} />
        </label>
        <label className="check">
          움직임 줄이기
          <input type="checkbox" checked={settings.reduceMotion} onChange={(event) => void onSave({ reduceMotion: event.target.checked })} />
        </label>
      </section>
      <section className="block">
        <h2>목소리</h2>
        <label className="check">
          음성으로 답하기
          <input type="checkbox" checked={settings.voiceEnabled} onChange={(event) => void onSave({ voiceEnabled: event.target.checked })} />
        </label>
      </section>
      <section className="block">
        <h2>시스템</h2>
        <label className="check">
          Windows 시작 시 실행
          <input type="checkbox" checked={settings.launchAtLogin} onChange={(event) => void onSave({ launchAtLogin: event.target.checked })} />
        </label>
      </section>
      <section className="block">
        <h2>AI</h2>
        <label className="check">
          클라우드
          <input
            type="radio"
            name="aiMode"
            checked={settings.aiMode === "cloud"}
            onChange={() => void onSave({ aiMode: "cloud" })}
          />
        </label>
        <label className="check">
          도구만 (로컬 모델 없음)
          <input
            type="radio"
            name="aiMode"
            checked={settings.aiMode === "tools"}
            onChange={() => void onSave({ aiMode: "tools" })}
          />
        </label>
        <p className="panel-note">로컬 언어 모델은 아직 없어. 클라우드가 꺼져 있으면 이 PC에서 도구만 동작해.</p>
        <input value={base} onChange={(event) => setBase(event.target.value)} className="field" placeholder="API URL" />
        <input value={model} onChange={(event) => setModel(event.target.value)} className="field" placeholder="Model" />
        <input
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          className="field"
          type="password"
          placeholder={settings.hasApiKey ? "키가 저장되어 있어" : "API 키"}
        />
        <button type="button" className="ghost" style={{ marginTop: 8 }} onClick={() => void onSave({ apiBaseUrl: base, apiModel: model, apiKey })}>
          저장
        </button>
      </section>
    </div>
  );
}

function SmileMark() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
      <circle cx="4" cy="3" r="1.4" fill="currentColor" />
      <circle cx="14" cy="3" r="1.4" fill="currentColor" />
      <path d="M4 8c2.2 2.4 7.8 2.4 10 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function chatLabel(title: string) {
  return title === "New chat" ? "새 대화" : title;
}

function blackyError(raw: string) {
  if (/paused/i.test(raw)) return "지금은 쉬고 있어. 트레이에서 다시 깨워줄래?";
  if (/api key|key/i.test(raw)) return "API 키가 없어서 대답을 못 하겠어. 설정에서 넣어줘.";
  if (/network|fetch|서버|timeout/i.test(raw)) return "음... 서버에서 응답이 안 왔어. 잠깐 후에 다시 해볼까?";
  if (/마이크/i.test(raw)) return "이 환경에서는 마이크를 쓸 수 없어.";
  return "뭔가 꼬였어. 아래에서 원인을 볼 수 있어.";
}

function fallbackLine(state: CharacterState) {
  if (state === "idle") return "무엇을 도와줄까?";
  if (state === "thinking") return "잠깐만…";
  if (state === "listening") return "듣고 있어.";
  if (state === "confused") return "음…";
  if (state === "sleeping") return "z z z";
  if (state === "error") return "뭔가 꼬였어.";
  if (state === "typing") return "적어 가는 중.";
  if (state === "surprised") return "오.";
  return "";
}

function stageLine({
  tab,
  state,
  paused,
  error,
  emptyChat,
  emptyMemory,
  emptyTasks,
}: {
  tab: Tab;
  state: CharacterState;
  paused: boolean;
  error: string | null;
  emptyChat: boolean;
  emptyMemory: boolean;
  emptyTasks: boolean;
}) {
  if (paused) return "잠깐 쉬고 있어.";
  if (error) return blackyError(error);
  if (tab === "memory" && emptyMemory) return "기억하라고 한 것만 여기에 남아.";
  if (tab === "tasks" && emptyTasks) return "할 일이 없으면 편하지. 생기면 나한테 말해.";
  if (tab === "settings") return "필요한 것만 만지면 돼.";
  if (tab === "chat" && emptyChat && (state === "idle" || state === "sleeping")) {
    return "아직 대화가 없네. 나한테 뭐든 물어봐.";
  }
  return undefined;
}

type SpeechRec = {
  lang: string;
  start: () => void;
  onstart: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
};
