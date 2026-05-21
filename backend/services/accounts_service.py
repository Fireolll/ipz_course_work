# Сервіс для управління фінансовими рахунками.

from sqlalchemy.ext.asyncio import AsyncSession

from dal import finance_account_dal
from models.finance_account_model import FinanceAccountModel


async def create_account(
    db: AsyncSession, 
    account_data: dict, 
    user_id: int
) -> FinanceAccountModel:
    """Створює новий фінансовий рахунок для користувача."""
    new_account = await finance_account_dal.create_account(db, account_data, user_id)
    await db.commit()
    return new_account
