# Таблиця всіх фінансових транзакцій (доходи та витрати)

from sqlalchemy import Column, Integer, Text, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from core.database import Base

class TransactionModel(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)
    fa_id = Column(Integer, ForeignKey("finance_account.fa_id", ondelete="CASCADE"), nullable=False, index=True) 
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="RESTRICT"), nullable=False, index=True) 
    amount = Column(Numeric(12, 2), nullable=False, server_default="0.00")
    description = Column(Text, nullable=True)
    transaction_date = Column(DateTime, nullable=False, index=True)
    tra_created_at = Column(DateTime, nullable=False, server_default=func.now())

    account = relationship("FinanceAccountModel", back_populates="transactions")
    category = relationship("CategoryModel", back_populates="transactions")