from database import SessionLocal
from models import User, UserRole

db = SessionLocal()
user = db.query(User).filter(User.email == "your@email.com").first()

if user:
    user.role = UserRole.admin
    db.commit()
    print(f"Done! {user.name} is now admin.")
else:
    print("User not found. Check your email.")

db.close()