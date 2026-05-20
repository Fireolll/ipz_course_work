# Схеми транзакцій.

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from decimal import Decimal

class TransactionBase(BaseModel):
    fa_id: int = Field(..., description="ID фінансового рахунку")
    category_id: int = Field(..., description="ID категорії")
    # перевірка щоб користувач не ввів від'ємну суму або нуль
    amount: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2, description="Сума операції")
    description: Optional[str] = Field(None, max_length=500)
    transaction_date: datetime

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    # при редагуванні транзакції буде редагуватися тільки те, що користувач вкаже, тому всі поля робимо необов'язковими
    category_id: Optional[int] = None
    amount: Optional[Decimal] = Field(None, gt=0, max_digits=12, decimal_places=2)
    description: Optional[str] = Field(None, max_length=500)
    transaction_date: Optional[datetime] = None

class TransactionResponse(TransactionBase):
    transaction_id: int
    tra_created_at: datetime

    model_config = ConfigDict(from_attributes=True)