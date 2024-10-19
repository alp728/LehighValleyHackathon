import os
import secrets
import time
from datetime import date, datetime, timedelta
from typing import Dict, List

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile
from passlib.context import CryptContext
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.config.settings import Settings
from app.db import models
from app.db.models import UserRequest
from app.schemas.user import UserCreate

settings = Settings()

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.REGION_NAME,
)

# CRUD Operations for User  
def create_user(db: Session, user_create: UserCreate):
    try:
        # Hash the password
        password = get_password_hash(user_create.password)

        # Create a new user instance with the hashed password
        db_user = models.User(
            first_name=user_create.first_name,
            last_name=user_create.last_name,
            email=user_create.email,
            password=password,
        )
        user = db_user

        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return user
    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")


def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def update_user(db: Session, user_id: int, updated_user: models.User):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()

    if db_user:
        db.commit()
        for key, value in updated_user.dict().items():
            setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
        return db_user
    else:
        raise HTTPException(status_code=404, detail="User not found")


def patch_user(db: Session, user_id: int, updated_user: models.User):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    print(db_user)

    if db_user:
        updated_user_dict = updated_user.dict(exclude_unset=True)

        for key, value in updated_user_dict.items():
            setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
        return db_user
    else:
        raise HTTPException(status_code=404, detail="User not found")


def delete_file_from_bucket(bucket_name, file_name):
    try:

        s3_client.delete_object(Bucket=bucket_name, Key=file_name)
        print(f"File '{file_name}' deleted successfully from bucket '{bucket_name}'")
    except Exception as e:
        print(
            f"Error deleting file '{file_name}' from bucket '{bucket_name}': {str(e)}"
        )


def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:

        if db_user.profile_picture:
            bucket_name = settings.BUCKET_NAME
            file_name = db_user.profile_picture.split("/")[-1]
            delete_file_from_bucket(bucket_name, file_name)

        db.delete(db_user)
        db.commit()
        return db_user
    else:
        raise HTTPException(status_code=404, detail="User not found")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def update_user_password(db: Session, user_id: int, new_password: str):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed_password = get_password_hash(new_password)
    db_user.password = hashed_password
    db.commit()
    db.refresh(db_user)
    return db_user

def upload_profile_picture(db: Session, file: UploadFile, current_user: models.User):
    try:
        file_name = f"profile_picture_{current_user.id}_{int(time.time())}{os.path.splitext(file.filename)[1]}"
        s3_client.upload_fileobj(file.file, settings.BUCKET_NAME, file_name)

        current_user.profile_picture = (
            f"https://{settings.BUCKET_NAME}.s3.amazonaws.com/{file_name}"
        )
        db.commit()
        db.refresh(current_user)
        print(get_user_by_id(db, current_user.id).profile_picture)
        return file_name
    except Exception as e:
        db.rollback()
        raise e

def generate_signed_url(db: Session, file_name: str):
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.BUCKET_NAME, "Key": file_name},
            ExpiresIn=3600,
        )
        return url
    except ClientError as e:
        raise e
    except Exception as e:
        raise e

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
