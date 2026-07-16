from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Pydantic models define what data the API expects to receive
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    salary: float = 0
    monthly_budget: float = 0

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user with hashed password
    new_user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        salary=request.salary,
        monthly_budget=request.monthly_budget
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Return a token immediately so user is logged in after registering
    token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email}
    }

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Return token
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }
class UpdateProfileRequest(BaseModel):
    salary: Optional[float] = None
    monthly_budget: Optional[float] = None

@router.patch("/profile")
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if request.salary is not None:
        current_user.salary = request.salary
    if request.monthly_budget is not None:
        current_user.monthly_budget = request.monthly_budget
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Profile updated",
        "monthly_budget": current_user.monthly_budget,
        "salary": current_user.salary
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "salary": current_user.salary,
        "monthly_budget": current_user.monthly_budget,
    }