from fastapi import APIRouter, Depends, HTTPException, status,  Query
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models.task import Task
from models.project import Project
from models.task_submission import TaskSubmission
from schemas.schemas import TaskCreate, TaskOut, UserOut, TaskSubmissionResponse
from models.user import User, RoleEnum  # Import RoleEnum here
from auth.dependencies import get_current_admin
from typing import List
# router = APIRouter(tags=["Admin Tasks"])
# @router.post("/admin/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
# def create_task(
#     task_data: TaskCreate,
#     db: Session = Depends(get_db),
#     current_admin=Depends(get_current_admin)
# ):
#     task = Task(
#         title=task_data.title,
#         description=task_data.description,
#         deadline=task_data.deadline,
#         assigned_to=task_data.assigned_to,
#         created_by=current_admin.id
#     )
#     db.add(task)
#     db.commit()
#     db.refresh(task)
#     return task
# @router.get("/admin/tasks/{user_id}", response_model=List[TaskOut])
# def get_tasks_by_admin(
    
#     db: Session = Depends(get_db),
#     current_admin=Depends(get_current_admin)
# ):
#     tasks = db.query(Task).filter(Task.created_by == current_admin.id).all()
#     return tasks
# @router.get("/admin/task-submissions", response_model=List[TaskSubmissionResponse])
# def get_all_submissions_for_admin(
#     db: Session = Depends(get_db),
#     current_admin=Depends(get_current_admin)
#     ):
#     # Explicitly load the files relationship to ensure it's included in the response
#     submissions = db.query(TaskSubmission).options(joinedload(TaskSubmission.files)).all()
    
#     # Debug: Print submission files count
#     for sub in submissions:
#         print(f"Submission {sub.id} has {len(sub.files)} files")
        
#     return submissions

# @router.get("/admin/interns", response_model=List[UserOut])
# def get_all_interns(
#     db: Session = Depends(get_db),
#     current_admin=Depends(get_current_admin)
# ):
#     interns = db.query(User).filter(User.role == "intern").all()
#     return interns
# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from typing import List

# from database import get_db
# from models.task import Task
# from models.project import Project
# from models.user import User  # Make sure User is defined in backend/models/user.py, otherwise update this import to the correct path where User is defined.
# from schemas.schemas import TaskCreate, TaskOut, UserOut
# from auth.dependencies import get_current_admin

router = APIRouter(tags=["Admin Tasks"])

# ---------------- CREATE TASK ----------------
@router.post("/", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    # ✅ ensure project exists
    project = db.query(Project).filter(Project.id == task_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    task = Task(
        title=task_data.title,
        description=task_data.description,
        deadline=task_data.deadline,
        assigned_to=task_data.assigned_to,
        created_by=current_admin.id,
        project_id=task_data.project_id  # ✅ link task to project
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

# ---------------- GET TASKS CREATED BY ADMIN ----------------
@router.get("/tasks/{user_id}", response_model=List[TaskOut])
def get_tasks_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    if current_admin.id != user_id:
        raise HTTPException(status_code=403, detail="You can only view your own created tasks")
    
    tasks = db.query(Task).filter(Task.created_by == user_id).all()
    return tasks
@router.get("/task-submissions", response_model=List[TaskSubmissionResponse])
def get_all_submissions(db: Session = Depends(get_db)):
    submissions = (
        db.query(TaskSubmission)
        .options(joinedload(TaskSubmission.files))
        .all()
    )
    return submissions



# ---------------- GET ALL INTERNS ----------------
@router.get("/admin/interns", response_model=List[UserOut])
def get_all_interns(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    interns = db.query(User).filter(User.role == RoleEnum.intern).all()
    return interns

