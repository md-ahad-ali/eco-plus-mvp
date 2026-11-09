import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    BUILDING_MANAGER = "building_manager"
    OCCUPANT = "occupant"

class ImportStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    PARTIAL = "partial"
    FAILED = "failed"


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


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Building(Base):
    __tablename__ = "buildings"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(150))
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
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

class ImportRecord(Base):
    __tablename__ = "import_records"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    file_name: Mapped[str] = mapped_column(String(255), nullable=False)

    rows_imported: Mapped[int] = mapped_column(default=0, nullable=False)

    rows_rejected: Mapped[int] = mapped_column(default=0, nullable=False)

    status: Mapped[ImportStatus] = mapped_column(
        Enum(ImportStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=ImportStatus.PENDING,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
