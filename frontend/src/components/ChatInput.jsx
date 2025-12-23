import { useState, useRef, useEffect } from "react";

export default function ChatInput({ onSend }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;   
    onSend(input);                                                               
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      handleSubmit(e);    // trigger send manually
    }
  };

  return (
    <form className="flex gap-2 items-end" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        rows={2}
        className="flex-1 px-4 py-3 text-base rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-72 overflow-y-auto"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown} // ✅ listen for Enter
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Send
      </button>
    </form>
  );
}
