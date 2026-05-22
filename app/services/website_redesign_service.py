import logging
import os
from openai import OpenAI

logger = logging.getLogger(__name__)

class WebsiteRedesignService:
    """
    Dedicated service for AI-powered website redesigns.
    """
    
    def __init__(self):
        # DeepSeek Configuration
        self.model = "deepseek-chat"
        api_key = "sk-b643187be9ee4c6db30d9b8191beca77"
        
        if api_key:
            self.client = OpenAI(
                api_key=api_key, 
                base_url="https://api.deepseek.com"
            )
        else:
            self.client = None
            logger.warning("DeepSeek API Key not configured")

    async def redesign_html(self, source_html: str, instructions: str = "") -> dict:
        """
        Redesign the given HTML content using Bootstrap 5.2.
        """
        if not self.client:
            return {
                "content": "<!-- LLM service not configured -->",
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }

        system_prompt = """You are an expert UI/UX designer and Frontend Developer. 
Your task is to REDESIGN the provided HTML content.
Rules:
1. Keep ALL the core content (text, images, links) but completely modernize the layout and styling.
2. DO NOT OMIT ANY SECTIONS. If the original page has 10 sections, the redesign must have 10 sections.
3. **Use Bootstrap 5.2 (via CDN) for styling.** Do NOT use Tailwind.
   - Include the Bootstrap 5.2 CSS CDN link in the <head>.
   - Use Bootstrap utility classes and components effectively.
   - ENSURE PROPER ALIGNMENT: Use `.container`, `.row`, and `.col-*` classes correctly.
4. Make it fully responsive (mobile-friendly).
5. The output must be valid, complete HTML5.
6. Do NOT include markdown fences (```html). Just return the raw HTML code.
7. Make it look "Premium", "Clean", and "Corporate".
8. Do NOT simply output a generic "Hero + 3 features" template. Respect the original structure's depth.
9. **IMAGES:** Use ONLY the image URLs provided in the source HTML. 
   - DO NOT invent new image URLs. 
   - DO NOT use placeholders like `via.placeholder.com` or `unsplash`.
   - If an image tag exists in the source, use its EXACT `src` in the redesign.
   - Ensure images are responsive (use `.img-fluid`).
10. **VISUAL EXCELLENCE:** The design MUST be unique, modern, attractive, and professional.
    - Avoid generic "Bootstrap look". Customize standard components with utility classes to look bespoke.
    - **Typography:** Use modern font stacks (e.g., Inter, system-ui). Use varying font weights (300, 400, 600, 700) to create strong visual hierarchy.
    - **Whitespace:** Use ample whitespace (padding/margins) to let content breathe. Avoid cramped layouts.
    - **Depth & Texture:** Use subtle shadows (`shadow-sm`, `shadow-lg`) and rounded corners (`rounded-4`, `rounded-pill`) to add depth and modernity.
    - **Contrast:** Ensure high contrast for readability. Use dark headers with light text or punchy accent colors.
    - **Cards:** Style content cards with hover effects (e.g., lift on hover) for interactivity.
11. **COMPLETELY DIFFERENT LAYOUT:** The redesign MUST look SIGNIFICANTLY different from the original HTML structure.
    - Do NOT copy the original layout.
    - Be creative with the layout while keeping the content intact.
12. **FULL CONTENT:** Do NOT truncate or summarize text. Include ALL paragraphs, headings, and details from the source.
"""

        user_prompt = f"""Here is the raw HTML of a website:

{source_html}

Instructions: {instructions or 'Redesign this website to look modern and premium using Bootstrap 5.2.'}
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=8000
            )
            
            content = response.choices[0].message.content
            
            # Strip markdown fences
            if content.startswith("```html"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
                
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
            
            return {
                "content": content.strip(),
                "usage": usage
            }
            
        except Exception as e:
            logger.error(f"Error in redesign_html: {e}")
            return {
                "content": f"<!-- Error generating design: {str(e)} -->",
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }

    async def edit_html(self, source_html: str, instructions: str) -> dict:
        """
        Edit existing HTML based on specific user instructions.
        """
        if not self.client:
            return {
                "content": source_html,
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }

        system_prompt = """You are an expert Web Developer specializing in refining and fixing HTML/CSS.
Your task is to EDIT the provided HTML based on the user's specific instructions.
Rules:
1. Apply the user's changes PRECISELY.
2. **MINIMAL INTERVENTION:** Change ONLY what is requested. DO NOT refactor, reformat, or "improve" unrelated code.
3. PRESERVE all other content, structure, and styling exactly as is.
4. Return the FULL, VALID HTML code with the changes applied.
5. Do NOT truncate the output.
6. Do NOT include markdown fences (```html).
"""

        user_prompt = f"""Here is the existing HTML:

{source_html}

USER INSTRUCTIONS: {instructions}

Return the updated HTML:
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3, # Lower temperature for more precise edits
                max_tokens=8000
            )  
            
            content = response.choices[0].message.content
            
            # Strip markdown fences
            if content.startswith("```html"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
                
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
            
            return {
                "content": content.strip(),
                "usage": usage
            }
            
        except Exception as e:
            logger.error(f"Error in edit_html: {e}")
            return {
                "content": source_html, # Return original on error
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }
