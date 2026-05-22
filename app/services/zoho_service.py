import httpx
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class ZohoService:
    """Service to interact with Zoho CRM API, specifically for Deals."""
    
    def __init__(self, client_id: str, client_secret: str, refresh_token: str, dc: str = "in"):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.dc = dc
        self.base_url = f"https://www.zohoapis.{'in' if dc == 'in' else 'com' if dc == 'us' else dc}/crm/v2"
        self.auth_url = f"https://accounts.zoho.{'in' if dc == 'in' else 'com' if dc == 'us' else dc}/oauth/v2/token"
        self._access_token = None

    async def _get_access_token(self) -> Optional[str]:
        """Get a new access token using the refresh token."""
        if self._access_token:
            return self._access_token

        if not self.refresh_token:
            logger.error("No refresh token provided for Zoho")
            return None

        params = {
            "refresh_token": self.refresh_token,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "refresh_token"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.auth_url, params=params)
                if response.status_code != 200:
                    logger.error(f"Failed to refresh Zoho token: {response.text}")
                    return None
                
                data = response.json()
                self._access_token = data.get("access_token")
                return self._access_token
            except Exception as e:
                logger.error(f"Zoho token refresh exception: {e}")
                return None

    async def search_deals(self, query: str) -> List[Dict[str, Any]]:
        """Search for deals in Zoho CRM."""
        token = await self._get_access_token()
        if not token:
            return []
        
        headers = {"Authorization": f"Zoho-oauthtoken {token}"}
        
        # Search deals by name or custom field
        params = {"criteria": f"(Deal_Name:starts_with:{query})"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/Deals/search", headers=headers, params=params)
                if response.status_code == 204: # No content
                    return []
                if response.status_code != 200:
                    logger.error(f"Zoho Search Error: {response.text}")
                    return []
                
                return response.json().get("data", [])
            except Exception as e:
                logger.error(f"Zoho search exception: {e}")
                return []

    async def get_recent_deals(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Fetch recently modified deals."""
        token = await self._get_access_token()
        if not token:
            return []
        
        headers = {"Authorization": f"Zoho-oauthtoken {token}"}
        params = {"sort_by": "Modified_Time", "sort_order": "desc", "per_page": limit}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/Deals", headers=headers, params=params)
                if response.status_code != 200:
                    logger.error(f"Zoho Fetch Error: {response.text}")
                    return []
                
                return response.json().get("data", [])
            except Exception as e:
                logger.error(f"Zoho fetch recent exception: {e}")
                return []

    async def get_deal_details(self, deal_id: str) -> Optional[Dict[str, Any]]:
        """Get full details of a specific deal."""
        token = await self._get_access_token()
        if not token:
            return None
            
        headers = {"Authorization": f"Zoho-oauthtoken {token}"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/Deals/{deal_id}", headers=headers)
                if response.status_code != 200:
                    return None
                
                data = response.json().get("data", [])
                return data[0] if data else None
            except Exception as e:
                logger.error(f"Zoho get details exception: {e}")
                return None
