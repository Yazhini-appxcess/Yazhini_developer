"""Admin router for super admin authentication and management."""
from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import selectinload
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
from app.core.logging_utils import log_activity
from app.models.user import User
from app.models.permission import Permission
from app.models.activity_log import ActivityLog

router = APIRouter(prefix="/api/admin", tags=["admin"])


class AdminCreateRequest(BaseModel):
    """Request model for creating a regular admin."""

    email: EmailStr
    password: str
    first_name: str
    last_name: str
    user_type: str = "admin"
    permission_names: list[str] = []


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
    user_type: str
    created_at: datetime
    last_login: Optional[datetime] = None
    permissions: list[str] = []

    class Config:
        from_attributes = True


class ActivityLogResponse(BaseModel):
    """Response model for activity log."""

    id: int
    user_email: str | None
    action: str
    details: dict | None
    timestamp: datetime

    class Config:
        from_attributes = True


class PermissionResponse(BaseModel):
    """Response model for a permission."""

    id: int
    name: str
    display_name: str
    description: str | None

    class Config:
        from_attributes = True


class UpdateUserPermissionsRequest(BaseModel):
    """Request model for updating a user's permissions."""

    permission_names: list[str]


async def ensure_superadmin_exists(db: AsyncSession) -> User:
    """Ensure the superadmin exists in the database."""
    HARDCODED_SUPER_ADMIN_EMAIL = "superadmin@gmail.com"
    HARDCODED_SUPER_ADMIN_PASSWORD = "superadmin@123"
    
    result = await db.execute(
        select(User)
        .options(selectinload(User.permissions))
        .where(User.email == HARDCODED_SUPER_ADMIN_EMAIL)
    )
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
        # Give super admin all permissions
        result = await db.execute(select(Permission))
        all_perms = result.scalars().all()
        user.permissions = list(all_perms)
        
        await db.commit()
    else:
        # Ensure is_superuser is set and update password to the correct one if needed
        should_commit = False
        if not user.is_superuser:
            user.is_superuser = True
            should_commit = True
        if not verify_password(HARDCODED_SUPER_ADMIN_PASSWORD, user.password):
            user.password = get_password_hash(HARDCODED_SUPER_ADMIN_PASSWORD)
            should_commit = True
        if should_commit:
            await db.commit()
    
    # Re-query user with permissions explicitly loaded after any potential commit
    result = await db.execute(
        select(User)
        .options(selectinload(User.permissions))
        .where(User.email == HARDCODED_SUPER_ADMIN_EMAIL)
    )
    user = result.scalar_one()

    # Always ensure super admin has all permissions
    result = await db.execute(select(Permission))
    all_perms = result.scalars().all()
    
    # Simple check to see if permissions match
    if len(user.permissions) != len(all_perms):
        user.permissions = list(all_perms)
        await db.commit()
        # Re-fetch again if we changed permissions
        result = await db.execute(
            select(User)
            .options(selectinload(User.permissions))
            .where(User.id == user.id)
        )
        user = result.scalar_one()
        
    # Log activity - use user.id directly as it's the only one we have
    # ensure_superadmin_exists is called without a current_user sometimes
    await log_activity(
        db,
        action="SYSTEM_INIT",
        user_id=user.id,
        details={"message": "Super admin verified/updated", "email": user.email}
    )
    
    # Final re-fetch or refresh to be absolutely sure
    result = await db.execute(
        select(User).options(selectinload(User.permissions)).where(User.id == user.id)
    )
    user = result.scalar_one()

    return user


@router.post("/login", response_model=AdminLoginResponse, status_code=status.HTTP_200_OK)
async def login(
    login_data: AdminLoginRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Login endpoint for both super admin and regular admin."""
    # Hardcoded super admin credentials (for emergency access)
    HARDCODED_SUPER_ADMIN_EMAIL = "superadmin@gmail.com"
    HARDCODED_SUPER_ADMIN_PASSWORD = "superadmin@123"
    
    # Check hardcoded super admin credentials first
    if (
        login_data.email == HARDCODED_SUPER_ADMIN_EMAIL
        and (login_data.password == HARDCODED_SUPER_ADMIN_PASSWORD or login_data.password == "Superadmin@123")
    ):
        # Auto-provision super admin in database
        user = await ensure_superadmin_exists(db)
        
        # Update last login time
        user.last_login = datetime.now()
        await db.commit()
            
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
                "user_type": getattr(user, "user_type", "admin"),
                "created_at": user.created_at,
                "last_login": user.last_login,
                "permissions": [p.name for p in user.permissions],
            },
        )
    
    # Find user by email in database
    result = await db.execute(
        select(User)
        .options(selectinload(User.permissions))
        .where(User.email == login_data.email)
    )
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

    # Update last login time
    user.last_login = datetime.now()
    await db.commit()

    # Create access token
    access_token = create_access_token(data={"sub": user.email})

    # Capture user info before logging (which might commit/expire/has just committed)
    user_id = user.id
    user_email = user.email

    # Log the login activity
    await log_activity(
        db, 
        action="LOGIN", 
        user_id=user_id, 
        details={"email": user_email}
    )
    
    # Re-query with selectinload to ensure permissions are loaded for the response
    result = await db.execute(
        select(User).options(selectinload(User.permissions)).where(User.id == user_id)
    )
    user = result.scalar_one()

    return AdminLoginResponse(
        access_token=access_token,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_superuser": user.is_superuser,
            "user_type": getattr(user, "user_type", "admin"),
            "created_at": user.created_at,
            "last_login": user.last_login,
            "permissions": [p.name for p in user.permissions],
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
        user_type=admin_data.user_type
    )

    db.add(new_admin)
    
    # Handle initial permissions
    if admin_data.permission_names:
        result = await db.execute(
            select(Permission).where(Permission.name.in_(admin_data.permission_names))
        )
        initial_perms = result.scalars().all()
        new_admin.permissions = list(initial_perms)
    
    # Capture admin_performing_id before commit
    admin_performing_id = current_user.id

    await db.commit()
    
    # Re-fetch with selectinload for response
    result = await db.execute(
        select(User).options(selectinload(User.permissions)).where(User.email == admin_data.email)
    )
    new_admin = result.scalar_one()
    
    # Capture info for logging
    new_admin_id = new_admin.id
    new_admin_email = new_admin.email

    # Log activity
    await log_activity(
        db,
        action="CREATE_ADMIN",
        user_id=admin_performing_id,
        details={"created_admin_id": new_admin_id, "created_email": new_admin_email}
    )
    
    # Re-fetch again after log_activity
    result = await db.execute(
        select(User).options(selectinload(User.permissions)).where(User.id == new_admin_id)
    )
    new_admin = result.scalar_one()

    return AdminResponse(
        id=new_admin.id,
        email=new_admin.email,
        first_name=new_admin.first_name,
        last_name=new_admin.last_name,
        is_superuser=new_admin.is_superuser,
        user_type=new_admin.user_type,
        created_at=new_admin.created_at,
        last_login=new_admin.last_login,
        permissions=[p.name for p in new_admin.permissions],
    )


@router.get("/list", response_model=list[AdminResponse])
async def list_admins(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """List all admins (including super admins)."""
    result = await db.execute(select(User).options(selectinload(User.permissions)))
    admins = result.scalars().all()
    
    return [
        AdminResponse(
            id=admin.id,
            email=admin.email,
            first_name=admin.first_name,
            last_name=admin.last_name,
            is_superuser=admin.is_superuser,
            user_type=getattr(admin, "user_type", "admin"),
            created_at=admin.created_at,
            last_login=admin.last_login,
            permissions=[p.name for p in admin.permissions],
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
    
    # Capture info
    admin_performing_id = current_user.id
    deleted_email = admin.email
    
    await db.delete(admin)
    await db.commit()

    # Log activity
    await log_activity(
        db,
        action="DELETE_ADMIN",
        user_id=admin_performing_id,
        details={"deleted_admin_id": admin_id, "deleted_email": deleted_email}
    )
    
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
        user_type=getattr(current_user, "user_type", "admin"),
        created_at=current_user.created_at,
        last_login=current_user.last_login,
        permissions=[p.name for p in current_user.permissions],
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
    
    # Capture info
    admin_performing_id = current_user.id
    target_email = user.email
    
    # Hash the new password
    hashed_password = get_password_hash(reset_data.password)
    user.password = hashed_password
    
    await db.commit()

    # Log activity
    await log_activity(
        db,
        action="RESET_PASSWORD",
        user_id=admin_performing_id,
        details={"target_admin_id": admin_id, "target_email": target_email}
    )
    
    return {"message": "Password updated successfully"}


@router.get("/permissions", response_model=list[PermissionResponse])
async def list_permissions(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """List all available permissions. Requires super admin authentication."""
    result = await db.execute(select(Permission))
    permissions = result.scalars().all()
    return permissions


@router.post("/{admin_id}/permissions", response_model=AdminResponse)
async def update_admin_permissions(
    admin_id: int,
    perm_data: UpdateUserPermissionsRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """Update an admin's permissions. Requires super admin authentication."""
    # Find the user
    result = await db.execute(
        select(User)
        .options(selectinload(User.permissions))
        .where(User.id == admin_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )
    
    if user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super admin permissions cannot be modified",
        )
    
    # Find the permissions
    result = await db.execute(
        select(Permission).where(Permission.name.in_(perm_data.permission_names))
    )
    new_permissions = result.scalars().all()
    
    # Capture info before commit
    admin_performing_id = current_user.id
    target_email = user.email

    # Update user permissions
    user.permissions = list(new_permissions)
    await db.commit()
    
    # Log activity
    await log_activity(
        db,
        action="UPDATE_PERMISSIONS",
        user_id=admin_performing_id,
        details={
            "target_admin_id": admin_id,
            "target_email": target_email,
            "permissions": perm_data.permission_names
        }
    )

    # Re-fetch with selectinload to ensure permissions are loaded for the response
    result = await db.execute(
        select(User).options(selectinload(User.permissions)).where(User.id == admin_id)
    )
    user = result.scalar_one()
    
    return AdminResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_superuser=user.is_superuser,
        user_type=user.user_type,
        created_at=user.created_at,
        last_login=user.last_login,
        permissions=[p.name for p in user.permissions],
    )


@router.get("/activity-logs", response_model=list[ActivityLogResponse])
async def list_activity_logs(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """List all activity logs. Requires super admin authentication."""
    result = await db.execute(
        select(ActivityLog)
        .options(selectinload(ActivityLog.user))
        .order_by(ActivityLog.timestamp.desc())
        .limit(100)
    )
    logs = result.scalars().all()

    return [
        ActivityLogResponse(
            id=log.id,
            user_email=log.user.email if log.user else "System/Deleted",
            action=log.action,
            details=log.details,
            timestamp=log.timestamp,
        )
        for log in logs
    ]
