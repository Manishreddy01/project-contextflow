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
    ? "Doc answer"
    : type === "web"
    ? "Web answer"
    : type === "chat"
    ? "Chat mode"
    : "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xl px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap text-sm md:text-base ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        }`}
      >
        {!isUser && modeLabel && (
          <div className="text-[11px] text-gray-500 mb-1 flex justify-between">
            <span>Assistant</span>
            <span className="italic">{modeLabel}</span>
          </div>
        )}

        <p>{content}</p>

        {!isUser && !isThinking && sources?.length > 0 && (
          <div className="mt-2 text-[11px] text-gray-500 border-t pt-2 space-y-1">
            <div className="flex flex-wrap gap-1">
              <span className="font-semibold mr-1">Sources:</span>
              {sources.map((src, i) => (
                <span
                  key={`${src}-${i}`}
                  className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700"
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
