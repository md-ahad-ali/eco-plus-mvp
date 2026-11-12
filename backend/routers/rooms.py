from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Room, User, UserRole
from routers.auth import get_current_user, require_roles
from routers.buildings import _get_building_or_404
from schemas import RoomCreate, RoomResponse, RoomUpdate

router = APIRouter(prefix="/api", tags=["rooms"])

manager_only = require_roles(UserRole.BUILDING_MANAGER)


def _get_room_or_404(db: Session, room_id: int, user: User) -> Room:
    room = db.get(Room, room_id)
    if room is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Room not found")
    # Raises 404 if the user can't see the room's building.
    _get_building_or_404(db, room.building_id, user)
    return room


@router.get("/buildings/{building_id}/rooms", response_model=list[RoomResponse])
def list_rooms_by_building(
    building_id: int,
    q: str | None = Query(default=None, description="Search by room name"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Room]:
    """List rooms of a building the current user can see."""
    _get_building_or_404(db, building_id, current_user)
    stmt = select(Room).where(Room.building_id == building_id)
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
    current_user: User = Depends(manager_only),
    db: Session = Depends(get_db),
) -> Room:
    """Create a room in a building the current manager manages (building manager only)."""
    _get_building_or_404(db, payload.building_id, current_user)
    room = Room(
        building_id=payload.building_id,
        room_name=payload.room_name.strip(),
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.put("/rooms/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    payload: RoomUpdate,
    current_user: User = Depends(manager_only),
    db: Session = Depends(get_db),
) -> Room:
    """Update a room in a building the current manager manages (building manager only)."""
    room = _get_room_or_404(db, room_id, current_user)

    data = payload.model_dump(exclude_unset=True)
    if data.get("building_id") is None:
        data.pop("building_id", None)
    elif data["building_id"] != room.building_id:
        _get_building_or_404(db, data["building_id"], current_user)
    if data.get("room_name") is None:
        data.pop("room_name", None)
    else:
        data["room_name"] = data["room_name"].strip()

    for field, value in data.items():
        setattr(room, field, value)
    db.commit()
    db.refresh(room)
    return room


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    current_user: User = Depends(manager_only),
    db: Session = Depends(get_db),
) -> Response:
    """Delete a room (building manager only). Its energy logs are removed by DB cascade."""
    room = _get_room_or_404(db, room_id, current_user)
    db.delete(room)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
