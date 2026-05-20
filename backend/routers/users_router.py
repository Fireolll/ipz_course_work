from fastapi import APIRouter, Depends
from core.security import get_current_user
from models.user_model import UserModel
from schemas.user_schema import UserResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: UserModel = Depends(get_current_user)):
#Повертає інформацію про поточного користувача.
    return current_user