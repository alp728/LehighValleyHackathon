from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    # FE_ROOT: str
    DATABASE_URL: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    REGION_NAME: str
    BUCKET_NAME: str

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
