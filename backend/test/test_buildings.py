import pytest

from fixtures_users import (  # noqa: F401  (fixtures are used by name)
    admin,
    auth_headers,
    client,
    db,
    make_building,
    make_user,
    manager,
)


# ---------- list / get (visibility) ----------

def test_list_requires_auth(client):
    assert client.get("/api/buildings").status_code == 401


def test_admin_sees_all_buildings(client, admin, manager, make_user, make_building, auth_headers):
    other = make_user()
    make_building(manager, "A")
    make_building(other, "B")
    res = client.get("/api/buildings", headers=auth_headers(admin))
    assert res.status_code == 200
    assert [b["name"] for b in res.json()] == ["A", "B"]


def test_manager_only_sees_own_buildings(client, manager, make_user, make_building, auth_headers):
    other = make_user()
    mine = make_building(manager, "Mine")
    make_building(other, "Theirs")
    res = client.get("/api/buildings", headers=auth_headers(manager))
    assert [b["id"] for b in res.json()] == [mine.id]


def test_list_response_shape(client, manager, make_building, auth_headers):
    b = make_building(manager, "Main", area_sqm=250.5)
    item = client.get("/api/buildings", headers=auth_headers(manager)).json()[0]
    assert item == {
        "id": b.id,
        "user_id": manager.id,
        "manager_username": manager.username,
        "name": "Main",
        "area_sqm": 250.5,
    }


def test_list_search_by_name_is_case_insensitive(client, admin, manager, make_building, auth_headers):
    make_building(manager, "Science Hall")
    make_building(manager, "Library")
    res = client.get("/api/buildings", params={"q": "  science "}, headers=auth_headers(admin))
    assert [b["name"] for b in res.json()] == ["Science Hall"]


def test_list_pagination(client, admin, manager, make_building, auth_headers):
    for i in range(5):
        make_building(manager, f"B{i}")
    res = client.get("/api/buildings", params={"skip": 1, "limit": 2}, headers=auth_headers(admin))
    assert [b["name"] for b in res.json()] == ["B1", "B2"]


@pytest.mark.parametrize("params", [{"skip": -1}, {"limit": 0}, {"limit": 201}])
def test_list_rejects_invalid_pagination(client, admin, auth_headers, params):
    assert client.get("/api/buildings", params=params, headers=auth_headers(admin)).status_code == 422


def test_get_building(client, manager, make_building, auth_headers):
    b = make_building(manager, "Main")
    res = client.get(f"/api/buildings/{b.id}", headers=auth_headers(manager))
    assert res.status_code == 200
    assert res.json()["name"] == "Main"


def test_get_building_not_found(client, admin, auth_headers):
    assert client.get("/api/buildings/999", headers=auth_headers(admin)).status_code == 404


def test_manager_cannot_get_someone_elses_building(client, manager, make_user, make_building, auth_headers):
    theirs = make_building(make_user(), "Theirs")
    res = client.get(f"/api/buildings/{theirs.id}", headers=auth_headers(manager))
    assert res.status_code == 404  # hidden, not 403


# ---------- managers picker ----------

def test_search_managers_admin_only(client, manager, auth_headers):
    assert client.get("/api/buildings/managers", headers=auth_headers(manager)).status_code == 403


def test_search_managers_lists_only_building_managers(client, admin, make_user, auth_headers):
    make_user(username="zed")
    make_user(username="amy")
    res = client.get("/api/buildings/managers", headers=auth_headers(admin))
    assert res.status_code == 200
    assert [m["username"] for m in res.json()] == ["amy", "zed"]  # admin excluded, sorted


def test_search_managers_by_username_or_email(client, admin, make_user, auth_headers):
    make_user(username="amy", email="amy@campus.edu")
    make_user(username="bob", email="bob@other.com")
    by_name = client.get("/api/buildings/managers", params={"q": "AM"}, headers=auth_headers(admin))
    by_email = client.get("/api/buildings/managers", params={"q": "other.com"}, headers=auth_headers(admin))
    assert [m["username"] for m in by_name.json()] == ["amy"]
    assert [m["username"] for m in by_email.json()] == ["bob"]


def test_search_managers_limit(client, admin, make_user, auth_headers):
    for _ in range(3):
        make_user()
    res = client.get("/api/buildings/managers", params={"limit": 2}, headers=auth_headers(admin))
    assert len(res.json()) == 2


# ---------- create ----------

def test_admin_creates_building(client, admin, manager, auth_headers):
    res = client.post(
        "/api/buildings",
        json={"name": "  New Hall  ", "area_sqm": 500, "user_id": manager.id},
        headers=auth_headers(admin),
    )
    assert res.status_code == 201
    body = res.json()
    assert body["name"] == "New Hall"  # trimmed
    assert body["area_sqm"] == 500
    assert body["user_id"] == manager.id
    assert body["manager_username"] == manager.username


def test_manager_cannot_create_building(client, manager, auth_headers):
    res = client.post(
        "/api/buildings",
        json={"name": "X", "area_sqm": 10, "user_id": manager.id},
        headers=auth_headers(manager),
    )
    assert res.status_code == 403


def test_create_building_requires_auth(client, manager):
    res = client.post("/api/buildings", json={"name": "X", "area_sqm": 10, "user_id": manager.id})
    assert res.status_code == 401


def test_create_building_unknown_manager(client, admin, auth_headers):
    res = client.post(
        "/api/buildings",
        json={"name": "X", "area_sqm": 10, "user_id": 999},
        headers=auth_headers(admin),
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "Manager user not found"


def test_create_building_cannot_be_assigned_to_admin(client, admin, auth_headers):
    res = client.post(
        "/api/buildings",
        json={"name": "X", "area_sqm": 10, "user_id": admin.id},
        headers=auth_headers(admin),
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "Selected user is not a building manager"


@pytest.mark.parametrize(
    "payload",
    [
        {"name": "", "area_sqm": 10},
        {"name": "X", "area_sqm": 0},
        {"name": "X", "area_sqm": -5},
        {"name": "X"},
        {"name": "x" * 151, "area_sqm": 10},
    ],
)
def test_create_building_validation_errors(client, admin, manager, auth_headers, payload):
    res = client.post(
        "/api/buildings", json={**payload, "user_id": manager.id}, headers=auth_headers(admin)
    )
    assert res.status_code == 422


# ---------- update ----------

def test_admin_updates_building_partially(client, admin, manager, make_building, auth_headers):
    b = make_building(manager, "Old", area_sqm=100)
    res = client.put(
        f"/api/buildings/{b.id}", json={"name": "  Renamed "}, headers=auth_headers(admin)
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Renamed"
    assert res.json()["area_sqm"] == 100  # untouched


def test_admin_reassigns_building_to_another_manager(client, admin, manager, make_user, make_building, auth_headers):
    new_manager = make_user(username="newbie")
    b = make_building(manager)
    res = client.put(
        f"/api/buildings/{b.id}", json={"user_id": new_manager.id}, headers=auth_headers(admin)
    )
    assert res.status_code == 200
    assert res.json()["user_id"] == new_manager.id
    assert res.json()["manager_username"] == "newbie"


def test_update_building_rejects_non_manager_assignee(client, admin, manager, make_building, auth_headers):
    b = make_building(manager)
    res = client.put(f"/api/buildings/{b.id}", json={"user_id": admin.id}, headers=auth_headers(admin))
    assert res.status_code == 400


def test_update_building_rejects_unknown_assignee(client, admin, manager, make_building, auth_headers):
    b = make_building(manager)
    res = client.put(f"/api/buildings/{b.id}", json={"user_id": 999}, headers=auth_headers(admin))
    assert res.status_code == 400


def test_update_building_not_found(client, admin, auth_headers):
    assert client.put("/api/buildings/999", json={"name": "X"}, headers=auth_headers(admin)).status_code == 404


def test_manager_cannot_update_building(client, manager, make_building, auth_headers):
    b = make_building(manager)
    res = client.put(f"/api/buildings/{b.id}", json={"name": "X"}, headers=auth_headers(manager))
    assert res.status_code == 403


def test_update_building_validation_error(client, admin, manager, make_building, auth_headers):
    b = make_building(manager)
    res = client.put(f"/api/buildings/{b.id}", json={"area_sqm": -1}, headers=auth_headers(admin))
    assert res.status_code == 422


# ---------- delete ----------

def test_admin_deletes_building(client, admin, manager, make_building, auth_headers):
    b = make_building(manager)
    res = client.delete(f"/api/buildings/{b.id}", headers=auth_headers(admin))
    assert res.status_code == 204
    assert res.content == b""
    assert client.get(f"/api/buildings/{b.id}", headers=auth_headers(admin)).status_code == 404


def test_delete_building_not_found(client, admin, auth_headers):
    assert client.delete("/api/buildings/999", headers=auth_headers(admin)).status_code == 404


def test_manager_cannot_delete_building(client, db, manager, make_building, auth_headers):
    b = make_building(manager)
    res = client.delete(f"/api/buildings/{b.id}", headers=auth_headers(manager))
    assert res.status_code == 403
    assert client.get(f"/api/buildings/{b.id}", headers=auth_headers(manager)).status_code == 200


def test_model_manager_username_property(manager, make_building):
    assert make_building(manager).manager_username == manager.username
