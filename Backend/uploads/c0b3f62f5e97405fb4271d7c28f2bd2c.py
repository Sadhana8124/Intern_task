
from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, EmailStr

class RoleEnum(str, Enum):
    admin = "admin"
    intern = "intern"

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: RoleEnum = RoleEnum.intern

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: datetime
    assigned_to: int

class TaskCreate(TaskBase):
    pass

class TaskOut(TaskBase):
    id: int
    created_by: int
    created_at: datetime
    is_completed: bool
    class Config:
        orm_mode = True


class TaskOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    deadline: datetime
    assigned_to: int
    created_by: int
    created_at: datetime
    is_completed: bool
    submissions: List["TaskSubmissionResponse"] = []
    class Config:
        orm_mode = True

class TaskSubmissionCreate(BaseModel):
    task_id: int
    intern_id: int
    file_urls: List[str] = []

class SubmissionFileOut(BaseModel):
    id: int
    file_url: str

    class Config:
        orm_mode = True
class SubmissionFileResponse(BaseModel):
    id: int
    file_url: str
    filename: Optional[str] = None

    class Config:
        orm_mode = True



# For returning submission responses
class TaskSubmissionResponse(BaseModel):
    id: int
    task_id: int
    intern_id: int
    status: str
    submitted_at: datetime
    files: List[SubmissionFileResponse] = []
    
    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str
