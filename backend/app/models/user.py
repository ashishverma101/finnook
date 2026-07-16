from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255))
    salary = Column(Float, default=0)
    monthly_budget = Column(Float, default=0)
    currency = Column(String(10), default="INR")
    created_at = Column(DateTime(timezone=True), server_default=func.now())