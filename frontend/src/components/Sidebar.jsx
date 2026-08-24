import { useState, useRef, useEffect, useCallback } from 'react'

export default function Sidebar({ isOpen, onNewChat, conversations, activeId, onSelectChat, onDeleteChat, onRenameChat }) {
  const [hoveredId, setHoveredId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef(null)
  const previousTitleRef = useRef('')

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const startEditing = useCallback((chat) => {
    previousTitleRef.current = chat.title
    setEditValue(chat.title)
    setEditingId(chat.id)
  }, [])

  const saveEdit = useCallback(() => {
    if (!editingId) return
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== previousTitleRef.current) {
      onRenameChat(editingId, trimmed)
    }
    setEditingId(null)
    setEditValue('')
  }, [editingId, editValue, onRenameChat])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditValue('')
  }, [])

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

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
              className={`chat-item ${activeId === chat.id ? 'active' : ''} ${hoveredId === chat.id ? 'hovered' : ''} ${editingId === chat.id ? 'editing' : ''}`}
              onMouseEnter={() => setHoveredId(chat.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => { if (editingId !== chat.id) onSelectChat(chat.id) }}
            >
              <svg className="chat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {editingId === chat.id ? (
                <input
                  ref={editInputRef}
                  className="chat-rename-input"
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={saveEdit}
                  onClick={(e) => e.stopPropagation()}
                  maxLength={50}
                />
              ) : (
                <span className="chat-title">{chat.title}</span>
              )}
              {hoveredId === chat.id && editingId !== chat.id && (
                <>
                  <button
                    className="chat-rename"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); startEditing(chat) }}
                    aria-label="Rename conversation"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </button>
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
                </>
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
