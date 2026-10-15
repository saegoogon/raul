export function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <div className="code-block">
      <div className="code-filebar">
        <span>{language}</span>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
