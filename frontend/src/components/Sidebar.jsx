import { useState, useRef, useEffect, useCallback } from 'react'
import { QyronStaticOrb } from './QyronOrb'

function formatRelativeTime(ts) {
  if (!ts) return ''
  const now = Date.now()
  const diffMinutes = Math.floor((now - ts) / 60000)
  if (diffMinutes < 5) return 'Now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getChatTime(chat) {
  if (!chat.messages || chat.messages.length === 0) return ''
  const lastMsg = chat.messages[chat.messages.length - 1]
  return formatRelativeTime(lastMsg.timestamp)
}

export default function Sidebar({
  isOpen,
  onNewChat,
  conversations,
  activeId,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onClose,
  theme = 'dark',
  onToggleTheme,
}) {
  const [hoveredId, setHoveredId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // User name state
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem('qyron-user-name') || ''
    } catch {
      return ''
    }
  })
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  const editInputRef = useRef(null)
  const searchInputRef = useRef(null)
  const nameInputRef = useRef(null)
  const previousTitleRef = useRef('')
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [isEditingName])

  // Handle Ctrl+K / Cmd+K shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredConversations = searchQuery.trim()
    ? conversations.filter(c =>
        c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : conversations

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

  // User name editing logic
  const startEditingName = (e) => {
    if (e) e.stopPropagation()
    setNameValue(userName)
    setIsEditingName(true)
  }

  const saveUserName = () => {
    if (!isEditingName) return
    const trimmed = nameValue.trim()
    if (trimmed) {
      setUserName(trimmed)
      try {
        localStorage.setItem('qyron-user-name', trimmed)
      } catch {}
    }
    setIsEditingName(false)
  }

  const cancelEditingName = () => {
    setIsEditingName(false)
    setNameValue('')
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveUserName()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEditingName()
    }
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-row">
          <button
            className="sidebar-header-toggle"
            onClick={onClose}
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="brand">
            <QyronStaticOrb size={28} className="brand-orb" alt="Qyron Orb" />
            <span className="brand-name">
              <span className="brand-qyron">Qyron</span> <span className="brand-ai">AI</span>
            </span>
          </div>
        </div>
        <button className="btn-new-chat" onClick={onNewChat}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      <div className="sidebar-search">
        <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={searchInputRef}
          className="search-input"
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery ? (
          <button
            className="search-clear"
            onClick={() => { setSearchQuery(''); searchInputRef.current?.focus() }}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <kbd className="search-kbd">⌘ K</kbd>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">RECENT</div>
        <ul className="chat-list">
          {conversations.length === 0 && (
            <li className="chat-item empty-hint">
              <span className="chat-title">No conversations yet</span>
            </li>
          )}
          {conversations.length > 0 && filteredConversations.length === 0 && (
            <li className="chat-item empty-hint">
              <span className="chat-title">No conversations found</span>
            </li>
          )}
          {filteredConversations.map(chat => {
            const relativeTime = getChatTime(chat)
            return (
              <li
                key={chat.id}
                className={`chat-item ${activeId === chat.id ? 'active' : ''} ${hoveredId === chat.id ? 'hovered' : ''} ${editingId === chat.id ? 'editing' : ''}`}
                onMouseEnter={() => setHoveredId(chat.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => { if (editingId !== chat.id) { onSelectChat(chat.id); if (onClose && window.innerWidth <= 768) onClose() } }}
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
                  <>
                    <span className="chat-title">{chat.title}</span>
                    {relativeTime && editingId !== chat.id && (
                      <span className="chat-time">{relativeTime}</span>
                    )}
                  </>
                )}
                {(isTouchDevice || hoveredId === chat.id) && editingId !== chat.id && (
                  <div className="chat-actions" onClick={(e) => e.stopPropagation()}>
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
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-area" onClick={startEditingName}>
          <div className="avatar">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                className="user-name-input"
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={saveUserName}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter your name"
                maxLength={30}
              />
            ) : userName ? (
              <span className="user-name">{userName}</span>
            ) : (
              <>
                <span className="user-name">User</span>
                <span className="user-subtext">Set your name</span>
              </>
            )}
          </div>
          {!isEditingName && (
            <button className="user-edit-btn" onClick={startEditingName} aria-label="Edit name">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          )}
        </div>

        <div className="theme-area" onClick={onToggleTheme} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleTheme?.() }}>
          <div className="theme-info">
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            <span className="theme-label">Theme</span>
          </div>
          <svg className="theme-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </aside>
  )
}
