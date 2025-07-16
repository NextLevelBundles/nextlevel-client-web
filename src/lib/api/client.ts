import { getIdTokenFromLocalStorage } from "@/app/(shared)/contexts/id-token/id-token-servie";

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  statusText: string;
}

export class ClientApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

export interface RequestOptions {
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export class ClientApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "";
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const idToken = getIdTokenFromLocalStorage();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new ClientApiError(
        errorMessage,
        response.status,
        response.statusText
      );
    }

    // Handle successful responses that don't have a body
    if (response.status === 204 || response.status === 205) {
      return {} as T;
    }

    // Check if response has content
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    // If no content-type or content-length is 0, assume no body
    if (!contentType || contentLength === "0") {
      return {} as T;
    }

    // Only try to parse JSON if content-type indicates JSON
    if (contentType.includes("application/json")) {
      try {
        const text = await response.text();
        // Handle empty JSON response
        if (!text.trim()) {
          return {} as T;
        }
        return JSON.parse(text);
      } catch {
        throw new ClientApiError(
          "Failed to parse JSON response",
          response.status,
          response.statusText
        );
      }
    }

    // For non-JSON content types, return the response as text
    try {
      const text = await response.text();
      return (text || {}) as T;
    } catch {
      throw new ClientApiError(
        "Failed to read response",
        response.status,
        response.statusText
      );
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const { headers: customHeaders, ...fetchOptions } = options;

    const authHeaders = await this.getAuthHeaders();
    const headers = {
      ...authHeaders,
      ...customHeaders,
    };

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ClientApiError) {
        throw error;
      }

      // Handle network errors, timeouts, etc.
      console.error(`API Request failed for ${url}:`, error);
      throw new ClientApiError(
        error instanceof Error ? error.message : "Network request failed",
        0,
        "Network Error"
      );
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "GET",
      ...options,
    });
  }

  async post<T, U = unknown>(
    endpoint: string,
    data?: U,
    options?: RequestOptions
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T, U = unknown>(
    endpoint: string,
    data?: U,
    options?: RequestOptions
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async patch<T, U = unknown>(
    endpoint: string,
    data?: U,
    options?: RequestOptions
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "DELETE",
      ...options,
    });
  }
}

// Default instance
export const apiClient = new ClientApi();
