# TinkerTrack — Shared Resource Management System

A platform for discovering, reserving, and managing shared resources in an organized manner. Built for hostels, student clubs, labs, makerspaces, or any shared environment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Database | SQLite, SQLAlchemy |
| Auth | JWT tokens, bcrypt |
| Frontend | React, React Router |
| Styling | Inline styles (no CSS framework) |

---

## Features

- User registration and login with JWT authentication
- Browse and filter resources by category
- Book resources with conflict detection (no overlapping bookings)
- View and cancel your own bookings
- Admin panel to add, delete, and toggle resource availability
- Analytics dashboard with booking stats and charts (admin only)

---

## Project Structure

```
tinkertrack/
├── backend/
│   ├── main.py           # FastAPI app entry point
│   ├── database.py       # SQLite connection
│   ├── models.py         # User, Resource, Booking tables
│   ├── schemas.py        # Request/response validation
│   ├── auth.py           # JWT + password hashing
│   ├── requirements.txt
│   └── routers/
│       ├── users.py      # Register, login, profile
│       ├── resources.py  # Resource CRUD
│       └── bookings.py   # Booking management
└── frontend/
    └── src/
        ├── App.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Resources.jsx
        │   ├── MyBookings.jsx
        │   ├── Admin.jsx
        │   └── Analytics.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   └── BookingModal.jsx
        └── utils/
            ├── api.js
            └── AuthContext.jsx
```

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

---

## Making a User Admin

```bash
cd backend
python
```

```python
from database import SessionLocal
from models import User, UserRole

db = SessionLocal()
user = db.query(User).filter(User.email == "your@email.com").first()
user.role = UserRole.admin
db.commit()
print("Done!")
exit()
```

---

## API Endpoints

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /users/register | No | Create account |
| POST | /users/login | No | Login, get token |
| GET | /users/me | Yes | Get own profile |

### Resources
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /resources/ | No | List all resources |
| GET | /resources/{id} | No | Get one resource |
| POST | /resources/ | Admin | Add resource |
| DELETE | /resources/{id} | Admin | Delete resource |
| PATCH | /resources/{id}/toggle-availability | Admin | Toggle availability |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /bookings/ | Yes | Create booking |
| GET | /bookings/my | Yes | My bookings |
| DELETE | /bookings/{id} | Yes | Cancel booking |
| GET | /bookings/all | Admin | All bookings |

---

## Design Decisions

- **SQLite** chosen for simplicity — can be swapped to PostgreSQL by changing DATABASE_URL
- **Soft deletes for bookings** — cancelled bookings keep their record for history
- **Hard deletes for resources** — admin-managed content, safe to remove
- **JWT stored in localStorage** — simple for a demo, httpOnly cookies recommended for production
- **Conflict detection** uses overlap formula: `start1 < end2 AND end1 > start2`
- **Role-based access** — user vs admin enforced at API level, not just frontend

---

## Assumptions

- One user cannot book the same resource twice at the same time
- Admins are assigned manually via script (no self-registration as admin)
- No email verification required for registration
- All times stored in UTC
