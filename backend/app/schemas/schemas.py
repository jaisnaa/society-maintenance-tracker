from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.models.models import RoleEnum, StatusEnum, PriorityEnum, CategoryEnum


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.resident


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: RoleEnum
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Complaint History ----------
class ComplaintHistoryOut(BaseModel):
    id: int
    status: StatusEnum
    note: Optional[str]
    actor_id: int
    actor_name: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# ---------- Complaint ----------
class ComplaintCreate(BaseModel):
    category: CategoryEnum
    description: str


class ComplaintStatusUpdate(BaseModel):
    status: StatusEnum
    note: Optional[str] = None


class ComplaintPriorityUpdate(BaseModel):
    priority: PriorityEnum


class ComplaintOut(BaseModel):
    id: int
    resident_id: int
    resident_name: Optional[str] = None
    category: CategoryEnum
    description: str
    photo_url: Optional[str]
    status: StatusEnum
    priority: PriorityEnum
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    is_overdue: bool = False
    history: List[ComplaintHistoryOut] = []

    class Config:
        from_attributes = True


# ---------- Notice ----------
class NoticeCreate(BaseModel):
    title: str
    content: str
    is_important: bool = False


class NoticeOut(BaseModel):
    id: int
    title: str
    content: str
    is_important: bool
    posted_by: int
    posted_by_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Dashboard ----------
class DashboardOut(BaseModel):
    total_complaints: int
    by_status: dict
    by_category: dict
    overdue_count: int
