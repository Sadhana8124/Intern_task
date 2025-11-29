from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class TaskSubmission(Base):
    __tablename__ = "task_submissions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    intern_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(225), default="pending")
    submitted_at = Column(DateTime, server_default=func.now())
    file_path = Column(String, nullable=False)  # ✅ Added column
    project_id = Column(Integer, ForeignKey("projects.id"))

    task = relationship("Task", back_populates="submissions")
    intern = relationship("User", back_populates="task_submissions")
    files = relationship("SubmissionFile", back_populates="submission", cascade="all, delete-orphan")
