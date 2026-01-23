import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from typing import List

# Load config from Env (Railway)
# Users must set MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, MAIL_PORT, MAIL_SERVER
# Default to Gmail for convenience if minimal vars are present

# Load config from Env
mail_port = int(os.getenv("MAIL_PORT", 587))

# Railway/Gmail Standard Config
# Port 587 -> STARTTLS = True, SSL = False
# Port 465 -> STARTTLS = False, SSL = True

use_ssl = (mail_port == 465)
use_tls = (mail_port == 587)

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "example@gmail.com"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "secret"),
    MAIL_FROM = os.getenv("MAIL_FROM", "admin@pt-tracker.com"),
    MAIL_PORT = mail_port,
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS = use_tls,
    MAIL_SSL_TLS = use_ssl,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True,
    TIMEOUT = 30 # Increase timeout
)

async def send_email(subject: str, recipients: List[EmailStr], body: str):
    """
    Sends an email using fastapi-mail.
    If credentials are dummy (default), it will likely fail or needs to be mocked.
    """
    
    # Check if we are in "Demo Mode" (no real credentials)
    if conf.MAIL_USERNAME == "example@gmail.com":
        print(f"e-Mail Simulation (No Config): To: {recipients}, Subject: {subject}")
        return {"message": "Email simulation success (check server logs)"}

    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print(f"Email sent to {recipients}")
        return {"message": "Email sent successfully"}
    except Exception as e:
        print(f"Error sending email: {e}")
        return {"error": str(e)}
