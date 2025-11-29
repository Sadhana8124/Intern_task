from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timedelta
import os
from schemas.schemas import TaskSubmissionResponse
from database import get_db
from models.task_submission import TaskSubmission
from models.submission_file import SubmissionFile
import models
router = APIRouter(
    prefix="/task-submissions",
    tags=["Task Submissions"]
)
# ✅ Base backend URL (change this when deploying)
backend_url = "http://127.0.0.1:8000"

# Intern submits a task (with file upload)
# Intern submits a task (with file upload)
# Intern submits a task (with file upload)
@router.post("/", response_model=TaskSubmissionResponse)
async def submit_task(
    task_id: int = Form(...),
    intern_id: int = Form(...),
    uploaded_files: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Create submission record
    new_submission = models.TaskSubmission(
        task_id=task_id,
        intern_id=intern_id,
        status="pending",  # start as pending
        submitted_at=datetime.utcnow()
    )
    if file_uploaded:
        new_submission.status="submitted"
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    # Ensure uploads folder exists
    os.makedirs("uploads", exist_ok=True)

    file_uploaded = False  # 👈 track if at least one file is uploaded

    # Save uploaded files
    if uploaded_files:
        for uploaded_file in uploaded_files:
            file_uploaded = True
            file_location = f"uploads/{uploaded_file.filename}"
            with open(file_location, "wb") as buffer:
                buffer.write(await uploaded_file.read())

            new_file = models.SubmissionFile(
                submission_id=new_submission.id,
                filename=uploaded_file.filename,
                file_url=f"{backend_url}/uploads/{uploaded_file.filename}"
            )
            db.add(new_file)

    # ✅ Update status only if file uploaded
    if file_uploaded:
        new_submission.status = "submitted"
        db.commit()
        db.refresh(new_submission)

    return new_submission



# Admin fetches all submissions
@router.get("/")
def get_all_submissions(db: Session = Depends(get_db)):
    submissions = (
        db.query(TaskSubmission)
        .options(joinedload(TaskSubmission.files), joinedload(TaskSubmission.intern))  
        .all()
    )

    result = []
    for sub in submissions:
        files = []
        for f in sub.files:
            files.append({
                "id": f.id,
                "file_url": f.file_url,
                "filename": getattr(f, "filename", None),
            })

        result.append({
            "id": sub.id,
            "task_id": sub.task_id,
            "intern_id": sub.intern_id,
            "status": sub.status,
            "submitted_at": sub.submitted_at,
            "files": files,
        })

    return result

# Admin fetches submissions for one task
@router.get("/task/{task_id}", response_model=List[TaskSubmissionResponse])
def get_task_submissions(task_id: int, db: Session = Depends(get_db)):
    submissions = (
        db.query(models.TaskSubmission)
        .options(joinedload(models.TaskSubmission.files))  
        .filter(models.TaskSubmission.task_id == task_id)
        .all()
    )
    return submissions

# Admin updates status
@router.put("/{submission_id}", response_model=TaskSubmissionResponse)
def update_submission_status(submission_id: int, status: str, db: Session = Depends(get_db)):
    submission = db.query(models.TaskSubmission).filter(models.TaskSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission.status = status
    db.commit()
    db.refresh(submission)
    return submission

