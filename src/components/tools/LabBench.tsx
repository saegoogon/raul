"use client";

import { useMemo, useState } from "react";

const TOOLS = [
  { id: "base64", name: "Base64" },
  { id: "url", name: "URL" },
  { id: "hex", name: "Hex" },
  { id: "hash", name: "SHA-256" },
  { id: "json", name: "JSON" },
  { id: "time", name: "시간" },
  { id: "uuid", name: "UUID" },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function hexToBytes(value: string) {
  const clean = value.replace(/\s+/g, "");
  if (!clean || clean.length % 2 !== 0 || /[^0-9a-f]/i.test(clean)) {
    throw new Error("hex가 아닙니다.");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    out[i / 2] = Number.parseInt(clean.slice(i, i + 2), 16);
  }
  return out;
}

function fallbackCopy(text: string) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  document.body.removeChild(field);
}

async function copyText(text: string) {
  try {
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise((_, reject) => window.setTimeout(() => reject(new Error("copy-timeout")), 400)),
    ]);
  } catch {
    fallbackCopy(text);
  }
}

export function LabBench() {
  const [tool, setTool] = useState<ToolId>("base64");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const hint = useMemo(() => {
    if (tool === "hash") return "입력한 글의 SHA-256을 만듭니다. 되돌릴 수 없습니다.";
    if (tool === "json") return "JSON을 읽기 쉽게 만들거나 한 줄로 줄입니다.";
    if (tool === "time") return "유닉스 시간과 ISO 시각을 서로 바꿉니다.";
    if (tool === "uuid") return "이 브라우저에서 UUID를 만듭니다.";
    return "입력은 이 브라우저에서만 처리합니다. 서버로 보내지 않습니다.";
  }, [tool]);

  const run = async (mode: "encode" | "decode" | "make") => {
    setError(null);
    setCopied(false);
    try {
      if (tool === "base64") {
        setOutput(mode === "encode" ? toBase64(input) : fromBase64(input));
        return;
      }
      if (tool === "url") {
        setOutput(mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input));
        return;
      }
      if (tool === "hex") {
        if (mode === "encode") {
          setOutput(bytesToHex(new TextEncoder().encode(input)));
          return;
        }
        setOutput(new TextDecoder().decode(hexToBytes(input)));
        return;
      }
      if (tool === "hash") {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
        setOutput(bytesToHex(new Uint8Array(digest)));
        return;
      }
      if (tool === "json") {
        const parsed = JSON.parse(input);
        setOutput(mode === "encode" ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed));
        return;
      }
      if (tool === "uuid") {
        setOutput(crypto.randomUUID());
        return;
      }
      const raw = input.trim();
      if (/^\d+$/.test(raw)) {
        const date = new Date(Number(raw) * (raw.length <= 10 ? 1000 : 1));
        if (Number.isNaN(date.getTime())) throw new Error("시간을 읽지 못했습니다.");
        setOutput(date.toISOString());
        return;
      }
      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) throw new Error("시간을 읽지 못했습니다.");
      setOutput(String(Math.floor(date.getTime() / 1000)));
    } catch {
      setOutput("");
      setError("변환하지 못했습니다. 입력을 다시 확인하세요.");
    }
  };

  return (
    <div className="tool-layout">
      <nav className="tool-nav" aria-label="도구">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tool === item.id ? "is-on" : ""}
            onClick={() => {
              setTool(item.id);
              setOutput("");
              setError(null);
              setCopied(false);
            }}
          >
            {item.name}
          </button>
        ))}
      </nav>
      <section className="tool-panel">
        <p className="tool-note">{hint}</p>
        {tool === "uuid" ? null : (
          <label className="mute">
            입력
            <textarea className="field tool-io" rows={8} value={input} onChange={(event) => setInput(event.target.value)} />
          </label>
        )}
        <div className="tool-actions">
          {tool === "hash" ? (
            <button type="button" className="btn-primary" onClick={() => void run("encode")}>
              해시
            </button>
          ) : tool === "json" ? (
            <>
              <button type="button" className="btn-primary" onClick={() => void run("encode")}>
                정리
              </button>
              <button type="button" className="btn-ghost" onClick={() => void run("decode")}>
                압축
              </button>
            </>
          ) : tool === "time" ? (
            <>
              <button type="button" className="btn-primary" onClick={() => void run("decode")}>
                변환
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setInput(String(Math.floor(Date.now() / 1000)));
                  setOutput(new Date().toISOString());
                  setError(null);
                }}
              >
                지금
              </button>
            </>
          ) : tool === "uuid" ? (
            <button type="button" className="btn-primary" onClick={() => void run("make")}>
              만들기
            </button>
          ) : (
            <>
              <button type="button" className="btn-primary" onClick={() => void run("encode")}>
                인코딩
              </button>
              <button type="button" className="btn-ghost" onClick={() => void run("decode")}>
                디코딩
              </button>
            </>
          )}
        </div>
        {error ? <p className="text-sm text-warn">{error}</p> : null}
        <label className="mute">
          결과
          <textarea className="field tool-io" rows={8} value={output} readOnly />
        </label>
        <div className="tool-actions">
          <button
            type="button"
            className="btn-ghost"
            disabled={!output}
            onClick={async () => {
              await copyText(output);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      </section>
    </div>
  );
}
