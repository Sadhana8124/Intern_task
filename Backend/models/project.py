from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base



class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Pending")
    is_public = Column(Boolean, default=True)
   # Corrected foreign keys
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_by = relationship("User", foreign_keys=[created_by_id])

    team_leader_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    team_leader = relationship("User", foreign_keys=[team_leader_id])
    # Relationships
    tasks = relationship("Task", back_populates="project")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    file_submissions = relationship("ProjectSubmission", back_populates="project", cascade="all, delete-orphan")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String(50), nullable=False)   # "leader" or "member"

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_members")

    # Expose user's full name for Pydantic serialization (schemas.ProjectMemberOut)
    @property
    def full_name(self):
        return self.user.full_name if getattr(self, "user", None) else None

