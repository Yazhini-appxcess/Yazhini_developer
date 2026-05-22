"""Widget.js endpoint - serves the embeddable bot widget as a JavaScript file."""
from fastapi import APIRouter, Request, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os

from app.core.database import get_db
from app.models.settings import OrganizationSettings

router = APIRouter(prefix="/api/bot", tags=["bot"])


@router.get("/widget.js")
async def get_widget_js(
    request: Request, 
    type: str = "external",
    db: AsyncSession = Depends(get_db)
):
    """
    Serve the embeddable bot widget as a JavaScript file.
    This allows websites to embed with just: <script src=".../widget.js?type=internal"></script>
    params:
        type: 'internal' or 'external' (default)
    """
    # Fetch branding settings from database
    result = await db.execute(select(OrganizationSettings).limit(1))
    settings = result.scalar_one_or_none()
    
    # Dynamically determine the API URL from the request
    base_url = str(request.base_url).rstrip('/')
    api_url = base_url if "localhost" in base_url or "127.0.0.1" in base_url else os.getenv("API_URL", base_url)
    
    # Configure widget appearance based on type and database settings
    is_internal = type == "internal"
    
    # Priority: DB setting > Default for internal/external
    default_name = "Leucadia Copilot" if is_internal else "Leucadia Assistant"
    bot_name = (settings.widget_name if settings and settings.widget_name else default_name) if not is_internal else default_name
    
    # Solid brand blue for header and toggle base
    # Priority: DB setting > Default brand blue
    brand_blue = (settings.widget_primary_color if settings and settings.widget_primary_color else "#01284e") if not is_internal else "#1e293b"
    
    # Logo Priority: DB setting > Default LOGO
    default_logo = f"{api_url}/static/LWWD.png"
    logo_url = (settings.widget_logo_url if settings and settings.widget_logo_url else default_logo) if not is_internal else default_logo
    
    # If logo_url is relative, prepend API_URL
    if logo_url and logo_url.startswith("/"):
        logo_url = f"{api_url}{logo_url}"
    
    glassy_shine = "radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)"
    header_color = f"{glassy_shine}, {brand_blue}" if not is_internal else "#1e293b"
    
    # Unified glassy style string
    brand_glassy_css = f"background: {header_color}; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.05);"
    # Polished glass: Mostly blue with a white glassy shine at the corner
    toggle_style = f"{brand_glassy_css} box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), inset 0 0 8px rgba(255, 255, 255, 0.05);" if not is_internal else f"background: {header_color};"
    toggle_icon_color = "white"

    
    widget_js = rf"""
(function() {{
    // Leucadia Bot Widget
    const API_URL = '{api_url}/api/bot';
    const AGENT_TYPE = '{type}';
    console.log('[CL WIDGET] Initialized with type:', AGENT_TYPE);
    console.log('[CL WIDGET] API URL:', API_URL);
    
    // Generate session ID
    function getSessionId() {{
        let sessionId = localStorage.getItem('cl_session_id');
        if (!sessionId) {{
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 16);
            localStorage.setItem('cl_session_id', sessionId);
        }}
        return sessionId;
    }}
    
    // Format markdown text to HTML
    function formatMessage(text) {{
        if (!text) return '';
        
        // Escape HTML first to prevent XSS
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
            
        // Convert Markdown Links [text](url) to <a href="url">text</a>
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #0096c7; text-decoration: underline; font-weight: 500;">$1</a>');
        
        // Convert **bold** to <strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Handle Headers (convert # Header to <strong>Header</strong> to prevent large text but keep emphasis)
        // Global multiline replace for lines starting with #
        html = html.replace(/^(#+)\s*(.*)$/gm, '<strong>$2</strong>');
        
        // Split by lines to handle bullet points and lists
        const lines = html.split('\n');
        let formattedLines = [];
        let inList = false;
        let listType = '';
        
        for (let i = 0; i < lines.length; i++) {{
            const line = lines[i].trim();
            
            // Check for bullet points (• or - or *)
            if (line.match(/^[•\-\*]\s/)) {{
                if (!inList || listType !== 'ul') {{
                    if (inList && listType === 'ol') {{
                        formattedLines.push('</ol>');
                    }}
                    formattedLines.push('<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;">');
                    inList = true;
                    listType = 'ul';
                }}
                // Remove bullet and format
                const content = line.replace(/^[•\-\*]\s*/, '');
                formattedLines.push(`<li style="margin: 4px 0; font-size: 13px;">${{content}}</li>`);
            }}
            // Check for numbered lists
            else if (line.match(/^\d+[\.\)]\s/)) {{
                if (!inList || listType !== 'ol') {{
                    if (inList && listType === 'ul') {{
                        formattedLines.push('</ul>');
                    }}
                    formattedLines.push('<ol style="margin: 8px 0; padding-left: 20px;">');
                    inList = true;
                    listType = 'ol';
                }}
                const content = line.replace(/^\d+[\.\)]\s*/, '');
                formattedLines.push(`<li style="margin: 4px 0; font-size: 13px;">${{content}}</li>`);
            }}
            else {{
                // Close list if we were in one
                if (inList) {{
                    formattedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
                    inList = false;
                    listType = '';
                }}
                
                // Regular paragraph or empty line
                if (line) {{
                    // Check if it was already formatted as a header (now strong) - it will be wrapped in p
                    formattedLines.push(`<p style="margin: 8px 0; font-size: 13px;">${{line}}</p>`);
                }} else {{
                    formattedLines.push('<br>');
                }}
            }}
        }}
        
        // Close list if still open
        if (inList) {{
            formattedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        }}
        
        return formattedLines.join('');
    }}
    
    // Render messages into a container
    function renderMessages(messages, container) {{
        container.innerHTML = '';
        if (!messages || messages.length === 0) return;
        
        messages.forEach(msg => {{
            const msgDiv = document.createElement('div');
            msgDiv.style.cssText = msg.role === 'user' 
                ? 'background: #01284e; color: white; padding: 10px 14px; border-radius: 16px; max-width: 80%; align-self: flex-end; box-shadow: 0 2px 6px rgba(1, 40, 78, 0.2); font-size: 13px;'
                : 'background: #e9ecef; padding: 10px 14px; border-radius: 16px; max-width: 80%; align-self: flex-start; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 13px; color: #212529;';
            
            let content = '';
            if (msg.role === 'assistant') {{
                content = formatMessage(msg.content);
            }} else {{
                const escaped = msg.content
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
                content = `<p style="margin: 0; font-size: 13px; line-height: 1.4;">${{escaped}}</p>`;
            }}
            
            msgDiv.innerHTML = content;
            container.appendChild(msgDiv);
        }});
    }}
    
    // Create widget HTML
    function createWidget() {{
        const widget = document.createElement('div');
        widget.id = 'cl-bot-widget';
        widget.innerHTML = `
            <!-- Bot Container -->
            <div id="cl-bot-container" style="display: none; position: fixed; bottom: 85px; right: 30px; width: 350px; height: 500px; max-height: calc(100vh - 110px); background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); flex-direction: column; overflow: hidden; margin-bottom: 0; transition: all 0.3s ease; z-index: 2147483640; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px;">
                <!-- Header -->
                <div style="background: {header_color}; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button id="cl-back-btn" style="display: none; background: none; border: none; color: white; cursor: pointer; margin-right: 4px; transition: opacity 0.2s; flex-shrink: 0; padding: 4px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 12H5"></path>
                                <path d="M12 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <img src="{logo_url}" alt="Leucadia" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.src='{api_url}/static/LWWD.png'; this.onerror=null;" />
                        </div>
                        <div>
                            <h3 style="margin: 0; font-size: 14px; font-weight: 600; line-height: 1.2;">{bot_name}</h3>
                            <p style="margin: 2px 0 0 0; font-size: 11px; opacity: 0.95; display: flex; align-items: center; gap: 5px;">
                                <span style="width: 6px; height: 6px; background: #81c341; border-radius: 50%; display: inline-block; box-shadow: 0 0 3px rgba(129, 195, 65, 0.6);"></span>
                                We are online!
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button id="cl-end-chat-btn" style="display: none; background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px; line-height: 1; transition: all 0.2s; padding: 0; align-items: center; justify-content: center;" title="End Chat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                <line x1="12" y1="2" x2="12" y2="12"></line>
                            </svg>
                        </button>
                    <button id="cl-close-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 24px; line-height: 1; transition: opacity 0.2s; padding: 4px;">×</button>
                    </div>
                </div>
                
                <!-- Home View -->
                <div id="cl-home-view" style="flex: 1; overflow-y: auto; padding: 12px 14px; background: #f8f9fa; display: flex; flex-direction: column; gap: 8px; min-height: 0; align-items: center; justify-content: flex-start;">
                    <div style="text-align: center; padding: 6px 0; width: 100%;">
                        <div style="width: 44px; height: 44px; margin: 0 auto 6px; border-radius: 50%; {brand_glassy_css} display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 22px;">🤖</div>
                        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #212529;">Welcome to {bot_name}</h3>
                        <p style="margin: 0; font-size: 12px; color: #6c757d; line-height: 1.4;">Your AI-powered assistant is here to help</p>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 6px; width: 100%; align-items: center;">
                        <div style="background: white; padding: 10px; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); width: 100%; max-width: 100%;">
                            <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                                <div style="width: 30px; height: 30px; border-radius: 50%; {brand_glassy_css} display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                <div style="flex: 1; min-width: 0; text-align: left;">
                                    <h4 style="margin: 0; font-size: 13px; font-weight: 600; color: #212529;">24/7 Support</h4>
                                    <p style="margin: 0; font-size: 11px; color: #6c757d; line-height: 1.3;">Available round the clock</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 10px; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); width: 100%; max-width: 100%;">
                            <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                                <div style="width: 30px; height: 30px; border-radius: 50%; {brand_glassy_css} display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                </div>
                                <div style="flex: 1; min-width: 0; text-align: left;">
                                    <h4 style="margin: 0; font-size: 13px; font-weight: 600; color: #212529;">Instant Responses</h4>
                                    <p style="margin: 0; font-size: 11px; color: #6c757d; line-height: 1.3;">Get answers in seconds</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 10px; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); width: 100%; max-width: 100%;">
                            <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                                <div style="width: 30px; height: 30px; border-radius: 50%; {brand_glassy_css} display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                        <path d="M2 17l10 5 10-5"></path>
                                        <path d="M2 12l10 5 10-5"></path>
                                    </svg>
                                </div>
                                <div style="flex: 1; min-width: 0; text-align: left;">
                                    <h4 style="margin: 0; font-size: 13px; font-weight: 600; color: #212529;">Smart AI Assistant</h4>
                                    <p style="margin: 0; font-size: 11px; color: #6c757d; line-height: 1.3;">Intelligent and helpful responses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Chat with us button -->
                    <button id="cl-chat-with-us-btn" style="margin-top: 8px; width: 100%; padding: 12px 16px; {brand_glassy_css} color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(1, 40, 78, 0.3); display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>Chat with us</span>
                    </button>
                </div>
                
                <!-- Conversation View -->
                <div id="cl-conversation-view" style="flex: 1; overflow-y: auto; padding: 16px; background: #f8f9fa; display: none; flex-direction: column; gap: 12px; min-height: 0;">
                    <div id="cl-messages" style="display: flex; flex-direction: column; gap: 12px;">
                        <!-- Messages will be added dynamically -->
                            </div>
                </div>
                
                <!-- Input Area (only shown in conversation view) -->
                <div id="cl-input-area" style="border-top: 1px solid #e9ecef; padding: 10px 12px; background: white; display: none;">
                    <div id="cl-chat-controls" style="position: relative;">
                        <div style="display: flex; align-items: center; gap: 6px; background: #f8f9fa; border-radius: 20px; padding: 3px 3px 3px 12px; border: 1px solid #e9ecef;">
                            <input id="cl-input" type="text" placeholder="Enter your message..." style="flex: 1; border: none; background: transparent; padding: 8px 6px; font-size: 13px; outline: none; color: #212529;" />
                            <button id="cl-send-btn" style="background: {header_color}; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 6px rgba(1, 40, 78, 0.3);" title="Send message">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Conversations List View -->
                <div id="cl-conversations-view" style="flex: 1; overflow-y: auto; padding: 12px; background: #f8f9fa; display: none; flex-direction: column; gap: 8px; min-height: 0;">
                    <div id="cl-conversations-list" style="display: flex; flex-direction: column; gap: 8px;">
                        <!-- Conversations will be loaded here -->
                    </div>
                    <div id="cl-no-conversations" style="text-align: center; padding: 40px 20px; color: #6c757d; font-size: 13px;">
                        No conversations yet. Start chatting to see your conversations here.
                    </div>
                </div>
                
                <!-- Bottom Tab Navigation -->
                <div id="cl-bottom-tabs" style="border-top: 1px solid #e9ecef; background: white; display: flex; padding: 0;">
                    <button id="cl-home-tab" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 6px; background: none; border: none; cursor: pointer; transition: background 0.2s;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#01284e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 3px;">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span style="font-size: 11px; font-weight: 500; color: #01284e;">Home</span>
                        <div style="width: 100%; height: 2px; background: #01284e; margin-top: 3px; border-radius: 2px 2px 0 0;"></div>
                    </button>
                    <button id="cl-conversations-tab" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 6px; background: none; border: none; cursor: pointer; transition: background 0.2s;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 3px;">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span style="font-size: 11px; font-weight: 500; color: #9ca3af;">Conversations</span>
                        <div style="width: 100%; height: 2px; background: transparent; margin-top: 3px;"></div>
                    </button>
                </div>
            </div>
            
            <!-- Toggle Button -->
            <button id="cl-toggle-btn" style="position: fixed; bottom: 20px; right: 30px; width: 60px; height: 60px; border-radius: 30px; {toggle_style} box-shadow: 0 8px 32px rgba(0,0,0,0.15); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); z-index: 2147483647;">
                <div style="position: relative; width: 34px; height: 34px;">
                    <svg id="cl-toggle-icon-open" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="{toggle_icon_color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 0; left: 0; transition: all 0.3s ease;">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <svg id="cl-toggle-icon-close" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="{toggle_icon_color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 0; left: 0; opacity: 0; transform: rotate(-90deg); transition: all 0.3s ease;">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
            </button>
            <style>
                @keyframes fadeIn {{
                    from {{
                        opacity: 0;
                        transform: translateY(10px);
                    }}
                    to {{
                        opacity: 1;
                        transform: translateY(0);
                    }}
                }}
                @keyframes typing-dot {{
                    0%, 60%, 100% {{
                        transform: translateY(0);
                        opacity: 0.7;
                    }}
                    30% {{
                        transform: translateY(-10px);
                        opacity: 1;
                    }}
                }}
                #cl-home-view::-webkit-scrollbar,
                #cl-conversation-view::-webkit-scrollbar,
                #cl-conversations-view::-webkit-scrollbar {{
                    width: 5px;
                }}
                #cl-home-view::-webkit-scrollbar-track,
                #cl-conversation-view::-webkit-scrollbar-track,
                #cl-conversations-view::-webkit-scrollbar-track {{
                    background: transparent;
                }}
                #cl-home-view::-webkit-scrollbar-thumb,
                #cl-conversation-view::-webkit-scrollbar-thumb,
                #cl-conversations-view::-webkit-scrollbar-thumb {{
                    background: rgba(1, 40, 78, 0.2);
                    border-radius: 10px;
                }}
                #cl-home-view, #cl-conversation-view, #cl-conversations-view {{
                    scrollbar-width: thin;
                    scrollbar-color: rgba(1, 40, 78, 0.2) transparent;
                }}
            </style>
        `;
        document.body.appendChild(widget);
        return widget;
    }}
    
    // Initialize widget
    const isWidgetPage = window.location.pathname.includes('/portal') || window.location.pathname.includes('/website') || window.location.pathname.includes('/landing') || window.location.pathname.includes('/landing-page');
    console.log('[CL WIDGET] Pathname:', window.location.pathname, 'Is Widget Page:', isWidgetPage);
    
    if (!document.getElementById('cl-bot-widget')) {{
        const widget = createWidget();
        const container = document.getElementById('cl-bot-container');
        const toggleBtn = document.getElementById('cl-toggle-btn');
        
        // Control visibility of the entire widget toggle based on path
        if (toggleBtn) {{
            if (isWidgetPage) {{
                toggleBtn.style.display = 'flex';
                console.log('[CL WIDGET] Forcing display flex');
            }} else {{
                toggleBtn.style.display = 'none';
            }}
        }}
        const toggleIconOpen = document.getElementById('cl-toggle-icon-open');
        const toggleIconClose = document.getElementById('cl-toggle-icon-close');
        
        const closeBtn = document.getElementById('cl-close-btn');
        const sendBtn = document.getElementById('cl-send-btn');
        const input = document.getElementById('cl-input');
        const homeView = document.getElementById('cl-home-view');
        const conversationView = document.getElementById('cl-conversation-view');
        const messagesDiv = document.getElementById('cl-messages');
        const inputArea = document.getElementById('cl-input-area');
        const chatControls = document.getElementById('cl-chat-controls');
        const homeTab = document.getElementById('cl-home-tab');
        const conversationsTab = document.getElementById('cl-conversations-tab');
        const bottomTabs = document.getElementById('cl-bottom-tabs');
        const backBtn = document.getElementById('cl-back-btn');
        const chatWithUsBtn = document.getElementById('cl-chat-with-us-btn');
        const consultationBtn = document.getElementById('cl-consultation-btn');
        const faqsBtn = document.getElementById('cl-faqs-btn');
        const endChatBtn = document.getElementById('cl-end-chat-btn');
        const conversationsView = document.getElementById('cl-conversations-view');
        const conversationsList = document.getElementById('cl-conversations-list');
        const noConversations = document.getElementById('cl-no-conversations');
        
        const sessionId = getSessionId();
        const websiteUrl = window.location.href;
        
        let conversationStarted = false;
        let currentConversationId = null;
        // Track messages in memory for accurate saving (preserves full content)
        let messageHistory = [];
        
        // Check if we're on the widget page (already defined above)
        
        // Toggle Widget Logic
        function toggleWidget() {{
            const isHidden = container.style.display === 'none';
            if (isHidden) {{
                container.style.display = 'flex';
                container.style.animation = 'fadeIn 0.3s ease forwards';
                toggleIconOpen.style.opacity = '0';
                toggleIconOpen.style.transform = 'rotate(90deg)';
                toggleIconClose.style.opacity = '1';
                toggleIconClose.style.transform = 'rotate(0)';
                
                if (conversationStarted || currentConversationId) {{
                    showConversationView(false);
                }} else {{
                    showHomeView();
                }}
            }} else {{
                container.style.display = 'none';
                toggleIconOpen.style.opacity = '1';
                toggleIconOpen.style.transform = 'rotate(0)';
                toggleIconClose.style.opacity = '0';
                toggleIconClose.style.transform = 'rotate(-90deg)';
            }}
        }}

        toggleBtn.addEventListener('click', toggleWidget);
        
        /* Auto-open logic disabled for now
        // Auto-open widget after 4 seconds only on widget preview page
        if (isWidgetPage) {{
            setTimeout(() => {{
                if (container && container.style.display === 'none') {{
                    toggleWidget();
                }}
            }}, 4000);
        }}
        */
        
        // Function to show welcome message when starting conversation
        function showWelcomeMessage() {{
            if (messagesDiv.children.length === 0) {{
                const welcomeMsg = document.createElement('div');
                welcomeMsg.style.cssText = 'background: #e9ecef; padding: 10px 14px; border-radius: 16px; max-width: 80%; align-self: flex-start; box-shadow: 0 1px 2px rgba(0,0,0,0.05);';
                welcomeMsg.innerHTML = `
                    <div style="font-size: 13px; color: #212529; line-height: 1.5;">
                        <p style="margin: 0;">Hello! I'm <strong>{bot_name}</strong>. How can I help you with our services today? 😊</p>
                    </div>
                `;
                messagesDiv.appendChild(welcomeMsg);
                
                // Scroll to show the welcome message
                setTimeout(() => {{
                    conversationView.scrollTop = conversationView.scrollHeight;
                }}, 100);
                
                // Clear any previous conversation ID
                currentConversationId = null;
                // Clear message history - will be initialized when user sends message
                messageHistory = [];
                
                // Directly enable FAQs (no buttons needed)
                if (inputArea) inputArea.style.display = 'block';
                if (endChatBtn) endChatBtn.style.display = 'flex';
            }}
        }}
        
        // Function to save conversation state (ongoing) - uses messageHistory for accurate content
        // CRITICAL: This should ONLY be called for welcome messages (initial save).
        // Bot API saves all user/assistant message pairs using $push.
        // This function should NOT be called after bot API has saved any messages.
        async function saveConversationState() {{
            try {{
                const baseUrl = API_URL.replace('/api/bot', '');
                
                // Check if messageHistory contains any user messages or long assistant messages
                // If so, bot API has likely already saved messages - don't overwrite
                const hasUserMessages = messageHistory.some(m => m.role === 'user');
                const hasLongAssistant = messageHistory.some(m => 
                    m.role === 'assistant' && m.content && m.content.length > 200
                );
                
                if (hasUserMessages || hasLongAssistant) {{
                    console.warn('saveConversationState() called but messageHistory contains bot API messages. Skipping to avoid overwrite.');
                    return; // Don't save - bot API is the source of truth
                }}
                
                // Use messageHistory which preserves full content (not DOM extraction)
                const params = new URLSearchParams({{
                    session_id: sessionId,
                    agent_type: AGENT_TYPE,
                    ended: 'false'
                }});
                if (websiteUrl) params.append('website_url', websiteUrl);
                
                // Log message content lengths for debugging
                const messageLengths = messageHistory.map(m => ({{
                    role: m.role,
                    length: m.content ? m.content.length : 0
                }}));
                console.log('Saving conversation (welcome messages only) - session_id:', sessionId, 'messages count:', messageHistory.length, 'lengths:', messageLengths);
                
                const response = await fetch(baseUrl + '/api/conversations/save?' + params.toString(), {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{ messages: messageHistory }})
                }});
                
                if (!response.ok) {{
                    const errorText = await response.text();
                    console.error('Failed to save conversation:', response.status, errorText);
                    return;
                }}
                
                const data = await response.json();
                if (data.conversation_id) {{
                    currentConversationId = data.conversation_id;
                    console.log('Conversation saved successfully, ID:', currentConversationId, 'session_id:', sessionId);
                }} else {{
                    console.log('Conversation save response:', data);
                }}
            }} catch (error) {{
                console.error('Error saving conversation:', error);
            }}
        }}
        
        // Function to end chat and save as ended
        async function endChat() {{
            if (!conversationStarted) return;
            
            if (confirm('Are you sure you want to end this chat?')) {{
                try {{
                    const baseUrl = API_URL.replace('/api/bot', '');
                    // Use messageHistory instead of DOM extraction for accuracy
                    const messages = messageHistory.length > 0 ? messageHistory : [];
                    
                    const params = new URLSearchParams({{
                        session_id: sessionId,
                        agent_type: AGENT_TYPE,
                        ended: 'true'
                    }});
                    if (currentConversationId) params.append('conversation_id', currentConversationId);
                    
                    await fetch(baseUrl + '/api/conversations/end?' + params.toString(), {{
                        method: 'POST',
                        headers: {{ 'Content-Type': 'application/json' }},
                        body: JSON.stringify({{ messages: messages }})
                    }});
                }} catch (error) {{
                    console.error('Error ending conversation:', error);
                }}
                
                // Show thank you message covering the complete widget
                const botContainer = document.getElementById('cl-bot-container');
                if (botContainer) {{
                    // Hide all views
                    homeView.style.display = 'none';
                    conversationView.style.display = 'none';
                    conversationsView.style.display = 'none';
                    inputArea.style.display = 'none';
                    bottomTabs.style.display = 'none';
                    backBtn.style.display = 'none';
                    
                    // Create overlay that covers the complete widget
                    const thankYouOverlay = document.createElement('div');
                    thankYouOverlay.id = 'cl-thank-you-overlay';
                    thankYouOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; z-index: 1000;';
                    thankYouOverlay.innerHTML = `
                        <div style="text-align: center; max-width: 280px;">
                            <div style="margin-bottom: 24px;">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#01284e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #212529;">Thank You!</h3>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6c757d; line-height: 1.6;">We appreciate your time. If you have any more questions, feel free to start a new conversation.</p>
                            <button id="cl-start-new-conversation-btn" style="background: #01284e; color: white; border: none; padding: 12px 24px; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(1, 40, 78, 0.3); width: 100%;">
                                Start a New Conversation
                            </button>
                        </div>
                    `;
                    botContainer.appendChild(thankYouOverlay);
                    
                    // Add event listener to the new conversation button (after element is added to DOM)
                    setTimeout(() => {{
                        const startNewBtn = document.getElementById('cl-start-new-conversation-btn');
                        if (startNewBtn) {{
                            startNewBtn.addEventListener('click', () => {{
                                // Remove thank you overlay
                                const overlay = document.getElementById('cl-thank-you-overlay');
                                if (overlay) {{
                                    overlay.remove();
                                }}
                                
                                // Clear everything and go to home view
                                messagesDiv.innerHTML = '';
                                messageHistory = []; // Clear message history
                                conversationStarted = false;
                                currentConversationId = null;
                                if (endChatBtn) endChatBtn.style.display = 'none';
                                inputArea.style.display = 'none';
                                showHomeView();
                            }});
                            startNewBtn.addEventListener('mouseenter', () => {{
                                startNewBtn.style.transform = 'scale(1.02)';
                                startNewBtn.style.boxShadow = '0 4px 12px rgba(0, 44, 92, 0.4)';
                            }});
                            startNewBtn.addEventListener('mouseleave', () => {{
                                startNewBtn.style.transform = 'scale(1)';
                                startNewBtn.style.boxShadow = '0 2px 8px rgba(0, 44, 92, 0.3)';
                            }});
                        }}
                    }}, 100);
                }}
                
                // Clear conversation state
                messageHistory = []; // Clear message history
                conversationStarted = false;
                currentConversationId = null;
                if (endChatBtn) endChatBtn.style.display = 'none';
                inputArea.style.display = 'none';
                
                // Reload conversations list
                loadConversations();
            }}
        }}
        
        // Function to load conversations list
        async function loadConversations() {{
            try {{
                const baseUrl = API_URL.replace('/api/bot', '');
                const response = await fetch(baseUrl + '/api/conversations/list?session_id=' + encodeURIComponent(sessionId) + '&agent_type=' + encodeURIComponent(AGENT_TYPE));
                const data = await response.json();
                
                console.log('Loaded conversations:', data);
                conversationsList.innerHTML = '';
                
                if (data.conversations && data.conversations.length > 0) {{
                    noConversations.style.display = 'none';
                    data.conversations.forEach(conv => {{
                        const convItem = document.createElement('div');
                        convItem.style.cssText = 'background: white; padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s; border: 1px solid #e5e7eb;';
                        
                        // Get last message preview
                        let lastMessagePreview = '';
                        if (conv.messages && conv.messages.length > 0) {{
                            const lastMsg = conv.messages[conv.messages.length - 1];
                            let msgContent = lastMsg.content || '';
                            // Strip HTML tags if any
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = msgContent;
                            msgContent = tempDiv.textContent || tempDiv.innerText || '';
                            // Escape HTML and truncate to 60 characters
                            msgContent = msgContent
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&#39;');
                            if (msgContent.length > 60) {{
                                lastMessagePreview = msgContent.substring(0, 60) + '...';
                            }} else {{
                                lastMessagePreview = msgContent;
                            }}
                        }}
                        
                        convItem.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                                <div style="flex: 1; min-width: 0;">
                                    <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 500; color: #212529;">${{conv.ended ? 'Ended' : 'Ongoing'}}</p>
                                    <p style="margin: 0 0 4px 0; font-size: 11px; color: #6c757d;">${{new Date(conv.created_at).toLocaleDateString()}}</p>
                                    ${{lastMessagePreview ? '<p style="margin: 0; font-size: 12px; color: #495057; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + lastMessagePreview + '</p>' : '<p style="margin: 0; font-size: 12px; color: #9ca3af; font-style: italic;">No messages yet</p>'}}
                                </div>
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${{conv.ended ? '#9ca3af' : '#81c341'}}; box-shadow: ${{conv.ended ? 'none' : '0 0 3px rgba(129, 195, 65, 0.6)'}}; display: inline-block; flex-shrink: 0; margin-top: 4px;"></span>
                            </div>
                        `;
                        convItem.addEventListener('click', () => {{
                            // Set conversation ID
                            currentConversationId = conv.id;
                            
                            if (conv.ended) {{
                                // Show ended conversation - display history only, no chatting allowed
                                conversationStarted = false;
                                if (endChatBtn) endChatBtn.style.display = 'none';
                                showConversationView(false);
                                
                                // Load messages for viewing only
                                renderMessages(conv.messages, messagesDiv);
                                
                                if (!conv.messages || conv.messages.length === 0) {{
                                    const noMsgDiv = document.createElement('div');
                                    noMsgDiv.style.cssText = 'background: #e9ecef; padding: 10px 14px; border-radius: 16px; max-width: 80%; align-self: flex-start;';
                                    noMsgDiv.innerHTML = '<p style="margin: 0; font-size: 13px; color: #6c757d;">This conversation has no messages.</p>';
                                    messagesDiv.appendChild(noMsgDiv);
                                }}
                                
                                conversationView.scrollTop = conversationView.scrollHeight;
                                
                                // Hide input area - no chatting allowed for ended conversations
                                inputArea.style.display = 'none';
                                
                                // Show a message that this conversation is ended
                                const endedMsg = document.createElement('div');
                                endedMsg.style.cssText = 'background: #fee2e2; padding: 10px 14px; border-radius: 16px; max-width: 80%; align-self: flex-start; margin-top: 8px;';
                                endedMsg.innerHTML = '<p style="margin: 0; font-size: 12px; color: #991b1b;">This conversation has ended. Click "Chat with us" to start a new conversation.</p>';
                                messagesDiv.appendChild(endedMsg);
                                conversationView.scrollTop = conversationView.scrollHeight;
                            }} else {{
                                // Continue ongoing conversation - allow chatting
                                conversationStarted = true;
                                if (endChatBtn) endChatBtn.style.display = 'flex';
                                showConversationView(false);
                                
                                // Load messages and populate messageHistory
                                if (conv.messages && conv.messages.length > 0) {{
                                    // Populate messageHistory from loaded conversation
                                    messageHistory = conv.messages.map(msg => ({{
                                        role: msg.role,
                                        content: msg.content,
                                        timestamp: msg.timestamp || new Date().toISOString()
                                    }}));
                                    
                                    // Display messages with proper formatting
                                    renderMessages(conv.messages, messagesDiv);
                                    conversationView.scrollTop = conversationView.scrollHeight;
                                }} else {{
                                    messagesDiv.innerHTML = '';
                                    messageHistory = [];
                                }}
                                
                                // Show input area for ongoing conversations
                                inputArea.style.display = 'block';
                            }}
                        }});
                        convItem.addEventListener('mouseenter', () => {{
                            convItem.style.background = '#f8f9fa';
                            convItem.style.borderColor = '#002c5c';
                        }});
                        convItem.addEventListener('mouseleave', () => {{
                            convItem.style.background = 'white';
                            convItem.style.borderColor = '#e5e7eb';
                        }});
                        conversationsList.appendChild(convItem);
                    }});
                }} else {{
                    noConversations.style.display = 'block';
                }}
            }} catch (error) {{
                console.error('Error loading conversations:', error);
                noConversations.style.display = 'block';
            }}
        }}
        
        // Update tab styles
        function updateTabStyles(activeTab) {{
            if (activeTab === 'home') {{
                // Home tab active
                homeTab.querySelector('svg').setAttribute('stroke', '#01284e');
                homeTab.querySelector('span').style.color = '#01284e';
                homeTab.querySelector('div:last-child').style.background = '#01284e';
                
                // Conversations tab inactive
                conversationsTab.querySelector('svg').setAttribute('stroke', '#9ca3af');
                conversationsTab.querySelector('span').style.color = '#9ca3af';
                conversationsTab.querySelector('div:last-child').style.background = 'transparent';
            }} else {{
                // Conversations tab active
                conversationsTab.querySelector('svg').setAttribute('stroke', '#01284e');
                conversationsTab.querySelector('span').style.color = '#01284e';
                conversationsTab.querySelector('div:last-child').style.background = '#01284e';
                
                // Home tab inactive
                homeTab.querySelector('svg').setAttribute('stroke', '#9ca3af');
                homeTab.querySelector('span').style.color = '#9ca3af';
                homeTab.querySelector('div:last-child').style.background = 'transparent';
            }}
        }}
        
        // Show home view by default
        function showHomeView() {{
            homeView.style.display = 'flex';
            conversationView.style.display = 'none';
            conversationsView.style.display = 'none';
            inputArea.style.display = 'none';
            bottomTabs.style.display = 'flex';
            backBtn.style.display = 'none';
            if (endChatBtn) endChatBtn.style.display = 'none';
            updateTabStyles('home');
        }}
        
        // Show conversations list view
        function showConversationsView() {{
            homeView.style.display = 'none';
            conversationView.style.display = 'none';
            conversationsView.style.display = 'flex';
            bottomTabs.style.display = 'flex';
            backBtn.style.display = 'none';
            if (endChatBtn) endChatBtn.style.display = 'none';
            updateTabStyles('conversations');
            loadConversations();
        }}
        
        // Show conversation view
        function showConversationView(shouldShowWelcome = false) {{
            homeView.style.display = 'none';
            conversationsView.style.display = 'none';
            conversationView.style.display = 'flex';
            bottomTabs.style.display = 'none';
            backBtn.style.display = 'flex';
            
            // Clear current messages before deciding what to show
            messagesDiv.innerHTML = '';
            
            // If it's a new chat, show welcome message
            if (shouldShowWelcome && !conversationStarted) {{
                showWelcomeMessage();
                if (endChatBtn) endChatBtn.style.display = 'none';
                // Scroll to show buttons immediately
                setTimeout(() => {{
                    conversationView.scrollTop = conversationView.scrollHeight;
                }}, 150);
            }} else {{
                if (endChatBtn && conversationStarted) endChatBtn.style.display = 'flex';
                // If we have history in memory, restore it
                if (messageHistory && messageHistory.length > 0) {{
                    renderMessages(messageHistory, messagesDiv);
                    setTimeout(() => {{
                        conversationView.scrollTop = conversationView.scrollHeight;
                    }}, 50);
                }}
            }}
            
            // Show input area
            const optionsDiv = document.getElementById('eti-options');
            if (optionsDiv) optionsDiv.style.display = 'none';
            if (conversationStarted || shouldShowWelcome) {{
                inputArea.style.display = 'block';
            }}
        }}
        
        // End chat button handler
        if (endChatBtn) {{
            endChatBtn.addEventListener('click', endChat);
            endChatBtn.addEventListener('mouseenter', () => {{
                endChatBtn.style.background = 'rgba(255,255,255,0.3)';
            }});
            endChatBtn.addEventListener('mouseleave', () => {{
                endChatBtn.style.background = 'rgba(255,255,255,0.2)';
            }});
        }}
        
        // Back button to go to home
        if (backBtn) {{
            backBtn.addEventListener('click', () => {{
                showHomeView();
            }});
        }}
        
        // Tab navigation
        homeTab.addEventListener('click', () => {{
            showHomeView();
        }});
        
        conversationsTab.addEventListener('click', () => {{
            showConversationsView();
        }});
        
        // Function to check for ongoing conversation and load it
        async function checkAndLoadOngoingConversation() {{
            try {{
                const baseUrl = API_URL.replace('/api/bot', '');
                const response = await fetch(baseUrl + '/api/conversations/list?session_id=' + encodeURIComponent(sessionId) + '&agent_type=' + encodeURIComponent(AGENT_TYPE));
                const data = await response.json();
                
                if (data.conversations && data.conversations.length > 0) {{
                    // Find the first ongoing conversation (not ended)
                    const ongoingConv = data.conversations.find(conv => !conv.ended);
                    if (ongoingConv) {{
                        // Load the ongoing conversation
                        currentConversationId = ongoingConv.id;
                        conversationStarted = true;
                        if (endChatBtn) endChatBtn.style.display = 'flex';
                        
                        // Load messages and populate messageHistory
                        if (ongoingConv.messages && ongoingConv.messages.length > 0) {{
                            messagesDiv.innerHTML = '';
                            // Populate messageHistory from loaded conversation
                            messageHistory = ongoingConv.messages.map(msg => ({{
                                role: msg.role,
                                content: msg.content,
                                timestamp: msg.timestamp || new Date().toISOString()
                            }}));
                            
                            // Display messages with proper formatting using helper
                            renderMessages(ongoingConv.messages, messagesDiv);
                            conversationView.scrollTop = conversationView.scrollHeight;
                            inputArea.style.display = 'block';
                            return true; // Ongoing conversation loaded
                        }}
                    }}
                }}
                return false; // No ongoing conversation found
            }} catch (error) {{
                console.error('Error checking ongoing conversation:', error);
                return false;
            }}
        }}
        
        // Chat with us button - navigate to conversation (shows welcome message or ongoing chat)
        if (chatWithUsBtn) {{
            chatWithUsBtn.addEventListener('click', async () => {{
                // If we ALREADY have a conversation started in this session, just switch to it
                if (conversationStarted) {{
                    showConversationView(false);
                    return;
                }}

                // Initially show the view (without welcome yet, will check ongoing first)
                showConversationView(false);
                
                // Check if there's an ongoing conversation in the database
                const hasOngoing = await checkAndLoadOngoingConversation();
                
                if (!hasOngoing) {{
                    // No ongoing conversation (all ended or no conversations), start a NEW conversation
                    conversationStarted = false;
                    currentConversationId = null; // Clear any previous conversation ID to ensure new one is created
                    
                    // Now show with welcome message
                    showConversationView(true);
                }}
            }});
            
            // Hover effects for chat with us button
            chatWithUsBtn.addEventListener('mouseenter', () => {{
                chatWithUsBtn.style.transform = 'scale(1.02)';
                chatWithUsBtn.style.boxShadow = '0 4px 12px rgba(0, 44, 92, 0.4)';
            }});
            chatWithUsBtn.addEventListener('mouseleave', () => {{
                chatWithUsBtn.style.transform = 'scale(1)';
                chatWithUsBtn.style.boxShadow = '0 2px 8px rgba(0, 44, 92, 0.3)';
            }});
        }}
        
        
        closeBtn.addEventListener('click', () => {{
            toggleWidget();
        }});
        
        // Hover effects for send button
        if (sendBtn) {{
            sendBtn.addEventListener('mouseenter', () => {{
                sendBtn.style.transform = 'scale(1.05)';
                sendBtn.style.boxShadow = '0 4px 12px rgba(0, 44, 92, 0.4)';
            }});
            sendBtn.addEventListener('mouseleave', () => {{
                sendBtn.style.transform = 'scale(1)';
                sendBtn.style.boxShadow = '0 2px 8px rgba(0, 44, 92, 0.3)';
        }});
        }}
        
        
        // Send message
        async function sendMessage() {{
            const message = input.value.trim();
            if (!message) return;
            
            // Hide options if visible
            const optionsDiv = document.getElementById('eti-options');
            if (optionsDiv) optionsDiv.style.display = 'none';
            
            // Mark conversation as started
            if (!conversationStarted) {{
                conversationStarted = true;
                if (endChatBtn) endChatBtn.style.display = 'flex';
            }}
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.style.cssText = 'background: #01284e; color: white; padding: 10px 14px; border-radius: 16px; max-width: 80%; align-self: flex-end; box-shadow: 0 2px 6px rgba(1, 40, 78, 0.2); font-size: 13px;';
            userMsg.innerHTML = `<p style="margin: 0; font-size: 13px; line-height: 1.4;">${{message}}</p>`;
            messagesDiv.appendChild(userMsg);
            conversationView.scrollTop = conversationView.scrollHeight;
            
            // Add to message history (for local tracking only)
            messageHistory.push({{
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            }});
            
            // NOTE: User message will be saved by bot API when it responds
            // Don't call saveConversationState() here to avoid overwriting
            
            input.value = '';
            sendBtn.disabled = true;
            sendBtn.style.opacity = '0.6';
            
            // Add typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.id = 'eti-typing-indicator';
            typingIndicator.style.cssText = 'background: #e9ecef; padding: 10px 14px; border-radius: 16px; max-width: 80%; align-self: flex-start; box-shadow: 0 1px 2px rgba(0,0,0,0.05);';
            typingIndicator.innerHTML = `
                <div style="display: flex; align-items: center; gap: 4px; font-size: 13px; color: #212529;">
                    <span style="width: 8px; height: 8px; background: #6c757d; border-radius: 50%; display: inline-block; animation: typing-dot 1.4s infinite ease-in-out;"></span>
                    <span style="width: 8px; height: 8px; background: #6c757d; border-radius: 50%; display: inline-block; animation: typing-dot 1.4s infinite ease-in-out; animation-delay: 0.2s;"></span>
                    <span style="width: 8px; height: 8px; background: #6c757d; border-radius: 50%; display: inline-block; animation: typing-dot 1.4s infinite ease-in-out; animation-delay: 0.4s;"></span>
                </div>
            `;
            messagesDiv.appendChild(typingIndicator);
            conversationView.scrollTop = conversationView.scrollHeight;
            
            try {{
                const response = await fetch(API_URL + '/chat', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{
                        message: message,
                        session_id: sessionId,
                        website_url: websiteUrl,
                        user_ip: null,
                        agent_type: AGENT_TYPE,
                        user_agent: navigator.userAgent
                    }})
                }});
                
                const data = await response.json();
                
                // Remove typing indicator
                const typingEl = document.getElementById('eti-typing-indicator');
                if (typingEl) {{
                    typingEl.remove();
                }}
                
                // Add bot response with formatted markdown
                const botMsg = document.createElement('div');
                botMsg.style.cssText = 'background: #e9ecef; padding: 10px 14px; border-radius: 16px; max-width: 80%; align-self: flex-start; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 13px; color: #212529;';
                botMsg.innerHTML = `<div style="font-size: 13px; color: #212529; line-height: 1.5;">${{formatMessage(data.response)}}</div>`;
                messagesDiv.appendChild(botMsg);
                conversationView.scrollTop = conversationView.scrollHeight;
                
                // Add to message history with full content (before formatting)
                messageHistory.push({{
                    role: 'assistant',
                    content: data.response, // Use original response, not formatted HTML
                    timestamp: new Date().toISOString()
                }});
                
                // NOTE: Bot API already saves messages correctly to MongoDB using $push
                // DO NOT call saveConversationState() here as it would overwrite with $set
                // The bot API preserves full message content correctly
            }} catch (error) {{
                console.error('Error sending message:', error);
                
                // Remove typing indicator
                const typingEl = document.getElementById('eti-typing-indicator');
                if (typingEl) {{
                    typingEl.remove();
                }}
                
                const errorMsg = document.createElement('div');
                errorMsg.style.cssText = 'background: #fee2e2; padding: 10px 14px; border-radius: 16px; max-width: 80%; align-self: flex-start; box-shadow: 0 1px 2px rgba(0,0,0,0.05);';
                errorMsg.innerHTML = `<p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.4;">Sorry, there was an error. Please try again.</p>`;
                messagesDiv.appendChild(errorMsg);
                conversationView.scrollTop = conversationView.scrollHeight;
            }} finally {{
                sendBtn.disabled = false;
                sendBtn.style.opacity = '1';
            }}
        }}
        
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {{
            if (e.key === 'Enter') sendMessage();
        }});
    }}
}})();
"""
    
    response = Response(
        content=widget_js.strip(),
        media_type="application/javascript"
    )
    # Add cache control headers to prevent caching
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


