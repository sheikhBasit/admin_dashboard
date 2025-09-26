// API configuration and utilities for FastAPI backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://zoogloeal-byron-unruled.ngrok-free.dev"

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

private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      let accessToken: string | null = null
      if (typeof window !== "undefined") {
        accessToken = localStorage.getItem("access_token")
      }

      // Detect if body is URLSearchParams (form data)
      let headers: Record<string, string> = {}
      let body = options.body

      if (body instanceof URLSearchParams) {
        headers["Content-Type"] = "application/x-www-form-urlencoded"
      } else if (body && typeof body === "object" && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(body)
      }

      // Merge custom headers
      headers = { ...headers, ...(options.headers as Record<string, string>) }
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        body,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  }
  
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }
async post<T>(endpoint: string, data: any, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
  const headers = new Headers(customHeaders);
  let body: BodyInit | null = null;

  if (data instanceof FormData) {
    body = data;
    // Do not set Content-Type; the browser handles it.
  } else if (data instanceof URLSearchParams) {
    body = data;
    headers.set("Content-Type", "application/x-www-form-urlencoded");
  } else if (data !== undefined && data !== null) {
    body = JSON.stringify(data);
    headers.set("Content-Type", "application/json");
  }

  return this.request<T>(endpoint, {
    method: "POST",
    body,
    headers,
  });
}

async put<T>(endpoint: string, data: any, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
  const headers = new Headers(customHeaders);
  let body: BodyInit | null = null;

  if (data instanceof FormData) {
    body = data;
  } else if (data instanceof URLSearchParams) {
    body = data;
    headers.set("Content-Type", "application/x-www-form-urlencoded");
  } else if (data !== undefined && data !== null) {
    body = JSON.stringify(data);
    headers.set("Content-Type", "application/json");
  }

  return this.request<T>(endpoint, {
    method: "PUT",
    body,
    headers,
  });
}

async patch<T>(endpoint: string, data: any, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
  const headers = new Headers(customHeaders);
  let body: BodyInit | null = null;

  if (data instanceof FormData) {
    body = data;
  } else if (data instanceof URLSearchParams) {
    body = data;
    headers.set("Content-Type", "application/x-www-form-urlencoded");
  } else if (data !== undefined && data !== null) {
    body = JSON.stringify(data);
    headers.set("Content-Type", "application/json");
  }

  return this.request<T>(endpoint, {
    method: "PATCH",
    body,
    headers,
  });
}

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

export const api = apiClient
