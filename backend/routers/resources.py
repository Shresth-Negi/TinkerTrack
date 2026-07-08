from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/resources", tags=["Resources"])

# Anyone can view resources
@router.get("/", response_model=List[schemas.ResourceOut])
def get_all_resources(db: Session = Depends(get_db)):
    return db.query(models.Resource).all()

@router.get("/{resource_id}", response_model=schemas.ResourceOut)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

# Only admins can create/delete resources
@router.post("/", response_model=schemas.ResourceOut)
def create_resource(
    data: schemas.ResourceCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin)
):
    resource = models.Resource(**data.model_dump())
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource

@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin)
):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(resource)
    db.commit()
    return {"message": "Resource deleted"}

@router.patch("/{resource_id}/toggle-availability")
def toggle_availability(
    resource_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin)
):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource.is_available = not resource.is_available
    db.commit()
    return {"message": f"Availability set to {resource.is_available}"}
