from sqlalchemy import Column, Integer, String, Boolean, Enum as SqlEnum
from sqlalchemy.orm import relationship
from database import Base
import enum 

class RoleEnum(str, enum.Enum):
    admin = "admin"
    intern = "intern"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SqlEnum(RoleEnum), nullable=False)
    is_approved = Column(Boolean, default=False)

    project_members = relationship("ProjectMember", back_populates="user")
    task_submissions = relationship("TaskSubmission", back_populates="intern")
    notifications = relationship("Notification", back_populates="admin")
