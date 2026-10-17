"use client";

import { useActionState, useState } from "react";
import { createSnippet } from "@/actions/snippets";
import { HoodMotion } from "@/components/mascot/HoodMotion";
import { isLanguage, LANGUAGES, type Language } from "@/lib/snippets/languages";

const EXT: Record<string, Language> = {
  ts: "ts",
  tsx: "ts",
  js: "js",
  jsx: "js",
  mjs: "js",
  py: "py",
  go: "go",
  rs: "rust",
  sql: "sql",
  css: "css",
  html: "html",
  htm: "html",
  json: "json",
  txt: "text",
};

export function NewForm() {
  const [state, action, pending] = useActionState(createSnippet, null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("text");
  const [fileError, setFileError] = useState<string | null>(null);

  return (
    <form action={action} className="composer">
      <label className="mute">
        제목
        <input name="title" className="field" required maxLength={200} />
      </label>
      <label className="mute">
        본문
        <textarea name="note" className="field" rows={6} maxLength={8000} />
      </label>
      <label className="mute">
        코드
        <textarea
          name="code"
          className="field code-input"
          rows={10}
          maxLength={40000}
          spellCheck={false}
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      </label>
      <label className="mute file-upload">
        또는 파일 올리기
        <input
          type="file"
          accept=".ts,.tsx,.js,.jsx,.mjs,.py,.go,.rs,.sql,.css,.html,.htm,.json,.txt,.md"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (file.size > 40_000) {
              setFileError("파일이 40KB를 넘습니다.");
              return;
            }
            const text = await file.text();
            const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
            setCode(text.slice(0, 40000));
            setLanguage(EXT[ext] && isLanguage(EXT[ext]) ? EXT[ext] : "text");
            setFileError(null);
          }}
        />
      </label>
      {fileError ? <p className="text-sm text-warn">{fileError}</p> : null}
      <label className="mute">
        언어
        <select name="language" className="field" value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
          {LANGUAGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      {state?.error ? (
        <div className="hood-error-block">
          <HoodMotion kind="error" size={72} />
          <p className="text-sm text-warn">{state.error}</p>
        </div>
      ) : null}
      <div className="hood-action-row">
        {pending ? <HoodMotion kind="loading" size={36} pose="face" /> : null}
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "올리는 중…" : "올리기"}
        </button>
      </div>
    </form>
  );
}
