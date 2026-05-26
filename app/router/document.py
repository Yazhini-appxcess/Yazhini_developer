import logging
import os
import shutil
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pathlib import Path

from app.core.database import get_db
from app.core.auth import get_current_admin
from app.models.document import Document, DocumentChunk
from app.models.user import User
from app.models.permission import Permission
from app.core.logging_utils import log_activity
from app.schema.document import DocumentResponse, QueryRequest, QueryResponse, ScrapeUrlRequest
from app.services.document_processor import DocumentProcessor
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore
from app.services.llm_service import LLMService
from app.services.web_scraper import WebScraper

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["documents"])

# Initialize services (singleton)
_embedding_service = None
_llm_service = None
_document_processor = None

# Upload directory
UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_embedding_service() -> EmbeddingService:
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service


def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


def get_document_processor() -> DocumentProcessor:
    global _document_processor
    if _document_processor is None:
        _document_processor = DocumentProcessor()
    return _document_processor


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: Annotated[UploadFile, File()],
    db: Annotated[AsyncSession, Depends(get_db)],
    agent_type: Annotated[str, Form()],
    force: bool = False,
    current_user: User = Depends(get_current_admin)
):
    """Upload and process a document for AI training"""
    # Check permission
    permission_names = [p.name for p in current_user.permissions]
    if not current_user.is_superuser and "document_uploading" not in permission_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to upload documents"
        )

    try:
        # Save file temporarily to extract text/check sensitive data
        file_path = UPLOAD_DIR / file.filename
        # Ensure we don't overwrite blindly without checking, but for now we follow simple flow
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Extract text immediately to check for sensitive data
        try:
            with open(file_path, "rb") as f:
                file_bytes = f.read()
            
            processor = get_document_processor()
            # We need mime_type early
            mime_type = file.content_type or "application/octet-stream"
            text_content = processor.extract_text(file_bytes, mime_type, file.filename)
            
            if not text_content:
                # If we can't extract text, we might warn or just proceed (binary file?)
                # But typically we want text.
                pass 
            else:
                # 2. Check for sensitive data if not forced
                if not force:
                    warnings = processor.detect_sensitive_data(text_content)
                    if warnings:
                        # Clean up file
                        os.remove(file_path)
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail={
                                "message": "Sensitive information detected in document.",
                                "code": "SENSITIVE_DATA_DETECTED",
                                "warnings": warnings
                            }
                        )
        except HTTPException:
            raise
        except Exception as e:
            # If extraction fails here, we might fail hard or let the main process logic handle it.
            # But since we are pre-processing for safety, let's log and continue to main flow if it wasn't a safety block
            logger.warning(f"Pre-processing text extraction failed: {e}")
            pass

        # Create document record
        uploaded_by_id = current_user.id
        document = Document(
            name=file.filename,
            file_path=str(file_path),
            file_size=file_path.stat().st_size,
            mime_type=file.content_type or "application/octet-stream",
            agent_type=agent_type,
            processed=False,
            uploaded_by=uploaded_by_id
        )
        db.add(document)
        await db.flush()
        document_id = document.id

        # Process document in background (for now, we'll do it synchronously)
        # In production, use Celery task
        try:
            # Reuse text_content if we already extracted it successfully
            if 'text_content' in locals() and text_content:
                pass
            else:
                # Read file bytes again if needed
                with open(file_path, "rb") as f:
                    file_bytes = f.read()
                text_content = processor.extract_text(file_bytes, document.mime_type, document.name)

            if not text_content:
                document.error_message = "Failed to extract text from document"
                await db.commit()
                # We already created the doc, so maybe we shouldn't raise 400 here if we want to keep record relative to 201
                # But original code raised 400. Let's keep consistent.
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not extract text from document"
                )

            document.text_content = text_content

            # Chunk text
            chunks_data = processor.chunk_text(text_content)

            # Generate embeddings
            embedding_service = get_embedding_service()
            chunk_texts = [chunk["text"] for chunk in chunks_data]
            embeddings = embedding_service.generate_embeddings_batch(chunk_texts)

            # Store chunks with embeddings
            vector_store = VectorStore()
            for i, (chunk_data, embedding) in enumerate(zip(chunks_data, embeddings)):
                await vector_store.store_chunk(
                    db=db,
                    document_id=document.id,
                    chunk_index=chunk_data["index"],
                    text=chunk_data["text"],
                    embedding=embedding,
                    agent_type=document.agent_type,
                    metadata={
                        "start_char": chunk_data["start_char"],
                        "end_char": chunk_data["end_char"]
                    }
                )

            document.processed = True
            document_name = document.name  # Capture before commit
            await db.commit()

            logger.info(f"Successfully processed document: {document_name} ({len(chunks_data)} chunks)")

            # Log activity
            await log_activity(
                db,
                action="UPLOAD_DOCUMENT",
                user_id=uploaded_by_id,
                details={"filename": document_name, "agent_type": agent_type}
            )

        except Exception as e:
            logger.error(f"Error processing document: {e}")
            document.error_message = str(e)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing document: {str(e)}"
            )

        # Reload document and uploader after commit to avoid session issues
        # Use document_id and uploaded_by_id captured before any commit
        doc_result = await db.execute(select(Document).where(Document.id == document_id))
        document = doc_result.scalar_one()
        
        uploader = None
        if uploaded_by_id:
            user_result = await db.execute(select(User).where(User.id == uploaded_by_id))
            uploader = user_result.scalar_one_or_none()
        
        response_data = {
            "id": document.id,
            "name": document.name,
            "file_path": document.file_path,
            "file_size": document.file_size,
            "mime_type": document.mime_type,
            "agent_type": document.agent_type,
            "processed": document.processed,
            "text_content": document.text_content,
            "uploaded_by": document.uploaded_by,
            "created_at": document.created_at,
            "updated_at": document.updated_at,
        }
        
        if uploader:
            response_data["uploader"] = {
                "id": uploader.id,
                "email": uploader.email,
                "first_name": uploader.first_name,
                "last_name": uploader.last_name,
            }
        
        return DocumentResponse(**response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading document: {str(e)}"
        )


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_admin)
):
    """List all uploaded documents"""
    result = await db.execute(
        select(Document, User)
        .outerjoin(User, Document.uploaded_by == User.id)
        .order_by(Document.created_at.desc())
    )
    rows = result.all()
    
    documents = []
    for row in rows:
        doc, user = row
        doc_dict = {
            "id": doc.id,
            "name": doc.name,
            "file_path": doc.file_path,
            "file_size": doc.file_size,
            "mime_type": doc.mime_type,
            "agent_type": doc.agent_type,
            "processed": doc.processed,
            "text_content": doc.text_content,
            "uploaded_by": doc.uploaded_by,
            "created_at": doc.created_at,
            "updated_at": doc.updated_at,
        }
        if user:
            doc_dict["uploader"] = {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        documents.append(DocumentResponse(**doc_dict))
    
    return documents


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_admin)
):
    """Delete a document and its chunks"""
    # Check permission
    permission_names = [p.name for p in current_user.permissions]
    if not current_user.is_superuser and "document_deletion" not in permission_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete documents"
        )

    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Delete file
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    # Capture info for logging
    doc_name = document.name
    doc_id = document.id
    uploaded_by = current_user.id

    await db.delete(document)
    await db.commit()

    # Log activity
    await log_activity(
        db,
        action="DELETE_DOCUMENT",
        user_id=uploaded_by,
        details={"filename": doc_name, "document_id": doc_id}
    )

    return None


@router.post("/query", response_model=QueryResponse)
async def query_documents(
    request: QueryRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_admin)
):
    """Query documents using RAG (Retrieval Augmented Generation)"""
    # Generate query embedding
    embedding_service = get_embedding_service()
    query_embedding = embedding_service.generate_embedding(request.query)

    # Search for similar chunks
    vector_store = VectorStore()
    similar_chunks = []

    try:
        search_threshold = request.threshold

        # First attempt with requested threshold
        similar_chunks = await vector_store.search_similar(
            db,
            query_embedding,
            limit=request.max_results * 2,
            threshold=search_threshold,
            agent_type=request.agent_type
        )

        logger.info(f"Found {len(similar_chunks)} similar chunks for query: '{request.query}'")

        # If no results, try progressively lower thresholds
        if not similar_chunks:
            for fallback_threshold in [0.25, 0.2, 0.15, 0.1]:
                logger.info(f"No results with threshold {search_threshold}, trying {fallback_threshold}")
                similar_chunks = await vector_store.search_similar(
                    db,
                    query_embedding,
                    limit=request.max_results * 2,
                    threshold=fallback_threshold,
                    agent_type=request.agent_type
                )
                if similar_chunks:
                    logger.info(f"Found {len(similar_chunks)} results with threshold {fallback_threshold}")
                    break

        # Limit to requested max_results
        if similar_chunks:
            similar_chunks = similar_chunks[:request.max_results]

    except Exception as e:
        logger.error(f"Error searching for similar chunks: {e}")
        llm_service = get_llm_service()
        return QueryResponse(
            answer="No documents have been uploaded yet. Please upload documents first before querying.",
            sources=[],
            model_used=llm_service.model
        )

    if not similar_chunks:
        llm_service = get_llm_service()
        return QueryResponse(
            answer="I couldn't find any relevant information in the uploaded documents to answer your question. Try rephrasing your question or upload more relevant documents.",
            sources=[],
            model_used=llm_service.model
        )

    # Get document information for sources
    chunk_ids = [chunk.id for chunk, _ in similar_chunks]
    result = await db.execute(
        select(DocumentChunk, Document)
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(DocumentChunk.id.in_(chunk_ids))
    )
    chunk_doc_pairs = result.all()

    # Build context chunks with source info
    context_chunks = []
    sources_map = {}

    for chunk, similarity in similar_chunks:
        # Find document for this chunk
        doc = next((doc for chunk_obj, doc in chunk_doc_pairs if chunk_obj.id == chunk.id), None)

        doc_name = doc.name if doc else "Unknown Document"

        context_chunks.append({
            "text": chunk.text,
            "similarity": similarity,
            "source": doc_name
        })

        if doc:
            sources_map[doc.id] = {
                "document_id": doc.id,
                "document_name": doc.name,
                "chunk_index": chunk.chunk_index
            }

    # Generate LLM response
    llm_service = get_llm_service()

    # CRITICAL: generate_response is async, so we must await it
    llm_result = await llm_service.generate_response(
        request.query,
        context_chunks
    )
    
    answer = llm_result["content"]
    token_usage = llm_result["usage"]
    
    # Log token usage
    try:
        from app.core.mongodb import mongodb_settings
        from datetime import datetime
        
        db_mongo = mongodb_settings.get_database()
        usage_collection = db_mongo["token_usage"]
        
        await usage_collection.insert_one({
            "session_id": "document_query", # No session ID for direct queries
            "agent_type": "document_query",
            "timestamp": datetime.utcnow(),
            "prompt_tokens": token_usage["prompt_tokens"],
            "completion_tokens": token_usage["completion_tokens"],
            "total_tokens": token_usage["total_tokens"],
            "model": llm_service.model,
            "source": "document_query",
            "query": request.query[:100]  # Store first 100 chars of query for context
        })
    except Exception as e:
        logger.error(f"Failed to log token usage: {e}")

    # Prepare sources
    sources = list(sources_map.values())

    return QueryResponse(
        answer=answer,
        sources=sources,
        model_used=llm_service.model
    )


@router.post("/scrape-url", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def scrape_url(
    request: ScrapeUrlRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_admin)
):
    """Scrape content from a website URL and process it for AI training"""
    # Check permission
    permission_names = [p.name for p in current_user.permissions]
    if not current_user.is_superuser and "document_uploading" not in permission_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to scrape URLs"
        )

    try:
        # Scrape the URL
        scraper = WebScraper()
        text_content = scraper.scrape_url(request.url)

        if not text_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not scrape content from the URL. Please check if the URL is accessible."
            )

        # Extract domain name for document name (for full site scraping)
        from urllib.parse import urlparse
        parsed_url = urlparse(request.url)
        domain_name = parsed_url.netloc.replace('www.', '')
        document_name = f"{domain_name} - Full Site"

        # Create document record (similar to file upload but for URL)
        uploaded_by_id = current_user.id
        document = Document(
            name=document_name,
            file_path=request.url,  # Store URL as file_path for URL-based documents
            file_size=len(text_content.encode('utf-8')),
            mime_type="text/html",
            agent_type=request.agent_type,
            processed=False,
            uploaded_by=uploaded_by_id  # Track which admin scraped the URL
        )
        db.add(document)
        await db.flush()
        document_id = document.id
        document_id = document.id

        # Process the scraped content
        try:
            document.text_content = text_content

            # Chunk text
            processor = get_document_processor()
            chunks_data = processor.chunk_text(text_content)

            # Generate embeddings
            embedding_service = get_embedding_service()
            chunk_texts = [chunk["text"] for chunk in chunks_data]
            embeddings = embedding_service.generate_embeddings_batch(chunk_texts)

            # Store chunks with embeddings
            vector_store = VectorStore()
            for i, (chunk_data, embedding) in enumerate(zip(chunks_data, embeddings)):
                await vector_store.store_chunk(
                    db=db,
                    document_id=document.id,
                    chunk_index=chunk_data["index"],
                    text=chunk_data["text"],
                    embedding=embedding,
                    agent_type=document.agent_type,
                    metadata={
                        "start_char": chunk_data["start_char"],
                        "end_char": chunk_data["end_char"],
                        "source_url": request.url
                    }
                )

            document.processed = True
            document_name = document.name  # Capture before commit
            await db.commit()

            logger.info(f"Successfully processed scraped URL: {request.url} ({len(chunks_data)} chunks)")

            # Log activity
            await log_activity(
                db,
                action="SCRAPE_URL",
                user_id=uploaded_by_id,
                details={"url": request.url, "agent_type": request.agent_type}
            )

        except Exception as e:
            logger.error(f"Error processing scraped URL: {e}")
            document.error_message = str(e)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing scraped content: {str(e)}"
            )

        # Reload document and uploader after commit to avoid session issues
        doc_result = await db.execute(select(Document).where(Document.id == document_id))
        document = doc_result.scalar_one()
        
        uploader = None
        if uploaded_by_id:
            user_result = await db.execute(select(User).where(User.id == uploaded_by_id))
            uploader = user_result.scalar_one_or_none()
        
        # Construct response manually
        response_data = {
            "id": document.id,
            "name": document.name,
            "file_path": document.file_path,
            "file_size": document.file_size,
            "mime_type": document.mime_type,
            "agent_type": document.agent_type,
            "processed": document.processed,
            "text_content": document.text_content,
            "uploaded_by": document.uploaded_by,
            "created_at": document.created_at,
            "updated_at": document.updated_at,
        }
        
        if uploader:
            response_data["uploader"] = {
                "id": uploader.id,
                "email": uploader.email,
                "first_name": uploader.first_name,
                "last_name": uploader.last_name,
            }
        
        return DocumentResponse(**response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scraping URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error scraping URL: {str(e)}"
    )


@router.get("/{document_id}/file")
async def get_document_file(
    document_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    disposition: str = Query("attachment", pattern="^(inline|attachment)$"),
    token: Optional[str] = Query(None)
):
    """Retrieve the actual file for viewing or downloading"""
    # Verify token manually if provided in query string (for direct <a> tag access)
    from app.core.auth import verify_token
    
    user = None
    if token:
        try:
            user = await verify_token(token, db)
        except:
            pass
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid authentication token required"
        )

    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        document.file_path,
        media_type=document.mime_type,
        filename=document.name if disposition == "attachment" else None,
        content_disposition_type=disposition
    )


@router.get("/models")
async def list_available_models(
    current_user: User = Depends(get_current_admin)
):
    """List available LLM models"""
    return {
        "models": [
            {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "provider": "OpenAI"},
            {"id": "gpt-4", "name": "GPT-4", "provider": "OpenAI"},
            {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "provider": "OpenAI"},
        ]
    }

