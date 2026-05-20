# Створення підключення до PostgreSQL (engine) та генератор сесій бази даних (get_db).
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

database_url = "postgresql+asyncpg://password123@localhost:5432/Financial_Tracker"
#це для асинхроного двигуна бази даних
engine = create_async_engine(database_url, echo=True)

# це для асинхронної сесії, яка дозволяє виконувати запити до бази даних без блокування основного потоку виконання.
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)
# клас для наслідування іншими иоделями бази даних, що дозволяє визначати структуру таблиць та взаємозв'язки між ними.
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
