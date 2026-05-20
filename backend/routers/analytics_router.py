from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user_model import UserModel
from schemas.analytics_schema import BalanceReportResponse
from services import analytics_service

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/report", response_model=BalanceReportResponse)
async def get_general_report(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
   #Повертає фінальний фінансовий звіт: загальні доходи, витрати та детальну розбивку витрат по категоріях у відсотках.
    report = await analytics_service.generate_balance_report(
        db=db, 
        user_id=current_user.user_id, # type: ignore
        user_currency=current_user.currency# type: ignore
    )
    return report