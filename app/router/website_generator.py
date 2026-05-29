print("DEBUG: website_generator.py module loaded")
from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import logging
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.mongodb import mongodb_settings
from app.models.user import User
from app.services.web_scraper import WebScraper
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/website-generator", tags=["website-generator"])

@router.post("/generate")
async def generate_website(
    url: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a modern HTML website from an existing URL.
    1. Create a processing record in MongoDB.
    2. Scrape content.
    3. Extract meaningful business data via AI.
    4. Update status to completed or failed.
    """
    try:
        db_mongo = mongodb_settings.get_database()
        collection = db_mongo["generated_sites"]
        
        doc = {
            "source_url": url,
            "generation_type": "capture",
            "status": "processing",
            "created_at": datetime.utcnow(),
            "admin_id": current_user.id
        }
        
        insert_result = await collection.insert_one(doc)
        site_id = str(insert_result.inserted_id)
    except Exception as e:
        logger.error(f"Error creating initial site record: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    try:
        # 1. Scrape Content
        scraper = WebScraper()
        # We just need the raw content of the target page for now
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
            import requests
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            raw_html = response.text
            
            # Convert to absolute URLs to fix broken images/links
            generated_html = scraper.convert_to_absolute_urls(raw_html, url)
        except Exception as e:
            logger.error(f"Error fetching raw HTML: {e}")
            raise HTTPException(status_code=400, detail=f"Could not fetch raw HTML: {str(e)}")

        # 2. Extract Data via AI
        try:
            # Clean HTML for token efficiency
            cleaned_html = scraper._clean_for_design_extraction(generated_html.encode('utf-8'))
            
            llm_service = LLMService()
            
            extraction_prompt = """
            Analyze the provided website HTML and extract the following:
            1. Brand Name (exact string)
            2. Color Palette (list of main 3-5 hex codes found in styles/css/attributes)

            Return ONLY valid JSON in this format:
            {
                "brand_name": "Name",
                "color_palette": ["#hex1", "#hex2", ...]
            }
            """
            
            llm_response = await llm_service.generate_response(
                query="Extract brand identity",
                context_chunks=[{"text": cleaned_html}],
                system_prompt=extraction_prompt
            )
            
            import json
            try:
                content = llm_response["content"].strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                    
                extracted_json = json.loads(content.strip())
                
                extraction_data = json.dumps({
                    "brand_name": extracted_json.get("brand_name", "Unknown Brand"),
                    "primary_services": [],
                    "value_proposition": "Extracted Content",
                    "brand_tone": [],
                    "contact_info": "Unavailable",
                    "color_palette": extracted_json.get("color_palette", [])
                })
            except Exception as parse_error:
                logger.error(f"Error parsing extraction JSON: {parse_error}")
                extraction_data = "{\"brand_name\": \"Extraction Failed\", \"primary_services\": [], \"value_proposition\": \"Could not extract\", \"brand_tone\": [], \"contact_info\": \"Unavailable\", \"color_palette\": []}"
                
        except Exception as e:
            logger.error(f"Error in extraction step: {e}")
            extraction_data = "{\"brand_name\": \"Extraction Error\", \"primary_services\": [], \"value_proposition\": \"Error\", \"brand_tone\": [], \"contact_info\": \"Unavailable\", \"color_palette\": []}"

        # 3. Update MongoDB to completed
        await collection.update_one(
            {"_id": ObjectId(site_id)},
            {
                "$set": {
                    "extraction_data": extraction_data,
                    "generated_html": generated_html,
                    "status": "completed",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "id": site_id,
            "extraction_data": extraction_data,
            "generated_html": generated_html
        }

    except Exception as e:
        logger.error(f"Error in website generation: {e}")
        try:
            await collection.update_one(
                {"_id": ObjectId(site_id)},
                {
                    "$set": {
                        "status": "failed",
                        "error_message": str(e),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        except Exception as db_err:
            logger.error(f"Failed to update failed status in DB: {db_err}")
            
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_generated_sites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all previously generated websites."""
    print(f"DEBUG: list_generated_sites called by user: {current_user.email}, is_superuser: {current_user.is_superuser}, user_type: {current_user.user_type}")
    try:
        db_mongo = mongodb_settings.get_database()
        collection = db_mongo["generated_sites"]
        
        cursor = collection.find().sort("created_at", -1)
        sites = await cursor.to_list(length=100)
        
        # Convert ObjectId to string and optimize payload size
        for site in sites:
            site["id"] = str(site["_id"])
            del site["_id"]
            
            # Default or infer values for older records
            if "status" not in site:
                site["status"] = "completed"
            if "generation_type" not in site:
                site["generation_type"] = "redesign" if ("redesigned_html" in site or "redesigned_at" in site) else "capture"
                
            # Exclude large HTML from list and store sizes
            if "generated_html" in site:
                site["has_html"] = True
                site["generated_html_size"] = len(site["generated_html"])
                del site["generated_html"]
            else:
                site["generated_html_size"] = 0

            if "redesigned_html" in site:
                site["has_redesigned_html"] = True
                site["redesigned_html_size"] = len(site["redesigned_html"])
                del site["redesigned_html"]
            else:
                site["redesigned_html_size"] = 0
                
        return {"sites": sites}
    except Exception as e:
        logger.error(f"Error listing sites: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/landing-content")
async def get_landing_content():
    """
    Get the content for the public /landing page.
    """
    print("DEBUG: get_landing_content called - PUBLIC ENDPOINT")
    try:
        db_mongo = mongodb_settings.get_database()
        landing_collection = db_mongo["landing_page"]
        
        doc = await landing_collection.find_one({"type": "active_landing_page"})
        
        if not doc or "html_content" not in doc:
            # Return a default placeholder if nothing is published
            return {"html": "<!-- No landing page published yet -->"}
            
        return {"html": doc["html_content"]}
    except Exception as e:
        logger.error(f"Error fetching landing content: {e}")
        # Don't crash the landing page, just return empty
        return {"html": "<!-- Error loading content -->"}

@router.get("/{site_id}")
async def get_site_detail(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get full details of a specific generated site."""
    try:
        db_mongo = mongodb_settings.get_database()
        collection = db_mongo["generated_sites"]
        
        site = await collection.find_one({"_id": ObjectId(site_id)})
        if not site:
            raise HTTPException(status_code=404, detail="Site not found")
            
        site["id"] = str(site["_id"])
        del site["_id"]
        
        # Ensure status and type are present in detail too
        if "status" not in site:
            site["status"] = "completed"
        if "generation_type" not in site:
            site["generation_type"] = "redesign" if ("redesigned_html" in site or "redesigned_at" in site) else "capture"
            
        return site
    except Exception as e:
        logger.error(f"Error getting site details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/redesign/{site_id}")
async def redesign_website(
    site_id: str,
    instructions: str = Body(default="", embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Step 2: Redesign the captured website using AI.
    """
    try:
        db_mongo = mongodb_settings.get_database()
        collection = db_mongo["generated_sites"]
        
        # 1. Get the original site
        site = await collection.find_one({"_id": ObjectId(site_id)})
        if not site:
            raise HTTPException(status_code=404, detail="Site not found")
            
        source_html = site.get("generated_html", "")
        if not source_html:
             raise HTTPException(status_code=400, detail="No source HTML found for this site")

        # Create a new redesign activity record in processing state
        new_doc = {
            "source_url": site.get("source_url"),
            "generation_type": "redesign",
            "status": "processing",
            "created_at": datetime.utcnow(),
            "admin_id": current_user.id,
            "generated_html": source_html,
            "extraction_data": site.get("extraction_data")
        }
        insert_result = await collection.insert_one(new_doc)
        new_site_id = str(insert_result.inserted_id)

    except Exception as e:
        logger.error(f"Error in redesign prep: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

    try:
        # 2. Call Redesign Service
        from app.services.website_redesign_service import WebsiteRedesignService
        service = WebsiteRedesignService()
        result = await service.redesign_html(source_html, instructions)
        
        redesigned_html = result["content"]
        token_usage = result["usage"]
        
        # 3. Update DB
        update_result = await collection.update_one(
            {"_id": ObjectId(new_site_id)},
            {
                "$set": {
                    "redesigned_html": redesigned_html,
                    "token_usage_redesign": token_usage,
                    "redesigned_at": datetime.utcnow(),
                    "status": "completed",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "id": new_site_id,
            "redesigned_html": redesigned_html,
            "token_usage": token_usage
        }

    except Exception as e:
        logger.error(f"Error in redesign endpoint: {e}")
        try:
            await collection.update_one(
                {"_id": ObjectId(new_site_id)},
                {
                    "$set": {
                        "status": "failed",
                        "error_message": str(e),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        except Exception as db_err:
            logger.error(f"Failed to update failed status in DB: {db_err}")
            
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit/{site_id}")
async def edit_website(
    site_id: str,
    instructions: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Step 3: Edit the redesigned website based on user instructions.
    """
    try:
        db_mongo = mongodb_settings.get_database()
        collection = db_mongo["generated_sites"]
        
        # 1. Get the site
        site = await collection.find_one({"_id": ObjectId(site_id)})
        if not site:
            raise HTTPException(status_code=404, detail="Site not found")
            
        # Use existing redesign or fall back to generated HTML
        source_html = site.get("redesigned_html") or site.get("generated_html", "")
        if not source_html:
             raise HTTPException(status_code=400, detail="No source HTML found for this site")

        # Mark as processing
        await collection.update_one(
            {"_id": ObjectId(site_id)},
            {
                "$set": {
                    "status": "processing",
                    "updated_at": datetime.utcnow()
                }
            }
        )

    except Exception as e:
        logger.error(f"Error in edit prep: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

    try:
        # 2. Call Redesign Service (Edit Mode)
        from app.services.website_redesign_service import WebsiteRedesignService
        service = WebsiteRedesignService()
        result = await service.edit_html(source_html, instructions)
        
        redesigned_html = result["content"]
        token_usage = result["usage"]
        
        # 3. Update DB
        update_result = await collection.update_one(
            {"_id": ObjectId(site_id)},
            {
                "$set": {
                    "redesigned_html": redesigned_html,
                    "token_usage_edit": token_usage,
                    "edited_at": datetime.utcnow(),
                    "status": "completed",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "id": site_id,
            "redesigned_html": redesigned_html,
            "token_usage": token_usage
        }

    except Exception as e:
        logger.error(f"Error in edit endpoint: {e}")
        try:
            await collection.update_one(
                {"_id": ObjectId(site_id)},
                {
                    "$set": {
                        "status": "failed",
                        "error_message": str(e),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        except Exception as db_err:
            logger.error(f"Failed to update failed status in DB: {db_err}")
            
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/publish/{site_id}")
async def publish_website(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Step 4: Publish the redesign to the /landing page.
    """
    try:
        db_mongo = mongodb_settings.get_database()
        sites_collection = db_mongo["generated_sites"]
        landing_collection = db_mongo["landing_page"]
        
        # 1. Get the site
        site = await sites_collection.find_one({"_id": ObjectId(site_id)})
        if not site:
            raise HTTPException(status_code=404, detail="Site not found")
            
        # Prioritize redesigned HTML, fall back to generated
        html_content = site.get("redesigned_html") or site.get("generated_html", "")
        if not html_content:
             raise HTTPException(status_code=400, detail="No content to publish")

        # 2. Update the single active landing page document
        await landing_collection.update_one(
            {"type": "active_landing_page"},
            {
                "$set": {
                    "type": "active_landing_page",
                    "site_id": site_id,
                    "html_content": html_content,
                    "published_at": datetime.utcnow(),
                    "published_by": current_user.id
                }
            },
            upsert=True
        )
        
        return {"status": "success", "message": "Website published to /landing"}
    except Exception as e:
        logger.error(f"Error publishing site: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{site_id}", status_code=204)
async def delete_site(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a generated site record."""
    try:
        db_mongo = mongodb_settings.get_database()
        collection = db_mongo["generated_sites"]
        
        result = await collection.delete_one({"_id": ObjectId(site_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Site record not found")
            
        return None
    except Exception as e:
        logger.error(f"Error deleting site: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


