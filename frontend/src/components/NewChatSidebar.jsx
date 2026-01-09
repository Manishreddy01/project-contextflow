// src/components/NewChatSidebar.jsx
export default function NewChatSidebar({
  onNewChat,
  chatList,
  onSelectChat,
  onDeleteChat,     // still here if you want it later
  onTogglePin,      // same
  onToggleSidebar,
  activeConversationId,
}) {
  const pinned = chatList.filter((c) => c.pinned);
  const others = chatList.filter((c) => !c.pinned);

  return (
    <div className="w-full h-full flex flex-col text-slate-50">
      <div className="p-4 pb-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            ContextFlow
          </h2>
          <p className="text-base font-semibold text-slate-200">
            Conversations
          </p>
        </div>
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm hover:bg-slate-700"
          aria-label="Hide sidebar"
        >
          ‹
        </button>
      </div>

      <div className="px-4 py-3 border-b border-white/5">
        <button
          onClick={onNewChat}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-full shadow-md transition"
        >
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 text-sm">
        {pinned.length > 0 && (
          <>
            <p className="px-1 text-sm font-semibold text-slate-100 mb-2">
              Pinned
            </p>
            {pinned.map((chat, index) => {
              const isActive = chat.conversationId === activeConversationId;
              return (
                <button
                  key={chat.conversationId || `pinned-${index}`}
                  onClick={() =>
                    onSelectChat(
                      chatList.findIndex(
                        (c) => c.conversationId === chat.conversationId
                      )
                    )
                  }
                  className={`w-full text-left px-3 py-2.5 rounded-xl mb-2 truncate ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-900/60 hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  {chat.messages?.[1]?.content || "New chat"}
                </button>
              );
            })}

            <p className="px-1 mt-4 text-sm font-semibold text-slate-100 mb-2">
              Recent
            </p>
          </>
        )}

        {pinned.length === 0 && (
          <p className="px-1 text-sm font-semibold text-slate-100 mb-2">
            Recent
          </p>
        )}

        {others.map((chat, index) => {
          const isActive = chat.conversationId === activeConversationId;
          return (
            <button
              key={chat.conversationId || index}
              onClick={() => onSelectChat(index)}
              className={`w-full text-left px-3 py-2.5 rounded-xl mb-2 truncate ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900/60 hover:bg-slate-800 text-slate-100"
              }`}
            >
              {chat.messages?.[1]?.content || "New chat"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
