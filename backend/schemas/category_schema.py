# Схеми категорій.

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from core.enums import TypeOfCashFlow

# схема з основними полями категорій
class CategoryBase(BaseModel):
    category_name: str = Field(..., min_length=1, max_length=20, description="Назва категорії")
    type_of_cash_flow: TypeOfCashFlow

# Схема для створення нової категорії
class CategoryCreate(CategoryBase):
    pass

# Схема для редагування назви категорії
class CategoryUpdate(BaseModel):
    category_name: Optional[str] = Field(None, min_length=1, max_length=20)

# Схема для відповіді фронтенду
class CategoryResponse(CategoryBase):
    category_id: int
    user_id: Optional[int] # Може бути None, якщо це дефолтна категорія для всіх
    is_default: bool
    created_at: datetime

    # Дозволяє читати дані безпосередньо з моделі SQLAlchemy
    model_config = ConfigDict(from_attributes=True)