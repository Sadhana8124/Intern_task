from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User
from database import get_db
from auth.dependencies import get_current_user  # 👈 import the existing dependency

router = APIRouter()

@router.get("/profile")
def get_admin_profile(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }
