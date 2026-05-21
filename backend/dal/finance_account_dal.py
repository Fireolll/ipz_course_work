# Запити для роботи з фінансовими рахунками.

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from models.finance_account_model import FinanceAccountModel
from decimal import Decimal

async def create_account(db: AsyncSession, account_data: dict, user_id: int) -> FinanceAccountModel:
    #cтворює новий фінансовий рахунок для користувача
    new_account = FinanceAccountModel(**account_data, user_id=user_id)
    db.add(new_account)
    await db.flush()
    return new_account

async def get_user_accounts(db: AsyncSession, user_id: int) -> list[FinanceAccountModel]:
    #Повертає список усіх рахунків користувача.
    stmt = select(FinanceAccountModel).where(FinanceAccountModel.user_id == user_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def get_account_by_id(db: AsyncSession, account_id: int, user_id: int) -> FinanceAccountModel | None:
    #Отримує конкретний рахунок, перевіряючи, чи належить він цьому юзеру.
    stmt = select(FinanceAccountModel).where(
        FinanceAccountModel.fa_id == account_id,
        FinanceAccountModel.user_id == user_id
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def update_account_balance(db: AsyncSession, account_id: int, amount_delta: Decimal):
    """
    Атомарно оновлює баланс рахунку. 
    Якщо amount_delta додатне — баланс збільшується (дохід).
    Якщо від'ємне — баланс зменшується (витрата).
    """
    stmt = (
        update(FinanceAccountModel)
        .where(FinanceAccountModel.fa_id == account_id)
        # Оновлюємо значення на рівні SQL-запиту: balance = balance + amount_delta
        .values(balance=FinanceAccountModel.balance + amount_delta)
    )
    await db.execute(stmt)
