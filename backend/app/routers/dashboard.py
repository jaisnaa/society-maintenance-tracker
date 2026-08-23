from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.models import Complaint, StatusEnum, User
from app.schemas.schemas import DashboardOut
from app.utils.security import require_admin
from app.config import settings

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOut)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    total = db.query(Complaint).count()

    status_counts = (
        db.query(Complaint.status, func.count(Complaint.id))
        .group_by(Complaint.status)
        .all()
    )
    by_status = {status.value: count for status, count in status_counts}

    category_counts = (
        db.query(Complaint.category, func.count(Complaint.id))
        .group_by(Complaint.category)
        .all()
    )
    by_category = {category.value: count for category, count in category_counts}

    threshold_date = datetime.utcnow() - timedelta(days=settings.OVERDUE_THRESHOLD_DAYS)
    overdue_count = (
        db.query(Complaint)
        .filter(Complaint.status != StatusEnum.resolved)
        .filter(Complaint.created_at < threshold_date)
        .count()
    )

    return DashboardOut(
        total_complaints=total,
        by_status=by_status,
        by_category=by_category,
        overdue_count=overdue_count,
    )
