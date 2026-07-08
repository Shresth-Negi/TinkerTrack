from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # noqa: F401 - required to register models with SQLAlchemy Base

# Import routers
from routers import users, resources, bookings

# Create all tables in the database (runs on startup)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TinkerTrack API",
    description="Shared Resource Management System",
    version="1.0.0"
)

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(users.router)
app.include_router(resources.router)
app.include_router(bookings.router)

@app.get("/")
def root():
    return {"message": "TinkerTrack API is running!"}
