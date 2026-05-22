from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class WebsiteConfigBase(BaseModel):
    company_name: Optional[str] = "Leucadia Wastewater District"
    logo_url: Optional[str] = None
    
    # Metadata
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # Colors
    primary_color: Optional[str] = "#0f172a"
    secondary_color: Optional[str] = "#3b82f6"
    accent_color: Optional[str] = "#8b5cf6"

    # Header
    header_links: Optional[List[Dict[str, Any]]] = None
    navbar_login_text: Optional[str] = "Log In"
    navbar_login_link: Optional[str] = "#"
    navbar_cta_text: Optional[str] = "Customer Portal"
    navbar_cta_link: Optional[str] = "#"

    # Hero Section
    hero_title: Optional[str] = "Sustainable Water for a Thriving Future"
    hero_subtitle: Optional[str] = "Operational Excellence"
    hero_description: Optional[str] = "Pioneering advanced wastewater recycling technologies to protect our coastlines and serve the Leucadia community with 99.9% reliability."
    hero_image_url: Optional[str] = None
    hero_cta_text: Optional[str] = "Start Service"
    hero_cta_link: Optional[str] = "#"
    hero_secondary_cta_text: Optional[str] = "Watch Our Story"
    hero_secondary_cta_link: Optional[str] = "#"

    # About Section
    about_title: Optional[str] = "Committed to Excellence"
    about_subtitle: Optional[str] = "Serving our community for over 60 years"
    about_description: Optional[str] = None
    about_mission: Optional[str] = None
    about_image_url: Optional[str] = None
    about_cta_text: Optional[str] = "Read Our Mission"
    about_cta_link: Optional[str] = "#"

    # Services Section
    services_title: Optional[str] = "Our Services"
    services_description: Optional[str] = None
    services_list: Optional[List[Dict[str, Any]]] = None
    services_cta_text: Optional[str] = "Learn More"

    # Features Section
    features_title: Optional[str] = "Built for the Community"
    features_description: Optional[str] = None
    features_list: Optional[List[Dict[str, Any]]] = None
    features_cta_text: Optional[str] = "Explore"

    # Stats Section
    stats_list: Optional[List[Dict[str, Any]]] = None

    # CTA Section
    cta_title: Optional[str] = "Ready to get started?"
    cta_description: Optional[str] = None
    cta_button_text: Optional[str] = "Access Customer Portal"
    cta_button_link: Optional[str] = "#"

    # Footer Section
    footer_about: Optional[str] = None
    footer_social_links: Optional[List[Dict[str, Any]]] = None
    footer_columns: Optional[List[Dict[str, Any]]] = None
    footer_copyright: Optional[str] = None
    footer_privacy_link: Optional[str] = "#"
    footer_terms_link: Optional[str] = "#"
    footer_sitemap_link: Optional[str] = "#"

class WebsiteConfigCreate(WebsiteConfigBase):
    pass

class WebsiteConfigUpdate(WebsiteConfigBase):
    pass

class WebsiteConfigResponse(WebsiteConfigBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
