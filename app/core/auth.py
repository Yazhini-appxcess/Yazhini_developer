"""Authentication utilities for super admin."""
from datetime import datetime, timedelta
from typing import Optional

import logging
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic_settings import BaseSettings
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)


class AuthSettings(BaseSettings):
    """Authentication settings from environment variables."""
    
    secret_key: str = "your-secret-key-change-in-production-use-env-var"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30 * 24 * 60  # 30 days
    
    class Config:
        env_file = ".env"
        extra = "ignore"


_auth_settings = AuthSettings()

# JWT settings
SECRET_KEY = _auth_settings.secret_key
ALGORITHM = _auth_settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = _auth_settings.access_token_expire_minutes

# HTTP Bearer token security
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    try:
        # Decode bytes if needed
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password."""
    # Encode password to bytes
    if isinstance(password, str):
        password = password.encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)
    # Return as string
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def verify_token(token: str, db: AsyncSession) -> User:
    """Verify a JWT token and return the user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        # logger.info(f"DEBUG AUTH: Verifying token for email: {email}") 
        if email is None:
            raise credentials_exception
    except JWTError as e:
        # logger.error(f"DEBUG AUTH: JWT Error: {e}") 
        raise credentials_exception
    
    # 1. Try to look up user in database FIRST
    result = await db.execute(
        select(User)
        .options(selectinload(User.permissions))
        .where(User.email == email)
    )
    user = result.scalar_one_or_none()
    
    if user:
        print(f"DEBUG AUTH: User found in DB: {user.email}") # DEBUG LOG
        return user

    # 2. Fallback: Check if it's the hardcoded superadmin or appxcess
    HARDCODED_SUPER_ADMIN_EMAIL = "superadmin@gmail.com"
    HARDCODED_APPXCESS_EMAIL = "superadmin@appxcess.com"
    
    # logger.info(f"DEBUG AUTH: Checking hardcoded: {email} against {HARDCODED_SUPER_ADMIN_EMAIL} and {HARDCODED_APPXCESS_EMAIL}") # DEBUG LOG

    if email == HARDCODED_SUPER_ADMIN_EMAIL:
        # Create a mock User object for hardcoded super admin
        hardcoded_admin = User(
            id=0,
            email=HARDCODED_SUPER_ADMIN_EMAIL,
            username="admin",
            slug="admin",
            first_name="Super",
            last_name="Admin",
            password="",  # Not used for hardcoded admin
            is_superuser=True,
            permissions=[],
        )
        return hardcoded_admin

    if email == HARDCODED_APPXCESS_EMAIL:
        # Create a mock User object for hardcoded appxcess
        # logger.info("DEBUG AUTH: MATCHED appxcess email") # DEBUG LOG
        hardcoded_appxcess = User(
            id=1, # Distinct ID from superadmin
            email=HARDCODED_APPXCESS_EMAIL,
            username="appxcess",
            slug="appxcess",
            first_name="AppXcess",
            last_name="Account",
            password="",
            is_superuser=True,
            permissions=[],
        )
        return hardcoded_appxcess
    
    # If neither found
    # logger.info("DEBUG AUTH: No user found, raising 401") # DEBUG LOG
    raise credentials_exception


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get the current authenticated user from JWT token."""
    return await verify_token(credentials.credentials, db)


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get the current authenticated admin (super admin or regular admin)."""
    # Both super admin and regular admin can access
    # Regular admin has user_type="admin" and is_superuser=False, super admin has is_superuser=True
    if not (current_user.is_superuser or current_user.user_type == "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get the current authenticated superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user

