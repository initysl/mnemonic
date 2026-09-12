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
    cors_origins: str = Field(default="http://localhost:3000,https://mnemonik.vercel.app", alias="CORS_ORIGINS")
    cors_allow_methods: List[str] = Field(default=["GET", "POST", "PUT", "DELETE", "OPTIONS"], alias="CORS_ALLOW_METHODS")
    cors_allow_headers: str = Field(
        default="Authorization, Content-Type, Accept",
        alias="CORS_ALLOW_HEADERS",
    )
    cors_allow_credentials: bool = Field(default=True, alias="CORS_ALLOW_CREDENTIALS")
    docs_enabled: Optional[bool] = Field(default=None, alias="DOCS_ENABLED")
    rate_limit_per_minute: int = Field(default=60, ge=1, alias="RATE_LIMIT_PER_MINUTE")
    # Reverse proxies in front of the app whose X-Forwarded-For entries can be
    # trusted. 1 suits a single platform load balancer; set 0 when the app is
    # exposed directly, so forged headers are ignored entirely.
    trusted_proxy_hops: int = Field(default=1, ge=0, alias="TRUSTED_PROXY_HOPS")
    web_concurrency: int = Field(default=1, ge=1, alias="WEB_CONCURRENCY")
    # Sync route handlers run in Starlette's threadpool (40 threads by
    # default), and each one can hold a pooled connection. Sizing the pool
    # below that width means requests queue on checkout and time out under
    # load. Keep pool_size + max_overflow >= the threadpool width, while
    # staying within the database server's max_connections across all workers.
    db_pool_size: int = Field(default=10, ge=1, alias="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=30, ge=0, alias="DB_MAX_OVERFLOW")
    db_pool_timeout: int = Field(default=10, ge=1, alias="DB_POOL_TIMEOUT")
    max_audio_bytes: int = Field(default=10 * 1024 * 1024, ge=1, alias="MAX_AUDIO_BYTES")

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
        if isinstance(self.cors_allow_methods, list):
            return self.cors_allow_methods
        return self._split_csv(self.cors_allow_methods)

    @property
    def cors_headers_list(self) -> List[str]:
        return self._split_csv(self.cors_allow_headers)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
