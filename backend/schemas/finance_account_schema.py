# Схеми рахунків.

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from decimal import Decimal
from core.enums import Currency

class FinanceAccountBase(BaseModel):
    fa_name: str = Field(..., min_length=1, max_length=30, description="Назва рахунку (Картка, Готівка)")
    balance: Decimal = Field(default=Decimal('0.00'), max_digits=12, decimal_places=2)
    currency: Currency = Currency.UAH
    is_active: bool = True

class FinanceAccountCreate(FinanceAccountBase):
    pass

class FinanceAccountUpdate(BaseModel):

    fa_name: Optional[str] = Field(None, min_length=1, max_length=30)
    is_active: Optional[bool] = None

class FinanceAccountResponse(FinanceAccountBase):
    fa_id: int
    user_id: int
    fa_created_at: datetime

    model_config = ConfigDict(from_attributes=True)