from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from database import get_db
from models import Building, Room, User, UserRole
from routers.auth import get_current_user, require_roles
from routers.buildings import _get_building_or_404
from schemas import OccupantOption, RoomCreate, RoomResponse, RoomUpdate

router = APIRouter(prefix="/api", tags=["rooms"])

can_manage = require_roles(UserRole.ADMIN, UserRole.BUILDING_MANAGER)


def _get_room_or_404(db: Session, room_id: int, user: User) -> Room:
    room = db.get(Room, room_id)
    if room is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Room not found")
    # Occupants may view their own room; others need access to the building.
    if user.role == UserRole.OCCUPANT and room.occupant_id == user.id:
        return room
    _get_building_or_404(db, room.building_id, user)
    return room


def _ensure_manages_building(db: Session, building_id: int, user: User) -> Building:
    building = db.get(Building, building_id)
    if building is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Building not found")
    if user.role != UserRole.ADMIN and building.user_id != user.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "You do not have permission to modify this building"
        )
    return building


def _validate_occupant(db: Session, occupant_id: int) -> None:
    if db.get(User, occupant_id) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Occupant user not found")


@router.get("/occupants", response_model=list[OccupantOption])
def search_occupants(
    q: str | None = Query(default=None, description="Search by username or email"),
    limit: int = Query(default=10, ge=1, le=50),
    _: User = Depends(can_manage),
    db: Session = Depends(get_db),
) -> list[User]:
    """Search occupant accounts by username/email, for assigning them to a room."""
    stmt = select(User).where(User.role == UserRole.OCCUPANT)
    if q and q.strip():
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(or_(User.username.ilike(pattern), User.email.ilike(pattern)))
    stmt = stmt.order_by(User.username).limit(limit)
    return list(db.execute(stmt).scalars().all())


@router.get("/buildings/{building_id}/rooms", response_model=list[RoomResponse])
def list_rooms_by_building(
    building_id: int,
    q: str | None = Query(default=None, description="Search by room name"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Room]:
    """List rooms of a building. Occupants only see their own room(s)."""
    _get_building_or_404(db, building_id, current_user)
    stmt = select(Room).where(Room.building_id == building_id)
    if current_user.role == UserRole.OCCUPANT:
        stmt = stmt.where(Room.occupant_id == current_user.id)
    if q:
        stmt = stmt.where(Room.room_name.ilike(f"%{q.strip()}%"))
    stmt = stmt.order_by(Room.id).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())


@router.get("/rooms/{room_id}", response_model=RoomResponse)
def get_room(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Room:
    return _get_room_or_404(db, room_id, current_user)


@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    payload: RoomCreate,
    current_user: User = Depends(can_manage),
    db: Session = Depends(get_db),
) -> Room:
    _ensure_manages_building(db, payload.building_id, current_user)
    if payload.occupant_id is not None:
        _validate_occupant(db, payload.occupant_id)
    room = Room(
        building_id=payload.building_id,
        room_name=payload.room_name.strip(),
        occupant_id=payload.occupant_id,
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.put("/rooms/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    payload: RoomUpdate,
    current_user: User = Depends(can_manage),
    db: Session = Depends(get_db),
) -> Room:
    room = db.get(Room, room_id)
    if room is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Room not found")
    _ensure_manages_building(db, room.building_id, current_user)

    data = payload.model_dump(exclude_unset=True)
    if data.get("building_id") is None:
        data.pop("building_id", None)
    elif data["building_id"] != room.building_id:
        _ensure_manages_building(db, data["building_id"], current_user)
    if data.get("room_name") is None:
        data.pop("room_name", None)
    else:
        data["room_name"] = data["room_name"].strip()
    if data.get("occupant_id") is not None:
        _validate_occupant(db, data["occupant_id"])

    for field, value in data.items():
        setattr(room, field, value)
    db.commit()
    db.refresh(room)
    return room


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    current_user: User = Depends(can_manage),
    db: Session = Depends(get_db),
) -> Response:
    """Delete a room. Its energy logs are removed by DB cascade."""
    room = db.get(Room, room_id)
    if room is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Room not found")
    _ensure_manages_building(db, room.building_id, current_user)
    db.delete(room)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
