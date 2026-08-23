const EXAMPLE_PROMPTS = [
  { id: 1, text: 'Explain how AI works in simple terms', icon: '💡' },
  { id: 2, text: 'Write a Python function to sort a list', icon: '🐍' },
  { id: 3, text: 'What are the best practices for React?', icon: '⚛️' },
  { id: 4, text: 'Help me debug this code', icon: '🐛' },
]

export default function ChatArea({ messages, onPromptClick }) {
  const isEmpty = messages.length === 0

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
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
