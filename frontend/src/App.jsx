import { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import NewChatSidebar from "./components/NewChatSidebar";
import ChatWindow from "./components/ChatWindow";
import AuthScreen from "./components/AuthScreen";

// Helper: create a fresh conversation
const makeDefaultConversation = () => ({
  conversationId: crypto.randomUUID(),
  messages: [
    {
      role: "assistant",
      content: "I'm an AI chatbot. How can I help you today?",
    },
  ],
  pinned: false,
});

const AUTH_STORAGE_KEY = "aurora_auth";

export default function App() {
  const [user, setUser] = useState(null);          // { name, email, picture }
  const [authToken, setAuthToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [chatList, setChatList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ---------- AUTH: hydrate from localStorage on first load ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user && parsed?.access_token) {
          setUser(parsed.user);
          setAuthToken(parsed.access_token);
        }
      }
    } catch (e) {
      console.warn("Failed to restore auth from localStorage", e);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  // ---------- per-user storage keys ----------
  const getChatsKey = useCallback(
    () => (user?.email ? `aurora_chats_${user.email}` : null),
    [user?.email]
  );

  const getActiveKey = useCallback(
    () => (user?.email ? `aurora_active_${user.email}` : null),
    [user?.email]
  );

  // ---------- load chats + active conversation whenever user changes ----------
  useEffect(() => {
    if (!user?.email) {
      setChatList([]);
      setActiveIndex(0);
      return;
    }

    const chatsKey = getChatsKey();
    const activeKey = getActiveKey();
    if (!chatsKey) return;

    const saved = localStorage.getItem(chatsKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatList(parsed);

          // restore last active conversation if exists
          let nextIndex = 0;
          if (activeKey) {
            const savedActiveId = localStorage.getItem(activeKey);
            if (savedActiveId) {
              const idx = parsed.findIndex(
                (c) => c.conversationId === savedActiveId
              );
              if (idx !== -1) {
                nextIndex = idx;
              }
            }
          }

          setActiveIndex(nextIndex);
          return;
        }
      } catch (e) {
        console.warn("Failed to parse saved chats, reinitializing.", e);
      }
    }

    // no saved chats → start with fresh one
    const fresh = [makeDefaultConversation()];
    setChatList(fresh);
    setActiveIndex(0);
  }, [user, getChatsKey, getActiveKey]);

  // ---------- save chats when they change ----------
  useEffect(() => {
    if (!user?.email) return;
    const chatsKey = getChatsKey();
    if (!chatsKey) return;
    try {
      localStorage.setItem(chatsKey, JSON.stringify(chatList));
    } catch (e) {
      console.warn("Failed to save chats to localStorage", e);
    }
  }, [chatList, user, getChatsKey]);

  // ---------- save active conversationId when activeIndex or chatList changes ----------
  useEffect(() => {
    if (!user?.email || chatList.length === 0) return;
    const activeKey = getActiveKey();
    if (!activeKey) return;

    const idx = Math.min(activeIndex, chatList.length - 1);
    const activeId = chatList[idx]?.conversationId;
    if (!activeId) return;

    try {
      localStorage.setItem(activeKey, activeId);
    } catch (e) {
      console.warn("Failed to save active conversation id", e);
    }
  }, [activeIndex, chatList, user, getActiveKey]);

  // ---------- auth handlers ----------
  const handleAuthSuccess = (payload) => {
    // payload: { access_token, user: { name, email, picture } }
    setAuthToken(payload.access_token);
    setUser(payload.user);

    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          access_token: payload.access_token,
          user: payload.user,
        })
      );
    } catch (e) {
      console.warn("Failed to persist auth", e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    setChatList([]);
    setActiveIndex(0);
    setSidebarCollapsed(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // per-user chats & activeId stay, so next login restores them
  };

  // ---------- chat helpers ----------
  const activeConversation =
    chatList.length > 0 ? chatList[Math.min(activeIndex, chatList.length - 1)] : null;

  const activeConversationId = activeConversation?.conversationId;
  const messages = activeConversation?.messages || [];

  const setMessages = (updater) => {
    setChatList((prev) => {
      if (prev.length === 0) return prev;
      const idx = Math.min(activeIndex, prev.length - 1);
      const copy = [...prev];
      const current = copy[idx];

      const nextMessages =
        typeof updater === "function" ? updater(current.messages) : updater;

      copy[idx] = { ...current, messages: nextMessages };
      return copy;
    });
  };

  const handleTogglePin = (conversationId) => {
    setChatList((prev) =>
      prev.map((chat) =>
        chat.conversationId === conversationId
          ? { ...chat, pinned: !chat.pinned }
          : chat
      )
    );
  };

  const handleNewChat = () => {
    setChatList((prev) => {
      const next = [...prev, makeDefaultConversation()];
      setActiveIndex(next.length - 1);
      return next;
    });
  };

  const handleSelectChat = (index) => {
    setActiveIndex(index);
  };

  const handleDeleteChat = (conversationId) => {
    setChatList((prev) => {
      const filtered = prev.filter((c) => c.conversationId !== conversationId);
      if (filtered.length === 0) {
        const fresh = [makeDefaultConversation()];
        setActiveIndex(0);
        return fresh;
      }
      setActiveIndex(0);
      return filtered;
    });
  };

  // ---------- WAIT until we’ve checked localStorage for auth ----------
  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Loading…
      </div>
    );
  }

  // ---------- unauthenticated view ----------
  if (!user || !authToken) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Navbar user={null} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  // ---------- main app ----------
  return (
    <div className="h-screen flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden pt-16 relative">
        {/* Show Bar button when sidebar is collapsed */}
        {sidebarCollapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="absolute left-3 top-4 z-30 w-10 h-10 rounded-full bg-blue-600 shadow-md flex items-center justify-center hover:bg-blue-700 active:scale-[0.97] transition text-white"
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        {/* Sidebar */}
        {!sidebarCollapsed && (
          <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
            <NewChatSidebar
              onNewChat={handleNewChat}
              chatList={chatList}
              onSelectChat={handleSelectChat}
              onDeleteChat={handleDeleteChat}
              onTogglePin={handleTogglePin}
              onToggleSidebar={() => setSidebarCollapsed(true)}
              sidebarCollapsed={sidebarCollapsed}
              activeConversationId={activeConversationId}
            />
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto">
            <ChatWindow
              messages={messages}
              setMessages={setMessages}
              conversationId={activeConversationId}
              authToken={authToken}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
