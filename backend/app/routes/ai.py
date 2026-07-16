from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.deps import get_current_user
from app.models.user import User
import httpx
import os
import json
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.core.database import get_db

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI"])

class CategorizeRequest(BaseModel):
    text: str

@router.post("/categorize")
async def categorize_expense(
    request: CategorizeRequest,
    current_user: User = Depends(get_current_user)
):
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    # Debug: print what key we got
    print(f"API Key found: {bool(api_key)}")
    print(f"API Key starts with: {api_key[:15] if api_key else 'NONE'}")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")

    prompt = f"""You are a personal finance assistant. Extract expense details from this text.

Text: "{request.text}"

Reply with ONLY a JSON object, no explanation, no markdown, just raw JSON:
{{
  "amount": <number or null>,
  "category": <one of: Food, Shopping, Rent, Travel, Entertainment, Bills, Healthcare, Other>,
  "merchant": <string or null>,
  "description": <string or null>
}}"""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Finance AI App"
                },
                json={
                    "model": "openrouter/free",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1
                },
                timeout=30.0
            )
        
        print(f"OpenRouter status: {response.status_code}")
        print(f"OpenRouter response: {response.text[:500]}")
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"AI service error: {response.text}")

        content = response.json()["choices"][0]["message"]["content"].strip()
        content = content.replace("```json", "").replace("```", "").strip()
        
        result = json.loads(content)
        return result
        
    except httpx.RequestError as e:
        print(f"HTTP Request error: {e}")
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        raise HTTPException(status_code=500, detail="AI returned invalid response")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_coach(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.expense import Expense
    import json

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")

    # Fetch user's expenses to give AI context
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id
    ).all()

    # Build expense summary for AI
    total_spent = sum(e.amount for e in expenses)
    by_category = {}
    for e in expenses:
        by_category[e.category] = by_category.get(e.category, 0) + e.amount

    category_summary = "\n".join([
        f"- {cat}: ₹{amount:,.0f}" for cat, amount in
        sorted(by_category.items(), key=lambda x: x[1], reverse=True)
    ])

    recent = expenses[-5:] if len(expenses) >= 5 else expenses
    recent_summary = "\n".join([
        f"- {e.date}: ₹{e.amount} at {e.merchant or e.category} ({e.category})"
        for e in reversed(recent)
    ])

    system_prompt = f"""You are a personal finance coach for {current_user.name}. 
You have access to their real spending data. Be specific, friendly, and actionable.
Keep responses concise — 3-5 sentences max unless they ask for detail.
Always reference their actual numbers when giving advice.

USER'S FINANCIAL DATA:
Total spent (all time): ₹{total_spent:,.0f}
Number of transactions: {len(expenses)}

Spending by category:
{category_summary if category_summary else "No expenses recorded yet"}

Recent transactions:
{recent_summary if recent_summary else "No recent transactions"}
"""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Finance AI App"
            },
            json={
                "model": "openrouter/free",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message}
                ],
                "temperature": 0.7
            },
            timeout=30.0
        )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="AI service error")

    reply = response.json()["choices"][0]["message"]["content"].strip()
    return {"reply": reply}