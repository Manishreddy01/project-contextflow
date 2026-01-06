// src/components/ChatInput.jsx
import { useState, useRef, useEffect } from "react";

export default function ChatInput({ onSend, files, setFiles, isLoading }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() && (!files || files.length === 0)) return;
    if (isLoading) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    if (typeof setFiles === "function") {
      setFiles(selected);
    }
  };

  const isDisabled =
    isLoading || (!input.trim() && (!files || files.length === 0));

  return (
    <form
      className="flex items-center gap-3 w-full"
      onSubmit={handleSubmit}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* + (file) button */}
      <button
        type="button"
        onClick={handleFileClick}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 shadow-md hover:bg-blue-700 active:scale-[0.97] transition text-white"
        aria-label="Upload files"
      >
        <span className="text-xl leading-none font-semibold text-white">+</span>
      </button>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        rows={1}
        className="flex-1 px-4 py-3 text-base rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32 overflow-y-auto"
        placeholder="Ask about your documents or the web..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={isDisabled}
        className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md active:scale-[0.97] transition
          ${
            isDisabled
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }
        `}
        aria-label="Send message"
      >
        <span className="text-white text-lg font-bold leading-none">
          ➤
        </span>
      </button>
    </form>
  );
}
