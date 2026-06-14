from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import UserCreate, LoginRequest, Token, UserRead
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if crud.user.get_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.user.create(
        db, payload.email, auth_service.hash_password(payload.password), payload.full_name
    )
    token = auth_service.create_access_token(user.email)
    return {"access_token": token, "user": user}


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = crud.user.get_by_email(db, payload.email)
    if not user or not auth_service.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth_service.create_access_token(user.email)
    return {"access_token": token, "user": user}


@router.get("/me", response_model=UserRead)
def me(current=Depends(auth_service.get_current_user)):
    return current
