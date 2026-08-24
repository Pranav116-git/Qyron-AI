import { useRef, useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const EXAMPLE_PROMPTS = [
  { id: 1, text: 'Explain how AI works in simple terms', icon: '💡' },
  { id: 2, text: 'Write a Python function to sort a list', icon: '🐍' },
  { id: 3, text: 'What are the best practices for React?', icon: '⚛️' },
  { id: 4, text: 'Help me debug this code', icon: '🐛' },
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
      {state === 'copied' ? 'Copied \u2713' : state === 'error' ? 'Failed' : 'Copy'}
    </button>
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
                <CopyButton text={code} />
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: 'var(--radius)',
                    fontSize: '13px',
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

export default function ChatArea({ messages, loading, error, onPromptClick }) {
  const bottomRef = useRef(null)
  const isEmpty = messages.length === 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (isEmpty) {
    return (
      <div className="chat-area">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="empty-title">Qyron AI</h1>
          <p className="empty-subtitle">Your intelligent coding assistant. Ask anything about code, debugging, or development.</p>

          <div className="prompt-grid">
            {EXAMPLE_PROMPTS.map(prompt => (
              <button
                key={prompt.id}
                className="prompt-card"
                onClick={() => onPromptClick(prompt.text)}
              >
                <span className="prompt-icon">{prompt.icon}</span>
                <span className="prompt-text">{prompt.text}</span>
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
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? 'S' : 'Q'}
            </div>
            <div className="message-content">
              {msg.role === 'assistant' ? (
                <MarkdownContent content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-avatar">Q</div>
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
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
