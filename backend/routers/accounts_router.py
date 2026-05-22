from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import get_current_user
from models.user_model import UserModel
from models.finance_account_model import FinanceAccountModel
from schemas.finance_account_schema import FinanceAccountCreate, FinanceAccountResponse, FinanceAccountUpdate
from dal import finance_account_dal
from services import accounts_service
from pydantic import BaseModel
from decimal import Decimal

router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)

# Схема для оновлення фіксованого балансу
class BalanceUpdateSchema(BaseModel):
    balance: Decimal

@router.post("/", response_model=FinanceAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_new_account(
    account_data: FinanceAccountCreate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_account = await accounts_service.create_account(
        db=db,
        account_data=account_data.model_dump(),
        user_id=current_user.user_id  # type: ignore
    )
    return new_account

@router.get("/", response_model=list[FinanceAccountResponse])
async def get_my_accounts(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    accounts = await finance_account_dal.get_user_accounts(
        db=db,
        user_id=current_user.user_id  # type: ignore
    )
    return accounts

# --- ДОДАНІ ЕНДПОІНТИ ---

@router.patch("/{account_id}", response_model=FinanceAccountResponse)
async def update_account_status(
    account_id: int,
    update_data: FinanceAccountUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Оновлення статусу активності (архівування) або назви рахунку"""
    stmt = select(FinanceAccountModel).where(
        FinanceAccountModel.fa_id == account_id,
        FinanceAccountModel.user_id == current_user.user_id
    )
    result = await db.execute(stmt)
    account = result.scalars().first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Рахунок не знайдено або доступу немає")
    
    if update_data.is_active is not None:
        account.is_active = update_data.is_active #type: ignore
    if update_data.fa_name is not None:
        account.fa_name = update_data.fa_name #type: ignore
        
    await db.commit()
    await db.refresh(account)
    return account

@router.patch("/{account_id}/balance", response_model=FinanceAccountResponse)
async def update_account_balance_fixed(
    account_id: int,
    balance_data: BalanceUpdateSchema,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Пряме коригування балансу рахунку з вікна налаштувань"""
    stmt = select(FinanceAccountModel).where(
        FinanceAccountModel.fa_id == account_id,
        FinanceAccountModel.user_id == current_user.user_id
    )
    result = await db.execute(stmt)
    account = result.scalars().first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Рахунок не знайдено або доступу немає")
    
    account.balance = balance_data.balance #type: ignore
    await db.commit()
    await db.refresh(account)
    return account