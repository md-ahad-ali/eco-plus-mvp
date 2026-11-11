from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from dotenv import load_dotenv

class Settings(BaseSettings):
    app_name: str = "Eco Pulse API"
    app_version: str = "1.0.0"
    host: str = "127.0.0.1"
    port: int = 8000
    debug: bool = True

    # JWT Authentication
    secret_key: str = "ecopulse-secret-key-change-in-production-only"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 1 day

    # Password reset
    password_reset_token_expire_minutes: int = 30
    frontend_url: str = "http://localhost:5173"

    # SMTP (leave smtp_host empty to log reset links to the console instead of emailing)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = "no-reply@ecopulse.local"
    smtp_use_tls: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@127.0.0.1:33061/ecopulse")
TARIFF = float(os.getenv("TARIFF_EUR_PER_KWH", "0.30"))
CO2_FACTOR = float(os.getenv("CO2_KG_PER_KWH", "0.40"))
BENCHMARK = float(os.getenv("BENCHMARK_KWH_PER_SQM_DAY", "0.06"))
SECRET_KEY = os.getenv("SECRET_KEY", "ecopulse-secret-key-change-in-production-only")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

OPENAI_API_KEY = "your-api-key"

MODEL = "gpt-6-luna"
MAX_TOKENS = 1500
DAILY_CAP = 20
TIMEOUT_S = 30
MAX_RETRIES = 3
MAX_TEXT_LEN = 2000

settings = Settings()