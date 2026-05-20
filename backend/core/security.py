# Логіка хешування паролів (bcrypt), перевірка паролів та генерація JWT токенів.

from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt
from core.config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError
from core.database import get_db
from dal.user_dal import get_user_by_id

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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
   #діставання токена з запиту, розшифровка його, і потім пошук юзера в бд
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не вдалося перевірити облікові дані",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub") # type: ignore
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except JWTError:
        raise credentials_exception
        

    user = await get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
        
    return user