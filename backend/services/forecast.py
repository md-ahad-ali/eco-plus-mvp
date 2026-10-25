from collections import defaultdict
from datetime import timedelta
from statistics import mean


def forecast_next_24h(hourly) -> list[dict]:
    """hourly: list of (timestamp, kwh). Predicts each next hour from the average of the same hour of day."""
    if not hourly:
        return []
    by_hour = defaultdict(list)
    for ts, kwh in hourly:
        by_hour[ts.hour].append(float(kwh))
    last = max(ts for ts, _ in hourly)
    result = []
    for i in range(1, 25):
        t = last + timedelta(hours=i)
        values = by_hour.get(t.hour)
        result.append({"timestamp": t.isoformat(), "predicted_kwh": round(mean(values), 2) if values else 0.0})
    return result
