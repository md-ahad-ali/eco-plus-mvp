import fixtures_users  # noqa: F401  (must come first: sets test env vars and sys.path)

from datetime import datetime, timedelta

import pytest
from sqlalchemy import select

from models import PasswordResetToken, User, UserRole
from routers import auth as auth_router
from services.security import generate_reset_token, verify_password

from fixtures_users import (  # noqa: F401  (fixtures are used by name)
    PASSWORD,
    admin,
    auth_headers,
    client,
    db,
    make_user,
    manager,
)


# ---------- register ----------

def test_register_creates_building_manager_and_returns_token(client, db):
    res = client.post(
        "/api/auth/register",
        json={"username": "alice", "email": "Alice@Example.com", "password": "secret123"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["username"] == "alice"
    assert body["user"]["email"] == "alice@example.com"  # normalised
    assert body["user"]["role"] == "building_manager"
    assert "password" not in body["user"] and "password_hash" not in body["user"]

    user = db.execute(select(User).where(User.username == "alice")).scalar_one()
    assert user.password_hash != "secret123"


def test_register_ignores_requested_role(client):
    res = client.post(
        "/api/auth/register",
        json={"username": "mallory", "email": "m@example.com", "password": "secret123", "role": "admin"},
    )
    assert res.status_code == 201
    assert res.json()["user"]["role"] == "building_manager"


def test_register_duplicate_username(client, manager):
    res = client.post(
        "/api/auth/register",
        json={"username": manager.username, "email": "other@example.com", "password": "secret123"},
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "Username already registered"


def test_register_duplicate_email(client, manager):
    res = client.post(
        "/api/auth/register",
        json={"username": "someone", "email": manager.email, "password": "secret123"},
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "Email already registered"


@pytest.mark.parametrize(
    "payload",
    [
        {"username": "ab", "email": "a@example.com", "password": "secret123"},  # username too short
        {"username": "alice", "email": "not-an-email", "password": "secret123"},
        {"username": "alice", "email": "a@example.com", "password": "123"},  # password too short
        {"email": "a@example.com", "password": "secret123"},  # missing username
    ],
)
def test_register_validation_errors(client, payload):
    assert client.post("/api/auth/register", json=payload).status_code == 422


# ---------- login ----------

def test_login_with_username(client, manager):
    res = client.post("/api/auth/login", json={"username": manager.username, "password": PASSWORD})
    assert res.status_code == 200
    assert res.json()["access_token"]
    assert res.json()["user"]["id"] == manager.id


def test_login_with_email(client, manager):
    res = client.post("/api/auth/login", json={"username": manager.email, "password": PASSWORD})
    assert res.status_code == 200
    assert res.json()["user"]["username"] == manager.username


def test_login_with_email_is_case_insensitive_and_trimmed(client, manager):
    res = client.post(
        "/api/auth/login", json={"username": f"  {manager.email.upper()}  ", "password": PASSWORD}
    )
    assert res.status_code == 200


def test_login_wrong_password(client, manager):
    res = client.post("/api/auth/login", json={"username": manager.username, "password": "wrong"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid username/email or password"


def test_login_unknown_user(client):
    res = client.post("/api/auth/login", json={"username": "ghost", "password": PASSWORD})
    assert res.status_code == 401


# ---------- /me and token handling ----------

def test_me_returns_current_user(client, manager, auth_headers):
    res = client.get("/api/auth/me", headers=auth_headers(manager))
    assert res.status_code == 200
    assert res.json() == {
        "id": manager.id,
        "username": manager.username,
        "email": manager.email,
        "role": "building_manager",
    }


def test_me_requires_token(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_rejects_invalid_token(client):
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer garbage"})
    assert res.status_code == 401
    assert res.headers["www-authenticate"] == "Bearer"


def test_me_rejects_token_of_deleted_user(client, db, manager, auth_headers):
    headers = auth_headers(manager)
    db.delete(manager)
    db.commit()
    assert client.get("/api/auth/me", headers=headers).status_code == 401


def test_me_rejects_token_without_subject(client):
    from services.security import create_access_token

    token = create_access_token({"role": "admin"})
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401


# ---------- change password ----------

def test_change_password_success(client, db, manager, auth_headers):
    res = client.put(
        "/api/auth/change-password",
        json={"current_password": PASSWORD, "new_password": "newsecret456"},
        headers=auth_headers(manager),
    )
    assert res.status_code == 200
    assert res.json()["message"] == "Password changed successfully"

    db.refresh(manager)
    assert verify_password("newsecret456", manager.password_hash)
    assert not verify_password(PASSWORD, manager.password_hash)

    # The new password works for login, the old one does not.
    assert client.post(
        "/api/auth/login", json={"username": manager.username, "password": "newsecret456"}
    ).status_code == 200
    assert client.post(
        "/api/auth/login", json={"username": manager.username, "password": PASSWORD}
    ).status_code == 401


def test_change_password_wrong_current_password(client, manager, auth_headers):
    res = client.put(
        "/api/auth/change-password",
        json={"current_password": "wrong", "new_password": "newsecret456"},
        headers=auth_headers(manager),
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "Current password is incorrect"


def test_change_password_same_as_current(client, manager, auth_headers):
    res = client.put(
        "/api/auth/change-password",
        json={"current_password": PASSWORD, "new_password": PASSWORD},
        headers=auth_headers(manager),
    )
    assert res.status_code == 400


def test_change_password_requires_auth(client):
    res = client.put(
        "/api/auth/change-password",
        json={"current_password": PASSWORD, "new_password": "newsecret456"},
    )
    assert res.status_code == 401


# ---------- forgot / reset password ----------

@pytest.fixture()
def sent_emails(monkeypatch):
    sent = []
    monkeypatch.setattr(
        auth_router,
        "send_password_reset_email",
        lambda to, username, link: sent.append((to, username, link)),
    )
    return sent


def test_forgot_password_sends_email_and_stores_hashed_token(client, db, manager, sent_emails):
    res = client.post("/api/auth/forgot-password", json={"email": manager.email})
    assert res.status_code == 200

    assert len(sent_emails) == 1
    to, username, link = sent_emails[0]
    assert (to, username) == (manager.email, manager.username)
    raw_token = link.split("token=")[1]

    stored = db.execute(select(PasswordResetToken)).scalar_one()
    assert stored.user_id == manager.id
    assert stored.token_hash != raw_token  # only the hash is stored
    assert stored.used_at is None
    assert stored.expires_at > datetime.utcnow()


def test_forgot_password_unknown_email_gives_same_response(client, db, manager, sent_emails):
    known = client.post("/api/auth/forgot-password", json={"email": manager.email})
    unknown = client.post("/api/auth/forgot-password", json={"email": "nobody@example.com"})
    assert unknown.status_code == 200
    assert unknown.json() == known.json()  # no account enumeration
    assert len(sent_emails) == 1  # only the known address got an email


def test_forgot_password_invalidates_previous_tokens(client, db, manager, sent_emails):
    client.post("/api/auth/forgot-password", json={"email": manager.email})
    client.post("/api/auth/forgot-password", json={"email": manager.email})

    tokens = db.execute(select(PasswordResetToken).order_by(PasswordResetToken.id)).scalars().all()
    assert len(tokens) == 2
    assert tokens[0].used_at is not None
    assert tokens[1].used_at is None


def _add_reset_token(db, user, expires_in=timedelta(minutes=30), used_at=None):
    raw, hashed = generate_reset_token()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hashed,
            expires_at=datetime.utcnow() + expires_in,
            used_at=used_at,
        )
    )
    db.commit()
    return raw


def test_reset_password_success(client, db, manager):
    raw = _add_reset_token(db, manager)
    res = client.post("/api/auth/reset-password", json={"token": raw, "new_password": "brandnew1"})
    assert res.status_code == 200

    db.refresh(manager)
    assert verify_password("brandnew1", manager.password_hash)
    assert db.execute(select(PasswordResetToken)).scalar_one().used_at is not None


def test_reset_password_token_is_single_use(client, db, manager):
    raw = _add_reset_token(db, manager)
    payload = {"token": raw, "new_password": "brandnew1"}
    assert client.post("/api/auth/reset-password", json=payload).status_code == 200
    res = client.post("/api/auth/reset-password", json={**payload, "new_password": "another123"})
    assert res.status_code == 400
    assert res.json()["detail"] == "Invalid or expired reset token"


def test_reset_password_expired_token(client, db, manager):
    raw = _add_reset_token(db, manager, expires_in=timedelta(minutes=-1))
    res = client.post("/api/auth/reset-password", json={"token": raw, "new_password": "brandnew1"})
    assert res.status_code == 400
    db.refresh(manager)
    assert verify_password(PASSWORD, manager.password_hash)  # unchanged


def test_reset_password_unknown_token(client):
    res = client.post("/api/auth/reset-password", json={"token": "nope", "new_password": "brandnew1"})
    assert res.status_code == 400


# ---------- role-based access control ----------

def test_require_roles_allows_matching_role(manager):
    checker = auth_router.require_roles(UserRole.BUILDING_MANAGER)
    assert checker(current_user=manager) is manager


def test_require_roles_rejects_other_roles(admin):
    from fastapi import HTTPException

    checker = auth_router.require_roles(UserRole.BUILDING_MANAGER)
    with pytest.raises(HTTPException) as exc:
        checker(current_user=admin)
    assert exc.value.status_code == 403
