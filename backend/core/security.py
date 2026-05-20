# Логіка хешування паролів (bcrypt), перевірка паролів та генерація JWT токенів.

from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt
from core.config import settings

# Налаштовуємо алгоритм хешування
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
# хешування пароля перед передавання його до бд
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    #перевіряємо пароль з його хешуванням в бд
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    #Генерує JWT токен

    to_encode = data.copy()
    
    # Визначаємо термін дії токена
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Додаємо час закінчення в тіло токена
    to_encode.update({"exp": expire})
    
    # Створюємо і підписуємо токен нашим секретним ключем
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt