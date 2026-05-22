"""Pydantic schemas for conversation API."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class MessageSchema(BaseModel):
    """Message schema for API."""
    role: str
    content: str
    timestamp: datetime


class ConversationSchema(BaseModel):
    """Conversation schema for API."""
    id: str
    session_id: str
    agent_type: Optional[str] = "external"
    website_url: Optional[str] = None
    user_ip: Optional[str] = None
    user_agent: Optional[str] = None
    messages: List[MessageSchema]
    created_at: datetime
    updated_at: datetime
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None


class BotChatRequest(BaseModel):
    """Request schema for bot chat endpoint."""
    message: str
    session_id: str
    website_url: Optional[str] = None
    user_ip: Optional[str] = None
    user_agent: Optional[str] = None
    agent_type: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None


class BotChatResponse(BaseModel):
    """Response schema for bot chat endpoint."""
    response: str
    session_id: str


class ConversationListResponse(BaseModel):
    """Response schema for listing conversations."""
    conversations: List[ConversationSchema]
    total: int


class SuggestionsResponse(BaseModel):
    """Response schema for suggested questions."""
    suggestions: List[str]
