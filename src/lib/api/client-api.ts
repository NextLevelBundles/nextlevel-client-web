import { toast } from "sonner";
import { getAuthProvider } from "@/lib/auth/auth-adapter";

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

export interface ApiErrorResponse {
  errors: string[];
  statusCode: number;
  message: string;
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
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    try {
      // Use the auth adapter to get the ID token
      // This automatically uses the correct provider (Cognito or Test)
      const provider = getAuthProvider();
      const idToken = await provider.getIdToken();

      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }
    } catch (error) {
      console.error("[ClientApi] Failed to get auth token:", error);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();

        // Check if it matches our expected API error format
        if (
          errorData.errors &&
          Array.isArray(errorData.errors) &&
          errorData.errors.length > 0
        ) {
          // Show toast with the first error message
          toast.error(errorData.errors[0]);
          errorMessage = errorData.errors[0];
        } else if (errorData.message) {
          // Fallback to message field if available
          toast.error(errorData.message);
          errorMessage = errorData.message;
        } else {
          // Default error message
          toast.error("An unexpected error occurred. Please try again.");
        }
      } catch {
        // If we can't parse the error response, show default toast
        toast.error("An unexpected error occurred. Please try again.");
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
