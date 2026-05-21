# Схеми користувача.

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional
from core.enums import Currency, FinancialPeriod

# Базова схема для користувача
class UserBase(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    user_nickname: str = Field(..., min_length=2, max_length=30, description="Нікнейм користувача")
    email: EmailStr
    currency: Currency = Currency.UAH
    financial_period: FinancialPeriod = FinancialPeriod.month

# Схема для обробки інформації з фронтендя для реєстрацій ного користувача
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Пароль користувача")

# Схема для оновлень та налаштувань користувача
class UserUpdate(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    user_nickname: Optional[str] = Field(None, min_length=2, max_length=30)
    currency: Optional[Currency] = None
    financial_period: Optional[FinancialPeriod] = None

# Схема для надання фронтенду інформації від бека у формі jspn
class UserResponse(UserBase):
    user_id: int
    created_at: datetime
    updated_at: datetime

    
    # конвертація з sqlalchemy моделей до pydantic моделей
    model_config = ConfigDict(from_attributes=True)