import asyncio
import sys
import os

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import DBSessionManager
from app.models.website import WebsiteConfig
from sqlalchemy import select

async def seed_website():
    async with DBSessionManager.session() as db:
        # Check if config already exists
        result = await db.execute(select(WebsiteConfig))
        config = result.scalars().first()

        premium_data = {
            "company_name": "Leucadia Wastewater District",
            "logo_url": None,
            "seo_title": "Leucadia Wastewater District - Sustainable Water Solutions",
            "seo_description": "Pioneering advanced wastewater recycling technologies to protect our coastlines and serve the Leucadia community.",
            "primary_color": "#0f172a",
            "secondary_color": "#3b82f6",
            "accent_color": "#8b5cf6",
            "header_links": [
                {"name": "Services", "href": "#services"},
                {"name": "Safety", "href": "#safety"},
                {"name": "About", "href": "#about"},
                {"name": "Community", "href": "#community"}
            ],
            "navbar_login_text": "Log In",
            "navbar_login_link": "#",
            "navbar_cta_text": "Customer Portal",
            "navbar_cta_link": "#",
            "hero_title": "Sustainable Water for a Thriving Future",
            "hero_subtitle": "Operational Excellence",
            "hero_description": "Pioneering advanced wastewater recycling technologies to protect our coastlines and serve the Leucadia community with 99.9% reliability.",
            "hero_image_url": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop",
            "hero_cta_text": "Start Service",
            "hero_cta_link": "#",
            "hero_secondary_cta_text": "Watch Our Story",
            "hero_secondary_cta_link": "#",
            "about_title": "Committed to Excellence",
            "about_subtitle": "Serving our community for over 60 years",
            "about_description": "Leucadia Wastewater District protects the environment and public health by providing safe and efficient wastewater collection and recycling services.",
            "about_mission": "We are dedicated to sustainable practices, utilizing state-of-the-art technology to recycle water for community use, reducing our dependence on imported water sources.",
            "about_image_url": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop",
            "about_cta_text": "Read Our Mission",
            "about_cta_link": "#",
            "services_title": "Our Services",
            "services_description": "Comprehensive wastewater management solutions tailored for residential, commercial, and environmental needs.",
            "services_list": [
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
            ],
            "services_cta_text": "Learn More",
            "features_title": "Built for the Community",
            "features_description": "We combine cutting-edge infrastructure with a commitment to environmental stewardship.",
            "features_list": [
                {"title": "24/7 Monitoring", "description": "Real-time Surveillance", "icon": "Activity"},
                {"title": "Eco-Friendly", "description": "Sustainable Future", "icon": "Shield"},
                {"title": "Customer Focused", "description": "Community First", "icon": "Users"}
            ],
            "features_cta_text": "Explore",
            "stats_list": [
                {"label": "60k+", "value": "Community Served", "sublabel": "Residents"},
                {"label": "300M", "value": "Recycled Annually", "sublabel": "Gallons"},
                {"label": "150+", "value": "Infrastructure", "sublabel": "Miles of Pipe"},
                {"label": "99.9%", "value": "Reliability", "sublabel": "Uptime"}
            ],
            "cta_title": "Ready to get started?",
            "cta_description": "Manage your account, view usage, and pay bills easily with our new customer portal.",
            "cta_button_text": "Access Customer Portal",
            "cta_button_link": "#",
            "footer_about": "Committed to environmental stewardship and delivering reliable wastewater services to our community since 1959.",
            "footer_social_links": [
                {"platform": "twitter", "url": "#"},
                {"platform": "facebook", "url": "#"},
                {"platform": "instagram", "url": "#"},
                {"platform": "linkedin", "url": "#"}
            ],
            "footer_columns": [
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
            ],
            "footer_copyright": "© 2024 Leucadia Wastewater District. All rights reserved.",
            "footer_privacy_link": "#",
            "footer_terms_link": "#",
            "footer_sitemap_link": "#"
        }

        if not config:
            print("Creating new website configuration...")
            config = WebsiteConfig(**premium_data)
            db.add(config)
        else:
            print("Updating existing website configuration...")
            for key, value in premium_data.items():
                setattr(config, key, value)
        
        await db.commit()
        print("Successfully seeded website configuration!")

if __name__ == "__main__":
    asyncio.run(seed_website())
