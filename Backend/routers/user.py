from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User

router = APIRouter(tags=["Interns"])

@router.patch("/users/interns/{intern_id}")
def approve_intern(intern_id: int, db: Session = Depends(get_db)):
    intern = db.query(User).filter(User.id == intern_id, User.role == "intern").first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    intern.is_approved = True
    db.commit()
    db.refresh(intern)
    return {"message": "Intern approved successfully", "intern": intern}
