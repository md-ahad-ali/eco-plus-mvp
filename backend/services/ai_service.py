import json
import logging
import re
import time
from datetime import datetime, timezone

from openai import APIConnectionError, APITimeoutError, OpenAI, RateLimitError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from models import AIRecommendation, Building, EnergyLog, Room
from services import analytics, anomaly

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# CONFIGURATION - paste your NEW OpenAI API key below
# WARNING: do not commit this file to GitHub with the real key in it.
# ---------------------------------------------------------------------------
OPENAI_API_KEY = "your-key"

MODEL = "gpt-6-luna"
MAX_TOKENS = 1500       # S4-NFR10: output token limit (higher because newer models may use tokens for reasoning)
DAILY_CAP = 20          # S4-NFR10: daily request cap
TIMEOUT_S = 30
MAX_RETRIES = 3         # S4-NFR01: retry with backoff
MAX_TEXT_LEN = 2000

SYSTEM_PROMPT = (
    "You are an energy-efficiency advisor for buildings. Using only the aggregated "
    "data provided, give 3-5 concrete, practical energy-saving recommendations. "
    "Respond ONLY with a JSON object with exactly two keys: "
    '"recommendation_text" (string, plain text, no HTML) and '
    '"estimated_savings_percent" (number between 0 and 100).'
)


class AIServiceError(Exception):
    """The AI provider failed or returned unusable output."""


class DailyLimitExceeded(Exception):
    """The daily cap on AI requests has been reached."""


class NoDataError(Exception):
    """No energy data exists for the requested building/period."""


class AIService:
    """Thin wrapper around the OpenAI API. Mock `call_openai_api` in tests (S4-NFR09)."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or OPENAI_API_KEY
        self._client: OpenAI | None = None

    def format_prompt(self, context: dict) -> list[dict]:
        user_msg = "Aggregated building data (JSON):\n" + json.dumps(context, default=str)
        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ]

    def call_openai_api(self, messages: list[dict]) -> str:
        if not self.api_key or self.api_key == "sk-your-key-here":
            raise AIServiceError("AI service is not configured")
        if self._client is None:
            self._client = OpenAI(api_key=self.api_key, timeout=TIMEOUT_S, max_retries=0)

        for attempt in range(MAX_RETRIES):
            try:
                resp = self._client.responses.create(
                    model=MODEL,
                    input=messages,
                    max_output_tokens=MAX_TOKENS,
                    text={"format": {"type": "json_object"}},
                    store=False,
                )
                return resp.output_text or ""
            except (RateLimitError, APITimeoutError, APIConnectionError) as exc:
                log.warning("OpenAI call failed (attempt %d/%d): %s", attempt + 1, MAX_RETRIES, exc)
                if attempt == MAX_RETRIES - 1:
                    raise AIServiceError("AI service is temporarily unavailable") from exc
                time.sleep(2 ** attempt)  # 1s, 2s
            except Exception as exc:  # auth errors, bad requests, etc. - do not retry
                log.error("OpenAI call failed: %s", exc)
                raise AIServiceError("AI service request failed") from exc
        raise AIServiceError("AI service is temporarily unavailable")

    @staticmethod
    def parse_response(raw: str) -> tuple[str, float]:
        """Validate and sanitise the model output (S4-NFR06)."""
        try:
            data = json.loads(raw)
            text = str(data["recommendation_text"])
            savings = float(data["estimated_savings_percent"])
        except (ValueError, KeyError, TypeError) as exc:
            raise AIServiceError("AI returned an invalid response") from exc

        text = re.sub(r"<[^>]*>", "", text)          # strip any HTML tags
        text = re.sub(r"[ \t]+", " ", text).strip()[:MAX_TEXT_LEN]
        if not text:
            raise AIServiceError("AI returned an empty recommendation")
        savings = round(min(max(savings, 0.0), 100.0), 1)
        return text, savings


def build_context(db: Session, building: Building, start, end) -> dict:
    """Aggregated data only - no usernames, emails or addresses (S4-NFR05)."""
    summary = analytics.summary(db, building.id, start, end)
    if summary["total_kwh"] <= 0:
        raise NoDataError("No energy data for this building and period")

    days = analytics.span_days(db, building.id, start, end)
    rooms = sorted(
        analytics.by_room(db, building.id, start, end),
        key=lambda r: r["total_kwh"],
        reverse=True,
    )[:10]

    rows_stmt = (
        select(EnergyLog.room_id, EnergyLog.timestamp, EnergyLog.energy_consumed_kwh)
        .join(Room, Room.id == EnergyLog.room_id)
        .where(Room.building_id == building.id)
    )
    rows = db.execute(analytics._range(rows_stmt, start, end)).all()
    try:
        flagged = anomaly.detect_anomalies(rows, 3.0)
        flagged = list(flagged)[:10]  # S4-FR03: abnormal periods as context
    except Exception:  # anomaly detection must never block a recommendation
        log.exception("Anomaly detection failed; continuing without it")
        flagged = []

    return {
        "area_sqm": building.area_sqm,
        "period_days": days,
        "total_kwh": summary["total_kwh"],
        "cost_eur": summary["cost_eur"],
        "carbon_kg_co2": summary["carbon_kg_co2"],
        "avg_indoor_temp_c": summary["avg_indoor_temp"],
        "kwh_per_sqm_per_day": round(summary["total_kwh"] / building.area_sqm / days, 3)
        if building.area_sqm and days
        else None,
        "top_rooms_by_kwh": [{"room": r["room_name"], "kwh": r["total_kwh"]} for r in rooms],
        "abnormal_periods": flagged,
    }


def _check_daily_cap(db: Session) -> None:
    midnight = datetime.now(timezone.utc).replace(tzinfo=None, hour=0, minute=0, second=0, microsecond=0)
    used = db.execute(
        select(func.count(AIRecommendation.id)).where(AIRecommendation.created_at >= midnight)
    ).scalar()
    if used >= DAILY_CAP:
        raise DailyLimitExceeded("Daily AI recommendation limit reached")


def generate_recommendation(
    db: Session, building: Building, ai: AIService, start=None, end=None
) -> AIRecommendation:
    _check_daily_cap(db)
    context = build_context(db, building, start, end)
    raw = ai.call_openai_api(ai.format_prompt(context))
    text, savings = ai.parse_response(raw)

    rec = AIRecommendation(
        building_id=building.id,
        recommendation_text=text,
        estimated_savings_percent=savings,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec