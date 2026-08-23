from typing import List
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Notice, User
from app.schemas.schemas import NoticeCreate, NoticeOut
from app.utils.security import get_current_user, require_admin
from app.utils.email import notify_important_notice

router = APIRouter(prefix="/notices", tags=["notices"])


def _to_out(notice: Notice) -> NoticeOut:
    data = NoticeOut.model_validate(notice)
    data.posted_by_name = notice.posted_by_user.name if notice.posted_by_user else None
    return data


def _send_important_notice_emails(recipient_emails: List[str], title: str, content: str):
    """Runs after the response has already been sent to the frontend."""
    for email in recipient_emails:
        try:
            notify_important_notice(email, title, content)
        except Exception as e:
            # Don't let one failed email break the rest of the batch
            print(f"Failed to send notice email to {email}: {e}")


@router.get("", response_model=List[NoticeOut])
def list_notices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Important notices pinned to the top, then newest first
    notices = (
        db.query(Notice)
        .order_by(Notice.is_important.desc(), Notice.created_at.desc())
        .all()
    )
    return [_to_out(n) for n in notices]


@router.post("", response_model=NoticeOut)
def create_notice(
    payload: NoticeCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    notice = Notice(
        title=payload.title,
        content=payload.content,
        is_important=payload.is_important,
        posted_by=current_user.id,
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)

    if payload.is_important:
        residents = db.query(User).filter(User.role == "resident").all()
        recipient_emails = [r.email for r in residents]
        background_tasks.add_task(
            _send_important_notice_emails, recipient_emails, notice.title, notice.content
        )

    return _to_out(notice)


@router.delete("/{notice_id}")
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    db.delete(notice)
    db.commit()
    return {"detail": "Notice deleted"}