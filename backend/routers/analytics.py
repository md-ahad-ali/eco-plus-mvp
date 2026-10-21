from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services import analytics

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
def get_summary(building_id: int | None = None, start: datetime | None = None,
                end: datetime | None = None, db: Session = Depends(get_db)):
    return analytics.summary(db, building_id, start, end)

@router.get("/buildings")
def get_by_building(start: datetime | None = None, end: datetime | None = None,
                    db: Session = Depends(get_db)):
    return analytics.by_building(db, start, end)