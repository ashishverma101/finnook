from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.expense import Expense
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/next-month")
def predict_next_month(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get all expenses for this user
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id
    ).all()

    if not expenses:
        return {"predictions": [], "message": "Not enough data to predict"}

    # Convert to pandas DataFrame for easy manipulation
    df = pd.DataFrame([{
        "amount": e.amount,
        "category": e.category,
        "month": e.date.month,
        "year": e.date.year,
    } for e in expenses])

    # Create a single month number for ordering (e.g. 2026-07 = 2026*12+7)
    df["month_num"] = df["year"] * 12 + df["month"]

    # Group by category and month — sum spending per category per month
    grouped = df.groupby(["category", "month_num"])["amount"].sum().reset_index()

    next_month = datetime.now().month
    next_year = datetime.now().year
    if next_month == 12:
        next_month = 1
        next_year += 1
    else:
        next_month += 1

    next_month_num = next_year * 12 + next_month

    predictions = []

    for category in grouped["category"].unique():
        cat_data = grouped[grouped["category"] == category].sort_values("month_num")

        if len(cat_data) < 2:
            # Not enough months of data — just use the average
            predicted = float(cat_data["amount"].mean())
        else:
            # Run linear regression
            X = cat_data["month_num"].values.reshape(-1, 1)
            y = cat_data["amount"].values
            model = LinearRegression()
            model.fit(X, y)
            predicted = float(model.predict([[next_month_num]])[0])

        # Never predict negative spending
        predicted = max(0, predicted)

        # Get current month actual spending for comparison
        current_month_num = datetime.now().year * 12 + datetime.now().month
        current_actual = cat_data[cat_data["month_num"] == current_month_num]["amount"].sum()

        predictions.append({
            "category": category,
            "predicted_amount": round(predicted, 2),
            "current_month_actual": round(float(current_actual), 2),
            "data_points": len(cat_data),
        })

    # Sort by predicted amount descending
    predictions.sort(key=lambda x: x["predicted_amount"], reverse=True)

    total_predicted = sum(p["predicted_amount"] for p in predictions)

    return {
        "predictions": predictions,
        "total_predicted": round(total_predicted, 2),
        "next_month": f"{next_year}-{next_month:02d}",
        "message": f"Prediction based on your spending history"
    }