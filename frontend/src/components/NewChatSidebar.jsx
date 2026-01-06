export default function NewChatSidebar({
  onNewChat,
  chatList,
  onSelectChat,
  onDeleteChat,
  onToggleSidebar,
  sidebarCollapsed,
  onTogglePin,
  activeConversationId,
}) {
  // split pinned vs normal
  const pinned = chatList.filter((c) => c.pinned);
  const others = chatList.filter((c) => !c.pinned);

  const renderChatButton = (chat, index) => {
    const isActive = chat.conversationId === activeConversationId;

    return (
      <div
        key={chat.conversationId || index}
        className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-sm cursor-pointer ${
          isActive
            ? "bg-blue-100 text-blue-800 font-medium"
            : "hover:bg-gray-200 text-gray-700"
        }`}
        onClick={() => onSelectChat(index)}
      >
        <span className="truncate mr-2">
          {chat.messages?.[1]?.content || "New Chat"}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* pin/unpin */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin && onTogglePin(chat.conversationId);
            }}
            className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          >
            {chat.pinned ? "Unpin" : "Pin"}
          </button>

          {/* delete */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChat && onDeleteChat(chat.conversationId);
            }}
            className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-100">
      {/* big toggle on the right edge */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="absolute -right-3 top-4 z-20 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.96] transition"
      >
        {sidebarCollapsed ? "▶" : "◀"}
      </button>

      <div className="p-4 pb-3 border-b border-gray-200 bg-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Project Aurora</h2>
        <p className="text-xs text-gray-500">Your document copilot</p>

        <button
          type="button"
          onClick={onNewChat}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-colors active:scale-[0.98]"
          style={{ color: "#fff" }}   // <-- force white text
        >
          New Chat
        </button>

      </div>

      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="p-3 space-y-3">
          {pinned.length > 0 && (
            <>
              <h3 className="text-xs font-semibold text-gray-500 px-1">
                PINNED
              </h3>
              <div className="space-y-1">{pinned.map(renderChatButton)}</div>
            </>
          )}

          <h3 className="text-xs font-semibold text-gray-500 px-1 mt-2">
            CONVERSATIONS
          </h3>
          <div className="space-y-1">
            {others.length === 0 ? (
              <p className="text-xs text-gray-400 px-1">
                No conversations yet. Start one!
              </p>
            ) : (
              others.map(renderChatButton)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
