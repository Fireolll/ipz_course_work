# Запити для створення, пошуку та фільтрації транзакцій.

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.transaction_model import TransactionModel
from models.finance_account_model import FinanceAccountModel
from datetime import datetime

async def create_transaction(db: AsyncSession, transaction_data: dict) -> TransactionModel:
    #Створює новий запис про дохід/витрату.
    new_tx = TransactionModel(**transaction_data)
    db.add(new_tx)
    await db.flush()
    return new_tx

async def get_filtered_transactions(
    db: AsyncSession, 
    user_id: int,
    fa_id: int | None = None,
    category_id: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None
) -> list[TransactionModel]:
    # Отримує історію транзакцій із можливістю гнучкої фільтрації.
    # джоінимо таблицю рахунків, щоб переконатися, що користувач отримує транзакції лише зі своїх власних рахунків.
    stmt = select(TransactionModel).join(FinanceAccountModel).where(
        FinanceAccountModel.user_id == user_id
    )
    
    # Динамічно додаємо умови фільтрації, якщо вони передані
    if fa_id:
        stmt = stmt.where(TransactionModel.fa_id == fa_id)
    if category_id:
        stmt = stmt.where(TransactionModel.category_id == category_id)
    if start_date:
        stmt = stmt.where(TransactionModel.transaction_date >= start_date)
    if end_date:
        stmt = stmt.where(TransactionModel.transaction_date <= end_date)
        
    # Сортуємо від найновіших до найстаріших
    stmt = stmt.order_by(TransactionModel.transaction_date.desc())
    
    result = await db.execute(stmt)
    return list(result.scalars().all())
