import { useState, useRef, useEffect } from 'react'

export default function MessageInput({ onSend }) {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="input-area">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="message-input"
          placeholder="Message Qyron AI..."
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={`send-btn ${input.trim() ? 'active' : ''}`}
          onClick={handleSubmit}
          disabled={!input.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>
      <p className="input-hint">Qyron AI can make mistakes. Verify important information.</p>
    </div>
  )
}
