from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, Base
from .routes import auth, meals, analytics

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NutriScan AI API",
    description="Backend API for food recognition, calorie logging, and macro tracking",
    version="1.0.0"
)

# CORS configuration
# Allowing all origins for development; can be narrowed in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it does not exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Mount the static directory to serve meal upload images
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(meals.router)
app.include_router(analytics.router)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "NutriScan AI API"}
