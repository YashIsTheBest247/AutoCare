import os
from functools import lru_cache
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BASE_DIR)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)

    app_name: str = "AutoCare AI"
    database_url: str = "sqlite:///./autocare.db"
    model_path: str = os.path.join(ROOT_DIR, "ml", "models", "failure_model.joblib")
    model_meta_path: str = os.path.join(ROOT_DIR, "ml", "models", "model_meta.json")
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    secret_key: str = "change-me-in-production-autocare-ai-secret"
    access_token_expire_minutes: int = 720
    default_admin_email: str = "admin@autocare.ai"
    default_admin_password: str = "admin123"

    smtp_host: str = Field(default="", validation_alias=AliasChoices("smtp_host", "mail_server"))
    smtp_port: int = Field(default=587, validation_alias=AliasChoices("smtp_port", "mail_port"))
    smtp_user: str = Field(default="", validation_alias=AliasChoices("smtp_user", "mail_username"))
    smtp_password: str = Field(default="", validation_alias=AliasChoices("smtp_password", "mail_password"))
    smtp_from: str = Field(default="alerts@autocare.ai", validation_alias=AliasChoices("smtp_from", "mail_from"))
    smtp_use_tls: bool = Field(default=True, validation_alias=AliasChoices("smtp_use_tls", "mail_starttls"))

    @property
    def cors_origins_list(self):
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_from)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
