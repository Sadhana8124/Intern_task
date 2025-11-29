from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from models import User
from auth.dependencies import get_current_user
from database import get_db

router = APIRouter()

@router.get("/profile")
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.value,
    }
