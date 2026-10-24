from collections import defaultdict
from statistics import mean, pstdev


def detect_anomalies(rows, z_threshold: float = 3.0) -> list[dict]:
    """rows: iterable of (room_id, timestamp, kwh). Flags values far above the room's own average."""
    by_room = defaultdict(list)
    for room_id, ts, kwh in rows:
        by_room[room_id].append((ts, float(kwh)))
    found = []
    for room_id, items in by_room.items():
        values = [v for _, v in items]
        avg, std = mean(values), pstdev(values)
        if std == 0:
            continue
        for ts, v in items:
            z = (v - avg) / std
            if z >= z_threshold:
                found.append({"room_id": room_id, "timestamp": ts.isoformat(), "kwh": round(v, 3), "z_score": round(z, 1)})
    return sorted(found, key=lambda a: -a["z_score"])
