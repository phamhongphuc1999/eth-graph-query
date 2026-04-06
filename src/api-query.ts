/* eslint-disable @typescript-eslint/no-explicit-any */
export const defaultHeader = { Accept: 'application/json', 'Content-Type': 'application/json' };

export type RequestOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
};

/**
 * Base class for handling API requests using fetch.
 * Provides protected methods for common HTTP verbs.
 */
export class ApiQuery {
  /** The root URL for all API requests. */
  root: string;
  /** Request options used for all requests. */
  config: RequestOptions;

  /**
   * Initializes a new instance of the ApiQuery class.
   * @param rootUrl - The base URL for the API.
   * @param config - Optional request configuration.
   */
  constructor(rootUrl: string, config: RequestOptions = {}) {
    this.root = rootUrl;
    this.config = {
      ...config,
      headers: { ...defaultHeader, ...(config.headers || {}) },
    };
  }

  /**
   * Performs an API request.
   * @template T - The expected response type.
   * @param method - The HTTP method to use.
   * @param url - The relative URL for the request.
   * @param data - The request payload (for POST, PUT).
   * @param config - Optional request configuration to override defaults.
   * @returns A promise that resolves to the response data.
   */
  private async request<T = any>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    config?: RequestOptions,
  ): Promise<T> {
    const fullUrl = `${this.root}${url}`;
    const mergedConfig: RequestOptions = {
      ...this.config,
      ...config,
      headers: { ...(this.config.headers || {}), ...(config?.headers || {}) },
    };

    const controller = new AbortController();
    const timeoutMs = mergedConfig.timeoutMs;
    const timeoutId =
      typeof timeoutMs === 'number' && timeoutMs > 0
        ? setTimeout(() => controller.abort(), timeoutMs)
        : undefined;

    try {
      const response = await fetch(fullUrl, {
        method: method.toUpperCase(),
        headers: mergedConfig.headers,
        body: method === 'get' || method === 'delete' ? undefined : JSON.stringify(data ?? {}),
        signal: mergedConfig.signal ?? controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as T;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  /**
   * Performs a GET request.
   * @template T - The expected response type.
   * @param url - The relative URL for the request.
   * @param config - Optional request configuration to override defaults.
   * @returns A promise that resolves to the response data.
   */
  protected async get<T = any>(url: string, config?: RequestOptions) {
    return this.request<T>('get', url, undefined, config);
  }

  /**
   * Performs a POST request.
   * @template B - The request body type.
   * @template T - The expected response type.
   * @param url - The relative URL for the request.
   * @param data - The request payload.
   * @param config - Optional request configuration to override defaults.
   * @returns A promise that resolves to the response data.
   */
  protected async post<B = any, T = any>(url: string, data?: B, config?: RequestOptions) {
    return this.request<T>('post', url, data, config);
  }

  /**
   * Performs a PUT request.
   * @template B - The request body type.
   * @template T - The expected response type.
   * @param url - The relative URL for the request.
   * @param data - The request payload.
   * @param config - Optional request configuration to override defaults.
   * @returns A promise that resolves to the response data.
   */
  protected async put<B = any, T = any>(url: string, data?: B, config?: RequestOptions) {
    return this.request<T>('put', url, data, config);
  }

  /**
   * Performs a DELETE request.
   * @template T - The expected response type.
   * @param url - The relative URL for the request.
   * @param config - Optional request configuration to override defaults.
   * @returns A promise that resolves to the response data.
   */
  protected async del<T = any>(url: string, config?: RequestOptions) {
    return this.request<T>('delete', url, undefined, config);
  }
}
