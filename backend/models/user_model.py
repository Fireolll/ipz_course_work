# models/user_model.py
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base
from core.enums import Currency, FinancialPeriod

class UserModel(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    user_nickname = Column(String(30), nullable=False)
    email = Column(String(50), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    
    currency = Column(SQLEnum(Currency, name="currency"), nullable=False, server_default="UAH")
    financial_period = Column(SQLEnum(FinancialPeriod, name="financial_period"), nullable=False, server_default="month")
    
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())


    resets = relationship("PasswordResetModel", back_populates="user", cascade="all, delete-orphan")
    blacklisted_tokens = relationship("BlacklistedTokenModel", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("CategoryModel", back_populates="user", cascade="all, delete-orphan")
    accounts = relationship("FinanceAccountModel", back_populates="user", cascade="all, delete-orphan")