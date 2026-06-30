from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdateGoals(BaseModel):
    calorie_goal: int
    protein_goal: int
    carb_goal: int
    fat_goal: int

class UserResponse(UserBase):
    id: int
    calorie_goal: int
    protein_goal: int
    carb_goal: int
    fat_goal: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class MealBase(BaseModel):
    food_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    confidence: float

class MealCreate(MealBase):
    pass

class MealResponse(MealBase):
    id: int
    user_id: int
    image_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    calorie_goal: int
    calorie_consumed: float
    protein_goal: int
    protein_consumed: float
    carb_goal: int
    carb_consumed: float
    fat_goal: int
    fat_consumed: float
    meals_count: int
    meals: List[MealResponse]
