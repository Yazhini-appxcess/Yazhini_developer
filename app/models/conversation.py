"""MongoDB models for conversations."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class Message(BaseModel):
    """Individual message in a conversation."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class Conversation(BaseModel):
    """Conversation model for MongoDB."""
    session_id: str  # Unique session ID (usually from website visitor)
    agent_type: str = "external"  # "internal" or "external"
    website_url: Optional[str] = None  # Website where bot was embedded
    user_ip: Optional[str] = None
    user_agent: Optional[str] = None
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "abc123",
                "website_url": "https://example.com",
                "messages": [
                    {
                        "role": "user",
                        "content": "Hello",
                        "timestamp": "2025-01-01T00:00:00"
                    },
                    {
                        "role": "assistant",
                        "content": "Hi! How can I help you?",
                        "timestamp": "2025-01-01T00:00:01"
                    }
                ]
            }
        }

























