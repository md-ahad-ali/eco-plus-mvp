from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App
    app_name: str
    app_version: str
    host: str
    port: int
    debug: bool

    # Database
    database_url: str

    # JWT Authentication
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    # Password reset
    password_reset_token_expire_minutes: int
    frontend_url: str

    # SMTP
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    smtp_from: str
    smtp_use_tls: bool

    # Energy calculation
    tariff_eur_per_kwh: float
    co2_kg_per_kwh: float
    benchmark_kwh_per_sqm_day: float

    # OpenAI
    openai_api_key: str
    model: str
    max_tokens: int
    daily_cap: int
    timeout_s: int
    max_retries: int
    max_text_len: int

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()


DATABASE_URL = settings.database_url
TARIFF = settings.tariff_eur_per_kwh
CO2_FACTOR = settings.co2_kg_per_kwh
BENCHMARK = settings.benchmark_kwh_per_sqm_day
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

OPENAI_API_KEY = settings.openai_api_key
MODEL = settings.model
MAX_TOKENS = settings.max_tokens
DAILY_CAP = settings.daily_cap
TIMEOUT_S = settings.timeout_s
MAX_RETRIES = settings.max_retries
MAX_TEXT_LEN = settings.max_text_len