/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiQuery, type RequestOptions } from './api-query';
import { QueryBuilder } from './query-builder';
import type { ErrorObject, GraphObject, Metadata } from './type';

export type EthGraphQueryOptions = RequestOptions & {
  /** Applied to every query where `first` is not explicitly set. */
  defaultFirst?: number;
};

export class EthGraphQuery extends ApiQuery {
  queryName: string;
  private defaultFirst?: number;

  constructor(rootUrl: string, config?: EthGraphQueryOptions) {
    const { defaultFirst, ...requestOptions } = config ?? {};
    super(rootUrl, requestOptions);
    this.queryName = 'query';
    this.defaultFirst = defaultFirst;
  }

  async stringQuery<T = any>(data: string): Promise<T> {
    const result = await this.post<{ query: string }, any>('', { query: data });

    if (result && typeof result === 'object' && 'errors' in result) {
      const errorObject = result as ErrorObject;
      const messages = errorObject.errors.map((error) => error.message).join('; ');
      throw new Error(`GraphQL Error: ${messages}`);
    }

    return result.data as T;
  }

  private applyDefaultFirst(data: GraphObject): GraphObject {
    if (this.defaultFirst === undefined || data.params?.first !== undefined) return data;
    return { ...data, params: { ...data.params, first: this.defaultFirst } };
  }

  /** Returns the full GraphQL query string without executing it. Useful for debugging. */
  buildQueryString(data: GraphObject, metadata?: Metadata): string {
    const sQuery = QueryBuilder.buildQuery(this.applyDefaultFirst(data), metadata);
    return QueryBuilder.makeFullQuery(sQuery, this.queryName);
  }

  /** Returns the full GraphQL query string for a multi-collection query without executing it. */
  buildMultipleQueryString(data: Array<GraphObject>, metadata?: Metadata): string {
    const merged = data.map((item) => this.applyDefaultFirst(item));
    const sQuery = QueryBuilder.buildMultipleQuery(merged, metadata);
    return QueryBuilder.makeFullQuery(sQuery, this.queryName);
  }

  async query<T = any>(data: GraphObject, metadata?: Metadata): Promise<T> {
    const sQuery = QueryBuilder.buildQuery(this.applyDefaultFirst(data), metadata);
    return this.stringQuery<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
  }

  async multipleQuery<T = any>(data: Array<GraphObject>, metadata?: Metadata): Promise<T> {
    const merged = data.map((item) => this.applyDefaultFirst(item));
    const sQuery = QueryBuilder.buildMultipleQuery(merged, metadata);
    return this.stringQuery<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
  }

  /**
   * Fetches all pages of a collection by incrementing `skip` until results are exhausted.
   * Returns the flat item array for `data.collection`.
   * Stops at The Graph's max skip (5000) to avoid indexer errors.
   */
  async queryAll<T = any>(data: GraphObject, pageSize = 1000): Promise<T[]> {
    const results: T[] = [];
    let skip = 0;
    const clampedPageSize = Math.min(pageSize, 1000);

    while (true) {
      const page = await this.query<Record<string, T[]>>({
        ...data,
        params: { ...data.params, first: clampedPageSize, skip },
      });

      const items = page[data.collection];
      if (!Array.isArray(items) || items.length === 0) break;

      results.push(...items);
      if (items.length < clampedPageSize) break;

      skip += clampedPageSize;
      if (skip >= 5000) break;
    }

    return results;
  }
}
