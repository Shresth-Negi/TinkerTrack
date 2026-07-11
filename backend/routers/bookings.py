from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def check_conflict(db: Session, resource_id: int, start_time, end_time, exclude_booking_id=None):
    """
    Check if a booking overlaps with any existing active booking for the same resource.
    Two bookings overlap if: start1 < end2 AND end1 > start2
    """
    query = db.query(models.Booking).filter(
        models.Booking.resource_id == resource_id,
        models.Booking.status == models.BookingStatus.active,
        models.Booking.start_time < end_time,
        models.Booking.end_time > start_time,
    )
    if exclude_booking_id:
        query = query.filter(models.Booking.id != exclude_booking_id)

    return query.first()


def auto_expire(bookings):
    """Mark any active booking whose end_time has passed as expired."""
    now = datetime.now()
    for booking in bookings:
        if booking.status == models.BookingStatus.active and booking.end_time < now:
            booking.status = models.BookingStatus.expired
    return bookings


@router.post("/", response_model=schemas.BookingOut)
def create_booking(
    data: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Validate time range
    if data.start_time >= data.end_time:
        raise HTTPException(status_code=400, detail="Start time must be before end time")

    # Check resource exists and is available
    resource = db.query(models.Resource).filter(models.Resource.id == data.resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if not resource.is_available:
        raise HTTPException(status_code=400, detail="Resource is not available for booking")

    # Check for time conflicts
    conflict = check_conflict(db, data.resource_id, data.start_time, data.end_time)
    if conflict:
        raise HTTPException(
            status_code=409,
            detail=f"Time slot conflicts with an existing booking (ID: {conflict.id})"
        )

    booking = models.Booking(
        user_id=current_user.id,
        resource_id=data.resource_id,
        start_time=data.start_time,
        end_time=data.end_time,
        purpose=data.purpose
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/my", response_model=List[schemas.BookingOut])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    bookings = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).order_by(models.Booking.start_time.desc()).all()

    auto_expire(bookings)
    db.commit()

    return bookings


@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.user_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not allowed to cancel this booking")

    if booking.status == models.BookingStatus.expired:
        raise HTTPException(status_code=400, detail="Cannot cancel an expired booking")

    booking.status = models.BookingStatus.cancelled
    db.commit()
    return {"message": "Booking cancelled"}


@router.get("/all", response_model=List[schemas.BookingOut])
def all_bookings(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin)
):
    bookings = db.query(models.Booking).order_by(
        models.Booking.created_at.desc()
    ).all()

    auto_expire(bookings)
    db.commit()

    return bookings
