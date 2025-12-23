import { useState, useEffect } from "react";  // ⬅️ add useEffect
import ChatFeed from "./ChatFeed";
import ChatInput from "./ChatInput";
import FileUpload from "./FileUpload";
import { v4 as uuidv4 } from "uuid";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function ChatWindow({ messages, setMessages, conversationId }) {
  const [files, setFiles] = useState([]);

  // 🔹 Stable conversation ID for this component
  const [convId, setConvId] = useState(() => {
    // Priority: prop → localStorage → new UUID
    if (conversationId) {
      localStorage.setItem("conversationId", conversationId);
      return conversationId;
    }

    const stored = localStorage.getItem("conversationId");
    if (stored) return stored;

    const fresh = uuidv4();
    localStorage.setItem("conversationId", fresh);
    return fresh;
  });

  // 🔹 If parent ever passes a new conversationId, sync it
  useEffect(() => {
    if (conversationId && conversationId !== convId) {
      setConvId(conversationId);
      localStorage.setItem("conversationId", conversationId);
    }
  }, [conversationId, convId]);

  const handleSend = async (inputText) => {
    if (!inputText.trim() && files.length === 0) return;

    // --------------------------------------------------
    // Use stable convId from state (no more local let convId logic)
    // --------------------------------------------------
    const activeConvId = convId;

    // Add user messages to UI
    const newMessages = [];
    if (inputText.trim()) {
      newMessages.push({ role: "user", content: inputText });
    }

    if (files.length > 0) {
      const fileMessages = files.map((file) => ({
        role: "user",
        content: `📄 Uploaded: ${file.name}`,
      }));
      newMessages.push(...fileMessages);
    }

    setMessages((prev) => [...prev, ...newMessages]);

    console.log("QUERY PAYLOAD:", {
      question: inputText,
      conversationId: activeConvId,
      files,
    });

    // --------------------------------------------------
    // Upload document(s) ONLY if there are files
    // --------------------------------------------------
    if (files.length > 0) {
      const formData = new FormData();
      formData.append("conversationId", activeConvId);

      files.forEach((file) => {
        formData.append("files", file); // MUST use same key used in backend
      });

      formData.forEach((v, k) => console.log("FORMDATA:", k, v));

      try {
        await fetch(`${BACKEND_URL}/upload/`, {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    // --------------------------------------------------
    // Query backend
    // --------------------------------------------------
    try {
      const res = await fetch(`${BACKEND_URL}/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: inputText,
          conversationId: activeConvId,
        }),
      });

      const data = await res.json();
      console.log("QUERY RESPONSE:", data);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          type: data.type,
          confidence: data.confidence,
        },
      ]);
    } catch (err) {
      console.error("Query failed:", err);
    }

    setFiles([]);
  };

  console.log("DEBUG FILE UPLOAD:", files);
  console.log("DEBUG conversationId used (frontend):", convId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-5 px-4">
        <ChatFeed messages={messages} />
      </div>

      <div className="mt-4 p-4 bg-white space-y-4">
        <ChatInput onSend={handleSend} />
        <FileUpload files={files} setFiles={setFiles} />
      </div>
    </div>
  );
}
