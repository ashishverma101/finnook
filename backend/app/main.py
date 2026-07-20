from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, expenses, ai, predictions, goals

app = FastAPI(
    title="Finance AI API",
    description="Backend API for Personal Finance AI app",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://finnook.vercel.app",
        "https://finnook-x26i.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(ai.router)
app.include_router(predictions.router)
app.include_router(goals.router)

@app.get("/")
def root():
    return {"message": "Finance AI API is running 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}