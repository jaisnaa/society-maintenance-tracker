import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings


def send_email(to_email: str, subject: str, body: str):
    """
    Sends an email via SMTP. Fails silently (logs to console) if
    mail credentials aren't configured, so the app doesn't crash
    in dev/demo environments without email set up.
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        print(f"[EMAIL SKIPPED - no credentials configured] To: {to_email} | Subject: {subject}")
        return

    try:
        msg = MIMEMultipart()
        msg["From"] = settings.MAIL_FROM or settings.MAIL_USERNAME
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(msg["From"], to_email, msg.as_string())
    except Exception as e:
        # Don't let email failures break the main request flow
        print(f"[EMAIL ERROR] Failed to send to {to_email}: {e}")


def notify_status_change(to_email: str, complaint_id: int, new_status: str, note: str = None):
    subject = f"Complaint #{complaint_id} status updated: {new_status}"
    body = f"Your complaint (#{complaint_id}) status has been updated to '{new_status}'."
    if note:
        body += f"\n\nNote from admin: {note}"
    body += "\n\nLog in to the Society Maintenance Tracker to view full details."
    send_email(to_email, subject, body)


def notify_important_notice(to_email: str, title: str, content: str):
    subject = f"Important Notice: {title}"
    body = f"{content}\n\nPosted on the Society Maintenance Tracker notice board."
    send_email(to_email, subject, body)
