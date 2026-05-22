from datetime import datetime
from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.activity_log import ActivityLog

async def log_activity(
    db: AsyncSession,
    action: str,
    user_id: Optional[int] = None,
    details: Optional[dict[str, Any]] = None,
) -> None:
    """
    Record an admin activity log.
    
    Args:
        db: Async database session
        action: The action performed (e.g., "LOGIN", "CREATE_ADMIN")
        user_id: The ID of the user performing the action (optional for login/failing actions)
        details: Additional details about the action
    """
    try:
        activity = ActivityLog(
            user_id=user_id,
            action=action,
            details=details,
            timestamp=datetime.utcnow()
        )
        db.add(activity)
        await db.commit()
    except Exception as e:
        # We don't want activity logging to break the main flow
        # In a real production app, you might use a background task or a queue
        print(f"Failed to log activity: {e}")
