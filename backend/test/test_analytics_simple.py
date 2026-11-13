import uuid
from datetime import datetime

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Building, EnergyLog, Room, User
from services import analytics
from routers.analytics import router  # change this to your router module


@pytest.fixture()
def db():
    try:
        connection = engine.connect()
    except OperationalError:
        pytest.skip("Database is not reachable. Check DATABASE_URL.")

    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def data(db):
    tag = uuid.uuid4().hex[:8]  # unique names, so old rows never clash
    user = User(username=f"test_{tag}", email=f"{tag}@example.com", password_hash="x")
    db.add(user)
    db.flush()

    building = Building(user_id=user.id, name=f"Building {tag}", area_sqm=100)
    db.add(building)
    db.flush()

    room1 = Room(building_id=building.id, room_name="R1")
    room2 = Room(building_id=building.id, room_name="R2")
    db.add_all([room1, room2])
    db.flush()

    db.add_all([
        EnergyLog(room_id=room1.id, timestamp=datetime(2026, 1, 1), energy_consumed_kwh=10, indoor_temp=20),
        EnergyLog(room_id=room1.id, timestamp=datetime(2026, 1, 2), energy_consumed_kwh=20, indoor_temp=22),
        EnergyLog(room_id=room2.id, timestamp=datetime(2026, 1, 1), energy_consumed_kwh=5, indoor_temp=18),
    ])
    db.commit()
    return {"user": user, "building": building}


@pytest.fixture()
def client(db):
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: db
    return TestClient(app)


def test_calculate_cost():
    assert analytics.calculate_cost(10, tariff=0.5) == 5.0


def test_summary_totals(db, data):
    result = analytics.summary(db, building_id=data["building"].id)
    assert result["total_kwh"] == 35.0
    assert result["avg_indoor_temp"] == 20.0  # (20 + 22 + 18) / 3


def test_by_building(db, data):
    result = analytics.by_building(db)
    mine = [row for row in result if row["building_id"] == data["building"].id]
    assert len(mine) == 1
    assert mine[0]["total_kwh"] == 35.0


def test_by_room(db, data):
    result = analytics.by_room(db, data["building"].id)
    totals = {row["room_name"]: row["total_kwh"] for row in result}
    assert totals == {"R1": 30.0, "R2": 5.0}


def test_timeseries_per_day(db, data):
    result = analytics.timeseries(db, data["building"].id, "day")
    assert [(r["period"], r["total_kwh"]) for r in result] == [
        ("2026-01-01", 15.0),
        ("2026-01-02", 20.0),
    ]


def test_api_summary(client, data):
    response = client.get("/api/analytics/summary",
                          params={"building_id": data["building"].id})
    assert response.status_code == 200
    assert response.json()["total_kwh"] == 35.0


def test_api_buildings_of_user(client, data):
    response = client.get(f"/api/analytics/buildings/{data['user'].id}")
    assert response.status_code == 200
    assert response.json()[0]["building_id"] == data["building"].id


def test_api_rooms_of_building(client, data):
    response = client.get(f"/api/analytics/buildings/{data['building'].id}/rooms")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_api_timeseries_rejects_bad_granularity(client, data):
    response = client.get("/api/analytics/timeseries", params={"granularity": "week"})
    assert response.status_code == 422


def test_api_sustainability_building_not_found(client, data):
    response = client.get("/api/analytics/sustainability/999999999")
    assert response.status_code == 404
