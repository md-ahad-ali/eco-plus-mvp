from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from models import UserRole


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, description="Unique username")
    email: EmailStr = Field(..., max_length=255, description="Unique email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    role: UserRole = Field(default=UserRole.OCCUPANT, description="Role of the user")

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
    building_name: str | None = None
    room_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class BuildingCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Building name")
    address: str | None = Field(default=None, max_length=255, description="Building address")
    area_sqm: float = Field(..., gt=0, description="Floor area in square meters")
    user_id: int | None = Field(
        default=None,
        description="Owner (building manager) id. Admin only; defaults to the current user",
    )


class BuildingUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    address: str | None = Field(default=None, max_length=255)
    area_sqm: float | None = Field(default=None, gt=0)
    user_id: int | None = Field(default=None, description="Reassign owner (admin only)")


class BuildingResponse(BaseModel):
    id: int
    user_id: int
    name: str
    address: str | None = None
    area_sqm: float

    model_config = ConfigDict(from_attributes=True)


class RoomCreate(BaseModel):
    building_id: int = Field(..., description="Building the room belongs to")
    room_name: str = Field(..., min_length=1, max_length=100)
    occupant_id: int | None = Field(default=None, description="User living in the room")


class RoomUpdate(BaseModel):
    building_id: int | None = None
    room_name: str | None = Field(default=None, min_length=1, max_length=100)
    occupant_id: int | None = Field(default=None, description="Set to null to clear occupant")


class RoomResponse(BaseModel):
    id: int
    building_id: int
    occupant_id: int | None
    room_name: str

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