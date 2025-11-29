from fastapi import FastAPI, Depends, HTTPException,  APIRouter, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, List
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal, get_db
from models.user import User
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from models.user import RoleEnum, User
from schemas.schemas import usercreate, UserOut
from routers import auth, intern_task, admin_tasks, project
from models.task import Task
from models.project import Project, ProjectMember 
from datetime import datetime, timedelta
from routers import task_submission
from routers import intern_profile
from routers import admin_profile
from routers import user
from routers import admin_notification
from auth.dependencies import get_current_admin
app = FastAPI()
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(intern_task.router)
app.include_router(admin_tasks.router,prefix="/admin/tasks",tags=["Admin Tasks"])
app.include_router(project.router)
app.include_router(task_submission.router)
app.include_router(intern_profile.router, prefix="/intern", tags=["Intern"])
app.include_router(admin_profile.router,prefix="/admin",tags=["Admin"])
app.include_router(admin_notification.router)
admin_users_router = APIRouter(tags=["Admin Users"], prefix="/admin/users")
app.include_router(admin_users_router)
@admin_users_router.get("/pending", response_model=list[UserOut])
def get_pending_interns(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    pending = db.query(User).filter(User.role == RoleEnum.intern, User.is_approved == False).all()
    return pending
@admin_users_router.put("/approve/{user_id}", response_model=UserOut)
def approve_intern(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id, User.role == RoleEnum.intern).first()
    if not user:
        raise HTTPException(status_code=404, detail="Intern not found")
    user.is_approved = True
    db.commit()
    db.refresh(user)
    return user
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("WARNING: could not create tables on startup:", str(e))
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")  
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
UPLOAD_DIR = "uploads"
@app.get("/uploads/{filename}")
def get_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}
@app.get("/")
def root():
    return {"message": "API is running"}
db_dependency = Annotated[SessionLocal, Depends(get_db)]
@app.post("/users/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user: usercreate, db: Annotated[Session, Depends(get_db)]):
    print("Received data:", user)
    try:
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            print(f"Email already exists: {user.email}")
            raise HTTPException(status_code=400, detail="Email already registered")
        from utils.hashing import hash_password
        hashed_password = hash_password(user.password)
        print(f"Creating user with data: full_name={user.full_name}, email={user.email}, role={user.role}")
        db_user = User(
            full_name=user.full_name,
            email=user.email,
            password_hash=hashed_password,
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"User created successfully with ID: {db_user.id}")
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
@app.get("/users/", response_model=List[UserOut])
def get_users(db: Annotated[Session, Depends(get_db)]):
    return db.query(User).all()
@app.get("/users/interns/")
def get_interns(db: Annotated[Session, Depends(get_db)]):
    interns = db.query(User).filter(User.role == RoleEnum.intern).all()
    print("Fetched interns:", interns)
    return interns
@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Annotated[Session, Depends(get_db)]):
    user_obj = db.query(User).filter(User.id == user_id).first()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    return user_obj
db = SessionLocal()
from models.submission_file import SubmissionFile
from models.task_submission import TaskSubmission
submissions = db.query(TaskSubmission).all()
print(f"Found {len(submissions)} submissions")
for sub in submissions:
    existing_files = db.query(SubmissionFile).filter(SubmissionFile.submission_id == sub.id).all()
    if not existing_files:
        test_file = SubmissionFile(
            submission_id=sub.id,
            filename=f"test_file_{sub.id}.txt",
            file_url=f"http://127.0.0.1:8000/uploads/test_file_{sub.id}.txt"
        )
        db.add(test_file)
        print(f"Added test file for submission {sub.id}")
        db.commit()
        print("✅ Test files added to submissions!")
        import os
        for sub in submissions:
            file_path = os.path.join("uploads", f"test_file_{sub.id}.txt")
            with open(file_path, "w") as f:
                f.write(f"This is a test file for submission {sub.id}")
                print(f"Created physical file {file_path}")

