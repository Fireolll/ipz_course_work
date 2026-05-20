# Схеми JWT токенів.

from pydantic import BaseModel
from pydantic import EmailStr

#JWT Токени (Авторизація)

# Схема токена, яку ми повертаємо на фронтенд при успішному логіні
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Схема даних, які ми записуємо всередину самого JWT токена
class TokenPayload(BaseModel):
    sub: str | None = None # зберігання id крпустувача


# відновлення пароля

# Схема для запиту на відновлення (користувач вводить email)
class PasswordResetRequest(BaseModel):
    email: EmailStr

# Схема для встановлення нового пароля (користувач перейшов за посиланням з пошти)
class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str