import { useState } from 'react'

const PLACEHOLDER_CHATS = [
  { id: 1, title: 'Getting started with Qyron' },
  { id: 2, title: 'Explain quantum computing' },
  { id: 3, title: 'Write a Python function' },
]

export default function Sidebar({ isOpen, onClose, onNewChat }) {
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
          {PLACEHOLDER_CHATS.map(chat => (
            <li
              key={chat.id}
              className={`chat-item ${hoveredId === chat.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredId(chat.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <svg className="chat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="chat-title">{chat.title}</span>
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
