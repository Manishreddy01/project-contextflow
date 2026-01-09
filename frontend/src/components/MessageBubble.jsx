// src/components/MessageBubble.jsx
export default function MessageBubble({
  role,
  content,
  sources = [],
  confidence,
  type,
  isThinking,
}) {
  const isUser = role === "user";

  const modeLabel = isThinking
    ? "Thinking..."
    : type === "document"
    ? "DOC ANSWER"
    : type === "web"
    ? "WEB ANSWER"
    : type === "chat"
    ? "CHAT MODE"
    : "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xl px-4 py-3 rounded-2xl shadow-md whitespace-pre-wrap text-sm md:text-base border border-transparent ${
          isUser
            ? "bg-indigo-500 text-white rounded-br-none"
            : "bg-slate-900/90 text-slate-50 rounded-bl-none border-slate-700/60"
        }`}
      >
        {/* Header: Assistant + mode */}
        {!isUser && modeLabel && (
          <div className="text-[11px] text-slate-200/80 mb-1 flex items-center justify-between gap-2">
            <span className="font-semibold">Assistant</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] uppercase tracking-wide">
              {modeLabel}
            </span>
          </div>
        )}

        <p>{content}</p>

        {/* Sources */}
        {!isUser && !isThinking && sources?.length > 0 && (
          <div className="mt-2 text-[11px] text-slate-200/80 border-t border-slate-700 pt-2 space-y-1">
            <div className="flex flex-wrap gap-1">
              <span className="font-semibold mr-1">Sources:</span>
              {sources.map((src, i) => (
                <span
                  key={`${src}-${i}`}
                  className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-100"
                >
                  {src}
                </span>
              ))}
            </div>
            {typeof confidence === "number" && (
              <div>confidence: {Math.round(confidence * 100)}%</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
