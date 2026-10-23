from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Building
from services import analytics, sustainability

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

@router.get("/sustainability/{building_id}")
def get_sustainability(building_id: int, start: datetime | None = None,
                       end: datetime | None = None, db: Session = Depends(get_db)):
    building = db.get(Building, building_id)
    if not building:
        raise HTTPException(404, "Building not found")
    data = analytics.summary(db, building_id, start, end)
    days = analytics.span_days(db, building_id, start, end)
    score = sustainability.sustainability_score(data["total_kwh"], building.area_sqm, days)
    return {"building_id": building_id, "name": building.name, **data,
            "days": days, "score": score, "grade": sustainability.grade(score)}