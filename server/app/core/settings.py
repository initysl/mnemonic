from functools import lru_cache
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = Field(default="development", alias="ENVIRONMENT")
    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    cors_allow_methods: str = Field(default="*", alias="CORS_ALLOW_METHODS")
    cors_allow_headers: str = Field(default="*", alias="CORS_ALLOW_HEADERS")
    cors_allow_credentials: bool = Field(default=True, alias="CORS_ALLOW_CREDENTIALS")
    docs_enabled: Optional[bool] = Field(default=None, alias="DOCS_ENABLED")

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def resolved_docs_enabled(self) -> bool:
        if self.docs_enabled is None:
            return not self.is_production
        return self.docs_enabled

    def _split_csv(self, value: str) -> List[str]:
        if value.strip() == "*":
            return ["*"]
        return [item.strip() for item in value.split(",") if item.strip()]

    @property
    def cors_origins_list(self) -> List[str]:
        return self._split_csv(self.cors_origins)

    @property
    def cors_methods_list(self) -> List[str]:
        return self._split_csv(self.cors_allow_methods)

    @property
    def cors_headers_list(self) -> List[str]:
        return self._split_csv(self.cors_allow_headers)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
