import pandas as pd
from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from models import Building, CsvUpload, EnergyLog, Room, User

REQUIRED = ["username", "building_name", "room_name", "timestamp",
            "energy_consumed_kwh", "indoor_temp"]
KEYS = ["username", "building_name", "room_name"]

MAX_KWH = 1000.0
TEMP_MIN, TEMP_MAX = -30.0, 60.0


def _clean(df: pd.DataFrame) -> pd.DataFrame:
    """Delete rows with missing or out-of-range values."""
    for col in KEYS:
        df[col] = df[col].str.strip()
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce", utc=True).dt.tz_localize(None)
    df["energy_consumed_kwh"] = pd.to_numeric(df["energy_consumed_kwh"], errors="coerce")
    df["indoor_temp"] = pd.to_numeric(df["indoor_temp"], errors="coerce")
    ok = (
        df.notna().all(axis=1)
        & df["energy_consumed_kwh"].between(0, MAX_KWH)
        & df["indoor_temp"].between(TEMP_MIN, TEMP_MAX)
    )
    return df[ok]


def _link_rooms(db: Session, df: pd.DataFrame) -> pd.DataFrame:
    """Add room_id. Rows without a matching user, building and room are deleted."""
    rows = db.execute(
        select(User.username, Building.name, Room.room_name, Room.id)
        .join(Building, Building.user_id == User.id)
        .join(Room, Room.building_id == Building.id)
        .where(User.username.in_(df["username"].unique().tolist()))
    ).all()
    lookup = pd.DataFrame(rows, columns=KEYS + ["room_id"])
    return df.merge(lookup, on=KEYS, how="inner")


def _drop_duplicates(db: Session, df: pd.DataFrame) -> pd.DataFrame:
    """Delete repeats inside the file (keep the first) and rows already in the database."""
    df = df.drop_duplicates(["room_id", "timestamp"], keep="first")
    if df.empty:
        return df
    existing = set(db.execute(
        select(EnergyLog.room_id, EnergyLog.timestamp).where(
            EnergyLog.room_id.in_(df["room_id"].unique().tolist()),
            EnergyLog.timestamp.between(df["timestamp"].min().to_pydatetime(),
                                        df["timestamp"].max().to_pydatetime()),
        )
    ).tuples().all())
    keys = zip(df["room_id"].tolist(), df["timestamp"].dt.to_pydatetime())
    return df[[k not in existing for k in keys]]


def _load(db: Session, fileobj) -> dict:
    try:
        df = pd.read_csv(fileobj, dtype=str)
    except (pd.errors.ParserError, pd.errors.EmptyDataError, UnicodeDecodeError):
        raise ValueError("The file is not a valid CSV")
    df.columns = df.columns.str.strip().str.lower()
    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {', '.join(missing)}")

    total = len(df)
    df = _clean(df[REQUIRED].copy())
    if not df.empty:
        df = _link_rooms(db, df)
    if not df.empty:
        df = _drop_duplicates(db, df)

    records = [
        {"room_id": int(r), "timestamp": t.to_pydatetime(),
         "energy_consumed_kwh": float(k), "indoor_temp": float(c)}
        for r, t, k, c in zip(df["room_id"], df["timestamp"],
                              df["energy_consumed_kwh"], df["indoor_temp"])
    ]
    if records:
        db.execute(insert(EnergyLog), records)
    return {"rows_total": total, "rows_inserted": len(records),
            "rows_deleted": total - len(records)}


def import_csv(db: Session, filename: str, fileobj) -> dict:
    upload = CsvUpload(filename=filename, status="processing")
    db.add(upload)
    db.commit()
    try:
        result = _load(db, fileobj)
        upload.status = "completed"
        db.commit()  # logs and status save together
    except Exception:
        db.rollback()  # no partial import stays in the database
        upload.status = "failed"
        db.commit()
        raise
    return {"upload_id": upload.id, "filename": filename, "status": upload.status, **result}
