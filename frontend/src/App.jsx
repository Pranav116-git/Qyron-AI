import { useState, useCallback, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import MessageInput from './components/MessageInput'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const STORAGE_KEY = 'qyron-conversations'

function loadConversations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveConversations(conversations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
}

function getUserName() {
  try {
    return localStorage.getItem('qyron-user-name') || ''
  } catch {
    return ''
  }
}

function deriveTitle(messages) {
  const first = messages.find(m => m.role === 'user')
  if (!first) return 'New Chat'
  return first.content.length > 30
    ? first.content.slice(0, 30) + '...'
    : first.content
}

function updateConversation(conversations, id, updater) {
  return conversations.map(c => {
    if (c.id !== id) return c
    const updated = updater(c)
    const title = c.title === 'New Chat'
      ? deriveTitle(updated.messages)
      : c.title
    return { ...updated, title }
  })
}

function now() {
  return Date.now()
}

function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m} ${period}`
}

function backfillTimestamps(messages) {
  let base = now() - messages.length * 60000
  return messages.map((msg) => {
    if (msg.timestamp) return msg
    base += 60000
    return { ...msg, timestamp: base }
  })
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('qyron-theme') || 'dark'
    } catch {
      return 'dark'
    }
  })
  const [conversations, setConversations] = useState(() => {
    const loaded = loadConversations()
    return loaded.map(conv => ({
      ...conv,
      messages: backfillTimestamps(conv.messages),
    }))
  })
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)
  const lastRemovedAssistantRef = useRef(null)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('qyron-theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const activeConversation = conversations.find(c => c.id === activeId)
  const messages = activeConversation ? activeConversation.messages : []

  const persist = useCallback((updated) => {
    setConversations(updated)
    saveConversations(updated)
  }, [])

  const handleStop = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }

  const handleSend = async (text) => {
    let currentId = activeId

    if (!currentId) {
      currentId = crypto.randomUUID()
      const newConv = { id: currentId, title: 'New Chat', messages: [] }
      persist([newConv, ...conversations])
      setActiveId(currentId)
    }

    const userMsg = { role: 'user', content: text, timestamp: now() }
    setError(null)
    setLoading(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    setConversations(prev => {
      const updated = updateConversation(prev, currentId, c => ({
        ...c,
        messages: [...c.messages, userMsg],
      }))
      saveConversations(updated)
      return updated
    })

    const existingMessages = activeConversation ? activeConversation.messages : []
    const updatedHistory = [...existingMessages, userMsg]
    const userName = getUserName()

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
          user_name: userName,
        }),
        signal: controller.signal,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Something went wrong')
      }

      const assistantMsg = { role: 'assistant', content: data.response, timestamp: now() }

      setConversations(prev => {
        const updated = updateConversation(prev, currentId, c => ({
          ...c,
          messages: [...c.messages, assistantMsg],
        }))
        saveConversations(updated)
        return updated
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        return
      }
      setError(err.message)
      setConversations(prev => {
        const updated = updateConversation(prev, currentId, c => ({
          ...c,
          messages: c.messages.slice(0, -1),
        }))
        saveConversations(updated)
        return updated
      })
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleEditMessage = async (messageIndex, newContent) => {
    if (loading || !activeConversation) return

    const trimmed = newContent.trim()
    if (!trimmed) return

    const msg = messages[messageIndex]
    if (!msg || msg.role !== 'user') return

    setError(null)
    setLoading(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    const historyUpToEdit = [
      ...messages.slice(0, messageIndex),
      { role: 'user', content: trimmed, timestamp: now() },
    ]
    const userName = getUserName()

    setConversations(prev => {
      const updated = updateConversation(prev, activeId, c => ({
        ...c,
        messages: historyUpToEdit,
      }))
      saveConversations(updated)
      return updated
    })

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          messages: historyUpToEdit.map(m => ({ role: m.role, content: m.content })),
          user_name: userName,
        }),
        signal: controller.signal,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Something went wrong')
      }

      const assistantMsg = { role: 'assistant', content: data.response, timestamp: now() }

      setConversations(prev => {
        const updated = updateConversation(prev, activeId, c => ({
          ...c,
          messages: [...c.messages, assistantMsg],
        }))
        saveConversations(updated)
        return updated
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleNewChat = () => {
    setActiveId(null)
    setError(null)
    setLoading(false)
    if (isMobile) setSidebarOpen(false)
  }

  const handleSelectChat = (id) => {
    setActiveId(id)
    setError(null)
    setLoading(false)
  }

  const handleDeleteChat = (id) => {
    persist(conversations.filter(c => c.id !== id))
    if (activeId === id) {
      setActiveId(null)
      setError(null)
      setLoading(false)
    }
  }

  const handleRenameChat = (id, newTitle) => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    persist(conversations.map(c => c.id === id ? { ...c, title: trimmed } : c))
  }

  const handleRegenerate = async () => {
    if (loading || !activeConversation) return

    let lastUserIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i
        break
      }
    }
    if (lastUserIndex === -1) return

    const lastUserMsg = messages[lastUserIndex]
    const historyUpToUser = messages.slice(0, lastUserIndex + 1)
    const userName = getUserName()

    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')
    lastRemovedAssistantRef.current = lastAssistantMsg || null

    setError(null)
    setLoading(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    setConversations(prev => {
      const updated = updateConversation(prev, activeId, c => ({
        ...c,
        messages: historyUpToUser,
      }))
      saveConversations(updated)
      return updated
    })

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: lastUserMsg.content,
          messages: historyUpToUser.map(m => ({ role: m.role, content: m.content })),
          user_name: userName,
        }),
        signal: controller.signal,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Something went wrong')
      }

      const assistantMsg = { role: 'assistant', content: data.response, timestamp: now() }

      setConversations(prev => {
        const updated = updateConversation(prev, activeId, c => ({
          ...c,
          messages: [...c.messages, assistantMsg],
        }))
        saveConversations(updated)
        return updated
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        const removed = lastRemovedAssistantRef.current
        if (removed) {
          setConversations(prev => {
            const updated = updateConversation(prev, activeId, c => ({
              ...c,
              messages: [...c.messages, removed],
            }))
            saveConversations(updated)
            return updated
          })
        }
        lastRemovedAssistantRef.current = null
        return
      }
      setError(err.message)
      const removed = lastRemovedAssistantRef.current
      if (removed) {
        setConversations(prev => {
          const updated = updateConversation(prev, activeId, c => ({
            ...c,
            messages: [...c.messages, removed],
          }))
          saveConversations(updated)
          return updated
        })
      }
      lastRemovedAssistantRef.current = null
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handlePromptClick = (text) => {
    handleSend(text)
  }

  return (
    <div className="app">
      {!sidebarOpen && (
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      )}

      {isMobile && sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeId={activeId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main">
        <ChatArea
          messages={messages}
          loading={loading}
          error={error}
          onPromptClick={handlePromptClick}
          onRegenerate={handleRegenerate}
          onEditMessage={handleEditMessage}
          formatTimestamp={formatTimestamp}
        />
        <MessageInput onSend={handleSend} onStop={handleStop} disabled={loading} />
      </main>
    </div>
  )
}
