from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from models import UserRole


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, description="Unique username")
    email: EmailStr = Field(..., max_length=255, description="Unique email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserLogin(BaseModel):
    username: str = Field(..., min_length=1, description="Username or email")
    password: str = Field(..., min_length=1, description="Password")


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=6, description="New password (at least 6 characters)")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Email address of the account")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1, description="Reset token received by email")
    new_password: str = Field(..., min_length=6, description="New password (at least 6 characters)")


class MessageResponse(BaseModel):
    message: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class BuildingCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Building name")
    area_sqm: float = Field(..., gt=0, description="Floor area in square meters")
    user_id: int = Field(..., description="Id of the building manager who manages this building")


class BuildingUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    area_sqm: float | None = Field(default=None, gt=0)
    user_id: int | None = Field(default=None, description="Reassign to another building manager")


class BuildingResponse(BaseModel):
    id: int
    user_id: int
    manager_username: str
    name: str
    area_sqm: float

    model_config = ConfigDict(from_attributes=True)


class RoomCreate(BaseModel):
    building_id: int = Field(..., description="Building the room belongs to")
    room_name: str = Field(..., min_length=1, max_length=100)


class RoomUpdate(BaseModel):
    building_id: int | None = None
    room_name: str | None = Field(default=None, min_length=1, max_length=100)


class RoomResponse(BaseModel):
    id: int
    building_id: int
    room_name: str

    model_config = ConfigDict(from_attributes=True)


class ManagerOption(BaseModel):
    """Lightweight user info used by the building-manager picker on the building form."""

    id: int
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class TokenPayload(BaseModel):
    sub: str | None = None
    role: UserRole | None = None


class RecommendationRequest(BaseModel):
    start: datetime | None = Field(default=None, description="Start of analysed period (inclusive)")
    end: datetime | None = Field(default=None, description="End of analysed period (exclusive)")

    @model_validator(mode="after")
    def check_range(self):
        if self.start and self.end and self.end <= self.start:
            raise ValueError("end must be after start")
        return self


class RecommendationResponse(BaseModel):
    id: int
    building_id: int
    created_at: datetime
    recommendation_text: str
    estimated_savings_percent: float

    model_config = ConfigDict(from_attributes=True)


class CsvUploadResponse(BaseModel):
    id: int
    filename: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class CsvImportResult(BaseModel):
    upload_id: int
    filename: str
    status: str
    rows_total: int
    rows_inserted: int
    rows_deleted: int

class EnergyLogRow(BaseModel):
    id: int
    timestamp: datetime
    building_id: int
    building_name: str
    room_id: int
    room_name: str
    energy_consumed_kwh: float
    indoor_temp: float

    model_config = ConfigDict(from_attributes=True)


class EnergyLogPage(BaseModel):
    items: list[EnergyLogRow]
    total: int
    skip: int
    limit: int