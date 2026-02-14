"""Admin router for super admin authentication and management."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import (
    create_access_token,
    get_current_admin,
    get_current_superuser,
    get_password_hash,
    security,
    verify_password,
)
from app.core.database import get_db
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["admin"])


class AdminCreateRequest(BaseModel):
    """Request model for creating a super admin."""

    email: EmailStr
    password: str
    first_name: str
    last_name: str


class AdminLoginRequest(BaseModel):
    """Request model for admin login."""

    email: EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    """Response model for admin login."""

    access_token: str
    token_type: str = "bearer"
    user: dict


class AdminResponse(BaseModel):
    """Response model for admin user."""

    id: int
    email: str
    first_name: str
    last_name: str
    is_superuser: bool

    class Config:
        from_attributes = True


async def ensure_superadmin_exists(db: AsyncSession) -> User:
    """Ensure the superadmin exists in the database."""
    HARDCODED_SUPER_ADMIN_EMAIL = "superadmin@gmail.com"
    HARDCODED_SUPER_ADMIN_PASSWORD = "Superadmin@123"
    
    result = await db.execute(select(User).where(User.email == HARDCODED_SUPER_ADMIN_EMAIL))
    user = result.scalar_one_or_none()
    
    if not user:
        # Create the super admin user
        hashed_password = get_password_hash(HARDCODED_SUPER_ADMIN_PASSWORD)
        user = User(
            email=HARDCODED_SUPER_ADMIN_EMAIL,
            password=hashed_password,
            first_name="Super",
            last_name="Admin",
            username="superadmin",
            slug="superadmin",
            is_superuser=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif not user.is_superuser:
        # Ensure is_superuser is set
        user.is_superuser = True
        await db.commit()
        await db.refresh(user)
        
    return user


@router.post("/login", response_model=AdminLoginResponse, status_code=status.HTTP_200_OK)
async def login(
    login_data: AdminLoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Login endpoint for both super admin and regular admin."""
    # Hardcoded super admin credentials (for emergency access)
    HARDCODED_SUPER_ADMIN_EMAIL = "superadmin@gmail.com"
    HARDCODED_SUPER_ADMIN_PASSWORD = "Superadmin@123"
    
    # Check hardcoded super admin credentials first
    if (
        login_data.email == HARDCODED_SUPER_ADMIN_EMAIL
        and login_data.password == HARDCODED_SUPER_ADMIN_PASSWORD
    ):
        # Auto-provision super admin in database
        user = await ensure_superadmin_exists(db)
            
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        
        return AdminLoginResponse(
            access_token=access_token,
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_superuser": user.is_superuser,
            },
        )
    
    # Find user by email in database
    result = await db.execute(select(User).where(User.email == login_data.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Verify password
    if not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Create access token
    access_token = create_access_token(data={"sub": user.email})

    return AdminLoginResponse(
        access_token=access_token,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_superuser": user.is_superuser,
        },
    )


@router.post("/create", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
async def create_admin(
    admin_data: AdminCreateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """Create a new regular admin. Requires super admin authentication."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == admin_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new regular admin user (not superuser)
    hashed_password = get_password_hash(admin_data.password)
    
    # Generate username and slug from email
    username = admin_data.email.split("@")[0]
    slug = username.lower().replace(".", "-").replace("_", "-")

    new_admin = User(
        email=admin_data.email,
        password=hashed_password,
        first_name=admin_data.first_name,
        last_name=admin_data.last_name,
        username=username,
        slug=slug,
        is_superuser=False,  # Regular admin, not super admin
    )

    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)

    return AdminResponse(
        id=new_admin.id,
        email=new_admin.email,
        first_name=new_admin.first_name,
        last_name=new_admin.last_name,
        is_superuser=new_admin.is_superuser,
    )


@router.get("/list", response_model=list[AdminResponse])
async def list_admins(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """List all admins (including super admins)."""
    result = await db.execute(select(User))
    admins = result.scalars().all()
    
    return [
        AdminResponse(
            id=admin.id,
            email=admin.email,
            first_name=admin.first_name,
            last_name=admin.last_name,
            is_superuser=admin.is_superuser,
        )
        for admin in admins
    ]


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(
    admin_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """Delete a regular admin. Requires super admin authentication."""
    result = await db.execute(select(User).where(User.id == admin_id, User.is_superuser == False))
    admin = result.scalar_one_or_none()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )
    
    await db.delete(admin)
    await db.commit()
    
    return


@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(
    current_user: User = Depends(get_current_admin),
):
    """Get current authenticated admin information (super admin or regular admin)."""
    return AdminResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        is_superuser=current_user.is_superuser,
    )

class AdminPasswordResetRequest(BaseModel):
    """Request model for resetting an admin's password."""
    password: str


@router.post("/{admin_id}/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    admin_id: int,
    reset_data: AdminPasswordResetRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """Reset an admin's password. Requires super admin authentication."""
    # Find the user
    result = await db.execute(select(User).where(User.id == admin_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )
    
    # Hash the new password
    hashed_password = get_password_hash(reset_data.password)
    user.password = hashed_password
    
    await db.commit()
    
    return {"message": "Password updated successfully"}
