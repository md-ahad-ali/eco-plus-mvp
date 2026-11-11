from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from database import get_db
from models import Building, User, UserRole
from routers.auth import get_current_user, require_roles
from schemas import BuildingCreate, BuildingResponse, BuildingUpdate, ManagerOption

router = APIRouter(prefix="/api/buildings", tags=["buildings"])

admin_only = require_roles(UserRole.ADMIN)


def _visible_buildings_stmt(user: User):
    """Admin sees all buildings; a building manager only sees the buildings they manage."""
    stmt = select(Building)
    if user.role != UserRole.ADMIN:
        stmt = stmt.where(Building.user_id == user.id)
    return stmt


def _get_building_or_404(db: Session, building_id: int, user: User) -> Building:
    building = db.execute(
        _visible_buildings_stmt(user).where(Building.id == building_id)
    ).scalar_one_or_none()
    if building is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Building not found")
    return building


def _validate_manager(db: Session, manager_id: int) -> None:
    manager = db.get(User, manager_id)
    if manager is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Manager user not found")
    if manager.role != UserRole.BUILDING_MANAGER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected user is not a building manager",
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


@router.get("/managers", response_model=list[ManagerOption])
def search_managers(
    q: str | None = Query(default=None, description="Search by username or email"),
    limit: int = Query(default=10, ge=1, le=50),
    _: User = Depends(admin_only),
    db: Session = Depends(get_db),
) -> list[User]:
    """Search building managers by username/email, for assigning them to a building."""
    stmt = select(User).where(User.role == UserRole.BUILDING_MANAGER)
    if q and q.strip():
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(or_(User.username.ilike(pattern), User.email.ilike(pattern)))
    stmt = stmt.order_by(User.username).limit(limit)
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
    _: User = Depends(admin_only),
    db: Session = Depends(get_db),
) -> Building:
    """Create a building and assign it to a building manager (admin only)."""
    _validate_manager(db, payload.user_id)
    building = Building(
        name=payload.name.strip(),
        area_sqm=payload.area_sqm,
        user_id=payload.user_id,
    )
    db.add(building)
    db.commit()
    db.refresh(building)
    return building


@router.put("/{building_id}", response_model=BuildingResponse)
def update_building(
    building_id: int,
    payload: BuildingUpdate,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
) -> Building:
    """Partially update a building (admin only; only provided fields are changed)."""
    building = _get_building_or_404(db, building_id, current_user)

    data = payload.model_dump(exclude_unset=True, exclude_none=True)
    if "user_id" in data and data["user_id"] != building.user_id:
        _validate_manager(db, data["user_id"])
    if "name" in data:
        data["name"] = data["name"].strip()

    for field, value in data.items():
        setattr(building, field, value)
    db.commit()
    db.refresh(building)
    return building


@router.delete("/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_building(
    building_id: int,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
) -> Response:
    """Delete a building (admin only). Rooms and energy logs are removed by DB cascade."""
    building = _get_building_or_404(db, building_id, current_user)
    db.delete(building)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
