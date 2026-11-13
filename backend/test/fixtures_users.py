"""Shared fixtures for the user / building / room tests.

Import the fixtures you need at the top of a test module, e.g.:

    from fixtures_users import PASSWORD, client, db, manager  # noqa: F401

These tests use an in-memory SQLite database (no MySQL needed) and a small
FastAPI app that only mounts the auth, buildings and rooms routers.
"""
import itertools
import os
import sys
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Make the backend package importable when pytest is run from any directory.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# config.Settings() needs every variable at import time. Real environment variables
# win over .env, so these defaults make the tests independent of the developer's .env
# (DATABASE_URL is deliberately not set here: the old MySQL-based tests still use it).
_TEST_ENV = {
    "APP_NAME": "Eco Pulse Test",
    "APP_VERSION": "0.0.0",
    "HOST": "127.0.0.1",
    "PORT": "8000",
    "DEBUG": "false",
    "SECRET_KEY": "test-secret-key-that-is-long-enough-for-hs256",
    "ALGORITHM": "HS256",
    "ACCESS_TOKEN_EXPIRE_MINUTES": "60",
    "PASSWORD_RESET_TOKEN_EXPIRE_MINUTES": "30",
    "FRONTEND_URL": "http://localhost:5173",
    "SMTP_HOST": "",
    "SMTP_PORT": "587",
    "SMTP_USERNAME": "",
    "SMTP_PASSWORD": "",
    "SMTP_FROM": "test@example.com",
    "SMTP_USE_TLS": "false",
    "TARIFF_EUR_PER_KWH": "0.30",
    "CO2_KG_PER_KWH": "0.40",
    "BENCHMARK_KWH_PER_SQM_DAY": "0.06",
    "OPENAI_API_KEY": "test",
    "MODEL": "test-model",
    "MAX_TOKENS": "100",
    "DAILY_CAP": "1",
    "TIMEOUT_S": "1",
    "MAX_RETRIES": "1",
    "MAX_TEXT_LEN": "100",
}
for _key, _value in _TEST_ENV.items():
    os.environ.setdefault(_key, _value)

from database import Base, get_db  # noqa: E402
from models import Building, Room, User, UserRole  # noqa: E402
from routers import auth, buildings, rooms  # noqa: E402
from services.security import create_access_token, hash_password  # noqa: E402

PASSWORD = "secret123"
_counter = itertools.count(1)


@pytest.fixture()
def db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autoflush=False)()
    yield session
    session.close()
    engine.dispose()


@pytest.fixture()
def client(db):
    app = FastAPI()
    app.include_router(auth.router)
    app.include_router(buildings.router)
    app.include_router(rooms.router)

    def _get_db():
        yield db

    app.dependency_overrides[get_db] = _get_db
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def make_user(db):
    def _make_user(role=UserRole.BUILDING_MANAGER, username=None, email=None, password=PASSWORD):
        n = next(_counter)
        user = User(
            username=username or f"user{n}",
            email=email or f"user{n}@example.com",
            password_hash=hash_password(password),
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    return _make_user


@pytest.fixture()
def make_building(db):
    def _make_building(manager, name=None, area_sqm=100.0):
        building = Building(
            user_id=manager.id,
            name=name or f"Building {next(_counter)}",
            area_sqm=area_sqm,
        )
        db.add(building)
        db.commit()
        db.refresh(building)
        return building

    return _make_building


@pytest.fixture()
def make_room(db):
    def _make_room(building, room_name=None):
        room = Room(building_id=building.id, room_name=room_name or f"Room {next(_counter)}")
        db.add(room)
        db.commit()
        db.refresh(room)
        return room

    return _make_room


@pytest.fixture()
def auth_headers():
    def _auth_headers(user):
        token = create_access_token({"sub": user.username, "role": user.role.value})
        return {"Authorization": f"Bearer {token}"}

    return _auth_headers


@pytest.fixture()
def admin(make_user):
    return make_user(role=UserRole.ADMIN, username="admin", email="admin@example.com")


@pytest.fixture()
def manager(make_user):
    return make_user(username="manager", email="manager@example.com")
