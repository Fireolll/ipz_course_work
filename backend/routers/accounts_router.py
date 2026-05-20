from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user_model import UserModel
from schemas.transaction_schema import TransactionCreate, TransactionResponse
from services import transactions_service

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_new_transaction(
    tx_data: TransactionCreate, 
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    #Створює нову транзакцію (дохід або витрату) та автоматично оновлює баланс.

    new_tx = await transactions_service.process_new_transaction(
        db=db, 
        tx_data=tx_data, 
        user_id=current_user.user_id # type: ignore
    )
    return new_tx