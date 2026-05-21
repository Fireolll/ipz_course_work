# Запити для роботи з категоріями.

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.category_model import CategoryModel

async def create_category(db: AsyncSession, category_data: dict, user_id: int | None = None) -> CategoryModel:
#Створює нову категорію. Якщо user_id = None, це буде дефолтна категорія, яка буде доступна всім юзерам.

    new_category = CategoryModel(**category_data, user_id=user_id)
    db.add(new_category)
    await db.flush()
    await db.commit()
    return new_category

async def get_user_categories(db: AsyncSession, user_id: int) -> list[CategoryModel]:
    #Повертає всі категорії: як дефолтні, так і кастомні
    stmt = select(CategoryModel).where(
        (CategoryModel.user_id == user_id) | (CategoryModel.is_default == True)
    ).order_by(CategoryModel.category_name)
    
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def get_category_by_id(db: AsyncSession, category_id: int, user_id: int) -> CategoryModel | None:
# Перевірка, чи існує категорія і чи належить вона цьому користувачеві 
    stmt = select(CategoryModel).where(
        CategoryModel.category_id == category_id,
        (CategoryModel.user_id == user_id) | (CategoryModel.is_default == True)
    )
    result = await db.execute(stmt)
    return result.scalars().first()
