import requests

from app.config import settings

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_email(to_email: str, subject: str, body: str):
    """
    Sends an email via Brevo's HTTP API. Fails silently (logs to console) if
    the API key isn't configured, so the app doesn't crash in dev/demo
    environments without email set up. Uses HTTPS instead of raw SMTP so it
    works on hosts (like Render's free tier) that block outbound SMTP ports.
    """
    if not settings.BREVO_API_KEY:
        print(f"[EMAIL SKIPPED - no Brevo API key configured] To: {to_email} | Subject: {subject}")
        return

    try:
        response = requests.post(
            BREVO_API_URL,
            headers={
                "accept": "application/json",
                "api-key": settings.BREVO_API_KEY,
                "content-type": "application/json",
            },
            json={
                "sender": {
                    "name": "Society Maintenance Tracker",
                    "email": settings.MAIL_FROM,
                },
                "to": [{"email": to_email}],
                "subject": subject,
                "textContent": body,
            },
            timeout=15,
        )
        if response.status_code >= 400:
            print(f"[EMAIL ERROR] Failed to send to {to_email}: {response.status_code} {response.text}")
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