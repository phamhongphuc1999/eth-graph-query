/* eslint-disable @typescript-eslint/no-explicit-any */
export const defaultHeader = { Accept: 'application/json', 'Content-Type': 'application/json' };

export type RequestOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  retries?: number;
};

export class ApiQuery {
  root: string;
  config: RequestOptions;

  constructor(rootUrl: string, config: RequestOptions = {}) {
    this.root = rootUrl;
    this.config = {
      ...config,
      headers: { ...defaultHeader, ...(config.headers || {}) },
    };
  }

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

    const maxAttempts = (mergedConfig.retries ?? 0) + 1;
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const controller = new AbortController();
      const { timeoutMs } = mergedConfig;
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

        if (!response.ok) throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        return (await response.json()) as T;
      } catch (err) {
        lastError = err;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    }

    throw lastError ?? new Error('Request failed');
  }

  protected async post<B = any, T = any>(url: string, data?: B, config?: RequestOptions) {
    return this.request<T>('post', url, data, config);
  }
}
