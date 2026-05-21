# ACID логіка транзакцій.

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from dal import category_dal, finance_account_dal, transaction_dal
from core.enums import TypeOfCashFlow
from schemas.transaction_schema import TransactionCreate

async def process_new_transaction(db: AsyncSession, tx_data: TransactionCreate, user_id: int):
    """
    Обробляє створення нової транзакції та автоматично оновлює баланс рахунку.
    """
    # 1. Перевіряємо категорію
    category = await category_dal.get_category_by_id(db, tx_data.category_id, user_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Категорію не знайдено або доступу немає"
        )

    # 2. Перевіряємо фінансовий рахунок
    account = await finance_account_dal.get_account_by_id(db, tx_data.fa_id, user_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Рахунок не знайдено або доступу немає"
        )
        
    if not account.is_active: #type: ignore
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Неможливо додати транзакцію: рахунок неактивний"
        )

    # 3. Визначаємо дельту (суму для зміни балансу)
    amount_delta = tx_data.amount
    if category.type_of_cash_flow == TypeOfCashFlow.EXPENSE: #type: ignore
        amount_delta = -tx_data.amount

    # 4. Оновлюємо баланс
    await finance_account_dal.update_account_balance(db, account.fa_id, amount_delta) #type: ignore
    
    # 5. Записуємо саму транзакцію (у вигляді словника)
    new_tx = await transaction_dal.create_transaction(db, tx_data.model_dump())
    
    # 6. Комітимо всі зміни разом (ACID гарантія)
    await db.commit()
    
    return new_tx