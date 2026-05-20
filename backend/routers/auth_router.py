from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from schemas.user_schema import UserCreate, UserResponse
from schemas.token_schema import TokenResponse
from services import auth_service

#створення самого роутера
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
   # Реєстрація нового користувача.

    new_user = await auth_service.register_new_user(db, user_data)
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    #Отримання JWT-токена для доступу до захищених ендпоінтів.
    token_data = await auth_service.authenticate_user(db, email=form_data.username, password=form_data.password)
    return token_data