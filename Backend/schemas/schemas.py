

from pydantic import BaseModel, EmailStr, Field
import enum
from datetime import datetime
import enum
from typing import List, Optional
from datetime import date
from models.user import RoleEnum

# ---------------- ROLE ----------------
class RoleEnum(str, enum.Enum):
    admin = "admin"
    intern = "intern"
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: RoleEnum = RoleEnum.intern

# ---------------- USERS ----------------
class usercreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: RoleEnum


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    model_config = {"from_attributes": True}
class ProjectMemberBase(BaseModel):
    user_id: int
    role: str

class ProjectMemberOut(ProjectMemberBase):
    
    user_id: int
    full_name: str
    role: str
    
    model_config = {"from_attributes": True}

# ---------------- PROJECTS ----------------
class ProjectBase(BaseModel):
    name: str
    description: Optional[str]=None
    status: Optional[str]= None
    is_public: bool = False
class ProjectCreate(BaseModel):
    name: str
    description: str
    status: str = "On Track"
    is_public: bool =True
    members: List[ProjectMemberBase] = Field(default_factory=list)
   



 

    model_config = {"from_attributes": True}

# ---------------- TASKS ----------------
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: datetime
    assigned_to: int
    project_id : int
class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    deadline: datetime
    assigned_to: int
    project_id: int   # ✅ required field to link with project
class TaskCreate(TaskBase):
    pass
class SubmissionOut(BaseModel):
    id: int | str  # Can be int or string (for task submissions with file IDs)
    type: Optional[str] = None  # 'project' or 'task'
    intern_name: str
    filename: str
    file_url: Optional[str] = None  # Can be None for submissions without files
    submitted_at: Optional[str] = None  # ISO format datetime string

class TaskOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    deadline: datetime
    assigned_to: int
    created_by: int
    created_at: datetime
    is_completed: bool
    submission_file: str | None = None
    submissions: List["TaskSubmissionResponse"] = Field(default_factory=list)
    project_id: Optional[int] = None  # ✅ included in responses

    model_config = {"from_attributes": True}
class TaskSubmissionCreate(BaseModel):
    task_id: int
    intern_id: int
    file_urls: List[str] = []
class ProjectOut(BaseModel):
    id: int
    name: str
    description: str
    status: Optional[str]="pending"
    is_public: bool
    team_leader_id: Optional[int]
    created_by_id: Optional[int]
    tasks: List[TaskOut] = Field(default_factory=list)
    members: List[ProjectMemberOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}

class SubmissionFileOut(BaseModel):
    id: int
    file_url: str

    class Config:
        from_attributes = True



class SubmissionFileResponse(BaseModel):
    id: int
    file_url: str
    filename: Optional[str] = None

    class Config:
        from_attributes = True
class TaskSubmissionResponse(BaseModel):
    id: int
    task_id: int
    intern_id: int
    status: str
    submitted_at: Optional[datetime]
    files: List[SubmissionFileResponse]=Field(default_factory=list)

    model_config = {
        "from_attributes": True
    }
class ProjectDetailOut(BaseModel):
    id: int
    name: str
   
    status: str
    created_by: Optional[str] = None
    team_leader: Optional[UserOut]
    team_members: List[UserOut]
    submissions: List[SubmissionOut]
    model_config = {
        "from_attributes": True
    }

# ---------------- TOKEN ----------------
class Token(BaseModel):
    access_token: str
    token_type: str

# ✅ Fix forward references
ProjectOut.update_forward_refs()
TaskOut.update_forward_refs()
TaskSubmissionResponse.update_forward_refs()