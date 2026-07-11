from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone
import enum

# --- Enums ---

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class BookingStatus(str, enum.Enum):
    active = "active"
    cancelled = "cancelled"
    expired = "expired"

class ResourceCategory(str, enum.Enum):
    room = "room"
    equipment = "equipment"
    lab = "lab"
    sports = "sports"
    other = "other"

# --- Models ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # One user can have many bookings
    bookings = relationship("Booking", back_populates="user")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    category = Column(Enum(ResourceCategory), default=ResourceCategory.other)
    location = Column(String)
    image_url = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # One resource can have many bookings
    bookings = relationship("Booking", back_populates="resource")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    purpose = Column(String)  # why are they booking it?
    status = Column(Enum(BookingStatus), default=BookingStatus.active)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Link back to user and resource
    user = relationship("User", back_populates="bookings")
    resource = relationship("Resource", back_populates="bookings")
