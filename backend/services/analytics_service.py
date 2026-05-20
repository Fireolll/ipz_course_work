from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal

from dal import analytics_dal
from core.enums import TypeOfCashFlow, Currency
from schemas.analytics_schema import BalanceReportResponse, CategoryStat

async def generate_balance_report(db: AsyncSession, user_id: int, user_currency: Currency) -> BalanceReportResponse:
    #формування готового звіту з балансом та розділенням по категоріях для користувача
    
    #Отримуємо загальні суми
    total_income = await analytics_dal.get_total_cashflow_by_type(db, user_id, TypeOfCashFlow.INCOME)
    total_expense = await analytics_dal.get_total_cashflow_by_type(db, user_id, TypeOfCashFlow.EXPENSE)
    
    # Вираховуємо чистий баланс
    net_balance = total_income - total_expense

    # Отримуємо розбивку витрат по категоріях
    expenses_raw = await analytics_dal.get_expenses_grouped_by_category(db, user_id)
    
    # Формуємо красивий список зі статистикою (рахуємо відсотки)
    expenses_by_category = []
    for row in expenses_raw:
        cat_name = row.category_name # type: ignore
        cat_total = row.total_amount # type: ignore
        
        percentage = 0.0
        if total_expense > 0:
            # Обчислюємо відсоток і округлюємо до одного знака після коми
            percentage = round(float((cat_total / total_expense) * 100), 1)
            
        expenses_by_category.append(
            CategoryStat(
                category_name=cat_name,
                total_amount=cat_total,
                percentage=percentage
            )
        )

    #готуємо звіт
    return BalanceReportResponse(
        total_income=total_income,
        total_expense=total_expense,
        net_balance=net_balance,
        currency=user_currency,
        expenses_by_category=expenses_by_category
    )