from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import AIRecommendation, Building
from schemas import RecommendationRequest, RecommendationResponse
from services.ai_service import (
    AIService,
    AIServiceError,
    DailyLimitExceeded,
    NoDataError,
    generate_recommendation,
)

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


def get_ai_service() -> AIService:
    return AIService()


def _get_building(db: Session, building_id: int) -> Building:
    building = db.get(Building, building_id)
    if not building:
        raise HTTPException(404, "Building not found")
    return building


# 1) Generate a new AI recommendation for a building
@router.post(
    "/buildings/{building_id}",
    response_model=RecommendationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_recommendation(
    building_id: int,
    body: RecommendationRequest | None = None,
    db: Session = Depends(get_db),
    ai: AIService = Depends(get_ai_service),
):
    building = _get_building(db, building_id)
    body = body or RecommendationRequest()
    try:
        return generate_recommendation(db, building, ai, body.start, body.end)
    except NoDataError as exc:
        raise HTTPException(422, str(exc))
    except DailyLimitExceeded as exc:
        raise HTTPException(429, str(exc))
    except AIServiceError:
        raise HTTPException(
            503,
            detail={
                "message": "Recommendations are temporarily unavailable. Please try again.",
                "retry": True,
            },
        )


# 2) Browse recommendation history for a building
@router.get("/buildings/{building_id}", response_model=list[RecommendationResponse])
def list_recommendations(
    building_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    _get_building(db, building_id)
    stmt = (
        select(AIRecommendation)
        .where(AIRecommendation.building_id == building_id)
        .order_by(AIRecommendation.created_at.desc(), AIRecommendation.id.desc())
        .limit(limit)
        .offset(offset)
    )
    return db.execute(stmt).scalars().all()


# 3) Delete an outdated recommendation
@router.delete("/{recommendation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
):
    rec = db.get(AIRecommendation, recommendation_id)
    if not rec:
        raise HTTPException(404, "Recommendation not found")
    db.delete(rec)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)