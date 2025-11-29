from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from database import get_db
from models.task import Task
from models.project import Project
from models.task_submission import TaskSubmission
from auth.dependencies import get_current_intern
from schemas.schemas import TaskOut
from typing import List
import os
from datetime import datetime
from uuid import uuid4

router = APIRouter(tags=["Intern Tasks"])
UPLOAD_FOLDER = "./uploads"

# Ensure uploads directory exists at startup
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- GET TASKS ----------------
@router.get("/intern/tasks")
def get_my_tasks(db: Session = Depends(get_db), current_user=Depends(get_current_intern)):
    tasks = db.query(Task).filter(Task.assigned_to == current_user.id).all()
    result = []
    for t in tasks:
        result.append({
            "id": t.id,
            "title": getattr(t, "title", None),
            "description": getattr(t, "description", None),
            "deadline": getattr(t, "deadline", None),
            "assigned_to": getattr(t, "assigned_to", None),
            "created_by": getattr(t, "created_by", None),
            "created_at": getattr(t, "created_at", None),
            "is_completed": getattr(t, "is_completed", False),
            "submission_file": getattr(t, "submission_file", None),
            "project_id": getattr(t, "project_id", None),
        })
    return result

# ---------------- COMPLETE TASK WITH FILE UPLOAD ----------------
@router.post("/intern/tasks/{task_id}/complete", status_code=status.HTTP_200_OK)
def complete_task_with_upload(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_intern)
):
    # ✅ Validate the task exists and is assigned to the intern
    task = db.query(Task).filter(Task.id == task_id, Task.assigned_to == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or not assigned to you")

    if task.is_completed:
        raise HTTPException(status_code=400, detail="Task already completed")

    # ✅ Validate file input
    if not file.filename:
        raise HTTPException(status_code=400, detail="File must have a name")

    # ✅ Save file
    file_ext = os.path.splitext(file.filename)[1]
    new_filename = f"{uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_FOLDER, new_filename)

    try:
        with open(file_path, "wb") as buffer:
            contents = file.file.read()
            if not contents:
                raise HTTPException(status_code=400, detail="File is empty")
            buffer.write(contents)
    finally:
        file.file.close()

    # ✅ Create TaskSubmission record
    submission = TaskSubmission(
        task_id=task.id,
        intern_id=current_user.id,
        file_path=new_filename,  # Save the relative path or name
        submitted_at=datetime.utcnow()
    )
    db.add(submission)

    # ✅ Update task status
    task.is_completed = True
    task.submission_file = new_filename
    task.submission_date = datetime.utcnow()
    db.add(task)
  

    project = db.query(Project).filter(Project.id == task.project_id).first()
    if project:
        all_tasks = db.query(Task).filter(Task.project_id == project.id).all()
        if all(t.is_completed for t in all_tasks):
            project.status = "Completed"
        elif any(t.is_completed for t in all_tasks):
            project.status = "In Progress"
        else:
            project.status = "Pending"
        db.add(project)


    db.commit()
    db.refresh(submission)
    db.refresh(task)
    if project:
        db.refresh(project)
    

    return {
        "message": "Task completed and file uploaded successfully",
        "file": new_filename,
        "task_id": task.id,
        "submission_date": task.submission_date.isoformat(),
        "project_status": project.status if project else None
        
    }
