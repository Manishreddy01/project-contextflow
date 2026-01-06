import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatFeed({
  messages = [],
  isLoading = false,
  debugSteps = [],
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, debugSteps]);

  const hasDebug = isLoading || debugSteps.length > 0;

  return (
    <div className="space-y-4">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          role={msg.role}
          content={msg.content}
          sources={msg.sources}
          confidence={msg.confidence}
          type={msg.type}
        />
      ))}

      {hasDebug && (
        <MessageBubble
          role="assistant"
          content={debugSteps.join("\n")}
          sources={[]}
          confidence={0}
          type="chat"
        />
      )}

      <div ref={endRef} />
    </div>
  );
}
