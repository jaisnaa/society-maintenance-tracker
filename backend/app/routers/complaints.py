from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.models.models import Complaint, ComplaintHistory, User, StatusEnum, CategoryEnum, PriorityEnum
from app.schemas.schemas import ComplaintOut, ComplaintStatusUpdate, ComplaintPriorityUpdate
from app.utils.security import get_current_user, require_admin
from app.utils.upload import upload_photo
from app.utils.email import notify_status_change
from app.config import settings

router = APIRouter(prefix="/complaints", tags=["complaints"])


def _is_overdue(complaint: Complaint) -> bool:
    if complaint.status == StatusEnum.resolved:
        return False
    threshold = timedelta(days=settings.OVERDUE_THRESHOLD_DAYS)
    age = datetime.utcnow() - complaint.created_at.replace(tzinfo=None)
    return age > threshold


def _to_out(complaint: Complaint) -> ComplaintOut:
    data = ComplaintOut.model_validate(complaint)
    data.is_overdue = _is_overdue(complaint)
    data.resident_name = complaint.resident.name if complaint.resident else None
    for h, hist_orm in zip(data.history, complaint.history):
        h.actor_name = hist_orm.actor.name if hist_orm.actor else None
    return data


@router.post("", response_model=ComplaintOut)
async def create_complaint(
    category: CategoryEnum = Form(...),
    description: str = Form(...),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo_url = None
    if photo is not None:
        photo_url = await upload_photo(photo)

    complaint = Complaint(
        resident_id=current_user.id,
        category=category,
        description=description,
        photo_url=photo_url,
        status=StatusEnum.open,
        priority=PriorityEnum.medium,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    history = ComplaintHistory(
        complaint_id=complaint.id,
        status=StatusEnum.open,
        note="Complaint raised",
        actor_id=current_user.id,
    )
    db.add(history)
    db.commit()
    db.refresh(complaint)

    return _to_out(complaint)


@router.get("/mine", response_model=List[ComplaintOut])
def my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaints = (
        db.query(Complaint)
        .options(joinedload(Complaint.history), joinedload(Complaint.resident))
        .filter(Complaint.resident_id == current_user.id)
        .order_by(Complaint.created_at.desc())
        .all()
    )
    return [_to_out(c) for c in complaints]


@router.get("", response_model=List[ComplaintOut])
def list_all_complaints(
    category: Optional[CategoryEnum] = Query(None),
    status_filter: Optional[StatusEnum] = Query(None, alias="status"),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    q = db.query(Complaint).options(joinedload(Complaint.history), joinedload(Complaint.resident))

    if category:
        q = q.filter(Complaint.category == category)
    if status_filter:
        q = q.filter(Complaint.status == status_filter)
    if date_from:
        q = q.filter(Complaint.created_at >= date_from)
    if date_to:
        q = q.filter(Complaint.created_at <= date_to)

    complaints = q.order_by(Complaint.created_at.desc()).all()
    results = [_to_out(c) for c in complaints]

    # Overdue complaints surface at the top of the admin view
    results.sort(key=lambda c: (not c.is_overdue,))
    return results


@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = (
        db.query(Complaint)
        .options(joinedload(Complaint.history), joinedload(Complaint.resident))
        .filter(Complaint.id == complaint_id)
        .first()
    )
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if current_user.role != "admin" and complaint.resident_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this complaint")

    return _to_out(complaint)


@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
def update_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = payload.status
    if payload.status == StatusEnum.resolved:
        complaint.resolved_at = datetime.utcnow()

    history = ComplaintHistory(
        complaint_id=complaint.id,
        status=payload.status,
        note=payload.note,
        actor_id=current_user.id,
    )
    db.add(history)
    db.commit()
    db.refresh(complaint)

    resident = db.query(User).filter(User.id == complaint.resident_id).first()
    if resident:
        notify_status_change(resident.email, complaint.id, payload.status.value, payload.note)

    return _to_out(complaint)


@router.patch("/{complaint_id}/priority", response_model=ComplaintOut)
def update_priority(
    complaint_id: int,
    payload: ComplaintPriorityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.priority = payload.priority
    db.commit()
    db.refresh(complaint)
    return _to_out(complaint)
