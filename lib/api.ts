// API configuration and utilities for FastAPI backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// Generic API client
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // Helper to create body and headers for POST/PUT/PATCH requests
  private async createRequestOptions(data: any, customHeaders?: Record<string, string>): Promise<{ body: BodyInit | null, headers: Headers }> {
      const headers = new Headers(customHeaders);
      let body: BodyInit | null = null;
      
      if (data instanceof FormData) {
          body = data;
          // IMPORTANT: Do not set Content-Type for FormData; browser handles boundary generation.
      } else if (data instanceof URLSearchParams) {
          body = data;
          headers.set("Content-Type", "application/x-www-form-urlencoded");
      } else if (data !== undefined && data !== null) {
          body = JSON.stringify(data);
          headers.set("Content-Type", "application/json");
      }
      return { body, headers };
  }


  // CRITICAL FIX: The return type is now Promise<T> (the data itself). 
  // Errors will cause the promise to be rejected via 'throw new Error()'.
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    
    let accessToken: string | null = null
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("access_token")
    }

    // Set Authorization header if token exists
    const headers = new Headers(options.headers);
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    // 1. Check for non-2xx status (4xx or 5xx)
    if (!response.ok) {
        // Attempt to read the detailed error message from the response body (FastAPI structure)
        let errorData: any = {};
        try {
            errorData = await response.json();
        } catch (e) {
            // If JSON parsing fails, use the status message
            errorData.detail = `Request failed with status ${response.status} ${response.statusText}`;
        }
        
        // 2. THROW the error. This rejects the promise and triggers React Query's onError.
        // We prioritize "detail" (FastAPI standard error) or "message"
        const errorMessage = errorData.detail || errorData.message || `Server Error: ${response.statusText} (${response.status})`;

        throw new Error(errorMessage);
    }
    
    // 3. Success (2xx status): Return the parsed JSON data.
    // Handle 204 No Content, which does not return a body.
    if (response.status === 204) {
        return {} as T; // Return an empty object for success with no content
    }

    // Return the response data
    return response.json() as Promise<T>;
  }
  
  // All public methods now return Promise<T>
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    const { body, headers } = await this.createRequestOptions(data, customHeaders);
    return this.request<T>(endpoint, {
      method: "POST",
      body,
      headers: headers as any,
    });
  }

  async put<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    const { body, headers } = await this.createRequestOptions(data, customHeaders);
    return this.request<T>(endpoint, {
      method: "PUT",
      body,
      headers: headers as any,
    });
  }

  async patch<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    const { body, headers } = await this.createRequestOptions(data, customHeaders);
    return this.request<T>(endpoint, {
      method: "PATCH",
      body,
      headers: headers as any,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}
export const apiClient = new ApiClient(API_BASE_URL)

export const api = apiClient
