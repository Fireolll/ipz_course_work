# services/email_service.py
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr, SecretStr
from core.config import settings # Імпортуємо наші налаштування

# Конфігурація тепер береться з єдиного безпечного місця
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=SecretStr(settings.MAIL_PASSWORD), 
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_password_reset_email(email_to: EmailStr, token: str):
 #  текст листа

    reset_link = f"http://localhost:5173/reset-password?token={token}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Відновлення пароля</h2>
        <p>Ви отримали цей лист, оскільки був зроблений запит на відновлення пароля для вашого акаунту.</p>
        <p>Будь ласка, перейдіть за посиланням нижче, щоб встановити новий пароль:</p>
        <a href="{reset_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Відновити пароль
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: gray;">
            Якщо ви не робили цього запиту, просто проігноруйте цей лист. 
        </p>
    </div>
    """

    message = MessageSchema(
        subject="Відновлення пароля у Financial Tracker",
        recipients=[email_to], # type: ignore
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)