from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db  
from models.user import User
from models.notification import Notification  # ✅ import Notification model
from schemas.schemas import Token, usercreate, UserOut
from utils.hashing import hash_password, verify_password
from auth.jwt_handler import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(tags=["Authentication"])

# ✅ Register Route
@router.post("/register/token", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: usercreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = hash_password(user.password)
    db_user = User(
        full_name=user.full_name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        is_approved=False  # make sure intern is not approved by default
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # ✅ Send notification to admin after intern registration
    if user.role == "intern":
        admin = db.query(User).filter(User.role == "admin").first()
        if admin:
            notif = Notification(
                message=f"New intern {user.full_name.full_name} registered. Approve the account.",
                admin_id=admin.id
            )
            db.add(notif)
            db.commit()

    return db_user

# ✅ Login Route
@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print("LOGIN ATTEMPT:", form_data.username)

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        print("USER NOT FOUND")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.password_hash:
        print("NO PASSWORD HASH")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password hash is missing for this user."
        )

    if not verify_password(form_data.password, user.password_hash):
        print("WRONG PASSWORD")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    print("LOGIN SUCCESS")

    # Handle enum or string role
    role_value = user.role.value if hasattr(user.role, "value") else user.role

    # ✅ Check if intern is approved by admin
    if user.role == "intern" and not user.is_approved:
        raise HTTPException(status_code=403, detail="Admin has not approved your account yet.")

    access_token = create_access_token(
        data={"sub": user.email, "role": role_value},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}
