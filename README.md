# Qyron AI

**An AI-powered chat workspace with multi-turn conversations, syntax-highlighted code rendering, and a polished dark-mode interface. Built with React and FastAPI, powered by Google Gemini through OpenRouter.**

---

## Overview

Qyron AI is a full-stack chat application designed for developers and technical users who want a clean, responsive interface for interacting with a large language model. It provides persistent multi-turn conversations, inline code highlighting with one-click copying, message editing, response regeneration, and a dark/light theme system — all backed by a lightweight Python API that proxies requests through OpenRouter to Google Gemini 2.5 Flash.

The application is built as a two-tier architecture: a static React frontend deployed to GitHub Pages, and a FastAPI backend deployed to Render. There is no database and no user authentication — conversations are stored locally in the browser via `localStorage`.

---

## Features

### Core Chat
- AI-powered chat via Google Gemini 2.5 Flash through OpenRouter
- Multi-turn conversation context (configurable, up to 20 messages)
- Response regeneration with previous-response restoration on cancel
- In-flight request cancellation via stop button
- Automatic conversation title derivation from first user message

### Conversation Management
- Create, switch, rename, and delete conversations
- Full-text search across conversation titles (Ctrl/Cmd+K)
- Client-side relative timestamps ("Now", "5m ago", "Yesterday")
- All conversations persisted in browser `localStorage`

### Message Editing
- Edit any previous user message in-place
- Truncated history sent to backend for accurate re-generation
- Edit mode with keyboard confirm (Enter) and cancel (Escape)

### Rendering
- GitHub-flavored Markdown rendering via `react-markdown`
- Syntax-highlighted code blocks for 100+ languages via `react-syntax-highlighter` (VSC Dark+ theme)
- One-click copy on all code blocks with visual confirmation
- Copy button on assistant message actions

### UI/UX
- Dark and light themes with CSS custom property system
- Theme preference persisted across sessions
- Atmospheric hero section with animated ring and dotted-grid accent on empty state
- Glass-style suggestion prompt cards for quick-starting conversations
- Responsive sidebar (drawer on mobile, fixed panel on desktop)
- User display name with inline editing
- Thinking/loading indicator with animated pulse dots
- Error banner with descriptive messages
- Touch-target optimization for mobile devices
- Safe-area-inset support for notched screens
- `prefers-reduced-motion` respected across all animations

### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Enter` | Send message |
| `Shift + Enter` | Insert newline |
| `Ctrl / Cmd + K` | Focus conversation search |
| `Escape` | Cancel message edit or name edit |
| `Enter` (in edit mode) | Confirm edit |

---

## Screenshots

> Screenshots can be added here.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, JavaScript |
| Markdown | react-markdown 10 |
| Syntax Highlighting | react-syntax-highlighter 16 (Prism / VSC Dark+) |
| Linting | oxlint 1.75 |
| Backend | Python 3.10+, FastAPI 0.115, Uvicorn 0.34 |
| HTTP Client | httpx 0.28 |
| AI Gateway | OpenRouter |
| Default Model | Google Gemini 2.5 Flash |
| Frontend Deployment | GitHub Pages (via GitHub Actions) |
| Backend Deployment | Render |

---

## Architecture

```
┌─────────────────────┐      ┌─────────────────────┐      ┌────────────┐      ┌─────────────────┐
│   React Frontend    │─────▶│   FastAPI Backend   │─────▶│  OpenRouter │─────▶│ Gemini 2.5 Flash│
│  (GitHub Pages)     │ /api │    (Render)          │      │   Gateway   │      │                 │
└─────────────────────┘      └─────────────────────┘      └────────────┘      └─────────────────┘
        │                              │
        ▼                              ▼
  localStorage                 Environment config
  (conversations,              (API key, model,
   theme, user name)            token limits, CORS)
```

**Key architectural decisions:**

- **No database.** All conversation data is stored in the browser's `localStorage`. This keeps the backend stateless and eliminates data management complexity.
- **No authentication.** The application has no user accounts, login, or session management. The API key lives exclusively on the backend and is never exposed to the client.
- **No routing.** The frontend is a single-page application with no URL-based navigation. Conversation state is managed entirely in React state.
- **Stateless backend.** The FastAPI server processes each request independently. It receives conversation history from the frontend, prepends the system prompt, forwards to OpenRouter, and returns the response.

---

## How It Works

1. The user types a message and presses Enter.
2. The React frontend appends the message to the active conversation in `localStorage` and sends the full conversation history to `POST /api/chat`.
3. The FastAPI backend receives the request, validates it, and filters to `user` and `assistant` messages only.
4. The backend constructs a system prompt establishing Qyron AI's identity and prepends it to the conversation history.
5. If the history exceeds the configured maximum (default: 20 messages), only the most recent messages are retained.
6. The backend sends the payload to OpenRouter's chat completions endpoint with the configured model and token limits.
7. OpenRouter routes the request to Google Gemini 2.5 Flash.
8. The model generates a response, which flows back through OpenRouter to the backend.
9. The backend returns the response to the frontend.
10. The frontend appends the assistant message to the conversation, persists it to `localStorage`, and renders it with Markdown formatting and syntax highlighting.

---

## Project Structure

```
Qyron-AI/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages deployment workflow
├── backend/
│   ├── .env.example                # Backend environment template
│   ├── main.py                     # FastAPI application (single file)
│   └── requirements.txt            # Python dependencies
├── frontend/
│   ├── public/
│   │   └── qyron-orb.png          # Application icon / orb asset
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatArea.jsx        # Message list, empty state, suggestion cards
│   │   │   ├── MessageInput.jsx    # Composer with send/stop buttons
│   │   │   ├── QyronOrb.jsx       # Orb image component (brand + avatar)
│   │   │   └── Sidebar.jsx        # Navigation, search, user profile, theme toggle
│   │   ├── App.jsx                 # Root component, state management, API calls
│   │   ├── App.css                 # Complete design system and component styles
│   │   ├── index.css               # Base reset (delegates to App.css)
│   │   └── main.jsx                # React entry point
│   ├── .env.example                # Frontend environment template
│   ├── .oxlintrc.json              # Linter configuration
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies and scripts
│   └── vite.config.js              # Vite config with dev proxy
├── render.yaml                     # Render backend deployment configuration
├── .gitignore
└── README.md
```

---

## AI Integration

Qyron AI is an application-layer persona, not a trained foundation model. It uses an external LLM through OpenRouter's API gateway.

### How Qyron Identity Works

A system prompt is prepended to every request sent to the model. This prompt:

- Establishes the name "Qyron AI" and credits "Qyron" as the creator
- Instructs the model to never claim affiliation with Google, OpenAI, Anthropic, Meta, or OpenRouter
- Defines the role as a professional AI workspace companion and software engineer
- Enforces GitHub-flavored Markdown output with properly tagged code blocks
- Injects the user's display name into the greeting when available

### Model Configuration

| Parameter | Default | Configurable |
|---|---|---|
| Model | `google/gemini-2.5-flash` | Yes (`OPENROUTER_MODEL`) |
| Max output tokens | 2048 | Yes (`MAX_TOKENS`) |
| Max history messages | 20 | Yes (`MAX_HISTORY_MESSAGES`) |
| Request timeout | 30 seconds | No (hardcoded) |

### Context Handling

The frontend sends the full conversation history with each request. The backend trims this to the most recent `MAX_HISTORY_MESSAGES` exchanges before forwarding to the model. The system prompt is always included and does not count toward the message limit.

---

## Conversation Management

### Storage

All conversations are stored in the browser's `localStorage` under the key `qyron-conversations`. Data persists across page refreshes and browser sessions until explicitly cleared.

### Features

| Feature | Description |
|---|---|
| Creation | A new conversation is created automatically when the first message is sent |
| Title | Auto-derived from the first user message (truncated to 30 characters) |
| Switching | Click any conversation in the sidebar |
| Renaming | Click the pencil icon on a conversation, or double-click |
| Deleting | Click the trash icon on a conversation |
| Searching | Use the search bar or press Ctrl/Cmd+K to filter by title |
| Editing | Click "Edit" on any user message to modify and re-send |
| Regenerating | Click "Regenerate" on the last assistant message to retry |

### Persistence Keys

| Key | Content |
|---|---|
| `qyron-conversations` | All conversation data (messages, titles, IDs, timestamps) |
| `qyron-theme` | Current theme preference (`dark` or `light`) |
| `qyron-user-name` | User's display name |

---

## UI / Design

The interface uses a midnight-purple visual identity built on CSS custom properties.

- **Dark theme** (default): Deep navy backgrounds with purple accent glows
- **Light theme**: Clean whites and soft grays with muted purple accents
- **Atmospheric hero**: Animated radial glow and circular ring on the empty-state screen
- **Suggestion cards**: Glass-morphism prompt cards with colored icon badges
- **Composer**: Floating input bar with glowing focus state and thinking pulse animation
- **Code blocks**: Dark-themed syntax highlighting with language badge and copy button
- **Sidebar**: Collapsible navigation with relative timestamps and inline rename
- **Responsive**: Mobile-first with drawer sidebar, adjusted padding, and single-column prompt grid

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Yes | — | Your OpenRouter API key ([get one here](https://openrouter.ai/keys)) |
| `OPENROUTER_MODEL` | No | `google/gemini-2.5-flash` | OpenRouter model identifier |
| `MAX_TOKENS` | No | `2048` | Maximum tokens in model response |
| `MAX_HISTORY_MESSAGES` | No | `20` | Maximum conversation messages sent per request |
| `CORS_ORIGINS` | No | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated allowed frontend origins |
| `PORT` | No | `8000` | Server listen port |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `''` (same origin) | Backend URL for production. In development, the Vite dev server proxies `/api` to `http://127.0.0.1:8000` automatically. |

---

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.10+
- An [OpenRouter API key](https://openrouter.ai/keys)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and set your OPENROUTER_API_KEY

python main.py
```

The backend starts at `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`. API requests are automatically proxied to the backend during development.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview production build locally |

---

## Production Deployment

The current deployment uses **GitHub Pages** for the frontend and **Render** for the backend.

### Frontend (GitHub Pages)

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys to GitHub Pages on every push to `main`. The Vite config detects the GitHub Actions environment and sets the base path to `/Qyron-AI/`.

For manual deployment:

```bash
cd frontend
echo "VITE_API_URL=https://your-backend-url" > .env
npm run build
# Serve the dist/ directory from any static host
```

### Backend (Render)

The `render.yaml` configuration deploys the backend to Render automatically. Set `OPENROUTER_API_KEY` as a secret environment variable in the Render dashboard.

For manual deployment:

```bash
cd backend
export OPENROUTER_API_KEY=your-key
export CORS_ORIGINS=https://your-frontend-domain.com
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## API Reference

### `GET /health`

Returns server health status.

**Response:**
```json
{ "status": "ok" }
```

### `POST /api/chat`

Send a message and receive an AI response.

**Request Body:**
```json
{
  "message": "Explain how React hooks work",
  "messages": [
    { "role": "user", "content": "What is React?" },
    { "role": "assistant", "content": "React is a JavaScript library..." }
  ],
  "user_name": "Alex"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | No* | The current user message |
| `messages` | array | No* | Conversation history (role + content) |
| `user_name` | string | No | User's display name for personalized responses |

*At least one of `message` or `messages` must contain non-empty content.

**Success Response (200):**
```json
{
  "response": "React hooks are functions that let you use state and lifecycle features..."
}
```

**Error Responses:**

| Status | Cause |
|---|---|
| 400 | Empty message |
| 500 | API key not configured |
| 502 | OpenRouter returned an error |
| 504 | Request timed out (30s) |

---

## Known Limitations

- **No authentication.** The API is open to anyone with the backend URL. The owner's OpenRouter API key is used for all requests.
- **No rate limiting.** There are no request quotas or throttling mechanisms.
- **No streaming.** Responses are buffered fully before display. Users see nothing until the complete response arrives.
- **No database.** Conversations exist only in the browser. Clearing localStorage or switching browsers loses all data.
- **Context truncation.** Only the most recent 20 messages are sent to the model. Older conversation context is silently dropped.
- **No conversation export/import.** There is no built-in way to back up or transfer conversations.

---

## License

MIT
