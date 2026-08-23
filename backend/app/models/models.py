import enum
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class RoleEnum(str, enum.Enum):
    resident = "resident"
    admin = "admin"


class StatusEnum(str, enum.Enum):
    open = "Open"
    in_progress = "In Progress"
    resolved = "Resolved"


class PriorityEnum(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class CategoryEnum(str, enum.Enum):
    plumbing = "Plumbing"
    electrical = "Electrical"
    security = "Security"
    housekeeping = "Housekeeping"
    parking = "Parking"
    other = "Other"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.resident)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaints = relationship("Complaint", back_populates="resident", foreign_keys="Complaint.resident_id")
    notices = relationship("Notice", back_populates="posted_by_user")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    resident_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(Enum(CategoryEnum), nullable=False)
    description = Column(Text, nullable=False)
    photo_url = Column(String, nullable=True)
    status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.open)
    priority = Column(Enum(PriorityEnum), nullable=False, default=PriorityEnum.medium)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    resident = relationship("User", back_populates="complaints", foreign_keys=[resident_id])
    history = relationship("ComplaintHistory", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintHistory.timestamp")


class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    status = Column(Enum(StatusEnum), nullable=False)
    note = Column(Text, nullable=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="history")
    actor = relationship("User")


class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_important = Column(Boolean, default=False)
    posted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posted_by_user = relationship("User", back_populates="notices")
