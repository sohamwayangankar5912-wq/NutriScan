from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, time
from sqlalchemy import func
from typing import List, Dict, Any

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_daily_summary(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    today = datetime.utcnow().date()
    start_of_today = datetime.combine(today, time.min)
    end_of_today = datetime.combine(today, time.max)
    
    # Query meals from today
    meals_today = db.query(models.Meal).filter(
        models.Meal.user_id == current_user.id,
        models.Meal.created_at >= start_of_today,
        models.Meal.created_at <= end_of_today
    ).all()
    
    # Calculate totals
    calories_sum = sum(m.calories for m in meals_today)
    protein_sum = sum(m.protein for m in meals_today)
    carbs_sum = sum(m.carbs for m in meals_today)
    fat_sum = sum(m.fat for m in meals_today)
    
    # Fetch all user meals for listing in historical logs (limit 20)
    all_meals = db.query(models.Meal).filter(
        models.Meal.user_id == current_user.id
    ).order_by(models.Meal.created_at.desc()).limit(20).all()
    
    return schemas.DashboardSummary(
        calorie_goal=current_user.calorie_goal,
        calorie_consumed=calories_sum,
        protein_goal=current_user.protein_goal,
        protein_consumed=protein_sum,
        carb_goal=current_user.carb_goal,
        carb_consumed=carbs_sum,
        fat_goal=current_user.fat_goal,
        fat_consumed=fat_sum,
        meals_count=len(meals_today),
        meals=all_meals
    )

@router.get("/weekly")
def get_weekly_trends(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve the past 7 days of logs (including today)
    today = datetime.utcnow().date()
    weekly_data = []
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        start_of_day = datetime.combine(day, time.min)
        end_of_day = datetime.combine(day, time.max)
        
        day_meals = db.query(models.Meal).filter(
            models.Meal.user_id == current_user.id,
            models.Meal.created_at >= start_of_day,
            models.Meal.created_at <= end_of_day
        ).all()
        
        weekly_data.append({
            "day": day.strftime("%a"), # e.g. "Mon", "Tue"
            "date": day.strftime("%Y-%m-%d"),
            "calories": sum(m.calories for m in day_meals),
            "protein": sum(m.protein for m in day_meals),
            "carbs": sum(m.carbs for m in day_meals),
            "fat": sum(m.fat for m in day_meals),
        })
        
    return weekly_data
