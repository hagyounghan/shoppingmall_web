// API 클라이언트 - 확장 가능한 구조로 설계

import { API_CONFIG } from '../config/api';

export interface ApiError {
  message: string;
  status: number;
  statusText: string;
}

export class ApiClientError extends Error {
  status: number;
  statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.statusText = statusText;
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * API 요청을 위한 범용 fetch 래퍼
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;

  const url = `${API_CONFIG.baseURL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // 토큰 가져오기
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));

      throw new ApiClientError(
        errorData.message || `HTTP Error: ${response.status}`,
        response.status,
        response.statusText,
      );
    }

    // 204 No Content 등의 경우 빈 응답 처리
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiClientError('Request timeout', 408, 'Request Timeout');
      }
      throw new ApiClientError(error.message, 0, 'Network Error');
    }

    throw new ApiClientError('Unknown error occurred', 0, 'Unknown Error');
  }
}

/**
 * GET 요청
 */
export async function apiGet<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST 요청
 */
export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH 요청
 */
export async function apiPatch<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 요청
 */
export async function apiDelete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

