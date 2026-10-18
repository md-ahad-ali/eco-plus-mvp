from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from dotenv import load_dotenv

class Settings(BaseSettings):
    app_name: str = "Eco Pulse API"
    app_version: str = "1.0.0"
    host: str = "127.0.0.1"
    port: int = 8000
    debug: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost:33061/ecopulse")
TARIFF = float(os.getenv("TARIFF_EUR_PER_KWH", "0.30"))
CO2_FACTOR = float(os.getenv("CO2_KG_PER_KWH", "0.40"))
BENCHMARK = float(os.getenv("BENCHMARK_KWH_PER_SQM_DAY", "0.06"))

settings = Settings()