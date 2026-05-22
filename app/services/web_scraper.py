import logging
import requests
from typing import Optional, Set, List
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, urlunparse
import re
import time

logger = logging.getLogger(__name__)


class WebScraper:
    """Service for scraping content from websites"""

    @staticmethod
    def scrape_url(url: str, max_pages: int = 50, include_html: bool = False) -> Optional[str | dict]:
        """
        Scrape text content from a website URL and all its internal pages.
        
        Args:
            url: The base URL to scrape (will crawl entire site)
            max_pages: Maximum number of pages to scrape (default: 50)
            include_html: If True, returns a dict with 'text' and 'root_html'
        
        Returns:
            Extracted text content or dict with text and root_html
        """
        try:
            # Validate and normalize URL
            parsed = urlparse(url)
            if not parsed.netloc:
                logger.error(f"Invalid URL format: {url}")
                return None

            # Add scheme if missing
            if not parsed.scheme:
                url = f"https://{url}"
                parsed = urlparse(url)

            base_url = f"{parsed.scheme}://{parsed.netloc}"
            base_domain = parsed.netloc.replace('www.', '')

            # Set headers to mimic a browser
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            }

            # Track visited URLs to avoid duplicates
            visited_urls: Set[str] = set()
            urls_to_visit: List[str] = [url]
            all_content: List[str] = []
            root_html: Optional[str] = None

            logger.info(f"Starting to scrape website: {base_url} (max {max_pages} pages)")

            # Crawl the website
            while urls_to_visit and len(visited_urls) < max_pages:
                current_url = urls_to_visit.pop(0)
                
                # Normalize URL (remove fragments, trailing slashes)
                parsed_current = urlparse(current_url)
                normalized_url = urlunparse((
                    parsed_current.scheme,
                    parsed_current.netloc,
                    parsed_current.path.rstrip('/') or '/',
                    parsed_current.params,
                    parsed_current.query,
                    ''  # Remove fragment
                ))

                # Skip if already visited
                if normalized_url in visited_urls:
                    continue

                # Skip external URLs
                if parsed_current.netloc.replace('www.', '') != base_domain:
                    continue

                # Skip non-HTML files
                if any(normalized_url.lower().endswith(ext) for ext in ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.css', '.js', '.zip', '.doc', '.docx']):
                    continue

                try:
                    logger.info(f"Scraping page {len(visited_urls) + 1}/{max_pages}: {normalized_url}")
                    
                    # Fetch the page
                    response = requests.get(normalized_url, headers=headers, timeout=30, allow_redirects=True)
                    response.raise_for_status()

                    # Check if it's HTML
                    content_type = response.headers.get('Content-Type', '').lower()
                    if 'text/html' not in content_type:
                        visited_urls.add(normalized_url)
                        continue

                    # Parse HTML
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # Capture root HTML if requested
                    if include_html and not root_html:
                        root_html = WebScraper._clean_for_design_extraction(response.content)

                    # Extract page content
                    page_content = WebScraper._extract_page_content(soup, normalized_url)
                    if page_content:
                        all_content.append(page_content)

                    # Mark as visited
                    visited_urls.add(normalized_url)

                    # Find and add new links to visit
                    if len(visited_urls) < max_pages:
                        links = WebScraper._extract_internal_links(soup, base_url, base_domain)
                        for link in links:
                            if link not in visited_urls and link not in urls_to_visit:
                                urls_to_visit.append(link)

                    # Be polite - add a small delay between requests
                    time.sleep(0.5)

                except requests.exceptions.RequestException as e:
                    logger.warning(f"Error fetching {normalized_url}: {e}")
                    visited_urls.add(normalized_url)  # Mark as visited to avoid retrying
                    continue
                except Exception as e:
                    logger.warning(f"Error processing {normalized_url}: {e}")
                    visited_urls.add(normalized_url)
                    continue

            # Combine all content
            if not all_content:
                logger.warning(f"No content scraped from {base_url}")
                return None

            full_text = "\n\n" + "="*80 + "\n\n".join(all_content)
            logger.info(f"Successfully scraped {len(visited_urls)} pages, {len(full_text)} characters from {base_url}")
            
            if include_html:
                return {
                    "text": full_text,
                    "root_html": root_html
                }
            return full_text

        except Exception as e:
            logger.error(f"Error scraping website {url}: {e}")
            return None

    @staticmethod
    def _extract_page_content(soup: BeautifulSoup, url: str) -> Optional[str]:
        """Extract text content from a single page"""
        try:
            # Remove script and style elements
            for element in soup(["script", "style", "nav", "header", "footer", "aside"]):
                element.decompose()

            text_parts = []

            # Extract URL and title
            parsed = urlparse(url)
            page_path = parsed.path.strip('/') or 'homepage'
            text_parts.append(f"URL: {url}")
            text_parts.append(f"Page: {page_path}")

            # Extract title
            title = soup.find('title')
            if title:
                text_parts.append(f"Title: {title.get_text().strip()}")

            # Extract meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc and meta_desc.get('content'):
                text_parts.append(f"Description: {meta_desc.get('content').strip()}")

            # Try to find main content area
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'content|main|body', re.I))
            
            if main_content:
                content_text = WebScraper._extract_text_from_element(main_content)
            else:
                # Fallback: extract from body
                body = soup.find('body')
                if body:
                    content_text = WebScraper._extract_text_from_element(body)
                else:
                    content_text = ""

            if content_text:
                text_parts.append(content_text)

            # Combine all text
            page_text = "\n\n".join([part for part in text_parts if part.strip()])

            if len(page_text.strip()) < 50:
                return None

            return page_text

        except Exception as e:
            logger.warning(f"Error extracting content from {url}: {e}")
            return None

    @staticmethod
    def _extract_internal_links(soup: BeautifulSoup, base_url: str, base_domain: str) -> List[str]:
        """Extract all internal links from a page"""
        links = []
        try:
            for anchor in soup.find_all('a', href=True):
                href = anchor.get('href', '').strip()
                if not href:
                    continue

                # Skip mailto, tel, javascript links
                if href.startswith(('mailto:', 'tel:', 'javascript:', '#')):
                    continue

                # Convert relative URLs to absolute
                absolute_url = urljoin(base_url, href)
                parsed = urlparse(absolute_url)

                # Only include links from the same domain
                if parsed.netloc.replace('www.', '') == base_domain:
                    # Normalize URL
                    normalized = urlunparse((
                        parsed.scheme,
                        parsed.netloc,
                        parsed.path.rstrip('/') or '/',
                        parsed.params,
                        parsed.query,
                        ''  # Remove fragment
                    ))
                    links.append(normalized)

        except Exception as e:
            logger.warning(f"Error extracting links: {e}")

        return links

    @staticmethod
    def _extract_text_from_element(element) -> str:
        """Extract clean text from a BeautifulSoup element"""
        if not element:
            return ""

        # Get text and clean it up
        text = element.get_text(separator='\n', strip=True)
        
        # Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        
        return text.strip()

    @staticmethod
    def _clean_for_design_extraction(html_content: bytes) -> str:
        """Clean HTML to keep only structure and styles for design extraction"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove scripts, iframes, and svgs to save tokens
            for element in soup(["script", "iframe", "svg", "noscript", "path"]):
                element.decompose()
                
            # Keep head (for styles/meta) and body
            # But strip actual image tags content, just keep the tag
            for img in soup.find_all('img'):
                img['src'] = 'IMAGE_URL'
                
            return soup.prettify()[:15000] # Limit to 15k chars for LLM safety
        except:
            return ""

    @staticmethod
    def convert_to_absolute_urls(html_content: str, base_url: str) -> str:
        """Convert all relative URLs in HTML to absolute URLs"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Tags and attributes to update
            url_attributes = {
                'img': 'src',
                'link': 'href',
                'script': 'src',
                'a': 'href',
                'iframe': 'src'
            }

            for tag, attr in url_attributes.items():
                for element in soup.find_all(tag):
                    val = element.get(attr)
                    if val:
                        # Skip data URIs, anchors, and existing absolute URLs
                        if val.startswith(('data:', '#', 'mailto:', 'tel:', 'javascript:')):
                            continue
                        
                        absolute_url = urljoin(base_url, val)
                        element[attr] = absolute_url
            
            return str(soup)
        except Exception as e:
            logger.warning(f"Error converting to absolute URLs: {e}")
            return html_content

