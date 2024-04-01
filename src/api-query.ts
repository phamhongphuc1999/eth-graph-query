/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export const defaultHeader = { Accept: 'application/json', 'Content-Type': 'application/json' };

function responseBody<T>(res: AxiosResponse<T>) {
  return res.data;
}

export class ApiQuery {
  root: string;
  config: AxiosRequestConfig;

  constructor(rootUrl: string, config?: AxiosRequestConfig) {
    this.root = rootUrl;
    if (config) {
      this.config = config;
      if (!this.config?.headers) this.config.headers = {};
      this.config['headers'] = { ...this.config['headers'], ...defaultHeader };
    } else this.config = { headers: defaultHeader };
  }

  protected async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return await axios
      .get(`${this.root}${url}`, { ...config, ...this.config })
      .then<T>(responseBody);
  }

  protected async post<B = any, T = any>(url: string, data?: B, config?: AxiosRequestConfig) {
    return await axios
      .post(`${this.root}${url}`, data, { ...config, ...this.config })
      .then<T>(responseBody);
  }

  protected async put<B = any, T = any>(url: string, data?: B, config?: AxiosRequestConfig) {
    return await axios
      .put(`${this.root}${url}`, data, { ...config, ...this.config })
      .then<T>(responseBody);
  }

  protected async del<T = any>(url: string, config?: AxiosRequestConfig) {
    return await axios
      .delete(`${this.root}${url}`, { ...config, ...this.config })
      .then<T>(responseBody);
  }
}
