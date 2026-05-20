# Схеми аналітики.

from pydantic import BaseModel
from typing import List
from decimal import Decimal
from core.enums import Currency

# Схема для елемента кругової діаграми (витрати по конкретній категорії)
class CategoryStat(BaseModel):
    category_name: str
    total_amount: Decimal
    percentage: float 

# Схема загального звіту
class BalanceReportResponse(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    net_balance: Decimal
    currency: Currency
    expenses_by_category: List[CategoryStat]