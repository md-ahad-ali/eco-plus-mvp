from config import BENCHMARK


def sustainability_score(total_kwh: float, area_sqm: float, days: float, benchmark: float = BENCHMARK) -> float:
    """100 = very efficient (half the benchmark), 50 = on the benchmark, 0 = 1.5x the benchmark or worse."""
    if area_sqm <= 0 or days <= 0:
        return 0.0
    ratio = (total_kwh / area_sqm / days) / benchmark
    return round(max(0.0, min(100.0, (1.5 - ratio) * 100)), 1)


def grade(score: float) -> str:
    return "A" if score >= 80 else "B" if score >= 60 else "C" if score >= 40 else "D"
