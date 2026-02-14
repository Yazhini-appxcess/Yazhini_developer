from sqlalchemy.orm import DeclarativeBase


# Modern approach (SQLAlchemy 2.0+)
class Base(DeclarativeBase):
    pass


# Register the models for Migration
from . import user  # noqa: E402, F401
from . import document  # noqa: E402, F401
from . import form_submission  # noqa: E402, F401
from . import ai_config  # noqa: E402, F401
