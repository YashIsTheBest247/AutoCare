from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User


def get(db: Session, user_id: int) -> Optional[User]:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    return db.scalars(stmt).first()


def create(db: Session, email: str, hashed_password: str, full_name: str = None, role: str = "operator") -> User:
    user = User(email=email, hashed_password=hashed_password, full_name=full_name, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def count(db: Session) -> int:
    return db.query(User).count()
