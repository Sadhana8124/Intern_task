from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from pydantic import BaseModel

from database import get_db
from models.user import User, RoleEnum

# OAuth2 scheme to extract token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

class TokenData(BaseModel):
    email: str
    role: str

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        # Decode the token WITHOUT verifying signature
        payload = jwt.decode(token, key="", options={"verify_signature": False, "verify_exp": False})

        print("Decoded payload:", payload)  # ✅ print the entire token payload
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except Exception as e:
        print("Error decoding token:", e)  # ✅ print any error that occurs
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"No user found with email: {email}")  # ✅ log if user not found
        raise credentials_exception

    print(f"Found user: {user.email} with role: {user.role}")  # ✅ log user details
    return user

def get_current_admin(user: User = Depends(get_current_user)) -> User:
    print("Checking admin access for user:", user.email, "with role:", user.role)
    role_value = user.role.value if hasattr(user.role, "value") else user.role
    print("Role value used for check:", role_value)
    if role_value != "admin":
        print("Unauthorized access attempt!")  # ✅ print if role check fails
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Admins only"
        )
    return user


def get_current_intern(current_user: User = Depends(get_current_user)) -> User:
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value != RoleEnum.intern.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Interns only"
        )
    return current_user
