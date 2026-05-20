# Таблиця заблокованих JWT токенів після logout.

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

class BlacklistedTokenModel(Base):
    __tablename__ = "blacklisted_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    token = Column(Text, nullable=False, unique=True, index=True)
    blacklisted_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("UserModel", back_populates="blacklisted_tokens")