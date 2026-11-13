from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import get_db
from models import Building, EnergyLog, Room, User, UserRole
from routers.auth import get_current_user
from routers.buildings import _get_building_or_404
from schemas import EnergyLogPage, EnergyLogRow

router = APIRouter(prefix="/api/energy-logs", tags=["energy-logs"])


@router.get("", response_model=EnergyLogPage)
def list_energy_logs(
    building_id: int | None = None,
    room_id: int | None = None,
    start: datetime | None = Query(default=None, description="Inclusive"),
    end: datetime | None = Query(default=None, description="Inclusive"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=25, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Energy readings joined with their room and building, newest first.

    Admin: all buildings. Building manager: only buildings they manage.
    """
    conditions = []

    if building_id is not None:
        # 404 if the building doesn't exist or the user can't see it.
        _get_building_or_404(db, building_id, current_user)
        conditions.append(Building.id == building_id)
    elif current_user.role != UserRole.ADMIN:
        # No building chosen: managers get all of their own buildings.
        conditions.append(Building.user_id == current_user.id)

    if room_id is not None:
        conditions.append(Room.id == room_id)
    if start is not None:
        conditions.append(EnergyLog.timestamp >= start)
    if end is not None:
        conditions.append(EnergyLog.timestamp <= end)

    joined = (
        select(EnergyLog)
        .join(Room, Room.id == EnergyLog.room_id)
        .join(Building, Building.id == Room.building_id)
        .where(*conditions)
    )

    total = db.execute(
        select(func.count()).select_from(joined.subquery())
    ).scalar_one()

    rows = db.execute(
        select(
            EnergyLog.id,
            EnergyLog.timestamp,
            Building.id.label("building_id"),
            Building.name.label("building_name"),
            Room.id.label("room_id"),
            Room.room_name,
            EnergyLog.energy_consumed_kwh,
            EnergyLog.indoor_temp,
        )
        .join(Room, Room.id == EnergyLog.room_id)
        .join(Building, Building.id == Room.building_id)
        .where(*conditions)
        .order_by(EnergyLog.timestamp.desc(), EnergyLog.id.desc())
        .offset(skip)
        .limit(limit)
    ).all()

    return {
        "items": [EnergyLogRow.model_validate(r) for r in rows],
        "total": total,
        "skip": skip,
        "limit": limit,
    }