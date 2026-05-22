from app.core.database import Base


# Register the models for Migration
from app.models.user import User  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.form_submission import FormSubmission  # noqa: F401
from app.models.ai_config import AIConfig  # noqa: F401
from app.models.permission import Permission, user_permissions  # noqa: F401
from app.models.activity_log import ActivityLog  # noqa: F401
from app.models.settings import OrganizationSettings  # noqa: F401
from app.models.integration import IntegrationService  # noqa: F401
from app.models.website import WebsiteConfig  # noqa: F401
from app.models.zoho_config import ZohoConfig  # noqa: F401
