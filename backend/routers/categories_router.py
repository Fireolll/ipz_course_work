from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import get_current_user
from models.user_model import UserModel
from models.category_model import CategoryModel
from schemas.category_schema import CategoryCreate, CategoryResponse
from dal import category_dal

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_new_category(
    category_data: CategoryCreate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_category = await category_dal.create_category(
        db=db, 
        category_data=category_data.model_dump(), 
        user_id=current_user.user_id # type: ignore
    )
    await db.commit()
    await db.refresh(new_category)
    return new_category

@router.get("/", response_model=list[CategoryResponse])
async def get_my_categories(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    categories = await category_dal.get_user_categories(
        db=db, 
        user_id=current_user.user_id # type: ignore
    )
    return categories

# --- ДОДАНИЙ ЕНДПОІНТ ---

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Видалення кастомної категорії користувача"""
    stmt = select(CategoryModel).where(
        CategoryModel.category_id == category_id,
        CategoryModel.user_id == current_user.user_id
    )
    result = await db.execute(stmt)
    category = result.scalars().first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Категорію не знайдено або системні категорії не можна видаляти"
        )
        
    await db.delete(category)
    await db.commit()
    return None