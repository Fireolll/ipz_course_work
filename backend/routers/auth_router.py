from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import secrets
from datetime import datetime, timedelta, timezone

from core.database import get_db
from schemas.user_schema import UserCreate, UserResponse
from schemas.token_schema import TokenResponse, PasswordResetRequest, PasswordResetConfirm
from services import auth_service, email_service
from dal import user_dal, password_reset_dal
from core import security

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

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    # Accepts PasswordResetRequest, checks if email exists, generates token, saves to DB, sends email
    user = await user_dal.get_user_by_email(db, request.email)
    if not user:
        # Avoid user enumeration by returning a generic success message
        return {"message": "If an account with this email exists, a password reset link has been sent."}
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    await password_reset_dal.create_reset_token(db, user.user_id, token, expires_at)
    await db.commit()
    
    # Fire and forget email sending (ideally a background task)
    await email_service.send_password_reset_email(user.email, token)
    
    return {"message": "If an account with this email exists, a password reset link has been sent."}

@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    # Checks token validity, hashes new password, updates DB, marks token used
    token_record = await password_reset_dal.get_valid_reset_token(db, request.token)
    if not token_record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")
    
    user = await user_dal.get_user_by_id(db, token_record.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found.")
        
    hashed_password = security.get_password_hash(request.new_password)
    user.password_hash = hashed_password
    
    await password_reset_dal.mark_token_as_used(db, token_record.id)
    await db.commit()
    
    return {"message": "Password successfully reset."}