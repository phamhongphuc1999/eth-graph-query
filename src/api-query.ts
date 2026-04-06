/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

export const defaultHeader = { Accept: 'application/json', 'Content-Type': 'application/json' };

function responseBody<T>(res: AxiosResponse<T>) {
  return res.data;
}

/**
 * Base class for handling API requests using axios.
 * Provides protected methods for common HTTP verbs.
 */
export class ApiQuery {
  /** The root URL for all API requests. */
  root: string;
  /** Axios configuration used for all requests. */
  config: AxiosRequestConfig;

  /**
   * Initializes a new instance of the ApiQuery class.
   * @param rootUrl - The base URL for the API.
   * @param config - Optional axios configuration.
   */
  constructor(rootUrl: string, config: AxiosRequestConfig = {}) {
    this.root = rootUrl;
    this.config = {
      ...config,
      headers: {
        ...defaultHeader,
        ...(config.headers || {}),
      },
    };
  }

  /**
   * Performs an API request.
   * @template T - The expected response type.
   * @param method - The HTTP method to use.
   * @param url - The relative URL for the request.
   * @param data - The request payload (for POST, PUT).
   * @param config - Optional axios configuration to override defaults.
   * @returns A promise that resolves to the response data.
   */
  private async request<T = any>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const fullUrl = `${this.root}${url}`;
    const mergedConfig = {
      ...this.config,
      ...config,
      headers: { ...(this.config.headers || {}), ...(config?.headers || {}) },
    };

    const response = await (method === 'get' || method === 'delete'
      ? axios[method](fullUrl, mergedConfig)
      : axios[method](fullUrl, data, mergedConfig));

    return responseBody(response);
  }

  /**
   * Performs a GET request.
   * @template T - The expected response type.
   * @param url - The relative URL for the request.
   * @param config - Optional axios configuration to override defaults.
   * @returns A promise that resolves to the response data.
   */
  protected async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('get', url, undefined, config);
  }

  /**
   * Performs a POST request.
   * @template B - The request body type.
   * @template T - The expected response type.
   * @param url - The relative URL for the request.
   * @param data - The request payload.
   * @param config - Optional axios configuration to override defaults.
   * @returns A promise that resolves to the response data.
   */
  protected async post<B = any, T = any>(url: string, data?: B, config?: AxiosRequestConfig) {
    return this.request<T>('post', url, data, config);
  }

  /**
   * Performs a PUT request.
   * @template B - The request body type.
   * @template T - The expected response type.
   * @param url - The relative URL for the request.
   * @param data - The request payload.
   * @param config - Optional axios configuration to override defaults.
   * @returns A promise that resolves to the response data.
   */
  protected async put<B = any, T = any>(url: string, data?: B, config?: AxiosRequestConfig) {
    return this.request<T>('put', url, data, config);
  }

  /**
   * Performs a DELETE request.
   * @template T - The expected response type.
   * @param url - The relative URL for the request.
   * @param config - Optional axios configuration to override defaults.
   * @returns A promise that resolves to the response data.
   */
  protected async del<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('delete', url, undefined, config);
  }
}
