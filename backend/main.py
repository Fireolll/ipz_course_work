# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Імпортуємо наші роутери
from backend.routers import analytics_router
from routers import (
    auth_router, 
    transactions_router, 
    accounts_router, 
    categories_router, 
    users_router,
    analytics_router
)
app = FastAPI(
    title="Financial Tracker API",
    description="Бекенд для системи управління особистими фінансами",
    version="1.0.0"
)

# Налаштування CORS (щоб твій майбутній React міг звертатися до бекенду)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Адреса Vite/React сервера
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Підключаємо роутери до головного додатка
app.include_router(auth_router)
app.include_router(transactions_router)
app.include_router(accounts_router)
app.include_router(categories_router)
app.include_router(users_router)
app.include_router(analytics_router)

@app.get("/")
async def root():
    return {"message": "Сервер Financial Tracker успішно працює!"}


