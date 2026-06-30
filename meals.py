import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import shutil

from ..database import get_db
from .. import models, schemas, auth, ai_vision

router = APIRouter(prefix="/api/meals", tags=["meals"])

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.get("", response_model=List[schemas.MealResponse])
def get_meals(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Meal).filter(
        models.Meal.user_id == current_user.id
    ).order_by(models.Meal.created_at.desc()).all()

@router.post("", response_model=schemas.MealResponse)
def create_manual_meal(
    meal_in: schemas.MealCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_meal = models.Meal(
        user_id=current_user.id,
        food_name=meal_in.food_name,
        calories=meal_in.calories,
        protein=meal_in.protein,
        carbs=meal_in.carbs,
        fat=meal_in.fat,
        confidence=1.0,
        image_path=None
    )
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal

@router.post("/scan", response_model=schemas.MealResponse)
async def scan_meal_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Read image contents
    try:
        contents = await file.read()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read uploaded file"
        )
    
    # Save the file locally
    file_ext = os.path.splitext(file.filename)[1]
    if not file_ext:
        file_ext = ".jpg"  # default
        
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
        
    # Run Gemini Vision analysis
    mime_type = file.content_type or "image/jpeg"
    nutrition_estimate = ai_vision.analyze_food_image(contents, mime_type=mime_type)
    
    # Create the database record
    db_meal = models.Meal(
        user_id=current_user.id,
        food_name=nutrition_estimate.get("food_name", "Scanned Food"),
        calories=float(nutrition_estimate.get("calories", 0)),
        protein=float(nutrition_estimate.get("protein", 0)),
        carbs=float(nutrition_estimate.get("carbs", 0)),
        fat=float(nutrition_estimate.get("fat", 0)),
        confidence=float(nutrition_estimate.get("confidence", 0.8)),
        image_path=f"/static/{unique_filename}"
    )
    
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal

@router.delete("/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal(
    meal_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    meal = db.query(models.Meal).filter(
        models.Meal.id == meal_id,
        models.Meal.user_id == current_user.id
    ).first()
    
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal log not found"
        )
        
    # Optionally delete the file if it exists
    if meal.image_path:
        filename = os.path.basename(meal.image_path)
        local_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass # Don't block delete if file removal fails
                
    db.delete(meal)
    db.commit()
    return
