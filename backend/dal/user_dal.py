# Запити для створення, пошуку та оновлення користувачів.

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user_model import UserModel

async def get_user_by_email(db: AsyncSession, email: str) -> UserModel | None:
#   шукає користувача за його email (потрібно для логіну та реєстрації).
    stmt = select(UserModel).where(UserModel.email == email)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> UserModel | None:
    #Шукає користувача за його ID
    stmt = select(UserModel).where(UserModel.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def create_user(db: AsyncSession, user_data: dict) -> UserModel:
 #створює нового користувача в базі даних. Після створення користувача, він повертає об'єкт UserModel з усіма даними, включаючи згенерований user_id. потрібен вже захешений пароль
    new_user = UserModel(**user_data)
    try:
        db.add(new_user)
        await db.flush()
        await db.commit()
        await db.refresh(new_user)
        return new_user
    except Exception as e:
        await db.rollback()
        raise e
