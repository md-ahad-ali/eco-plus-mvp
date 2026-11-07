from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

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


class TokenPayload(BaseModel):
    sub: str | None = None
    role: UserRole | None = None
