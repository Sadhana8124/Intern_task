# File: backend/utils/hashing.py

from passlib.context import CryptContext

# Configure the password context with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password for storing."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against a provided password."""
    # Add error handling to prevent crashes
    try:
        if not plain_password or not hashed_password:
            print("WARNING: Empty password or hash provided")
            return False
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {str(e)}")
        return False