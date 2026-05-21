# Завантаження змінних середовища (.env), секретні ключі JWT, налаштування пошти.

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # База даних
    DATABASE_URL: str = os.environ["DATABASE_URL"]
    # Безпека та JWT токени
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback_secret_key_do_not_use_in_prod")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")

# Створюємо єдиний екземпляр налаштувань, який будемо імпортувати в інші файли
settings = Settings()