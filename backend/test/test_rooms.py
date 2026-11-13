import pytest

from fixtures_users import (  # noqa: F401  (fixtures are used by name)
    admin,
    auth_headers,
    client,
    db,
    make_building,
    make_room,
    make_user,
    manager,
)


# ---------- list rooms by building ----------

def test_list_rooms_requires_auth(client, manager, make_building):
    b = make_building(manager)
    assert client.get(f"/api/buildings/{b.id}/rooms").status_code == 401


def test_manager_lists_rooms_of_own_building(client, manager, make_building, make_room, auth_headers):
    b = make_building(manager)
    r1, r2 = make_room(b, "101"), make_room(b, "102")
    other_building = make_building(manager)
    make_room(other_building, "201")
    res = client.get(f"/api/buildings/{b.id}/rooms", headers=auth_headers(manager))
    assert res.status_code == 200
    assert res.json() == [
        {"id": r1.id, "building_id": b.id, "room_name": "101"},
        {"id": r2.id, "building_id": b.id, "room_name": "102"},
    ]


def test_admin_can_list_rooms_of_any_building(client, admin, manager, make_building, make_room, auth_headers):
    b = make_building(manager)
    make_room(b, "101")
    res = client.get(f"/api/buildings/{b.id}/rooms", headers=auth_headers(admin))
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_manager_cannot_list_rooms_of_other_building(client, manager, make_user, make_building, make_room, auth_headers):
    theirs = make_building(make_user())
    make_room(theirs)
    assert client.get(f"/api/buildings/{theirs.id}/rooms", headers=auth_headers(manager)).status_code == 404


def test_list_rooms_unknown_building(client, admin, auth_headers):
    assert client.get("/api/buildings/999/rooms", headers=auth_headers(admin)).status_code == 404


def test_list_rooms_search_and_pagination(client, manager, make_building, make_room, auth_headers):
    b = make_building(manager)
    for name in ["Lab A", "Lab B", "Lab C", "Office"]:
        make_room(b, name)
    headers = auth_headers(manager)

    found = client.get(f"/api/buildings/{b.id}/rooms", params={"q": " lab "}, headers=headers)
    assert [r["room_name"] for r in found.json()] == ["Lab A", "Lab B", "Lab C"]

    page = client.get(f"/api/buildings/{b.id}/rooms", params={"skip": 1, "limit": 2}, headers=headers)
    assert [r["room_name"] for r in page.json()] == ["Lab B", "Lab C"]


@pytest.mark.parametrize("params", [{"skip": -1}, {"limit": 0}, {"limit": 501}])
def test_list_rooms_rejects_invalid_pagination(client, manager, make_building, auth_headers, params):
    b = make_building(manager)
    res = client.get(f"/api/buildings/{b.id}/rooms", params=params, headers=auth_headers(manager))
    assert res.status_code == 422


# ---------- get room ----------

def test_get_room(client, manager, make_building, make_room, auth_headers):
    room = make_room(make_building(manager), "101")
    res = client.get(f"/api/rooms/{room.id}", headers=auth_headers(manager))
    assert res.status_code == 200
    assert res.json()["room_name"] == "101"


def test_get_room_not_found(client, manager, auth_headers):
    res = client.get("/api/rooms/999", headers=auth_headers(manager))
    assert res.status_code == 404
    assert res.json()["detail"] == "Room not found"


def test_manager_cannot_get_room_in_other_building(client, manager, make_user, make_building, make_room, auth_headers):
    room = make_room(make_building(make_user()))
    assert client.get(f"/api/rooms/{room.id}", headers=auth_headers(manager)).status_code == 404


def test_admin_can_get_any_room(client, admin, manager, make_building, make_room, auth_headers):
    room = make_room(make_building(manager))
    assert client.get(f"/api/rooms/{room.id}", headers=auth_headers(admin)).status_code == 200


def test_get_room_requires_auth(client, manager, make_building, make_room):
    room = make_room(make_building(manager))
    assert client.get(f"/api/rooms/{room.id}").status_code == 401


# ---------- create ----------

def test_manager_creates_room(client, manager, make_building, auth_headers):
    b = make_building(manager)
    res = client.post(
        "/api/rooms",
        json={"building_id": b.id, "room_name": "  Lab 1  "},
        headers=auth_headers(manager),
    )
    assert res.status_code == 201
    body = res.json()
    assert body["room_name"] == "Lab 1"  # trimmed
    assert body["building_id"] == b.id
    assert client.get(f"/api/rooms/{body['id']}", headers=auth_headers(manager)).status_code == 200


def test_admin_cannot_create_room(client, admin, manager, make_building, auth_headers):
    b = make_building(manager)
    res = client.post(
        "/api/rooms", json={"building_id": b.id, "room_name": "X"}, headers=auth_headers(admin)
    )
    assert res.status_code == 403


def test_manager_cannot_create_room_in_other_building(client, manager, make_user, make_building, auth_headers):
    theirs = make_building(make_user())
    res = client.post(
        "/api/rooms",
        json={"building_id": theirs.id, "room_name": "X"},
        headers=auth_headers(manager),
    )
    assert res.status_code == 404


def test_create_room_unknown_building(client, manager, auth_headers):
    res = client.post(
        "/api/rooms", json={"building_id": 999, "room_name": "X"}, headers=auth_headers(manager)
    )
    assert res.status_code == 404


def test_create_room_requires_auth(client, manager, make_building):
    b = make_building(manager)
    assert client.post("/api/rooms", json={"building_id": b.id, "room_name": "X"}).status_code == 401


@pytest.mark.parametrize("room_name", ["", "x" * 101])
def test_create_room_validation_errors(client, manager, make_building, auth_headers, room_name):
    b = make_building(manager)
    res = client.post(
        "/api/rooms", json={"building_id": b.id, "room_name": room_name}, headers=auth_headers(manager)
    )
    assert res.status_code == 422


# ---------- update ----------

def test_manager_renames_room(client, manager, make_building, make_room, auth_headers):
    room = make_room(make_building(manager), "Old")
    res = client.put(
        f"/api/rooms/{room.id}", json={"room_name": "  New "}, headers=auth_headers(manager)
    )
    assert res.status_code == 200
    assert res.json()["room_name"] == "New"


def test_update_room_with_null_fields_changes_nothing(client, manager, make_building, make_room, auth_headers):
    b = make_building(manager)
    room = make_room(b, "Keep")
    res = client.put(
        f"/api/rooms/{room.id}",
        json={"building_id": None, "room_name": None},
        headers=auth_headers(manager),
    )
    assert res.status_code == 200
    assert res.json() == {"id": room.id, "building_id": b.id, "room_name": "Keep"}


def test_manager_moves_room_to_another_own_building(client, manager, make_building, make_room, auth_headers):
    b1, b2 = make_building(manager), make_building(manager)
    room = make_room(b1)
    res = client.put(f"/api/rooms/{room.id}", json={"building_id": b2.id}, headers=auth_headers(manager))
    assert res.status_code == 200
    assert res.json()["building_id"] == b2.id


def test_manager_cannot_move_room_to_other_managers_building(client, manager, make_user, make_building, make_room, auth_headers):
    mine = make_building(manager)
    theirs = make_building(make_user())
    room = make_room(mine)
    res = client.put(f"/api/rooms/{room.id}", json={"building_id": theirs.id}, headers=auth_headers(manager))
    assert res.status_code == 404
    # room stays where it was
    assert client.get(f"/api/rooms/{room.id}", headers=auth_headers(manager)).json()["building_id"] == mine.id


def test_update_room_not_found(client, manager, auth_headers):
    assert client.put("/api/rooms/999", json={"room_name": "X"}, headers=auth_headers(manager)).status_code == 404


def test_manager_cannot_update_room_of_other_manager(client, manager, make_user, make_building, make_room, auth_headers):
    room = make_room(make_building(make_user()), "Theirs")
    res = client.put(f"/api/rooms/{room.id}", json={"room_name": "Hacked"}, headers=auth_headers(manager))
    assert res.status_code == 404


def test_admin_cannot_update_room(client, admin, manager, make_building, make_room, auth_headers):
    room = make_room(make_building(manager))
    res = client.put(f"/api/rooms/{room.id}", json={"room_name": "X"}, headers=auth_headers(admin))
    assert res.status_code == 403


def test_update_room_validation_error(client, manager, make_building, make_room, auth_headers):
    room = make_room(make_building(manager))
    res = client.put(f"/api/rooms/{room.id}", json={"room_name": ""}, headers=auth_headers(manager))
    assert res.status_code == 422


# ---------- delete ----------

def test_manager_deletes_room(client, manager, make_building, make_room, auth_headers):
    room = make_room(make_building(manager))
    res = client.delete(f"/api/rooms/{room.id}", headers=auth_headers(manager))
    assert res.status_code == 204
    assert res.content == b""
    assert client.get(f"/api/rooms/{room.id}", headers=auth_headers(manager)).status_code == 404


def test_delete_room_not_found(client, manager, auth_headers):
    assert client.delete("/api/rooms/999", headers=auth_headers(manager)).status_code == 404


def test_manager_cannot_delete_room_of_other_manager(client, manager, make_user, make_building, make_room, auth_headers):
    other = make_user()
    room = make_room(make_building(other))
    assert client.delete(f"/api/rooms/{room.id}", headers=auth_headers(manager)).status_code == 404
    assert client.get(f"/api/rooms/{room.id}", headers=auth_headers(other)).status_code == 200


def test_admin_cannot_delete_room(client, admin, manager, make_building, make_room, auth_headers):
    room = make_room(make_building(manager))
    assert client.delete(f"/api/rooms/{room.id}", headers=auth_headers(admin)).status_code == 403
