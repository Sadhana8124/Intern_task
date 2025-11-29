from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String(255), nullable=False)
    is_read = Column(Boolean, default=False)
    admin_id = Column(Integer, ForeignKey("users.id"))

    admin = relationship("User", back_populates="notifications")  # optional, if you want reverse relation
