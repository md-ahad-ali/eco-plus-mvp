from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import or_, select, update
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import Building, PasswordResetToken, Room, User, UserRole
from schemas import (
    ForgotPasswordRequest,
    MessageResponse,
    PasswordChange,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
)
from services.mailer import send_password_reset_email
from services.security import (
    create_access_token,
    decode_access_token,
    generate_reset_token,
    hash_password,
    hash_reset_token,
    verify_password,
)


def _utcnow() -> datetime:
    """Naive UTC datetime, matching the MySQL DATETIME columns."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

router = APIRouter(prefix="/api/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency that extracts and verifies the JWT token from the Authorization header."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    username: str | None = payload.get("sub")
    if username is None:
        raise credentials_exception

    user = db.execute(
        select(User).where(User.username == username)
    ).scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user


def require_roles(*roles: UserRole) -> Callable[[User], User]:
    """Dependency factory for Role-Based Access Control (RBAC)."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )
        return current_user

    return role_checker


def _issue_token(user: User) -> dict:
    """Build the login response (JWT + user details) for an authenticated user."""
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value}
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> dict:
    """Register a new account and log it in. Admin accounts can't be self-registered."""
    if user_in.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be created through public registration",
        )

    existing_users = db.execute(
        select(User).where(
            or_(User.username == user_in.username, User.email == user_in.email)
        )
    ).scalars().all()

    if any(u.username == user_in.username for u in existing_users):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    if existing_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return _issue_token(new_user)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)) -> dict:
    """Authenticate credentials and return a signed JWT access token with user details."""
    identifier = credentials.username.strip()
    if "@" in identifier:
        condition = User.email == identifier.lower()
    else:
        condition = User.username == identifier

    user = db.execute(select(User).where(condition)).scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _issue_token(user)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """Retrieve details of the currently authenticated user."""
    profile = UserResponse.model_validate(current_user)

    if current_user.role == UserRole.OCCUPANT:
        room_and_building = db.execute(
            select(Room, Building)
            .join(Building, Building.id == Room.building_id)
            .where(Room.occupant_id == current_user.id)
        ).first()
        if room_and_building:
            room, building = room_and_building
            profile.room_name = room.room_name
            profile.building_name = building.name

    return profile


@router.put("/change-password", response_model=MessageResponse)
def change_password(
    payload: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Change the password of the currently authenticated user."""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if payload.new_password == payload.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password",
        )

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password changed successfully"}


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> dict:
    """Send a password reset link to the given email, if an account exists."""
    generic_response = {
        "message": "If an account with that email exists, a password reset link has been sent"
    }

    user = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()
    if user is None:
        return generic_response

    now = _utcnow()
    # Invalidate any previous unused tokens for this user.
    db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
    )

    raw_token, token_hash = generate_reset_token()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=now + timedelta(minutes=settings.password_reset_token_expire_minutes),
        )
    )
    db.commit()

    reset_link = f"{settings.frontend_url.rstrip('/')}/reset-password?token={raw_token}"
    background_tasks.add_task(send_password_reset_email, user.email, user.username, reset_link)

    return generic_response


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict:
    """Set a new password using a valid, unused, unexpired reset token."""
    reset_token = db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == hash_reset_token(payload.token)
        )
    ).scalar_one_or_none()

    now = _utcnow()
    if reset_token is None or reset_token.used_at is not None or reset_token.expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user = db.get(User, reset_token.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user.password_hash = hash_password(payload.new_password)
    reset_token.used_at = now
    db.commit()

    return {"message": "Password has been reset successfully"}
