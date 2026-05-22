from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class WebsiteConfig(Base):
    __tablename__ = "website_config"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, default="Leucadia Wastewater District")
    logo_url = Column(String, nullable=True)
    
    # Metadata
    seo_title = Column(String, default="Leucadia Wastewater District - Sustainable Water Solutions")
    seo_description = Column(String, default="Pioneering advanced wastewater recycling technologies to protect our coastlines and serve the Leucadia community.")

    # Colors
    primary_color = Column(String, default="#0f172a") # Slate 900
    secondary_color = Column(String, default="#3b82f6") # Blue 500
    accent_color = Column(String, default="#8b5cf6") # Violet 500

    # Header
    header_links = Column(JSON, default=[
        {"name": "Services", "href": "#services"},
        {"name": "Safety", "href": "#safety"},
        {"name": "Community", "href": "#community"},
        {"name": "News", "href": "#news"}
    ])
    navbar_login_text = Column(String, default="Log In")
    navbar_login_link = Column(String, default="#")
    navbar_cta_text = Column(String, default="Customer Portal")
    navbar_cta_link = Column(String, default="#")

    # Hero Section
    hero_title = Column(String, default="Sustainable Water for a Thriving Future")
    hero_subtitle = Column(String, default="Operational Excellence")
    hero_description = Column(Text, default="Pioneering advanced wastewater recycling technologies to protect our coastlines and serve the Leucadia community with 99.9% reliability.")
    hero_image_url = Column(String, default="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop")
    hero_cta_text = Column(String, default="Start Service")
    hero_cta_link = Column(String, default="#")
    hero_secondary_cta_text = Column(String, default="Watch Our Story")
    hero_secondary_cta_link = Column(String, default="#")

    # About Section
    about_title = Column(String, default="Committed to Excellence")
    about_subtitle = Column(String, default="Serving our community for over 60 years")
    about_description = Column(Text, default="Leucadia Wastewater District protects the environment and public health by providing safe and efficient wastewater collection and recycling services.")
    about_mission = Column(Text, default="We are dedicated to sustainable practices, utilizing state-of-the-art technology to recycle water for community use, reducing our dependence on imported water sources.")
    about_image_url = Column(String, default="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop")
    about_cta_text = Column(String, default="Read Our Mission")
    about_cta_link = Column(String, default="#")

    # Services Section
    services_title = Column(String, default="Our Services")
    services_description = Column(Text, default="Comprehensive wastewater management solutions tailored for residential, commercial, and environmental needs.")
    services_list = Column(JSON, default=[
        {
            "title": "Residential Service",
            "icon": "Home",
            "description": "Providing reliable, efficient, and eco-friendly wastewater collection and treatment services to over 60,000 residents."
        },
        {
            "title": "Commercial",
            "icon": "Briefcase",
            "description": "Specialized solutions for local businesses and industries."
        },
        {
            "title": "Recycled Water",
            "icon": "Droplets",
            "description": "Advanced purification for sustainable community use."
        }
    ])
    services_cta_text = Column(String, default="Learn More")

    # Features Section (Community)
    features_title = Column(String, default="Built for the Community")
    features_description = Column(Text, default="We combine cutting-edge infrastructure with a commitment to environmental stewardship.")
    features_list = Column(JSON, default=[
        {"title": "24/7 Monitoring", "description": "Real-time Surveillance", "icon": "Activity"},
        {"title": "Eco-Friendly", "description": "Sustainable Future", "icon": "Shield"},
        {"title": "Customer Focused", "description": "Community First", "icon": "Users"}
    ])
    features_cta_text = Column(String, default="Explore")

    # Stats Section
    stats_list = Column(JSON, default=[
        {"label": "60k+", "value": "Community Served", "sublabel": "Residents"},
        {"label": "300M", "value": "Recycled Annually", "sublabel": "Gallons"},
        {"label": "150+", "value": "Infrastructure", "sublabel": "Miles of Pipe"},
        {"label": "99.9%", "value": "Reliability", "sublabel": "Uptime"}
    ])

    # CTA Section
    cta_title = Column(String, default="Ready to get started?")
    cta_description = Column(Text, default="Manage your account, view usage, and pay bills easily with our new customer portal.")
    cta_button_text = Column(String, default="Access Customer Portal")
    cta_button_link = Column(String, default="#")

    # Footer Section
    footer_about = Column(Text, default="Committed to environmental stewardship and delivering reliable wastewater services to our community since 1959.")
    footer_social_links = Column(JSON, default=[
        {"platform": "twitter", "url": "#"},
        {"platform": "facebook", "url": "#"},
        {"platform": "instagram", "url": "#"},
        {"platform": "linkedin", "url": "#"}
    ])
    footer_columns = Column(JSON, default=[
        {
            "title": "Services",
            "links": [
                {"name": "Bill Payment", "href": "#"},
                {"name": "Start/Stop Service", "href": "#"},
                {"name": "Report Issue", "href": "#"},
                {"name": "Permits", "href": "#"}
            ]
        },
        {
            "title": "Company",
            "links": [
                {"name": "About Us", "href": "#"},
                {"name": "Board Meetings", "href": "#"},
                {"name": "Careers", "href": "#"},
                {"name": "Contact", "href": "#"}
            ]
        }
    ])
    footer_copyright = Column(String, default="© 2024 Leucadia Wastewater District. All rights reserved.")
    footer_privacy_link = Column(String, default="#")
    footer_terms_link = Column(String, default="#")
    footer_sitemap_link = Column(String, default="#")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
