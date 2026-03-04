import sys
import os

# Add server directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'server'))

from db.session import SessionLocal, init_db, engine
from models.database import User, Base
from core.security import get_password_hash
from sqlalchemy import text

def create_admin():
    # Initialize DB (creates tables if they don't exist)
    init_db()
    
    # Check if bookings table has user_id column
    # Use a separate connection/transaction for the check to avoid rollback issues
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT user_id FROM bookings LIMIT 1"))
    except Exception:
        print("Column user_id missing. Adding to bookings table...")
        try:
            with engine.connect() as connection:
                with connection.begin():
                    connection.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id VARCHAR(36)"))
                    connection.execute(text("CREATE INDEX IF NOT EXISTS ix_bookings_user_id ON bookings (user_id)"))
            print("Added user_id column to bookings.")
        except Exception as e:
            print(f"Error adding column: {e}")

    db = SessionLocal()
    
    email = "admin@uprev.id"
    password = "adminpassword123"
    
    # Check if admin already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"Admin user {email} already exists.")
        
        # Update to admin just in case
        if not existing_user.is_admin:
            existing_user.is_admin = True
            db.commit()
            print("Updated existing user to admin.")
        return

    admin_user = User(
        email=email,
        hashed_password=get_password_hash(password),
        is_admin=True
    )
    
    db.add(admin_user)
    db.commit()
    print(f"Admin user created: {email} / {password}")
    db.close()

if __name__ == "__main__":
    create_admin()
