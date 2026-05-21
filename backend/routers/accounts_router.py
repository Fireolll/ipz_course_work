from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from core.security import get_current_user
from models.user_model import UserModel
from schemas.finance_account_schema import FinanceAccountCreate, FinanceAccountResponse
from dal import finance_account_dal
from services import accounts_service

router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)

@router.post("/", response_model=FinanceAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_new_account(
    account_data: FinanceAccountCreate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Створює новий фінансовий рахунок для користувача
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
    # Отримує всі рахунки користувача
    accounts = await finance_account_dal.get_user_accounts(
        db=db,
        user_id=current_user.user_id  # type: ignore
    )
    return accounts