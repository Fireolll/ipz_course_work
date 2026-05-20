# Таблиця категорій доходів та витрат.

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base
from core.enums import TypeOfCashFlow

class CategoryModel(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=True, index=True)
    category_name = Column(String(20), nullable=False)
    type_of_cash_flow = Column(SQLEnum(TypeOfCashFlow, name="type_of_cash_flow"), nullable=False)
    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("UserModel", back_populates="categories")
    transactions = relationship("TransactionModel", back_populates="category")