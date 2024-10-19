from pydantic import BaseModel, EmailStr, conint, constr, validator
from typing import List, Optional

class TokenResponse(BaseModel):
    is_superuser: bool
    access_token: str
    token_type: str


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr


class ResetPassword(BaseModel):
    old_password: str
    new_password: str


class ForgotPassword(BaseModel):
    email: EmailStr


class FPAccept(ForgotPassword):
    code: int
    password: str
    confirm_password: str


class UserCreate(UserBase):
    password: str

class UserPatch(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[EmailStr]

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    profile_picture: Optional[str] = ""

    class Config:
        orm_mode = True

class UserResponseCurrent(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    profile_picture: Optional[str]

    class Config:
        orm_mode = True


class UserLogin(BaseModel):
    email: str
    password: str
