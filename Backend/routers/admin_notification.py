# routers/admin_notification.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, RoleEnum
from models.notification import Notification
from typing import List, Dict
from models.task_submission import TaskSubmission
from models.project_submission import ProjectSubmission
from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/admin", tags=["Admin Notifications"])

# Get all notifications for admin
@router.get("/notifications")
def get_admin_notifications(db: Session = Depends(get_db)):
    notifications = []
    
    # Get pending interns
    pending_interns = db.query(User).filter(
        User.role == RoleEnum.intern, 
        User.is_approved == False
    ).all()
    
    for intern in pending_interns:
        notifications.append({
            "id": f"intern-{intern.id}",
            "type": "intern",
            "message": f"🕒 Pending intern: {intern.full_name}",
            "internId": intern.id,
            "internName": intern.full_name,
            "time": None  # Can add created_at field to User model later if needed
        })
    
    # Get recent task submissions
    recent_submissions = (
        db.query(TaskSubmission)
        .options(joinedload(TaskSubmission.intern))
        .order_by(TaskSubmission.submitted_at.desc())
        .limit(10)
        .all()
    )
    
    for sub in recent_submissions:
        intern_name = sub.intern.full_name if sub.intern else f"Intern {sub.intern_id}"
        notifications.append({
            "id": f"task-submission-{sub.id}",
            "type": "submission",
            "message": f"📂 Task submitted by {intern_name}",
            "submissionId": sub.id,
            "taskId": sub.task_id,
            "internId": sub.intern_id,
            "time": sub.submitted_at.isoformat() if sub.submitted_at else None
        })
    
    # Get recent project submissions
    recent_project_submissions = (
        db.query(ProjectSubmission)
        .options(joinedload(ProjectSubmission.intern), joinedload(ProjectSubmission.project))
        .order_by(ProjectSubmission.submitted_at.desc())
        .limit(10)
        .all()
    )
    
    for sub in recent_project_submissions:
        intern_name = sub.intern.full_name if sub.intern else f"Intern {sub.intern_id}"
        project_name = sub.project.name if sub.project else "Unknown Project"
        notifications.append({
            "id": f"project-submission-{sub.id}",
            "type": "project-submission",
            "message": f"📁 Project '{project_name}' submitted by {intern_name}",
            "submissionId": sub.id,
            "projectId": sub.project_id,
            "internId": sub.intern_id,
            "projectName": project_name,
            "time": sub.submitted_at.isoformat() if sub.submitted_at else None
        })
    
    return notifications

# Get pending interns
@router.get("/pending-interns")
def get_pending_interns(db: Session = Depends(get_db)):
    interns = db.query(User).filter(User.role == RoleEnum.intern, User.is_approved == False).all()
    return interns

# Approve intern
@router.post("/approve-intern/{intern_id}")
def approve_intern(intern_id: int, db: Session = Depends(get_db)):
    intern = db.query(User).filter(User.id == intern_id, User.role == RoleEnum.intern).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    
    intern.is_approved = True
    db.commit()
    db.refresh(intern)

    return {"detail": f"{intern.full_name} has been approved", "intern": intern}
