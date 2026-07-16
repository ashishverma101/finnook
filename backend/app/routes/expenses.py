from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import Optional, List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.expense import Expense

router = APIRouter(prefix="/expenses", tags=["Expenses"])

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    merchant: Optional[str] = None
    payment_method: Optional[str] = None
    date: date
    description: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    category: str
    merchant: Optional[str]
    payment_method: Optional[str]
    date: date
    description: Optional[str]

    class Config:
        from_attributes = True

@router.post("/", response_model=ExpenseResponse)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_expense = Expense(
        user_id=current_user.id,
        amount=expense.amount,
        category=expense.category,
        merchant=expense.merchant,
        payment_method=expense.payment_method,
        date=expense.date,
        description=expense.description
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id
    ).order_by(Expense.date.desc()).all()
    return expenses

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}