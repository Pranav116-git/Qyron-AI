import os
import logging
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
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


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


class ChatRequest(BaseModel):
    message: str


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Service is not configured. Please try again later.",
        )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "google/gemini-2.5-flash",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are Qyron AI, a helpful coding assistant. "
                                "Be concise and clear."
                            ),
                        },
                        {"role": "user", "content": message},
                    ],
                    "max_tokens": 1000,
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
