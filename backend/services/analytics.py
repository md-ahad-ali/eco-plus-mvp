from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from config import CO2_FACTOR, TARIFF
from models import Building, EnergyLog, Room

BUCKETS = {"hour": "%Y-%m-%d %H:00", "day": "%Y-%m-%d", "month": "%Y-%m"}


def calculate_cost(kwh: float, tariff: float = TARIFF) -> float:
    return round(kwh * tariff, 2)


def calculate_carbon(kwh: float, factor: float = CO2_FACTOR) -> float:
    return round(kwh * factor, 2)


def _totals(kwh) -> dict:
    kwh = float(kwh or 0)
    return {
        "total_kwh": round(kwh, 2),
        "cost_eur": calculate_cost(kwh),
        "carbon_kg_co2": calculate_carbon(kwh),
    }


def _range(stmt, start: datetime | None, end: datetime | None):
    if start:
        stmt = stmt.where(EnergyLog.timestamp >= start)
    if end:
        stmt = stmt.where(EnergyLog.timestamp < end)
    return stmt


def summary(db: Session, building_id=None, start=None, end=None) -> dict:
    stmt = select(func.sum(EnergyLog.energy_consumed_kwh), func.avg(EnergyLog.indoor_temp)).join(
        Room, Room.id == EnergyLog.room_id
    )
    if building_id:
        stmt = stmt.where(Room.building_id == building_id)
    kwh, temp = db.execute(_range(stmt, start, end)).one()
    return {**_totals(kwh), "avg_indoor_temp": round(float(temp or 0), 1)}

def by_building(db: Session, start=None, end=None) -> list[dict]:
    stmt = (
        select(Building.id, Building.name, func.sum(EnergyLog.energy_consumed_kwh))
        .join(Room, Room.building_id == Building.id)
        .join(EnergyLog, EnergyLog.room_id == Room.id)
        .group_by(Building.id, Building.name)
    )
    rows = db.execute(_range(stmt, start, end)).all()
    return [{"building_id": i, "name": n, **_totals(k)} for i, n, k in rows]

def by_room(db: Session, building_id: int, start=None, end=None) -> list[dict]:
    stmt = (
        select(Room.id, Room.room_name, func.sum(EnergyLog.energy_consumed_kwh))
        .join(EnergyLog, EnergyLog.room_id == Room.id)
        .where(Room.building_id == building_id)
        .group_by(Room.id, Room.room_name)
    )
    rows = db.execute(_range(stmt, start, end)).all()
    return [{"room_id": i, "room_name": n, **_totals(k)} for i, n, k in rows]

def timeseries(db: Session, building_id=None, granularity="day", start=None, end=None) -> list[dict]:
    bucket = func.date_format(EnergyLog.timestamp, BUCKETS[granularity])
    stmt = select(bucket, func.sum(EnergyLog.energy_consumed_kwh)).join(Room, Room.id == EnergyLog.room_id)
    if building_id:
        stmt = stmt.where(Room.building_id == building_id)
    stmt = _range(stmt, start, end).group_by(bucket).order_by(bucket)
    return [{"period": p, **_totals(k)} for p, k in db.execute(stmt).all()]

def span_days(db: Session, building_id: int, start=None, end=None) -> float:
    stmt = select(func.min(EnergyLog.timestamp), func.max(EnergyLog.timestamp)).join(
        Room, Room.id == EnergyLog.room_id
    ).where(Room.building_id == building_id)
    first, last = db.execute(_range(stmt, start, end)).one()
    if not first:
        return 0.0
    return max(1.0, round((last - first).total_seconds() / 86400 + 1 / 24, 2))