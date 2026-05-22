from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import get_current_user
from core.enums import TypeOfCashFlow
from models.user_model import UserModel
from models.transaction_model import TransactionModel
from models.finance_account_model import FinanceAccountModel
from models.category_model import CategoryModel
from schemas.transaction_schema import TransactionCreate, TransactionResponse
from services import transactions_service
from dal import finance_account_dal

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
    new_tx = await transactions_service.process_new_transaction(
        db=db, 
        tx_data=tx_data, 
        user_id=current_user.user_id # type: ignore
    )
    return new_tx

@router.get("/", response_model=list[TransactionResponse])
async def get_my_transactions(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Отримання історії транзакцій користувача"""
    from dal import transaction_dal
    transactions = await transaction_dal.get_filtered_transactions(
        db=db,
        user_id=current_user.user_id # type: ignore
    )
    return transactions

# --- ДОДАНИЙ ЕНДПОІНТ ---

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Безпечне видалення транзакції з автоматичним поверненням балансу рахунку"""
    # Перевіряємо, чи належить транзакція рахунку поточного юзера
    stmt = (
        select(TransactionModel)
        .join(FinanceAccountModel, TransactionModel.fa_id == FinanceAccountModel.fa_id)
        .where(
            TransactionModel.transaction_id == transaction_id,
            FinanceAccountModel.user_id == current_user.user_id
        )
    )
    result = await db.execute(stmt)
    tx = result.scalars().first()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Транзакцію не знайдено або доступу немає")
        
    # Дізнаємося тип транзакції через її категорію, щоб зробити зворотний перерахунок
    cat_stmt = select(CategoryModel).where(CategoryModel.category_id == tx.category_id)
    cat_result = await db.execute(cat_stmt)
    category = cat_result.scalars().first()
    
    # Розраховуємо зворотну дельту балансу
    if category and category.type_of_cash_flow == TypeOfCashFlow.expense: #type: ignore
        # Якщо видаляємо витрату — повертаємо гроші (+)
        refund_amount = tx.amount
    else:
        # Якщо видаляємо дохід — забираємо гроші (-)
        refund_amount = -tx.amount

    # Оновлюємо баланс платіжного рахунку в базі даних
    await finance_account_dal.update_account_balance(db, tx.fa_id, refund_amount) #type: ignore
    
    # Видаляємо саму транзакцію
    await db.delete(tx)
    await db.commit()
    
    return None