from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file will be created automatically in your project folder
DATABASE_URL = "sqlite:///./tinkertrack.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite only
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# This function is used in every API route to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
