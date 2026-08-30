import { useRef, useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { QyronStaticOrb } from './QyronOrb'

const EXAMPLE_PROMPTS = [
  {
    id: 1,
    text: 'Explain how AI works in simple terms',
    type: 'amber',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
  {
    id: 2,
    text: 'Write a Python function to sort a list',
    type: 'green',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: 3,
    text: 'What are the best practices for React?',
    type: 'purple',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" />
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
  {
    id: 4,
    text: 'Help me debug this code',
    type: 'blue',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="6" width="8" height="12" rx="4" />
        <line x1="6" y1="9" x2="2" y2="8" />
        <line x1="6" y1="12" x2="2" y2="12" />
        <line x1="6" y1="15" x2="2" y2="16" />
        <line x1="18" y1="9" x2="22" y2="8" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="18" y1="15" x2="22" y2="16" />
      </svg>
    ),
  },
]

function CopyButton({ text }) {
  const [state, setState] = useState('copy')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
      setTimeout(() => setState('copy'), 2000)
    } catch {
      setState('error')
      setTimeout(() => setState('copy'), 2000)
    }
  }

  return (
    <button
      className={`copy-btn ${state === 'copied' ? 'copied' : ''} ${state === 'error' ? 'error' : ''}`}
      onClick={handleCopy}
      aria-label="Copy code"
    >
      {state === 'copied' ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Copied</span>
        </>
      ) : state === 'error' ? (
        'Failed'
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

function MessageActions({ content, onRegenerate, isLast, loading }) {
  const [state, setState] = useState('copy')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setState('copied')
      setTimeout(() => setState('copy'), 2000)
    } catch {
      setState('error')
      setTimeout(() => setState('copy'), 2000)
    }
  }

  return (
    <div className="message-actions">
      <button
        className={`message-copy-btn ${state === 'copied' ? 'copied' : ''} ${state === 'error' ? 'error' : ''}`}
        onClick={handleCopy}
        aria-label="Copy response"
      >
        {state === 'copied' ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Copied</span>
          </>
        ) : state === 'error' ? (
          'Failed'
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copy</span>
          </>
        )}
      </button>
      {isLast && (
        <button
          className="message-regenerate-btn"
          onClick={onRegenerate}
          disabled={loading}
          aria-label="Regenerate response"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <span>Regenerate</span>
        </button>
      )}
    </div>
  )
}

function MarkdownContent({ content }) {
  return (
    <Markdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const code = String(children).replace(/\n$/, '')
          if (match) {
            return (
              <div className="code-block">
                <div className="code-header">
                  <span className="code-lang">{match[1]}</span>
                  <CopyButton text={code} />
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                    fontSize: '13px',
                    background: 'var(--bg-code)',
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            )
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </Markdown>
  )
}

function EditableUserMessage({ content, onSave, onCancel }) {
  const [value, setValue] = useState(content)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      )
    }
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed) {
        onSave(trimmed)
      }
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed) {
      onSave(trimmed)
    }
  }

  return (
    <div className="message-edit-container">
      <textarea
        ref={textareaRef}
        className="message-edit-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <div className="message-edit-actions">
        <button className="edit-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="edit-save-btn"
          onClick={handleSubmit}
          disabled={!value.trim()}
        >
          Save & Send
        </button>
      </div>
    </div>
  )
}

export default function ChatArea({ messages, loading, error, onPromptClick, onRegenerate, onEditMessage, formatTimestamp }) {
  const bottomRef = useRef(null)
  const isEmpty = messages.length === 0
  const [editingIndex, setEditingIndex] = useState(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const latestUserIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return i
    }
    return -1
  })()

  const handleEditSave = (newContent) => {
    if (editingIndex === null) return
    onEditMessage(editingIndex, newContent)
    setEditingIndex(null)
  }

  const handleEditCancel = () => {
    setEditingIndex(null)
  }

  if (isEmpty) {
    return (
      <div className="chat-area">
        <div className="atmospheric-ring-system" aria-hidden="true">
          <div className="atmospheric-glow" />
          <div className="atmospheric-ring" />
        </div>
        <div className="dotted-grid-accent" aria-hidden="true" />
        <div className="empty-state">
          <h1 className="empty-title">
            <span className="brand-qyron">Qyron</span>{' '}
            <span className="brand-ai">
              AI
              <svg className="sparkle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="url(#sparkle-grad)" />
                <defs>
                  <linearGradient id="sparkle-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e9d5ff" />
                    <stop offset="0.5" stopColor="#c084fc" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
          <div className="title-underline-accent" aria-hidden="true" />
          <p className="empty-subtitle">
            Your intelligent coding assistant. Ask anything about code,<br className="desktop-br" />
            debugging, or development.
          </p>

          <div className="prompt-grid">
            {EXAMPLE_PROMPTS.map(prompt => (
              <button
                key={prompt.id}
                className="prompt-card"
                onClick={() => onPromptClick(prompt.text)}
              >
                <div className={`prompt-icon-wrapper prompt-icon-${prompt.type}`}>
                  {prompt.icon}
                </div>
                <span className="prompt-text">{prompt.text}</span>
                <div className="prompt-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-area">
      <div className="messages-container">
        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1 && !loading
          const isLatestUser = msg.role === 'user' && i === latestUserIndex
          const isEditing = editingIndex === i

          return (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? (
                  <span className="user-avatar-text">U</span>
                ) : (
                  <QyronStaticOrb size={28} className="assistant-orb-avatar" alt="Qyron AI" state={isLastAssistant && loading ? 'thinking' : 'idle'} />
                )}
              </div>
              <div className="message-content">
                {msg.role === 'assistant' ? (
                  <>
                    <MarkdownContent content={msg.content} />
                    <MessageActions
                      content={msg.content}
                      onRegenerate={onRegenerate}
                      isLast={isLastAssistant}
                      loading={loading}
                    />
                  </>
                ) : isEditing ? (
                  <EditableUserMessage
                    content={msg.content}
                    onSave={handleEditSave}
                    onCancel={handleEditCancel}
                  />
                ) : (
                  <>
                    <div className="user-message-text">{msg.content}</div>
                    {isLatestUser && !loading && editingIndex === null && (
                      <button
                        className="message-edit-btn"
                        onClick={() => setEditingIndex(i)}
                        aria-label="Edit message"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                        <span>Edit</span>
                      </button>
                    )}
                  </>
                )}
                {msg.timestamp && (
                  <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                )}
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="message assistant message-thinking">
            <div className="message-avatar">
              <QyronStaticOrb size={28} className="assistant-orb-avatar" alt="Qyron AI" loading={true} state="thinking" />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
