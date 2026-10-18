from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Building(Base):
    __tablename__ = "buildings"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(150))
    area_sqm: Mapped[float] = mapped_column(Float)


class Room(Base):
    __tablename__ = "rooms"
    id: Mapped[int] = mapped_column(primary_key=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id"))
    room_name: Mapped[str] = mapped_column(String(100))


class EnergyLog(Base):
    __tablename__ = "energy_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    energy_consumed_kwh: Mapped[float] = mapped_column(Float)
    indoor_temp: Mapped[float] = mapped_column(Float)
