 # SQL-запити для аналітики.

# dal/analytics_dal.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from decimal import Decimal

from models.transaction_model import TransactionModel
from models.finance_account_model import FinanceAccountModel
from models.category_model import CategoryModel
from core.enums import TypeOfCashFlow

async def get_total_cashflow_by_type(db: AsyncSession, user_id: int, flow_type: TypeOfCashFlow) -> Decimal:
    #підрахунок загальної сіми користувача
    stmt = (
        select(func.coalesce(func.sum(TransactionModel.amount), 0)) # type: ignore
        .join(FinanceAccountModel, TransactionModel.fa_id == FinanceAccountModel.fa_id)
        .join(CategoryModel, TransactionModel.category_id == CategoryModel.category_id)
        .where(
            FinanceAccountModel.user_id == user_id,
            CategoryModel.type_of_cash_flow == flow_type
        )
    )
    result = await db.execute(stmt)
    return result.scalar() or Decimal('0.00') # type: ignore

async def get_expenses_grouped_by_category(db: AsyncSession, user_id: int):
    """
    рахуємо суму витрат для кожної категорії, щоб потім показати відсоткову розбивку.
    """
    stmt = (
        select(
            CategoryModel.category_name,
            func.sum(TransactionModel.amount).label("total_amount") # type: ignore
        )
        .join(TransactionModel, CategoryModel.category_id == TransactionModel.category_id)
        .join(FinanceAccountModel, TransactionModel.fa_id == FinanceAccountModel.fa_id)
        .where(
            FinanceAccountModel.user_id == user_id,
            CategoryModel.type_of_cash_flow == TypeOfCashFlow.EXPENSE
        )
        .group_by(CategoryModel.category_name)
    )
    result = await db.execute(stmt)
    return result.all()