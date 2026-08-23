import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import MessageInput from './components/MessageInput'
import './App.css'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messages, setMessages] = useState([])

  const handleSend = (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }])
  }

  const handleNewChat = () => {
    setMessages([])
  }

  const handlePromptClick = (text) => {
    setMessages([{ role: 'user', content: text }])
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
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
      />

      <main className="main">
        <ChatArea messages={messages} onPromptClick={handlePromptClick} />
        <MessageInput onSend={handleSend} />
      </main>
    </div>
  )
}
