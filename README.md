# Qyron AI

An AI-powered coding assistant with a clean, modern chat interface. Built with React and FastAPI, powered by OpenRouter.

## Features

- Real-time AI chat powered by Google Gemini 2.5 Flash
- Clean dark-themed UI with sidebar navigation
- Typing indicator and loading states
- Auto-scroll to latest message
- Example prompt cards for quick start
- Responsive design (mobile + desktop)
- Error handling with user-friendly messages

## Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React 19, Vite                |
| Backend  | Python, FastAPI, Uvicorn       |
| AI       | OpenRouter (Gemini 2.5 Flash)  |

## Local Setup

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
# Edit .env and add your OPENROUTER_API_KEY

python main.py
```

The backend runs at `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API requests to the backend automatically.

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Required | Description                                      |
| --------------- | -------- | ------------------------------------------------ |
| OPENROUTER_API_KEY | Yes   | Your OpenRouter API key                          |
| CORS_ORIGINS    | No       | Comma-separated allowed origins (default: localhost:5173) |
| PORT            | No       | Server port (default: 8000)                      |

### Frontend (`frontend/.env`)

| Variable    | Required | Description                                     |
| ----------- | -------- | ----------------------------------------------- |
| VITE_API_URL | No      | Backend URL for production (empty = same origin) |

## Production Deployment

### Backend

```bash
# Set environment variables
export OPENROUTER_API_KEY=your-key
export CORS_ORIGINS=https://your-frontend-domain.com

# Run with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
# Point to your deployed backend
echo "VITE_API_URL=https://your-backend-domain.com" > .env

# Build for production
npm run build

# Serve dist/ from any static host (Vercel, Netlify, nginx, etc.)
```

## Project Structure

```
Qyron-AI/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root component + API logic
│   │   ├── components/
│   │   │   ├── ChatArea.jsx     # Messages, empty state, prompts
│   │   │   ├── MessageInput.jsx # Input textarea + send button
│   │   │   └── Sidebar.jsx      # Navigation sidebar
│   │   └── App.css          # All styles
│   ├── vite.config.js       # Vite config with API proxy
│   └── package.json
└── README.md
```

## License

MIT
