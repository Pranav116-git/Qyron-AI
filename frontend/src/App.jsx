import { useState, useCallback } from 'react'
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
    return { ...updated, title: deriveTitle(updated.messages) }
  })
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState(loadConversations)
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const activeConversation = conversations.find(c => c.id === activeId)
  const messages = activeConversation ? activeConversation.messages : []

  const persist = useCallback((updated) => {
    setConversations(updated)
    saveConversations(updated)
  }, [])

  const handleSend = async (text) => {
    let currentId = activeId

    if (!currentId) {
      currentId = crypto.randomUUID()
      const newConv = { id: currentId, title: 'New Chat', messages: [] }
      persist([newConv, ...conversations])
      setActiveId(currentId)
    }

    const userMsg = { role: 'user', content: text }
    setError(null)
    setLoading(true)

    setConversations(prev => {
      const updated = updateConversation(prev, currentId, c => ({
        ...c,
        messages: [...c.messages, userMsg],
      }))
      saveConversations(updated)
      return updated
    })

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Something went wrong')
      }

      const assistantMsg = { role: 'assistant', content: data.response }

      setConversations(prev => {
        const updated = updateConversation(prev, currentId, c => ({
          ...c,
          messages: [...c.messages, assistantMsg],
        }))
        saveConversations(updated)
        return updated
      })
    } catch (err) {
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
    }
  }

  const handleNewChat = () => {
    setActiveId(null)
    setError(null)
    setLoading(false)
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

  const handlePromptClick = (text) => {
    handleSend(text)
  }

  return (
    <div className="app">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      <Sidebar
        isOpen={sidebarOpen}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeId={activeId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      <main className="main">
        <ChatArea messages={messages} loading={loading} error={error} onPromptClick={handlePromptClick} />
        <MessageInput onSend={handleSend} disabled={loading} />
      </main>
    </div>
  )
}
