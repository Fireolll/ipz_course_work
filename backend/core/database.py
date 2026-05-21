# Створення підключення до PostgreSQL (engine) та генератор сесій бази даних (get_db).
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from core.config import settings

engine = create_async_engine(settings.DATABASE_URL)

# це для асинхронної сесії, яка дозволяє виконувати запити до бази даних без блокування основного потоку виконання.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=True
)
# клас для наслідування іншими иоделями бази даних, що дозволяє визначати структуру таблиць та взаємозв'язки між ними.
class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
