# Запити для токенів відновлення пароля.

# dal/password_reset_dal.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.sql import func, update
from models.password_reset_model import PasswordResetModel
from datetime import datetime

async def create_reset_token(db: AsyncSession, user_id: int, token: str, expires_at: datetime) -> PasswordResetModel:
    #Зберігає новий токен для скидання пароля в БД.
    reset_record = PasswordResetModel(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(reset_record)
    await db.flush()
    return reset_record

async def get_valid_reset_token(db: AsyncSession, token: str) -> PasswordResetModel | None:
    """
    тут відбувається пошук токенів для скидання паролів
    1. якщо used = False, то токен ще не використовували.
    2. expires_at > func.now() (термін дії ще не минув).
    """
    stmt = select(PasswordResetModel).where(
        PasswordResetModel.token == token,
        PasswordResetModel.used == False,
        PasswordResetModel.expires_at > func.now()
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def mark_token_as_used(db: AsyncSession, reset_record: PasswordResetModel):
    #позначає використаний токен, для уникнення повторного використання
    stmt = (
        update(PasswordResetModel)
        .where(PasswordResetModel.id == reset_record.id)
        .values(used=True)
    )
    await db.execute(stmt)
