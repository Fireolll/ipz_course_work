from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user_model import UserModel
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
    #створення кастомної категорії
    new_category = await category_dal.create_category(
        db=db, 
        category_data=category_data.model_dump(), 
        user_id=current_user.user_id # type: ignore
    )
    await db.commit()
    return new_category

@router.get("/", response_model=list[CategoryResponse])
async def get_my_categories(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    #Отримання всіх категорій, створених користувачем
    categories = await category_dal.get_user_categories(
        db=db, 
        user_id=current_user.user_id # type: ignore
    )
    return categories