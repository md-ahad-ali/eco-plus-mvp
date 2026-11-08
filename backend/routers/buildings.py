from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Building, Room, User, UserRole
from routers.auth import get_current_user, require_roles
from schemas import BuildingCreate, BuildingResponse, BuildingUpdate

router = APIRouter(prefix="/api/buildings", tags=["buildings"])

can_manage = require_roles(UserRole.ADMIN, UserRole.BUILDING_MANAGER)


def _visible_buildings_stmt(user: User):
    """Admin sees all, manager sees owned buildings, occupant sees buildings they live in."""
    stmt = select(Building)
    if user.role == UserRole.BUILDING_MANAGER:
        stmt = stmt.where(Building.user_id == user.id)
    elif user.role == UserRole.OCCUPANT:
        stmt = stmt.where(
            Building.id.in_(select(Room.building_id).where(Room.occupant_id == user.id))
        )
    return stmt


def _get_building_or_404(db: Session, building_id: int, user: User) -> Building:
    building = db.execute(
        _visible_buildings_stmt(user).where(Building.id == building_id)
    ).scalar_one_or_none()
    if building is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Building not found")
    return building


def _ensure_can_modify(building: Building, user: User) -> None:
    if user.role != UserRole.ADMIN and building.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this building",
        )


def _validate_owner(db: Session, owner_id: int) -> None:
    owner = db.get(User, owner_id)
    if owner is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner user not found")
    if owner.role not in (UserRole.ADMIN, UserRole.BUILDING_MANAGER):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner must be an admin or building manager",
        )


@router.get("", response_model=list[BuildingResponse])
def list_buildings(
    q: str | None = Query(default=None, description="Search by name"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Building]:
    """List buildings visible to the current user."""
    stmt = _visible_buildings_stmt(current_user)
    if q:
        stmt = stmt.where(Building.name.ilike(f"%{q.strip()}%"))
    stmt = stmt.order_by(Building.id).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())


@router.get("/{building_id}", response_model=BuildingResponse)
def get_building(
    building_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Building:
    """Get a single building by id."""
    return _get_building_or_404(db, building_id, current_user)


@router.post("", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
def create_building(
    payload: BuildingCreate,
    current_user: User = Depends(can_manage),
    db: Session = Depends(get_db),
) -> Building:
    """Create a building. Managers always own what they create; admins may assign an owner."""
    owner_id = current_user.id
    if payload.user_id is not None and payload.user_id != current_user.id:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can assign a building to another user",
            )
        _validate_owner(db, payload.user_id)
        owner_id = payload.user_id

    building = Building(
        name=payload.name.strip(),
        address=payload.address.strip() if payload.address else None,
        area_sqm=payload.area_sqm,
        user_id=owner_id,
    )
    db.add(building)
    db.commit()
    db.refresh(building)
    return building


@router.put("/{building_id}", response_model=BuildingResponse)
def update_building(
    building_id: int,
    payload: BuildingUpdate,
    current_user: User = Depends(can_manage),
    db: Session = Depends(get_db),
) -> Building:
    """Partially update a building (only provided fields are changed)."""
    building = _get_building_or_404(db, building_id, current_user)
    _ensure_can_modify(building, current_user)

    data = payload.model_dump(exclude_unset=True, exclude_none=True)
    if "user_id" in data and data["user_id"] != building.user_id:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can reassign building ownership",
            )
        _validate_owner(db, data["user_id"])
    if "name" in data:
        data["name"] = data["name"].strip()
    if "address" in data:
        data["address"] = data["address"].strip()

    for field, value in data.items():
        setattr(building, field, value)
    db.commit()
    db.refresh(building)
    return building


@router.delete("/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_building(
    building_id: int,
    current_user: User = Depends(can_manage),
    db: Session = Depends(get_db),
) -> Response:
    """Delete a building. Rooms and energy logs are removed by DB cascade."""
    building = _get_building_or_404(db, building_id, current_user)
    _ensure_can_modify(building, current_user)
    db.delete(building)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
