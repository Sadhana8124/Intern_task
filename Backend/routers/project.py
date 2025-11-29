from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from database import get_db
from models.task import Task
from models.project import ProjectMember
import os

from models.task_submission import TaskSubmission
from models.submission_file import SubmissionFile
from models.user import User, RoleEnum
from models.project import Project, ProjectMember
from models.project_submission import ProjectSubmission
from schemas.schemas import ProjectCreate, ProjectOut, UserOut,ProjectDetailOut
from auth.dependencies import get_current_intern, get_current_admin  # Added import for intern
# from auth.dependencies import get_current_admin  # Keep if you use admin endpoints

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
router = APIRouter(prefix="/projects", tags=["projects"])

# Backend URL
backend_url = "http://127.0.0.1:8000"

# Helper function to update project status based on submissions
def update_project_status(project_id: int, db: Session):
    """
    Calculate and update project status based on submission progress:
    - Off Track: 0% (no submissions)
    - On Track: 1-99% (partial submissions)
    - Completed: 100% (all members submitted)
    """
    # Get all project members (including leader)
    all_members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    total_members = len(all_members)
    
    if total_members == 0:
        return  # No members, no status update
    
    # Get unique submitters from project submissions
    project_submissions = db.query(ProjectSubmission).filter(
        ProjectSubmission.project_id == project_id
    ).all()
    
    submitted_user_ids = set()
    for sub in project_submissions:
        submitted_user_ids.add(sub.intern_id)
    
    # Calculate submission percentage
    submission_percentage = (len(submitted_user_ids) / total_members) * 100
    
    # Determine new status
    if submission_percentage == 0:
        new_status = "Off Track"  # No submissions
    elif submission_percentage == 100:
        new_status = "Completed"  # All members submitted
    else:
        new_status = "On Track"  # Partial submissions
    
    # Update the project status
    project = db.query(Project).filter(Project.id == project_id).first()
    if project and project.status != new_status:
        project.status = new_status
        db.commit()
        print(f"Project {project_id} status updated to: {new_status} ({len(submitted_user_ids)}/{total_members} members submitted)")

# ---------------- CREATE ----------------
@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # Check duplicate project name
    existing = db.query(Project).filter(Project.name == project_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project with this name already exists")

    # Create project
    project = Project(
        name=project_data.name,
        description=project_data.description,
        status="Pending",  # default
        created_by_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Add members
    for m in project_data.members:
        user = db.query(User).filter(User.id == m.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User {m.user_id} not found")
        member = ProjectMember(
            user_id=m.user_id,
            role=m.role,
            project_id=project.id
        )
        db.add(member)

    db.commit()
    db.refresh(project)
    return project

# ---------------- LIST USERS BY ROLE ----------------
@router.get("/users_by_role")
def get_users_by_role(db: Session = Depends(get_db)):
    admins = db.query(User).filter(User.role == RoleEnum.admin).all()
    interns = db.query(User).filter(User.role == RoleEnum.intern).all()

    def to_user_dict(u: User):
        role_value = u.role.value if hasattr(u.role, "value") else u.role
        return {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": role_value,
        }

    return {
        "admins": [to_user_dict(u) for u in admins],
        "interns": [to_user_dict(u) for u in interns],
    }
@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    
    # Update status for all projects based on submissions
    for project in projects:
        update_project_status(project.id, db)
    
    # Refresh to get updated statuses
    db.expire_all()
    projects = db.query(Project).all()
    
    return projects
# ---------------- LIST ALL PROJECTS ----------------
@router.get("/my_projects")
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    from sqlalchemy.orm import joinedload
    
    # Get projects where user is team leader or member
    projects = (
        db.query(Project)
        .join(Project.members)
        .filter(ProjectMember.user_id == current_user.id)
        .options(joinedload(Project.members).joinedload(ProjectMember.user))
        .all()
    )
    
    # Filter out projects that the current user has already submitted
    submitted_project_ids = (
        db.query(ProjectSubmission.project_id)
        .filter(ProjectSubmission.intern_id == current_user.id)
        .distinct()
        .all()
    )
    submitted_ids = [pid[0] for pid in submitted_project_ids]
    
    # Return only projects that haven't been submitted yet
    active_projects = [p for p in projects if p.id not in submitted_ids]
    
    # Debug: Print member data
    for project in active_projects:
        print(f"\nProject: {project.name}")
        for member in project.members:
            print(f"  Member ID: {member.user_id}, Role: {member.role}, Full Name: {member.full_name}")

    return active_projects

# ---------------- LIST MY PROJECT SUBMISSIONS ----------------
@router.get("/submissions/my")
def get_my_project_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    # Fetch project submissions made by the current intern
    submissions = (
        db.query(ProjectSubmission, Project)
        .join(Project, Project.id == ProjectSubmission.project_id)
        .filter(ProjectSubmission.intern_id == current_user.id)
        .order_by(ProjectSubmission.submitted_at.desc())
        .all()
    )

    result = []
    for sub, project in submissions:
        result.append({
            "id": sub.id,
            "project_name": project.name if project else None,
            "filename": sub.filename,
            "file_url": sub.file_url,
            "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
        })

    return result
@router.get("/{project_id}", response_model=ProjectDetailOut)
def get_project_detail(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    creator = db.query(User).filter(User.id == project.created_by_id).first()

    # Team leader
    team_leader = (
        db.query(User)
        .filter(User.id == project.team_leader_id)
        .first()
    )

    # ✅ Fetch team members with email + role (exclude team leader from members list)
    team_members = (
        db.query(User.id, User.full_name, User.email, ProjectMember.role)
        .join(ProjectMember, ProjectMember.user_id == User.id)
        .filter(ProjectMember.project_id == project_id)
        .filter(ProjectMember.role != "leader")  # Exclude leader from members
        .all()
    )

    # Submissions - Get ProjectSubmissions for this project
    project_submissions = (
        db.query(ProjectSubmission)
        .options(joinedload(ProjectSubmission.intern))
        .filter(ProjectSubmission.project_id == project_id)
        .order_by(ProjectSubmission.submitted_at.desc())
        .all()
    )
    
    # Also check for TaskSubmissions related to this project
    task_submissions = (
        db.query(TaskSubmission)
        .options(joinedload(TaskSubmission.intern))
        .filter(TaskSubmission.project_id == project_id)
        .order_by(TaskSubmission.submitted_at.desc())
        .all()
    )
    
    # Debug logging
    print(f"Project {project_id}: Found {len(project_submissions)} project submissions and {len(task_submissions)} task submissions")
    
    # Update project status based on submissions
    update_project_status(project_id, db)
    
    # Refresh project to get updated status
    db.refresh(project)
    
    # Combine all submissions
    all_submissions = []
    
    # Add project submissions
    for sub in project_submissions:
        all_submissions.append({
            "id": sub.id,
            "type": "project",
            "intern_name": sub.intern.full_name if sub.intern else "Unknown",
            "filename": sub.filename,
            "file_url": sub.file_url,
            "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None
        })
    
    # Add task submissions with their files
    for sub in task_submissions:
        intern_name = sub.intern.full_name if sub.intern else "Unknown"
        # Get all files for this task submission
        files = db.query(SubmissionFile).filter(SubmissionFile.submission_id == sub.id).all()
        
        if files:
            for file in files:
                all_submissions.append({
                    "id": f"task-{sub.id}-{file.id}",
                    "type": "task",
                    "intern_name": intern_name,
                    "filename": file.filename,
                    "file_url": file.file_url,
                    "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None
                })
        else:
            # If no files, still show the submission
            all_submissions.append({
                "id": f"task-{sub.id}",
                "type": "task",
                "intern_name": intern_name,
                "filename": "No file attached",
                "file_url": None,
                "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None
            })

    return {
        "id": project.id,
        "name": project.name,
        "created_by": creator.full_name if creator else None,
        "status": project.status,
        "team_leader": {
            "id": team_leader.id,
            "full_name": team_leader.full_name,
            "email": team_leader.email,
            "role": team_leader.role
        } if team_leader else None,
        # ✅ Return correct structure for Pydantic
        "team_members": [
            {
                "id": m.id,
                "full_name": m.full_name,
                "email": m.email,
                "role": m.role
            }
            for m in team_members
        ],
        "submissions": all_submissions,
    }

# ---------------- GET ALL PROJECT SUBMISSIONS (ADMIN) ----------------
@router.get("/submissions/all")
def get_all_project_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    from sqlalchemy.orm import joinedload
    
    submissions = (
        db.query(ProjectSubmission)
        .options(
            joinedload(ProjectSubmission.intern),
            joinedload(ProjectSubmission.project).joinedload(Project.members)
        )
        .order_by(ProjectSubmission.submitted_at.desc())
        .all()
    )
    
    return [
        {
            "id": sub.id,
            "project_id": sub.project_id,
            "project_name": sub.project.name if sub.project else "Unknown",
            "project_description": sub.project.description if sub.project else "",
            "project_status": sub.project.status if sub.project else "Unknown",
            "intern_id": sub.intern_id,
            "intern_name": sub.intern.full_name if sub.intern else "Unknown",
            "filename": sub.filename,
            "file_url": sub.file_url,
            "submitted_at": sub.submitted_at
        }
        for sub in submissions
    ]

# ---------------- GET SUBMITTED PROJECTS (ADMIN) ----------------
@router.get("/admin/submitted-projects")
def get_submitted_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    from sqlalchemy.orm import joinedload
    
    # Get all projects that have at least one submission
    submitted_project_ids = (
        db.query(ProjectSubmission.project_id)
        .distinct()
        .all()
    )
    project_ids = [pid[0] for pid in submitted_project_ids]
    
    projects = (
        db.query(Project)
        .filter(Project.id.in_(project_ids))
        .options(
            joinedload(Project.members).joinedload(ProjectMember.user),
            joinedload(Project.file_submissions).joinedload(ProjectSubmission.intern)
        )
        .all()
    )
    
    return [
        {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "submissions": [
                {
                    "id": sub.id,
                    "intern_name": sub.intern.full_name if sub.intern else "Unknown",
                    "filename": sub.filename,
                    "file_url": sub.file_url,
                    "submitted_at": sub.submitted_at
                }
                for sub in project.file_submissions
            ]
        }
        for project in projects
    ]

# ---------------- GET MY PROJECT SUBMISSIONS (INTERN) ----------------
@router.get("/submissions/my")
def get_my_project_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    from sqlalchemy.orm import joinedload
    
    submissions = (
        db.query(ProjectSubmission)
        .options(joinedload(ProjectSubmission.project))
        .filter(ProjectSubmission.intern_id == current_user.id)
        .order_by(ProjectSubmission.submitted_at.desc())
        .all()
    )
    
    return [
        {
            "id": sub.id,
            "project_id": sub.project_id,
            "project_name": sub.project.name if sub.project else "Unknown",
            "filename": sub.filename,
            "file_url": sub.file_url,
            "submitted_at": sub.submitted_at
        }
        for sub in submissions
    ]

# ---------------- SUBMIT PROJECT FILE ----------------
@router.post("/{project_id}/submit-file")
async def submit_project_file(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is a member of the project
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="You are not a member of this project")
    
    # Ensure uploads folder exists
    os.makedirs("uploads/projects", exist_ok=True)
    
    # Save file
    file_location = f"uploads/projects/{file.filename}"
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    
    # Create submission record
    submission = ProjectSubmission(
        project_id=project_id,
        intern_id=current_user.id,
        filename=file.filename,
        file_url=f"{backend_url}/uploads/projects/{file.filename}"
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # Update project status based on new submission
    update_project_status(project_id, db)
    
    return {
        "message": "File submitted successfully",
        "submission": {
            "id": submission.id,
            "filename": submission.filename,
            "file_url": submission.file_url,
            "submitted_at": submission.submitted_at
        }
    }
