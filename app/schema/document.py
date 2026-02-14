from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class DocumentUploaderInfo(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: int
    name: str
    file_path: str
    file_size: int
    mime_type: str
    agent_type: str
    processed: bool
    uploaded_by: Optional[int] = None
    uploader: Optional[DocumentUploaderInfo] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentChunkResponse(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    text: str
    created_at: datetime

    class Config:
        from_attributes = True


class QueryRequest(BaseModel):
    query: str
    agent_type: str
    max_results: int = 5
    threshold: float = 0.3


class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]
    model_used: str


class ScrapeUrlRequest(BaseModel):
    url: str
    agent_type: str

