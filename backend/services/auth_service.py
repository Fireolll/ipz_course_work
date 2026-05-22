# Баланси та фінансові звіти.

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from dal import user_dal
from schemas.user_schema import UserCreate
from core.security import get_password_hash, verify_password, create_access_token

async def register_new_user(db: AsyncSession, user_in: UserCreate):

    hashed_password = get_password_hash(user_in.password)

    user_data = user_in.model_dump(exclude={"password"})
    user_data["password_hash"] = hashed_password
    
    # ДОДАЙ ЦІ ДВА РЯДКИ: примусово передаємо об'єкти Enum, а не текст
    user_data["currency"] = user_in.currency
    user_data["financial_period"] = user_in.financial_period

    # Зберігаємо в базу
    new_user = await user_dal.create_user(db, user_data)
    
    # Видали звідси await db.commit(), бо він у тебе ВЖЕ Є в user_dal.py!
    print(f"✅ User successfully created: {new_user.user_id}")
    
    return new_user


async def authenticate_user(db: AsyncSession, email: str, password: str):

    # Шукаємо користувача за email
    user = await user_dal.get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Невірний email або пароль"
        )

    # Звіряємо пароль із хешем у базі
    if not verify_password(password, user.password_hash): #type: ignore
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Невірний email або пароль"
        )

    # генерація токену для авторизованого користувача
    access_token = create_access_token(data={"sub": str(user.user_id)})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer"
    }