/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiQuery, type RequestOptions } from './api-query';
import { QueryBuilder } from './query-builder';
import type { ErrorObject, GraphObject, Metadata } from './type';

/**
 * Main class for performing queries against The Graph protocols.
 * Extends ApiQuery to handle HTTP communication.
 */
export class EthGraphQuery extends ApiQuery {
  /** The name of the GraphQL query, used in makeFullQuery. */
  queryName: string;

  /**
   * Initializes a new EthGraphQuery instance.
   * @param rootUrl - The endpoint URL of the subgraph.
   * @param config - Optional request configuration for custom headers or timeouts.
   */
  constructor(rootUrl: string, config?: RequestOptions) {
    super(rootUrl, config);
    this.queryName = 'query';
  }

  /**
   * Executes a raw GraphQL query string.
   * @template T - The expected return type of the data.
   * @param data - The raw GraphQL query string.
   * @returns A promise resolving to the query result.
   * @throws Error if the response contains any GraphQL errors.
   */
  async stringQuery<T = any>(data: string): Promise<T> {
    const result = await this.post<{ query: string }, any>('', { query: data });

    if (result && typeof result === 'object' && 'errors' in result) {
      const errorObject = result as ErrorObject;
      const messages = errorObject.errors.map((error) => error.message).join('; ');
      throw new Error(`GraphQL Error: ${messages}`);
    }

    return result.data as T;
  }

  /**
   * Executes a single collection query using a JSON configuration.
   * @template T - The expected return type of the data.
   * @param data - The configuration for the collection query.
   * @param metadata - Optional metadata fields to include in the query.
   * @returns A promise resolving to the fetched data.
   */
  async query<T = any>(data: GraphObject, metadata?: Metadata): Promise<T> {
    const sQuery = QueryBuilder.buildQuery(data, metadata);
    return this.stringQuery<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
  }

  /**
   * Executes multiple collection queries in a single request using JSON configurations.
   * @template T - The expected return type of the data.
   * @param data - An array of query configurations.
   * @param metadata - Optional metadata fields to include in the query.
   * @returns A promise resolving to the merged results of all queries.
   */
  async multipleQuery<T = any>(data: Array<GraphObject>, metadata?: Metadata): Promise<T> {
    const sQuery = QueryBuilder.buildMultipleQuery(data, metadata);
    return this.stringQuery<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
  }
}
