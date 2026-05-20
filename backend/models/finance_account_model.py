 # Таблиця фінансових рахунків користувача та їх балансів.

from sqlalchemy import Column, Integer, String, Numeric, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base
from core.enums import Currency

class FinanceAccountModel(Base):
    __tablename__ = "finance_account"

    fa_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    fa_name = Column(String(30), nullable=False)
    balance = Column(Numeric(12, 2), nullable=False, default=0.00)
    currency = Column(SQLEnum(Currency, name="currency"), nullable=False, server_default="UAH")
    is_active = Column(Boolean, nullable=False, default=True)
    fa_created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("UserModel", back_populates="accounts")
    transactions = relationship("TransactionModel", back_populates="account", cascade="all, delete-orphan")