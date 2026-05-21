# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

# Імпортуємо наші роутери (БЕЗ слова backend)
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

# Налаштування CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Financial Tracker API",
        version="1.0.0",
        description="Бекенд для системи управління особистими фінансами",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT token from /auth/login",
        }
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
async def root():
    return {"message": "Сервер Financial Tracker успішно працює!"}