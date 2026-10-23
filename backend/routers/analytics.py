from datetime import datetime

from fastapi import APIRouter, Depends, Query
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

@router.get("/buildings/{building_id}/rooms")
def get_by_room(building_id: int, start: datetime | None = None, end: datetime | None = None,
                db: Session = Depends(get_db)):
    return analytics.by_room(db, building_id, start, end)

@router.get("/timeseries")
def get_timeseries(building_id: int | None = None,
                   granularity: str = Query("day", pattern="^(hour|day|month)$"),
                   start: datetime | None = None, end: datetime | None = None,
                   db: Session = Depends(get_db)):
    return analytics.timeseries(db, building_id, granularity, start, end)