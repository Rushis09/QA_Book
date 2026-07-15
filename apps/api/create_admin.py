from app.auth.security import hash_password
from app.db.database import SessionLocal
from app.models.admin import Admin

db = SessionLocal()

username = "rushis09"
password = input("Enter admin password: ")

existing = (
    db.query(Admin)
    .filter(Admin.username == username)
    .first()
)

if existing:
    print("Admin already exists.")
else:
    admin = Admin(
        username=username,
        password_hash=hash_password(password),
        is_active=True,
    )

    db.add(admin)
    db.commit()

    print("Admin created successfully!")

db.close()