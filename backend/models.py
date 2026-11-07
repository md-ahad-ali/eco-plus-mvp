import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    BUILDING_MANAGER = "building_manager"
    OCCUPANT = "occupant"


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, values_callable=lambda obj: [e.value for e in obj]),
        default=UserRole.OCCUPANT,
        nullable=False,
    )


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
    occupant_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    room_name: Mapped[str] = mapped_column(String(100))


class EnergyLog(Base):
    __tablename__ = "energy_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    energy_consumed_kwh: Mapped[float] = mapped_column(Float)
    indoor_temp: Mapped[float] = mapped_column(Float)
