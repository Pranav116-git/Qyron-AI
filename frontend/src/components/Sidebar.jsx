import { useState } from 'react'

export default function Sidebar({ isOpen, onNewChat, conversations, activeId, onSelectChat, onDeleteChat }) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">Q</div>
          <span className="brand-name">Qyron AI</span>
        </div>
        <button className="btn-new-chat" onClick={onNewChat}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Recent</div>
        <ul className="chat-list">
          {conversations.length === 0 && (
            <li className="chat-item empty-hint">
              <span className="chat-title">No conversations yet</span>
            </li>
          )}
          {conversations.map(chat => (
            <li
              key={chat.id}
              className={`chat-item ${activeId === chat.id ? 'active' : ''} ${hoveredId === chat.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredId(chat.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectChat(chat.id)}
            >
              <svg className="chat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="chat-title">{chat.title}</span>
              {hoveredId === chat.id && (
                <button
                  className="chat-delete"
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id) }}
                  aria-label="Delete conversation"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-area">
          <div className="avatar">S</div>
          <span className="user-name">Shree</span>
        </div>
      </div>
    </aside>
  )
}
