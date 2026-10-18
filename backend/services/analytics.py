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

