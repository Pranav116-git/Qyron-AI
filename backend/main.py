import os
import logging
from typing import List, Optional
from contextlib import asynccontextmanager

import httpx
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

logger = logging.getLogger(__name__)

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
ALLOWED_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "2048"))
MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "20"))


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if not OPENROUTER_API_KEY:
        logger.warning("OPENROUTER_API_KEY is not set — API requests will fail")
    yield


app = FastAPI(title="Qyron AI Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: Optional[str] = None
    messages: Optional[List[ChatMessage]] = None
    user_name: Optional[str] = None


def build_system_prompt(user_name: Optional[str] = None) -> str:
    name_clause = (
        f" The user you are conversing with is named '{user_name.strip()}'."
        if user_name and user_name.strip()
        else ""
    )
    return (
        "You are Qyron AI — an advanced, highly intelligent AI workspace assistant and expert software engineer."
        f"{name_clause}\n\n"
        "IDENTITY & CORE RULES:\n"
        "1. Your name is Qyron AI (or simply Qyron). You were created and developed by Qyron.\n"
        "2. If asked who developed, created, or trained you, ALWAYS state that you are Qyron AI, developed by Qyron. NEVER claim to be developed by Google, OpenAI, Anthropic, Meta, or OpenRouter, and do not mention underlying model names.\n"
        "3. You are a versatile, professional AI workspace companion capable of software architecture, code generation, debugging, refactoring, code reviews, writing docs, and answering general technical or creative inquiries.\n"
        "4. Always present your responses cleanly using standard GitHub-flavored Markdown. Use precise language syntax tags for code blocks (e.g., ```python, ```javascript, ```html, etc.).\n"
        "5. Be direct, clear, and helpful. Provide well-reasoned code and step-by-step explanations when appropriate."
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Service is not configured. Please try again later.",
        )

    raw_messages = []
    if request.messages:
        for m in request.messages:
            if m.role in ("user", "assistant") and m.content and m.content.strip():
                raw_messages.append({"role": m.role, "content": m.content.strip()})

    single_msg = request.message.strip() if request.message else ""
    if single_msg:
        if not raw_messages or raw_messages[-1]["content"] != single_msg:
            raw_messages.append({"role": "user", "content": single_msg})

    if not raw_messages:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if len(raw_messages) > MAX_HISTORY_MESSAGES:
        raw_messages = raw_messages[-MAX_HISTORY_MESSAGES:]

    system_prompt = build_system_prompt(request.user_name)
    payload_messages = [{"role": "system", "content": system_prompt}] + raw_messages

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": payload_messages,
                    "max_tokens": MAX_TOKENS,
                },
                timeout=30.0,
            )

        if response.status_code != 200:
            logger.warning("OpenRouter returned status %s", response.status_code)
            raise HTTPException(
                status_code=502,
                detail="The AI service is temporarily unavailable. Please try again.",
            )

        data = response.json()
        ai_message = data["choices"][0]["message"]["content"]
        return {"response": ai_message}

    except httpx.TimeoutException:
        logger.warning("OpenRouter request timed out")
        raise HTTPException(
            status_code=504,
            detail="The request timed out. Please try again.",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error in chat endpoint")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again later.",
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")))

