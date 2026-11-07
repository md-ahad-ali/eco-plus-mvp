import logging
import smtplib
from email.message import EmailMessage

from config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str) -> None:
    """Send a plain-text email via SMTP, or log it when SMTP is not configured."""
    if not settings.smtp_host:
        logger.warning("SMTP not configured. Email to %s | %s\n%s", to, subject, body)
        print(f"[email] To: {to}\nSubject: {subject}\n\n{body}\n")
        return

    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_username:
            server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(msg)


def send_password_reset_email(to: str, username: str, reset_link: str) -> None:
    body = (
        f"Hi {username},\n\n"
        "We received a request to reset your Eco Pulse password.\n"
        f"Click the link below to choose a new password:\n\n{reset_link}\n\n"
        f"This link expires in {settings.password_reset_token_expire_minutes} minutes. "
        "If you did not request a password reset, you can ignore this email.\n"
    )
    try:
        send_email(to, "Reset your Eco Pulse password", body)
    except (smtplib.SMTPException, OSError):
        logger.exception("Failed to send password reset email to %s", to)
