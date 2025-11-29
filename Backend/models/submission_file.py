# models/submission_file.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class SubmissionFile(Base):
    __tablename__ = "submission_files"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("task_submissions.id"))
    filename = Column(String(255), nullable=True)
    file_url = Column(String(255), nullable=False)
    submission = relationship("TaskSubmission", back_populates="files")
