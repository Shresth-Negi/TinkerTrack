from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from models import UserRole, BookingStatus, ResourceCategory

# -------------------------
# USER SCHEMAS
# -------------------------

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True  # allows reading from SQLAlchemy models


# -------------------------
# RESOURCE SCHEMAS
# -------------------------

class ResourceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: ResourceCategory = ResourceCategory.other
    location: Optional[str] = None
    image_url: Optional[str] = None

class ResourceOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: ResourceCategory
    location: Optional[str]
    image_url: Optional[str]
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------
# BOOKING SCHEMAS
# -------------------------

class BookingCreate(BaseModel):
    resource_id: int
    start_time: datetime
    end_time: datetime
    purpose: Optional[str] = None

class BookingOut(BaseModel):
    id: int
    resource_id: int
    user_id: int
    start_time: datetime
    end_time: datetime
    purpose: Optional[str]
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------
# TOKEN SCHEMA (for login response)
# -------------------------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
