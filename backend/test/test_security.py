import fixtures_users  # noqa: F401  (must come first: sets test env vars and sys.path)

from datetime import timedelta

import jwt

from config import settings
from services.security import (
    create_access_token,
    decode_access_token,
    generate_reset_token,
    hash_password,
    hash_reset_token,
    verify_password,
)


def test_hash_password_is_salted_and_verifiable():
    h1 = hash_password("secret123")
    h2 = hash_password("secret123")
    assert h1 != h2  # random salt
    assert "secret123" not in h1
    assert verify_password("secret123", h1)
    assert verify_password("secret123", h2)


def test_verify_password_rejects_wrong_password():
    assert not verify_password("wrong", hash_password("secret123"))


def test_verify_password_rejects_malformed_hash():
    assert not verify_password("secret123", "not-a-valid-hash")
    assert not verify_password("secret123", "")


def test_access_token_roundtrip():
    token = create_access_token({"sub": "alice", "role": "admin"})
    payload = decode_access_token(token)
    assert payload["sub"] == "alice"
    assert payload["role"] == "admin"
    assert "exp" in payload


def test_expired_access_token_is_rejected():
    token = create_access_token({"sub": "alice"}, expires_delta=timedelta(seconds=-1))
    assert decode_access_token(token) is None


def test_tampered_or_garbage_token_is_rejected():
    assert decode_access_token("garbage") is None
    forged = jwt.encode({"sub": "alice"}, "another-secret", algorithm=settings.algorithm)
    assert decode_access_token(forged) is None


def test_reset_token_hash_matches_raw_token():
    raw, hashed = generate_reset_token()
    assert raw != hashed
    assert hash_reset_token(raw) == hashed
    assert len(hashed) == 64


def test_reset_tokens_are_unique():
    assert generate_reset_token()[0] != generate_reset_token()[0]
