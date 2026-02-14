/**
 * API configuration and utility functions
 */

// Get API URL from environment variable, fallback to localhost:8000
// Ensure API_URL is defined
// Ensure API_URL is defined
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!envApiUrl) {
  console.warn("NEXT_PUBLIC_API_URL is not defined in environment variables");
}

export const API_URL = envApiUrl || "http://localhost:8000";

/**
 * Build API endpoint URL
 */
export function apiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${API_URL}/${cleanEndpoint}`;
  // Log in development to help debug
  if (process.env.NODE_ENV === "development") {
    console.log(`API URL: ${url}`);
  }
  return url;
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  base: API_URL,
  documents: {
    list: apiUrl("api/documents"),
    upload: apiUrl("api/documents/upload"),
    scrapeUrl: apiUrl("api/documents/scrape-url"),
    delete: (id: number) => apiUrl(`api/documents/${id}`),
    query: apiUrl("api/documents/query"),
    models: apiUrl("api/documents/models"),
  },
  bot: {
    chat: apiUrl("api/bot/chat"),
    script: apiUrl("api/bot/script"),
    suggestions: apiUrl("api/bot/suggestions"),
  },
  conversations: {
    list: apiUrl("api/conversations"),
    listUser: (sessionId: string) => apiUrl(`api/conversations/list?session_id=${sessionId}`),
    get: (id: string) => apiUrl(`api/conversations/${id}`),
    delete: (id: string) => apiUrl(`api/conversations/${id}`),
    save: apiUrl("api/conversations/save"),
    end: apiUrl("api/conversations/end"),
  },
  admin: {
    login: apiUrl("api/admin/login"),
    create: apiUrl("api/admin/create"),
    list: apiUrl("api/admin/list"),
    delete: (id: number) => apiUrl(`api/admin/${id}`),
    resetPassword: (id: number) => apiUrl(`api/admin/${id}/reset-password`),
  },
  forms: {
    list: apiUrl("api/forms"),
    submit: apiUrl("api/forms/submit"),
    delete: (id: number) => apiUrl(`api/forms/${id}`),
  },
  dashboard: {
    today: (agentType?: string) => apiUrl(`api/dashboard/stats/today${agentType ? `?agent_type=${agentType}` : ''}`),
    activity: (period: string = "week", agentType?: string) => apiUrl(`api/dashboard/stats/activity?period=${period}${agentType ? `&agent_type=${agentType}` : ''}`),
    visitors: (period: string = "month", agentType?: string) => apiUrl(`api/dashboard/stats/visitors?period=${period}${agentType ? `&agent_type=${agentType}` : ''}`),
    topDocuments: (limit: number = 10, agentType?: string) => apiUrl(`api/dashboard/stats/top-documents?limit=${limit}${agentType ? `&agent_type=${agentType}` : ''}`),
    topWebsites: (limit: number = 10, agentType?: string) => apiUrl(`api/dashboard/stats/top-websites?limit=${limit}${agentType ? `&agent_type=${agentType}` : ''}`),
    devices: (agentType?: string) => apiUrl(`api/dashboard/stats/devices${agentType ? `?agent_type=${agentType}` : ''}`),
    userActivity: (period: string = "month", agentType?: string) => apiUrl(`api/dashboard/stats/user-activity?period=${period}${agentType ? `&agent_type=${agentType}` : ''}`),
    documentImportance: (limit: number = 10, agentType?: string) => apiUrl(`api/dashboard/stats/document-importance?limit=${limit}${agentType ? `&agent_type=${agentType}` : ''}`),
  },
} as const;

