import os
import time
from typing import List

from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core import create_access_token, get_current_active_user, get_db
from app.db import crud, models
from app.schemas.user import (
    ForgotPassword,
    FPAccept,
    ResetPassword,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserPatch,
    UserResponse,
    UserResponseCurrent,
)
from app.utils.auth import (
    authenticate_user,
)

router = APIRouter()

@router.get("", response_model=List)
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """
    List all users, allowed for superadmin
    """

    users = [
        UserResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            profile_picture=crud.generate_signed_url(db, current_user.profile_picture.split("/")[-1]) if current_user.profile_picture else "",
        ).dict()
        for user in crud.get_users(db, skip=skip, limit=limit)
    ]
    return users

@router.post("/register", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )
    return crud.create_user(db, user)


@router.post("/login", response_model=TokenResponse)
def login_user(login: UserLogin, db: Session = Depends(get_db)):
    """
    returns jwt token for the current user in the provided org
    """

    email, password = login.email, login.password
    user = crud.get_user_by_email(db, email=email)
 

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    authenticated_user = authenticate_user(db, email, password)

    if authenticated_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    else:
        access_token = create_access_token(
        data={"sub": authenticated_user.email,}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponseCurrent)
def read_user_me(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    setattr(
        current_user,
        "profile_picture",
        (
            crud.generate_signed_url(db, current_user.profile_picture.split("/")[-1])
            if current_user.profile_picture
            else None
        ),
    )
    return current_user


@router.post("/reset-password")
def reset_password(
    data: ResetPassword,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    user = crud.get_user_by_email(db, current_user.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if not crud.verify_password(data.old_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password"
        )
    updated_user = crud.update_user_password(db, user.id, data.new_password)
    return {"message": "Password updated successfully"}

@router.post("/picture/{user_id}")
async def change_profile_picture(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):

    user = crud.get_user_by_id(db, user_id)
    if (
        user.id == current_user.id
    ):
        try:
            file_name = crud.upload_profile_picture(db, file, user)
            return {
                "message": "Profile picture changed successfully",
                "file_name": file_name,
            }
        except Exception as e:
            return {"error": str(e)}
    raise HTTPException(status_code=403, detail="You do not have permission to do this")


@router.get("/picture/{user_id}")
async def get_signed_url(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    try:
        user = crud.get_user_by_id(db, current_user.id)
        if not user:
            return JSONResponse(status_code=401, content={"error": "Unauthorized"})

        requested_user = crud.get_user_by_id(db, user_id)
        if not requested_user:
            raise HTTPException(status_code=404, detail="User not found")

        if not requested_user.profile_picture:
            return {"url": None}

        file_name = requested_user.profile_picture.split("/")[-1]
        url = crud.generate_signed_url(db, file_name)
        return {"url": url}
    except ClientError as e:
        return JSONResponse(status_code=401, content={"error": "Unauthorized"})
    except HTTPException as e:
        raise e
    except Exception as e:
        return {"error": str(e)}


@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    user = crud.get_user_by_id(db, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "profile_picture": (
            crud.generate_signed_url(db, user.profile_picture.split("/")[-1])
            if user.profile_picture
            else None
        ),

    }

@router.patch("/{user_id}", response_model=UserResponse)
def patch_user(
    user_id: int,
    updated_user: UserPatch,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Partially modify requested user.

    Allowed for the user updating themself:
        first_name
        last_name
        email
        phonenumber
    """
    target_user = crud.get_user_by_id(db, user_id=user_id)

    if (current_user.id == user_id):
        allowed_fields = ["first_name", "last_name", "email"]

        updated_user_dict = updated_user.dict(exclude_unset=True)
        for field in updated_user_dict:
            if field not in allowed_fields:
                raise HTTPException(
                    status_code=403,
                    detail=f"You do not have permission to update the field '{field}'",
                )

        user = crud.patch_user(db, user_id, updated_user)
        setattr(user, "profile_picture", (crud.generate_signed_url(db, current_user.profile_picture.split("/")[-1]) if current_user.profile_picture else None))
        return user

    raise HTTPException(status_code=403, detail="You do not have permission to do this")


@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Deletes the requested user, must be superadmin or admin
    """
    target_user = crud.get_user_by_id(db, user_id=user_id)
    if (current_user.id == target_user.id):
        return crud.delete_user(db, user_id)
    raise HTTPException(status_code=403, detail="You do not have permission to do this")